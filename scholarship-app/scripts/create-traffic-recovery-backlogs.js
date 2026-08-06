const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(DB_PATH);

const newTasks = [
    {
        id: 'CNT-101',
        title: 'Keyword Demand & Search Intent Audit (Aug 2026 - Jan 2027)',
        description: 'Audit search volume, intent, and keyword clusters across the 28 CSVs in Keyword research/ to identify top volume queries (UP Scholarship, NSP 2.0, SSP Karnataka, Oasis WB, Study Abroad).',
        impact: 'High',
        status: 'Done',
        type: 'Audit',
        category: 'content'
    },
    {
        id: 'CNT-102',
        title: '6-Month Seasonal Scholarship Boosting (Aug 2026 – Jan 2027)',
        description: 'Refresh 299+ scholarships active for the upcoming 2026-27 cycle. Bulk update 97 expired deadlines, set verification_year="2026-27", set status="Open", and set is_featured=1 for top portal powerhouses.',
        impact: 'Critical',
        status: 'In Progress',
        type: 'Optimization',
        category: 'content'
    },
    {
        id: 'CNT-103',
        title: 'Ingest Missing High-Demand Scholarships from Keyword Research',
        description: 'Ingest missing state, national, and corporate scholarships identified from keyword research (e.g. UP Dashmotar 2026-27, NSP OTR schemes, Bihar Post-Matric, sports/NTPC schemes) adhering to 5-step schema rules.',
        impact: 'High',
        status: 'Backlog',
        type: 'Ingestion',
        category: 'content'
    },
    {
        id: 'CNT-104',
        title: 'Pillar Article Production & Thin Content Fix (500+ Words)',
        description: 'Expand 36 thin articles (<500 words) to 700+ words and write new procedural pillar guides (/guides, /articles, /news) targeting NSP, UP, SSP, SVMCM, and Study Abroad with mandatory interlinking, key takeaway boxes, and 0 forbidden pronouns.',
        impact: 'Critical',
        status: 'Backlog',
        type: 'Feature',
        category: 'content'
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
console.log('\n🎉 Successfully created all 4 backlog tasks in SQLite DB (data/scholarships.db)!');
