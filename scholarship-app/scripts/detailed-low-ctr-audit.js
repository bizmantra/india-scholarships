const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));
const queries = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'queries.json'), 'utf-8'));
const db = new Database(dbPath);

// Prepare queries mapped to pages (heuristically using keywords)
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

// Filter for low CTR detail pages (Impressions > 50,000, CTR < 2.0%)
const lowCtrDetails = pageList.filter(p => p.url.startsWith('/scholarships/') && p.impressions > 50000 && parseFloat(p.ctr) < 2.0);

console.log(`Analyzing ${lowCtrDetails.length} high-impression low-CTR pages...\n`);

const auditResults = [];

lowCtrDetails.forEach(page => {
    const slug = page.url.replace('/scholarships/', '');
    const row = db.prepare('SELECT title, amount_annual, min_marks, docs_needed, step_guide, faq_json, helpline FROM scholarships WHERE slug = ?').get(slug);
    
    if (!row) {
        // Might be a legacy page or redirected
        return;
    }

    // Find queries matching key terms in slug
    const terms = slug.split('-');
    const pageQueries = queriesMapped.filter(q => {
        // match if query contains at least two key terms
        let matches = 0;
        terms.forEach(t => {
            if (t.length > 3 && q.query.toLowerCase().includes(t)) matches++;
        });
        return matches >= 2;
    }).sort((a, b) => b.impressions - a.impressions).slice(0, 3);

    // Identify DB gaps
    const gaps = [];
    if (row.amount_annual === null || row.amount_annual === 0) gaps.push('amount_annual (missing/variable)');
    if (row.min_marks === null || row.min_marks === 0) gaps.push('min_marks');
    if (!row.docs_needed || row.docs_needed === '[]' || row.docs_needed.length === 0) gaps.push('docs_needed');
    if (!row.step_guide || row.step_guide.trim() === '') gaps.push('step_guide');
    if (!row.faq_json || row.faq_json === '[]' || row.faq_json.length === 0) gaps.push('faq_json');
    if (!row.helpline || row.helpline.trim() === '' || row.helpline.toLowerCase().includes('contact')) gaps.push('helpline');

    auditResults.push({
        url: page.url,
        title: row.title,
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: page.ctr,
        pos: page.pos,
        topQueries: pageQueries,
        gaps: gaps
    });
});

console.log(JSON.stringify(auditResults, null, 2));

db.close();
