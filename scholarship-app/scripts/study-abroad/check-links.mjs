/**
 * Study Abroad route & link check (IS-137 / LINKING_RULES.md).
 *
 * Fails if any published page links to a draft, hidden country, redirect, or missing page,
 * or if any published university or course page has fewer than 3 incoming links.
 *
 * Usage:
 *   node scripts/study-abroad/check-links.mjs [--db=/path/to/scholarships.db] [--target=staging|production]
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { auditStudyAbroadLinkGraph } = require('../lib/quality-rules');
const { resolveTarget, connect } = require('../lib/turso-target');

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB = join(__dirname, '..', '..', 'data', 'scholarships.db');

function readLocalSqlite(dbPath) {
    try {
        const Database = require('better-sqlite3');
        const db = new Database(dbPath, { readonly: true });
        try {
            return {
                universities: db.prepare('SELECT * FROM sa_universities').all(),
                guides: db.prepare('SELECT * FROM sa_guides').all(),
                programs: db.prepare('SELECT * FROM sa_programs').all(),
            };
        } finally {
            db.close();
        }
    } catch {
        const queryJson = sql => {
            const out = execFileSync('sqlite3', ['-readonly', '-json', dbPath, sql], {
                encoding: 'utf8',
                maxBuffer: 50 * 1024 * 1024,
            });
            return out.trim() ? JSON.parse(out) : [];
        };
        return {
            universities: queryJson('SELECT * FROM sa_universities'),
            guides: queryJson('SELECT * FROM sa_guides'),
            programs: queryJson('SELECT * FROM sa_programs'),
        };
    }
}

async function loadData() {
    const dbArg = process.argv.find(a => a.startsWith('--db='));
    const targetArg = process.argv.find(a => a.startsWith('--target='));

    if (!targetArg && (dbArg || existsSync(DEFAULT_DB))) {
        const dbPath = dbArg ? dbArg.slice('--db='.length) : DEFAULT_DB;
        return readLocalSqlite(dbPath);
    }

    const { target, url, authToken } = resolveTarget();
    console.log(`Connecting to Turso (${target})...`);
    const client = connect(url, authToken);
    const [u, g, p] = await Promise.all([
        client.execute('SELECT * FROM sa_universities'),
        client.execute('SELECT * FROM sa_guides'),
        client.execute('SELECT * FROM sa_programs'),
    ]);
    return {
        universities: u.rows.map(r => ({ ...r })),
        guides: g.rows.map(r => ({ ...r })),
        programs: p.rows.map(r => ({ ...r })),
    };
}

const data = await loadData();
const result = auditStudyAbroadLinkGraph(data);

console.log(`Checked ${result.summary.universitiesChecked} universities, ${result.summary.programsChecked} programs.`);
console.log(`Rule 6 (broken/draft/redirect/unlaunched) errors: ${result.summary.rule6Errors}`);
console.log(`Incoming links (<3) errors: ${result.summary.lowIncomingErrors}`);

if (result.issues.length > 0) {
    console.error('\nLink check failures:');
    for (const issue of result.issues) {
        console.error(`- [${issue.code}] ${issue.path}: ${issue.message}`);
    }
    process.exit(1);
}

console.log('All link checks passed.');
