const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const devJsonPath = path.join(__dirname, '..', 'data', 'backlog-dev.json');
const contentJsonPath = path.join(__dirname, '..', 'data', 'backlog-content.json');

console.log('🏁 Starting Backlog Database Migration...\n');
console.log(`Connecting to database at: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found. Run database initialization first.');
    process.exit(1);
}

const db = new Database(dbPath);

try {
    // 1. Create backlog table
    console.log('🛠️ Creating backlog_tasks table...');
    db.prepare(`
        CREATE TABLE IF NOT EXISTS backlog_tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            impact TEXT,
            status TEXT,
            type TEXT,
            category TEXT
        )
    `).run();
    console.log('✅ backlog_tasks table is ready.');

    // 2. Read and parse dev tasks
    let devTasks = [];
    if (fs.existsSync(devJsonPath)) {
        try {
            devTasks = JSON.parse(fs.readFileSync(devJsonPath, 'utf8'));
            console.log(`📖 Loaded ${devTasks.length} tasks from backlog-dev.json`);
        } catch (e) {
            console.error('❌ Failed to parse backlog-dev.json:', e.message);
        }
    } else {
        console.log('⚠️ backlog-dev.json not found. Skipping.');
    }

    // 3. Read and parse content tasks
    let contentTasks = [];
    if (fs.existsSync(contentJsonPath)) {
        try {
            contentTasks = JSON.parse(fs.readFileSync(contentJsonPath, 'utf8'));
            console.log(`📖 Loaded ${contentTasks.length} tasks from backlog-content.json`);
        } catch (e) {
            console.error('❌ Failed to parse backlog-content.json:', e.message);
        }
    } else {
        console.log('⚠️ backlog-content.json not found. Skipping.');
    }

    // 4. Seed tasks into database
    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO backlog_tasks (id, title, description, impact, status, type, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let seededCount = 0;

    const transaction = db.transaction((tasks, categoryName) => {
        for (const task of tasks) {
            insertStmt.run(
                task.id,
                task.title || '',
                task.description || '',
                task.impact || 'Medium',
                task.status || 'Backlog',
                task.type || '',
                categoryName
            );
            seededCount++;
        }
    });

    if (devTasks.length > 0) {
        transaction(devTasks, 'dev');
    }
    if (contentTasks.length > 0) {
        transaction(contentTasks, 'content');
    }

    console.log(`\n🎉 Migration successful! Seeded ${seededCount} total tasks into backlog_tasks table.`);

} catch (error) {
    console.error('❌ Migration failed with error:', error.message);
} finally {
    db.close();
}
