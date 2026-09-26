/**
 * Push local SQLite data (data/scholarships.db) to Turso — safely.
 *
 * Unlike the previous version, this never drops or empties a table:
 *   - Table structure comes from the local database (no second hand-written copy).
 *     Missing tables are created and missing columns are added on Turso.
 *   - Only rows that are new or changed are written, as upserts in small transactions,
 *     so the live site keeps serving every row throughout the sync.
 *   - Rows that exist only on Turso are reported, never deleted.
 *   - Any failure exits with a non-zero code so the workflow run shows as failed.
 *
 * Usage: node scripts/push-to-turso.js [--target=production|staging] [--dry-run]
 */
const Database = require('better-sqlite3');
const path = require('path');
const { resolveTarget, connect, describe } = require('./lib/turso-target');

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

async function syncTable(turso, localDb, table) {
    console.log(`\n📦 ${table}`);
    const { localCols, created } = await ensureTable(turso, localDb, table);
    const cols = localCols.map(c => c.name);
    const pk = localCols.filter(c => c.pk).sort((a, b) => a.pk - b.pk).map(c => c.name);
    if (pk.length === 0) throw new Error(`Table "${table}" has no primary key; cannot sync safely`);

    const localRows = localDb.prepare(`SELECT * FROM ${quote(table)}`).all();
    const remoteRows = created && dryRun ? [] : (await turso.execute(`SELECT * FROM ${quote(table)}`)).rows;
    const remoteByKey = new Map(remoteRows.map(r => [rowKey(r, pk), r]));

    const inserts = [];
    const updates = [];
    for (const row of localRows) {
        const remote = remoteByKey.get(rowKey(row, pk));
        if (!remote) inserts.push(row);
        else if (!sameRow(row, remote, cols)) updates.push(row);
        remoteByKey.delete(rowKey(row, pk));
    }
    const remoteOnly = remoteByKey.size;

    console.log(`   local ${localRows.length} · turso ${remoteRows.length} · new ${inserts.length} · changed ${updates.length} · only on turso ${remoteOnly}`);
    if (remoteOnly > 0) {
        const sample = [...remoteByKey.values()].slice(0, 5).map(r => rowKey(r, pk)).join(', ');
        console.log(`   ⚠️  ${remoteOnly} row(s) exist only on Turso and were left untouched (e.g. ${sample})`);
    }

    const toWrite = [...inserts, ...updates];
    if (dryRun || toWrite.length === 0) return { table, inserts: inserts.length, updates: updates.length, remoteOnly };

    const nonPk = cols.filter(c => !pk.includes(c));
    const sql = `INSERT INTO ${quote(table)} (${cols.map(quote).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
        ON CONFLICT(${pk.map(quote).join(', ')}) DO UPDATE SET ${nonPk.map(c => `${quote(c)} = excluded.${quote(c)}`).join(', ')}`;
    for (let i = 0; i < toWrite.length; i += CHUNK_SIZE) {
        const chunk = toWrite.slice(i, i + CHUNK_SIZE);
        // Each batch is one transaction: it applies fully or not at all
        await turso.batch(chunk.map(row => ({ sql, args: cols.map(c => norm(row[c])) })), 'write');
    }
    console.log(`   ✅ wrote ${toWrite.length} row(s)`);
    return { table, inserts: inserts.length, updates: updates.length, remoteOnly };
}

async function run() {
    const target = resolveTarget();
    const { client: turso, url } = connect(target);
    const localDb = new Database(LOCAL_DB_PATH, { readonly: true });

    console.log(`🔄 Sync local database → Turso (${target}: ${describe(url)})${dryRun ? ' — DRY RUN, nothing will be written' : ''}`);

    const results = [];
    for (const table of SYNCED_TABLES) {
        results.push(await syncTable(turso, localDb, table));
    }
    if (!dryRun) {
        for (const sql of COMMUNITY_DDL) await turso.execute(sql);
    }
    localDb.close();

    const written = results.reduce((n, r) => n + r.inserts + r.updates, 0);
    console.log(`\n🏁 ${dryRun ? 'Dry run complete' : 'Sync complete'}: ${written} row(s) ${dryRun ? 'would be' : ''} written across ${results.length} tables.`);
}

run().catch(error => {
    console.error(`❌ Sync failed: ${error.message}`);
    process.exit(1);
});
