const path = require('path');
const Database = require('better-sqlite3');
const readline = require('readline');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const args = process.argv.slice(2);
const autoApprove = args.includes('--yes') || args.includes('-y');

console.log('📝 Apply Pending Reviewed Changes');
console.log('---------------------------------');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    // 1. Get all pending reviews
    const pendingLogs = db.prepare(`
        SELECT id, scholarship_id, scholarship_title, details, timestamp 
        FROM scholarship_changelog 
        WHERE action_type = 'pending_review'
        ORDER BY id ASC
    `).all();

    if (pendingLogs.length === 0) {
        console.log('✅ No pending changes to review. Database is up to date.');
        db.close();
        rl.close();
        return;
    }

    console.log(`📋 Found ${pendingLogs.length} pending review entries:\n`);

    let appliedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < pendingLogs.length; i++) {
        const log = pendingLogs[i];
        console.log(`[${i + 1}/${pendingLogs.length}] Scholarship: "${log.scholarship_title}" (ID: ${log.scholarship_id})`);
        
        let details = {};
        try {
            details = JSON.parse(log.details);
        } catch (e) {
            console.log(`   ⚠️ Failed to parse changelog details: ${log.details}`);
            continue;
        }

        const changes = details.changes || [];
        const source = details.source_citation || 'Unknown Source';

        console.log(`   Source: ${source}`);
        console.log(`   Changes:`);
        changes.forEach(c => {
            console.log(`     • ${c.field}: ${c.old} -> ${c.new}`);
        });

        let approve = false;
        if (autoApprove) {
            approve = true;
            console.log(`   [Auto-Approve] Applying changes...`);
        } else {
            const answer = await askQuestion(`   Apply these changes? (y/n/skip): `);
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                approve = true;
            }
        }

        if (approve) {
            try {
                // Begin Transaction for safe update
                db.transaction(() => {
                    // Build dynamic update set
                    changes.forEach(c => {
                        // Validate field name to prevent SQL injection
                        const allowedFields = ['deadline', 'deadline_description', 'amount_annual', 'amount_min', 'official_source', 'apply_url', 'helpline'];
                        if (!allowedFields.includes(c.field)) {
                            throw new Error(`Unauthorized field update: ${c.field}`);
                        }

                        // Determine field type for casting
                        let value = c.new;
                        if (c.field === 'amount_annual' || c.field === 'amount_min') {
                            value = Number(c.new);
                        }

                        db.prepare(`
                            UPDATE scholarships 
                            SET ${c.field} = ?, 
                                verified_status = 'Verified',
                                last_verified = datetime('now')
                            WHERE id = ?
                        `).run(value, log.scholarship_id);
                    });

                    // Update the changelog action type so it isn't processed again
                    db.prepare(`
                        UPDATE scholarship_changelog 
                        SET action_type = 'reviewed_applied' 
                        WHERE id = ?
                    `).run(log.id);
                })();

                console.log(`   ✅ Changes applied successfully.\n`);
                appliedCount++;
            } catch (err) {
                console.error(`   ❌ Failed to apply changes: ${err.message}\n`);
            }
        } else {
            console.log(`   ⏭️ Skipped.\n`);
            skippedCount++;
        }
    }

    console.log('==================================================');
    console.log(`🏁 Review process completed.`);
    console.log(`   Applied: ${appliedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log('==================================================');

    db.close();
    rl.close();

    if (appliedCount > 0) {
        let runPush = false;
        if (autoApprove) {
            runPush = true;
        } else {
            const rlPush = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const askPush = (query) => new Promise(resolve => rlPush.question(query, resolve));
            const answer = await askPush(`\nPush updated database to Turso Cloud? (y/n): `);
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                runPush = true;
            }
            rlPush.close();
        }

        if (runPush) {
            console.log('📡 Syncing local database to Turso Cloud...');
            try {
                execSync('node scripts/push-to-turso.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
                console.log('✅ Turso synchronization complete.');
            } catch (err) {
                console.error('❌ Failed to sync to Turso:', err.message);
                console.log('👉 Please manually run: node scripts/push-to-turso.js');
            }
        } else {
            console.log('\n👉 Reminder: Push changes to Turso Cloud when ready:');
            console.log('   node scripts/push-to-turso.js');
        }
    }
}

main();
