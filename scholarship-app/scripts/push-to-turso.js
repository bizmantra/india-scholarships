/**
 * Push local changes (data/scholarships.db) to Turso — safely.
 *
 * Turso is the master copy. Normal use is pull → edit locally → push (see pull-from-turso.js).
 *
 *   - Never drops or empties a table. Table structure comes from the local database;
 *     missing tables and columns are added on Turso.
 *   - THREE-WAY MERGE when a base snapshot from pull-from-turso.js exists: only fields that
 *     this run changed (local vs base) are written. If someone else changed the same field on
 *     Turso in the meantime, their value is kept and the clash is reported.
 *   - Without a base snapshot the push is refused, because a stale local copy would overwrite newer
 *     Turso data. --overwrite-turso (with --no-base to ignore an existing snapshot) forces
 *     "make Turso match local" for rows that differ — only for deliberate one-off repairs.
 *   - New rows in auto-numbered tables (changelog, translations) are inserted without their
 *     local id, so they can never collide with rows added on Turso meanwhile.
 *   - Rows are never deleted. Writes go in small transactions; failures exit non-zero.
 *
 * Usage: node scripts/push-to-turso.js [--target=production|staging] [--dry-run] [--no-base --overwrite-turso]
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { resolveTarget, connect, describe } = require('./lib/turso-target');
const { basePathFor } = require('./pull-from-turso');

const dryRun = process.argv.includes('--dry-run');
const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');

// Tables owned by the local database and mirrored to Turso
const SYNCED_TABLES = ['scholarships', 'scholarship_translations', 'scholarship_changelog', 'backlog_tasks', 'gsc_traffic_cache'];
const CHUNK_SIZE = 50;

// Tables written only by the live site (community features); ensured to exist, never touched otherwise
const COMMUNITY_DDL = [
    `CREATE TABLE IF NOT EXISTS community_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scholarship_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        session_hash TEXT NOT NULL,
        moderation_status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    'CREATE INDEX IF NOT EXISTS idx_community_events_scholarship_id ON community_events(scholarship_id)',
    'CREATE INDEX IF NOT EXISTS idx_community_events_moderation_status ON community_events(moderation_status)',
    `CREATE TABLE IF NOT EXISTS community_signals_aggregates (
        scholarship_id TEXT PRIMARY KEY,
        total_events INTEGER DEFAULT 0,
        application_count INTEGER DEFAULT 0,
        verification_count INTEGER DEFAULT 0,
        selected_count INTEGER DEFAULT 0,
        payment_count INTEGER DEFAULT 0,
        average_payment INTEGER DEFAULT 0,
        last_activity TEXT,
        common_issues_json TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS community_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        scholarship_id TEXT NOT NULL,
        session_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    'CREATE INDEX IF NOT EXISTS idx_community_analytics_event_name ON community_analytics(event_name)',
];

const quote = name => `"${name.replace(/"/g, '""')}"`;
// Stable comparison of values from better-sqlite3 and libsql (numbers, bigints, strings, null)
const norm = v => (v === undefined || v === null ? null : typeof v === 'bigint' ? Number(v) : v);
const rowKey = (row, pk) => pk.map(k => String(norm(row[k]))).join('\u0000');
const sameRow = (a, b, cols) => cols.every(c => norm(a[c]) === norm(b[c]));

async function ensureTable(turso, localDb, table) {
    const localSql = localDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table);
    if (!localSql) throw new Error(`Local database has no table "${table}"`);
    const localCols = localDb.prepare(`PRAGMA table_info(${quote(table)})`).all();

    const remote = await turso.execute({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?", args: [table] });
    const actions = [];
    if (remote.rows.length === 0) {
        actions.push(localSql.sql);
    } else {
        const remoteCols = new Set((await turso.execute(`PRAGMA table_info(${quote(table)})`)).rows.map(r => r.name));
        for (const col of localCols) {
            if (remoteCols.has(col.name)) continue;
            // ALTER TABLE cannot add PRIMARY KEY / UNIQUE columns; plain columns are all we ever add
            const dflt = col.dflt_value !== null ? ` DEFAULT ${col.dflt_value}` : '';
            actions.push(`ALTER TABLE ${quote(table)} ADD COLUMN ${quote(col.name)} ${col.type}${dflt}`);
        }
    }
    // Indexes from the local database, created only if missing
    const indexes = localDb.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name=? AND sql IS NOT NULL").all(table);
    for (const idx of indexes) {
        actions.push(idx.sql.replace(/^CREATE (UNIQUE )?INDEX (IF NOT EXISTS )?/i, 'CREATE $1INDEX IF NOT EXISTS '));
    }

    const schemaChanges = actions.filter(a => !/INDEX IF NOT EXISTS/i.test(a));
    schemaChanges.forEach(a => console.log(`   🏗️  ${a.split('\n')[0].slice(0, 110)}`));
    if (!dryRun) {
        for (const sql of actions) await turso.execute(sql);
    }
    return { localCols, created: remote.rows.length === 0 };
}

async function syncTable(turso, localDb, baseDb, table) {
    console.log(`\n📦 ${table}`);
    const { localCols, created } = await ensureTable(turso, localDb, table);
    const cols = localCols.map(c => c.name);
    const pkCols = localCols.filter(c => c.pk).sort((a, b) => a.pk - b.pk);
    const pk = pkCols.map(c => c.name);
    if (pk.length === 0) throw new Error(`Table "${table}" has no primary key; cannot sync safely`);
    // Auto-numbered tables: new rows get a fresh id on Turso instead of the local one
    const autoId = pkCols.length === 1 && /^INTEGER$/i.test(pkCols[0].type) && table !== 'scholarships';

    const localRows = localDb.prepare(`SELECT * FROM ${quote(table)}`).all();
    const remoteRows = created && dryRun ? [] : (await turso.execute(`SELECT * FROM ${quote(table)}`)).rows;
    const remoteByKey = new Map(remoteRows.map(r => [rowKey(r, pk), r]));
    const baseHasTable = baseDb && baseDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table);
    const baseByKey = baseHasTable ? new Map(baseDb.prepare(`SELECT * FROM ${quote(table)}`).all().map(r => [rowKey(r, pk), r])) : null;

    const inserts = [];   // brand-new rows
    const updates = [];   // merged rows to write
    const clashes = [];   // fields changed both here and on Turso
    let removedLocally = 0;

    for (const row of localRows) {
        const key = rowKey(row, pk);
        const remote = remoteByKey.get(key);
        const base = baseByKey ? baseByKey.get(key) : undefined;

        if (baseByKey && !base) {
            // Created by this run
            if (autoId) inserts.push(row);
            else if (!remote) inserts.push(row);
            else if (!sameRow(row, remote, cols)) clashes.push(`${key}: created here and on Turso with different values (Turso kept)`);
            continue;
        }
        if (!baseByKey) {
            // Two-way fallback: make Turso match local
            if (!remote) inserts.push(row);
            else if (!sameRow(row, remote, cols)) updates.push(row);
            continue;
        }
        if (sameRow(row, base, cols)) continue; // untouched by this run
        if (!remote) {
            clashes.push(`${key}: changed here but deleted on Turso (not recreated)`);
            continue;
        }
        // Field-by-field three-way merge
        const merged = { ...remote };
        let changed = false;
        for (const c of cols) {
            if (norm(row[c]) === norm(base[c])) continue;          // we did not touch this field
            if (norm(remote[c]) === norm(row[c])) continue;        // Turso already has our value
            if (norm(remote[c]) !== norm(base[c])) {               // someone else changed it too
                clashes.push(`${key}.${c}: changed here and on Turso (Turso value kept)`);
                continue;
            }
            merged[c] = row[c];
            changed = true;
        }
        if (changed) updates.push(merged);
    }
    if (baseByKey) {
        const localKeys = new Set(localRows.map(r => rowKey(r, pk)));
        for (const key of baseByKey.keys()) if (!localKeys.has(key)) removedLocally++;
    }

    console.log(`   local ${localRows.length} · turso ${remoteRows.length} · new ${inserts.length} · changed ${updates.length}${baseByKey ? '' : ' (no base snapshot: two-way sync)'}`);
    if (removedLocally) console.log(`   ⚠️  ${removedLocally} row(s) were removed locally; rows are never deleted from Turso (set status instead)`);
    if (clashes.length) {
        console.log(`   ⚠️  ${clashes.length} clash(es) with changes made on Turso during this run — Turso values kept:`);
        clashes.slice(0, 10).forEach(c => console.log(`      - ${c}`));
    }

    if (dryRun || (inserts.length === 0 && updates.length === 0)) {
        return { table, inserts: inserts.length, updates: updates.length, clashes: clashes.length };
    }

    const nonPk = cols.filter(c => !pk.includes(c));
    const upsertSql = `INSERT INTO ${quote(table)} (${cols.map(quote).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
        ON CONFLICT(${pk.map(quote).join(', ')}) DO UPDATE SET ${nonPk.map(c => `${quote(c)} = excluded.${quote(c)}`).join(', ')}`;
    const insertNewIdSql = `INSERT INTO ${quote(table)} (${nonPk.map(quote).join(', ')}) VALUES (${nonPk.map(() => '?').join(', ')}) ON CONFLICT DO NOTHING`;

    const statements = [
        ...inserts.map(row => autoId && baseByKey
            ? { sql: insertNewIdSql, args: nonPk.map(c => norm(row[c])) }
            : { sql: upsertSql, args: cols.map(c => norm(row[c])) }),
        ...updates.map(row => ({ sql: upsertSql, args: cols.map(c => norm(row[c])) })),
    ];
    for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
        // Each batch is one transaction: it applies fully or not at all
        await turso.batch(statements.slice(i, i + CHUNK_SIZE), 'write');
    }
    console.log(`   ✅ wrote ${statements.length} row(s)`);
    return { table, inserts: inserts.length, updates: updates.length, clashes: clashes.length };
}

async function run() {
    const target = resolveTarget();
    const { client: turso, url } = connect(target);
    const localDb = new Database(LOCAL_DB_PATH, { readonly: true });
    const basePath = path.join(path.dirname(LOCAL_DB_PATH), path.basename(basePathFor(target)));
    const useBase = !process.argv.includes('--no-base') && fs.existsSync(basePath);
    const baseDb = useBase ? new Database(basePath, { readonly: true }) : null;
    if (!useBase) {
        // Without a base we cannot tell our edits from stale data, so an old local copy would overwrite newer Turso data
        if (!dryRun && !process.argv.includes('--overwrite-turso')) {
            throw new Error('No base snapshot found. Run "node scripts/pull-from-turso.js" before editing, then push again. ' +
                '(To deliberately make Turso match this local file, re-run with --overwrite-turso.)');
        }
        console.log('⚠️  No base snapshot — every local difference will be written to Turso.');
    }

    console.log(`🔄 Sync local database → Turso (${target}: ${describe(url)})${dryRun ? ' — DRY RUN, nothing will be written' : ''}`);

    const results = [];
    for (const table of SYNCED_TABLES) {
        results.push(await syncTable(turso, localDb, baseDb, table));
    }
    if (!dryRun) {
        for (const sql of COMMUNITY_DDL) await turso.execute(sql);
    }
    localDb.close();
    if (baseDb) baseDb.close();
    // Everything this run changed is now on Turso: move the base forward so a repeated push sends nothing twice
    if (!dryRun && useBase) fs.copyFileSync(LOCAL_DB_PATH, basePath);

    const written = results.reduce((n, r) => n + r.inserts + r.updates, 0);
    const clashes = results.reduce((n, r) => n + r.clashes, 0);
    if (clashes) console.log(`\n⚠️  ${clashes} clash(es) kept the Turso value; see above.`);
    console.log(`\n🏁 ${dryRun ? 'Dry run complete' : 'Sync complete'}: ${written} row(s) ${dryRun ? 'would be' : ''} written across ${results.length} tables.`);
}

run().catch(error => {
    console.error(`❌ Sync failed: ${error.message}`);
    process.exit(1);
});
