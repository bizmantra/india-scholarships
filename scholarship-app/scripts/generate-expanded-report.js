const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const PROJECT_DIR = '/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app';
const DATA_DIR = path.join(PROJECT_DIR, 'data', 'gsc-june-2026');
const dbPath = path.join(PROJECT_DIR, 'data', 'scholarships.db');
const targetFile = '/Users/roshankumar/.gemini/antigravity/brain/9780199c-5969-4234-a634-dd4fbdb7c9e4/low_ctr_expanded_audit.md';

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

// Filter detail pages with CTR < 2.0%
const lowCtrDetails = pageList.filter(p => p.url.startsWith('/scholarships/') && parseFloat(p.ctr) < 2.0);

const tier1 = lowCtrDetails.filter(p => p.impressions > 50000).sort((a,b)=>b.impressions-a.impressions);
const tier2 = lowCtrDetails.filter(p => p.impressions > 10000 && p.impressions <= 50000).sort((a,b)=>b.impressions-a.impressions);
const tier3 = lowCtrDetails.filter(p => p.impressions > 5000 && p.impressions <= 10000).sort((a,b)=>b.impressions-a.impressions);

const getPageInfo = (page) => {
    const slug = page.url.replace('/scholarships/', '');
    const row = db.prepare('SELECT title, amount_annual, min_marks, docs_needed, step_guide, faq_json, helpline FROM scholarships WHERE slug = ?').get(slug);
    
    if (!row) return null;

    const gaps = [];
    if (row.amount_annual === null || row.amount_annual === 0) gaps.push('Amount');
    if (row.min_marks === null || row.min_marks === 0) gaps.push('Marks');
    if (!row.docs_needed || row.docs_needed === '[]' || row.docs_needed.length === 0) gaps.push('Docs');
    if (!row.step_guide || row.step_guide.trim() === '') gaps.push('Step Guide');
    if (!row.faq_json || row.faq_json === '[]' || row.faq_json.length === 0) gaps.push('FAQs');
    if (!row.helpline || row.helpline.trim() === '' || row.helpline.toLowerCase().includes('contact')) gaps.push('Helpline');

    // Find queries matching key terms in slug
    const terms = slug.split('-');
    const pageQueries = queriesMapped.filter(q => {
        let matches = 0;
        terms.forEach(t => {
            if (t.length > 3 && q.query.toLowerCase().includes(t)) matches++;
        });
        return matches >= 2;
    }).sort((a, b) => b.impressions - a.impressions).slice(0, 2);

    return {
        url: page.url,
        title: row.title,
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: page.ctr,
        pos: page.pos,
        gaps: gaps,
        queries: pageQueries.map(q => `${q.query} (${q.ctr} CTR)`).join(', ')
    };
};

let mdContent = `# 📈 Expanded Low-CTR Pages Audit Report

This report expands our Click-Through Rate (CTR) analysis by lowering the impression thresholds. It details all scholarship pages with **CTR < 2.0%** across different traffic tiers, identifies their database content gaps, and lists top queries.

---

## 📊 Summary of Low-CTR Pages by Tier

*   **Tier 1 (> 50,000 impressions/month):** **${tier1.length}** pages (including 4 previously optimized state portals).
*   **Tier 2 (10,000 - 50,000 impressions/month):** **${tier2.length}** pages.
*   **Tier 3 (5,000 - 10,000 impressions/month):** **${tier3.length}** pages.
*   **Total Low-CTR Pages (> 5,000 impressions):** **${tier1.length + tier2.length + tier3.length}** pages.

---

## 🔴 Tier 1: Very High Traffic (> 50,000 monthly impressions)

These pages are ranking highly and getting massive impressions but suffer from poor click-through rates.

| Scholarship / URL | Impressions | Clicks | CTR | Pos | Content Gaps | Key Search Queries |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

tier1.forEach(p => {
    const info = getPageInfo(p);
    if (!info) return;
    mdContent += `| [${info.title}](file://${PROJECT_DIR}/app/scholarships/${p.url.replace('/scholarships/', '')}/page.tsx) <br> \`${info.url}\` | ${info.impressions.toLocaleString()} | ${info.clicks} | ${info.ctr} | ${info.pos.toFixed(2)} | **${info.gaps.join(', ') || 'None'}** | ${info.queries || 'N/A'} |\n`;
});

mdContent += `
---

## 🟡 Tier 2: High Traffic (10,000 - 50,000 monthly impressions)

These pages represent the next major growth opportunity. Optimizing these will diversify site traffic away from the top performing pages.

| Scholarship / URL | Impressions | Clicks | CTR | Pos | Content Gaps | Key Search Queries |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

tier2.forEach(p => {
    const info = getPageInfo(p);
    if (!info) return;
    mdContent += `| [${info.title}](file://${PROJECT_DIR}/app/scholarships/${p.url.replace('/scholarships/', '')}/page.tsx) <br> \`${info.url}\` | ${info.impressions.toLocaleString()} | ${info.clicks} | ${info.ctr} | ${info.pos.toFixed(2)} | **${info.gaps.join(', ') || 'None'}** | ${info.queries || 'N/A'} |\n`;
});

mdContent += `
---

## 🟢 Tier 3: Medium Traffic (5,000 - 10,000 monthly impressions)

| Scholarship / URL | Impressions | Clicks | CTR | Pos | Content Gaps | Key Search Queries |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

tier3.forEach(p => {
    const info = getPageInfo(p);
    if (!info) return;
    mdContent += `| [${info.title}](file://${PROJECT_DIR}/app/scholarships/${p.url.replace('/scholarships/', '')}/page.tsx) <br> \`${info.url}\` | ${info.impressions.toLocaleString()} | ${info.clicks} | ${info.ctr} | ${info.pos.toFixed(2)} | **${info.gaps.join(', ') || 'None'}** | ${info.queries || 'N/A'} |\n`;
});

fs.writeFileSync(targetFile, mdContent);
console.log('Report generated successfully at ' + targetFile);
db.close();
