/**
 * Load a SQLite backup file into a Turso database, replacing the tables it contains.
 *
 * Used to refresh staging (see refresh-staging.js) and for disaster recovery.
 * Replacing tables is destructive, so restoring into production requires --confirm-production
 * and takes a fresh backup of production first.
 *
 * Usage:
 *   node scripts/restore-turso.js --from=backups/file.db --target=staging
 *   node scripts/restore-turso.js --from=backups/file.db --target=production --confirm-production
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { resolveTarget, connect, describe } = require('./lib/turso-target');
const { backup } = require('./backup-turso');

// Tables referenced by FOREIGN KEYs must be filled before the tables that reference them
function orderByDependencies(tables) {
    const refs = t => [...(t.sql.matchAll(/REFERENCES\s+"?(\w+)"?/gi))].map(m => m[1]).filter(n => n !== t.name);
    const done = new Set();
    const ordered = [];
    const visit = (t, depth = 0) => {
        if (done.has(t.name) || depth > tables.length) return;
        refs(t).forEach(name => { const dep = tables.find(x => x.name === name); if (dep) visit(dep, depth + 1); });
        done.add(t.name);
        ordered.push(t);
    };
    tables.forEach(t => visit(t));
    return ordered;
}

const quote = name => `"${name.replace(/"/g, '""')}"`;
const CHUNK_SIZE = 100;

async function restore(turso, fromPath) {
    const src = new Database(fromPath, { readonly: true });
    const schema = src.prepare(
        "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type = 'index', name"
    ).all();
    const tables = orderByDependencies(schema.filter(s => s.type === 'table'));
    const summary = {};

    // Drop (tables that reference others first) and recreate in ONE transaction: all or nothing
    await turso.batch([
        ...[...tables].reverse().map(t => `DROP TABLE IF EXISTS ${quote(t.name)}`),
        ...tables.map(t => t.sql),
    ], 'write');
    for (const t of tables) {
        const rows = src.prepare(`SELECT * FROM ${quote(t.name)}`).all();
        if (rows.length > 0) {
            const cols = Object.keys(rows[0]);
            const sql = `INSERT INTO ${quote(t.name)} (${cols.map(quote).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
            for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                await turso.batch(rows.slice(i, i + CHUNK_SIZE).map(r => ({ sql, args: cols.map(c => r[c]) })), 'write');
            }
        }
        summary[t.name] = rows.length;
    }
    for (const idx of schema.filter(s => s.type === 'index')) await turso.execute(idx.sql);
    src.close();
    return summary;
}

async function run() {
    const target = resolveTarget();
    const fromArg = process.argv.find(a => a.startsWith('--from='));
    if (!fromArg) throw new Error('Pass the backup file with --from=path/to/file.db');
    const fromPath = path.resolve(fromArg.split('=')[1]);
    if (!fs.existsSync(fromPath)) throw new Error(`Backup file not found: ${fromPath}`);

    if (target === 'production' && !process.argv.includes('--confirm-production')) {
        throw new Error('Restoring replaces live tables. Re-run with --confirm-production if you really mean production.');
    }
    const { client, url } = connect(target);

    if (target === 'production') {
        const safety = path.join(path.dirname(fromPath), `turso-production-before-restore-${Date.now()}.db`);
        console.log(`🛟 Taking a safety backup of production first → ${safety}`);
        await backup(client, safety);
    }

    console.log(`♻️  Restoring ${fromPath} → Turso (${target}: ${describe(url)})`);
    const summary = await restore(client, fromPath);
    Object.entries(summary).forEach(([table, count]) => console.log(`   ${table}: ${count} rows`));
    console.log('✅ Restore complete');
}

if (require.main === module) {
    run().catch(error => {
        console.error(`❌ Restore failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { restore };
