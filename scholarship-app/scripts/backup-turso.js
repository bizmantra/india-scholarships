/**
 * Back up a Turso database to a standalone SQLite file.
 *
 * Copies every table (structure, indexes and rows), including the community tables that
 * only exist on Turso. The file can be opened with any SQLite tool, used as a local copy,
 * or loaded back with scripts/restore-turso.js.
 *
 * Usage: node scripts/backup-turso.js [--target=production|staging] [--out=path/to/file.db]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { resolveTarget, connect, describe } = require('./lib/turso-target');

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
const norm = v => (typeof v === 'bigint' ? Number(v) : v instanceof ArrayBuffer ? Buffer.from(v) : v);

async function backup(turso, outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    const out = new Database(outPath);
    out.pragma('foreign_keys = OFF');

    const schema = (await turso.execute(
        "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' ORDER BY type = 'index', name"
    )).rows;
    const tables = orderByDependencies(schema.filter(s => s.type === 'table'));
    const summary = {};

    for (const t of tables) {
        out.exec(t.sql);
        const rows = (await turso.execute(`SELECT * FROM ${quote(t.name)}`)).rows;
        if (rows.length > 0) {
            const cols = Object.keys(rows[0]);
            const insert = out.prepare(`INSERT INTO ${quote(t.name)} (${cols.map(quote).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`);
            out.transaction(() => rows.forEach(r => insert.run(cols.map(c => norm(r[c])))))();
        }
        summary[t.name] = rows.length;
    }
    for (const idx of schema.filter(s => s.type === 'index')) out.exec(idx.sql);
    out.close();
    return summary;
}

async function run() {
    const target = resolveTarget();
    const { client, url } = connect(target);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outArg = process.argv.find(a => a.startsWith('--out='));
    const outPath = path.resolve(outArg ? outArg.split('=')[1] : path.join(__dirname, '..', 'backups', `turso-${target}-${stamp}.db`));

    console.log(`💾 Backing up Turso (${target}: ${describe(url)}) → ${outPath}`);
    const summary = await backup(client, outPath);
    Object.entries(summary).forEach(([table, count]) => console.log(`   ${table}: ${count} rows`));

    if (!summary.scholarships) {
        throw new Error('Backup contains no scholarships — treating as failed.');
    }
    const sizeMb = (fs.statSync(outPath).size / 1e6).toFixed(1);
    console.log(`✅ Backup complete (${sizeMb} MB)`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `path=${outPath}\n`);
}

if (require.main === module) {
    run().catch(error => {
        console.error(`❌ Backup failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { backup };
