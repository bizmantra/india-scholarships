/**
 * Add the Study Abroad columns that were introduced after a table was created (SA_ADDED_COLUMNS in
 * scripts/lib/study-abroad-tables.js) to a Turso database. Only adds missing nullable TEXT columns;
 * never changes or removes data. Safe to run more than once.
 *
 *   node scripts/study-abroad/add-columns.mjs [--target=staging|production] [--dry-run]
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { resolveTarget, connect, describe } = require('../lib/turso-target');
const { SA_ADDED_COLUMNS } = require('../lib/study-abroad-tables');

const dryRun = process.argv.includes('--dry-run');
const target = resolveTarget();
const { client, url } = connect(target);
console.log(`Study Abroad columns on ${target} (${describe(url)})${dryRun ? ' · dry run' : ''}`);

let added = 0;
for (const [table, columns] of Object.entries(SA_ADDED_COLUMNS)) {
    const have = new Set((await client.execute(`PRAGMA table_info(${table})`)).rows.map(r => String(r.name)));
    if (!have.size) { console.log(`  ${table}: table not found, skipped`); continue; }
    for (const col of columns) {
        if (have.has(col)) continue;
        if (!dryRun) await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`);
        console.log(`  + ${table}.${col}`);
        added++;
    }
}
console.log(added ? `Added ${added} column(s).${dryRun ? ' (dry run: nothing written)' : ''}` : 'Nothing to add.');
