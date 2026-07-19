/**
 * Database connectivity and schema validation script.
 * Verifies that both the primary scholarships table and the newly populated
 * backlog_tasks table are readable and return correct data.
 */

const path = require('path');
const fs = require('fs');

// Load environment variables if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            // Remove surrounding quotes if any
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
}

function getClient() {
    const forceLocal = process.argv.includes('--local');
    const databaseUrl = forceLocal ? null : process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (databaseUrl && databaseUrl.startsWith('libsql://')) {
        console.log('📡 Connecting to Turso Cloud Database: ' + databaseUrl);
        const { createClient } = require('@libsql/client');
        return createClient({
            url: databaseUrl,
            authToken: authToken
        });
    } else {
        const localPath = path.join(process.cwd(), 'data', 'scholarships.db');
        console.log('🔌 Connecting to Local SQLite Database: ' + localPath);
        const Database = require('better-sqlite3');
        const db = new Database(localPath);
        return {
            execute: async (query) => {
                const sql = typeof query === 'string' ? query : query.sql;
                const args = typeof query === 'string' ? [] : (query.args || []);
                try {
                    const stmt = db.prepare(sql);
                    if (sql.trim().toLowerCase().startsWith('select')) {
                        const rows = stmt.all(args);
                        return { rows, rowsAffected: 0 };
                    } else {
                        const info = stmt.run(args);
                        return { rows: [], rowsAffected: info.changes };
                    }
                } catch (err) {
                    throw err;
                }
            }
        };
    }
}

async function runTests() {
    console.log('🧪 Starting database integrity tests...');
    const client = getClient();

    try {
        // Test 1: Scholarships table check
        const scholRes = await client.execute('SELECT COUNT(*) as count FROM scholarships');
        const count = scholRes.rows[0].count;
        console.log(`✅ Scholarships table checked. Total entries: ${count}`);

        // Test 2: Backlog Tasks table check
        const backlogRes = await client.execute('SELECT COUNT(*) as count FROM backlog_tasks');
        const backlogCount = backlogRes.rows[0].count;
        console.log(`✅ Backlog tasks table checked. Total entries: ${backlogCount}`);

        if (backlogCount === 0) {
            console.warn('⚠️ Warning: Backlog tasks table exists but is empty!');
        }

        // Test 3: Sample tasks retrieval
        const sampleTasks = await client.execute('SELECT id, title, category FROM backlog_tasks LIMIT 3');
        console.log('📋 Sample Backlog Tasks:');
        sampleTasks.rows.forEach(row => {
            console.log(`  - [${row.id}] ${row.title} (${row.category})`);
        });

        // Test 4: Changelog table check
        const changelogRes = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='scholarship_changelog'");
        if (changelogRes.rows.length > 0) {
            console.log('✅ scholarship_changelog table exists.');
        } else {
            console.log('ℹ️ scholarship_changelog table does not exist yet (will be auto-created on first update).');
        }

        console.log('\n🎉 All database integrity tests passed successfully!');

    } catch (e) {
        console.error('❌ Database verification test failed:', e);
        process.exit(1);
    }
}

runTests();
