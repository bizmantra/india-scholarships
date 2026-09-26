/**
 * Review the agent inbox from the terminal (the command center in /admin does the same in the browser).
 *
 * Works on the local copy: run `npm run db:pull` first. Decisions are pushed to Turso at the end.
 *
 * Usage: node scripts/apply-reviewed-changes.js [--category=date_change|value_change|wording|new_scholarship] [--yes] [--by=name]
 *   --yes   approve every item shown without asking (use with --category)
 */
const path = require('path');
const Database = require('better-sqlite3');
const readline = require('readline');
const { execSync } = require('child_process');
const inbox = require('./lib/agent-inbox');

const args = process.argv.slice(2);
const argValue = name => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const autoApprove = args.includes('--yes') || args.includes('-y');
const category = argValue('category');
const actor = argValue('by') || process.env.USER || 'terminal';

const db = new Database(path.join(__dirname, '..', 'data', 'scholarships.db'));
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = query => new Promise(resolve => rl.question(query, resolve));

async function main() {
    inbox.ensureAgentTables(db);
    const pending = db.prepare(`SELECT * FROM agent_proposals WHERE status = 'pending' ${category ? 'AND category = ?' : ''}
                                ORDER BY CASE category WHEN 'date_change' THEN 0 WHEN 'new_scholarship' THEN 1 WHEN 'value_change' THEN 2 ELSE 3 END,
                                scholarship_id, field`).all(...(category ? [category] : []));

    console.log('📝 Agent inbox review');
    if (pending.length === 0) {
        console.log('✅ Nothing waiting for review.');
        return finish(0);
    }
    console.log(`📋 ${pending.length} item(s) waiting${category ? ` in "${category}"` : ''}. Answer y = approve, n = reject, Enter = skip, q = stop.\n`);

    let decisions = 0;
    for (let i = 0; i < pending.length; i++) {
        const p = pending[i];
        console.log(`[${i + 1}/${pending.length}] ${p.scholarship_title} (${p.scholarship_id}) · ${p.category}${p.risk === 'high' ? ' · ⚠️ high risk' : ''}`);
        if (p.kind === 'new_scholarship') {
            const record = JSON.parse(p.payload_json || '{}');
            console.log(`   New scholarship by ${record.provider || '—'} · ${record.amount_description || '—'} · deadline ${record.deadline || '—'}`);
        } else {
            console.log(`   ${p.field}: ${p.old_value || '(empty)'} → ${p.new_value}   (proposed ${p.times_proposed}×)`);
        }
        console.log(`   Source: ${p.source_citation || '—'}`);

        const answer = autoApprove ? 'y' : (await ask('   Decision (y/n/Enter/q): ')).trim().toLowerCase();
        if (answer === 'q') break;
        try {
            if (answer === 'y' || answer === 'yes') {
                if (p.kind === 'new_scholarship') inbox.approveNewScholarship(db, p, actor);
                else inbox.approveFieldProposal(db, p, actor);
                decisions++;
                console.log('   ✅ Approved\n');
            } else if (answer === 'n' || answer === 'no') {
                inbox.rejectProposal(db, p, actor);
                decisions++;
                console.log('   🚫 Rejected (will not be proposed again)\n');
            } else {
                console.log('   ⏭️  Skipped\n');
            }
        } catch (error) {
            console.error(`   ❌ ${error.message}\n`);
        }
    }
    return finish(decisions);
}

async function finish(decisions) {
    db.close();
    if (decisions > 0) {
        const push = autoApprove || /^y/i.test(await ask(`\nPush ${decisions} decision(s) to Turso now? (y/n): `));
        if (push) execSync('node scripts/push-to-turso.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        else console.log('👉 Push when ready: npm run db:push');
    }
    rl.close();
}

main().catch(error => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
});
