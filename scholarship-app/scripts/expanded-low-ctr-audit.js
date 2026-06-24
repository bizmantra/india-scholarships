const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));
const queries = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'queries.json'), 'utf-8'));
const db = new Database(dbPath);

const queriesMapped = queries.slice(1).map(q => ({
    query: q[0],
    clicks: Number(q[1] || 0),
    impressions: Number(q[2] || 0),
    ctr: q[3],
    pos: Number(q[4] || 0)
}));

const pageList = pages.slice(1).map(p => ({
    url: p[0].replace('https://www.indiascholarships.in', '').trim(),
    clicks: Number(p[1] || 0),
    impressions: Number(p[2] || 0),
    ctr: p[3],
    pos: Number(p[4] || 0)
}));

// Filter for low CTR detail pages (Impressions > 10,000, CTR < 2.0%)
const lowCtrDetails = pageList.filter(p => p.url.startsWith('/scholarships/') && p.impressions > 10000 && parseFloat(p.ctr) < 2.0);

console.log(`| Page | Impressions | Clicks | CTR | Position | Gaps |`);
console.log(`| --- | --- | --- | --- | --- | --- |`);

lowCtrDetails.forEach(page => {
    const slug = page.url.replace('/scholarships/', '');
    const row = db.prepare('SELECT title, amount_annual, min_marks, docs_needed, step_guide, faq_json, helpline FROM scholarships WHERE slug = ?').get(slug);
    
    if (!row) return;

    // Identify DB gaps
    const gaps = [];
    if (row.amount_annual === null || row.amount_annual === 0) gaps.push('Amount');
    if (row.min_marks === null || row.min_marks === 0) gaps.push('Marks');
    if (!row.docs_needed || row.docs_needed === '[]' || row.docs_needed.length === 0) gaps.push('Docs');
    if (!row.step_guide || row.step_guide.trim() === '') gaps.push('Step Guide');
    if (!row.faq_json || row.faq_json === '[]' || row.faq_json.length === 0) gaps.push('FAQs');
    if (!row.helpline || row.helpline.trim() === '' || row.helpline.toLowerCase().includes('contact')) gaps.push('Helpline');

    console.log(`| [${row.title}](${page.url}) | ${page.impressions.toLocaleString()} | ${page.clicks} | ${page.ctr} | ${page.pos.toFixed(2)} | ${gaps.join(', ') || 'None'} |`);
});

db.close();
