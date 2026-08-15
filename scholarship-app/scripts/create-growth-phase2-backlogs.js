const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(DB_PATH);

const newTasks = [
    {
        id: 'CNT-105',
        title: 'Broadcast 2026-27 Updates to Telegram Channel',
        description: 'Broadcast top boosted 2026-27 scholarships (UP, NSP, SSP, Chevening) to Telegram subscribers via bot API to drive instant referral traffic.',
        impact: 'High',
        status: 'In Progress',
        type: 'Distribution',
        category: 'marketing'
    },
    {
        id: 'CNT-106',
        title: 'Auto-Inject Contextual Money Page & State Hub Interlinks',
        description: 'Run inject-news-links.js to automatically inject contextual internal links across news items pointing to state hubs (/scholarships-in/[state]) and money pages (/scholarships/[slug]).',
        impact: 'High',
        status: 'Backlog',
        type: 'SEO',
        category: 'content'
    },
    {
        id: 'CNT-107',
        title: 'Google Rich Snippet & Schema Audit (FinancialAid & FAQPage)',
        description: 'Verify FinancialAid and FAQPage JSON-LD schema markup across all 482 detail pages to secure SERP rich snippet features.',
        impact: 'Critical',
        status: 'Backlog',
        type: 'SEO',
        category: 'dev'
    },
    {
        id: 'CNT-108',
        title: 'Audit 404s & Broken Internal Redirects',
        description: 'Run check_404s.js to verify zero broken links, invalid redirects, or 404 errors exist across all active routes.',
        impact: 'High',
        status: 'Backlog',
        type: 'QA',
        category: 'dev'
    }
];

const insert = db.prepare(`
    INSERT OR REPLACE INTO backlog_tasks (id, title, description, impact, status, type, category)
    VALUES (@id, @title, @description, @impact, @status, @type, @category)
`);

const insertMany = db.transaction((tasks) => {
    for (const t of tasks) {
        insert.run(t);
        console.log(`✅ Backlog task created/updated: [${t.id}] ${t.title}`);
    }
});

insertMany(newTasks);
console.log('\n🎉 Successfully added all 4 Phase 2 Growth tasks to SQLite backlog_tasks!');
