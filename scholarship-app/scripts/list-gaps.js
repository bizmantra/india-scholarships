const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));
const db = new Database(dbPath);

const pageList = pages.slice(1).map(p => ({
    url: p[0].replace('https://www.indiascholarships.in', '').trim(),
    clicks: Number(p[1] || 0),
    impressions: Number(p[2] || 0),
    ctr: p[3],
    pos: Number(p[4] || 0)
}));

// Impressions > 5,000, CTR < 2.0%
const lowCtrDetails = pageList.filter(p => p.url.startsWith('/scholarships/') && p.impressions > 5000 && parseFloat(p.ctr) < 2.0);

const gapsList = [];

lowCtrDetails.forEach(page => {
    const slug = page.url.replace('/scholarships/', '');
    const row = db.prepare('SELECT title, provider, amount_annual, amount_description, min_marks, selection, renewal, helpline, faq_json FROM scholarships WHERE slug = ?').get(slug);
    
    if (!row) return;

    const gaps = [];
    if (!row.amount_description || row.amount_description.trim() === '') gaps.push('amount_description');
    if (!row.selection || row.selection.trim() === '') gaps.push('selection');
    if (!row.renewal || row.renewal.trim() === '') gaps.push('renewal');
    if (!row.helpline || row.helpline.trim() === '' || row.helpline.toLowerCase().includes('contact')) gaps.push('helpline');
    if (!row.faq_json || row.faq_json === '[]' || row.faq_json.length === 0) gaps.push('faq_json');

    if (gaps.length > 0) {
        gapsList.push({
            slug,
            title: row.title,
            provider: row.provider || 'State/Central Government',
            impressions: page.impressions,
            ctr: page.ctr,
            gaps
        });
    }
});

fs.writeFileSync(path.join(__dirname, '..', 'data', 'gaps-list.json'), JSON.stringify(gapsList, null, 2));
console.log(`Saved ${gapsList.length} low-CTR scholarships with gaps to gaps-list.json`);

db.close();
