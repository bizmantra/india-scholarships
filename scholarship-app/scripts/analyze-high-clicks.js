const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));

const list = pages.slice(1).map(p => {
    const url = p[0].trim();
    const clicks = Number(p[1] || 0);
    return { url, clicks };
}).filter(p => p.url.includes('/scholarships/') && p.clicks > 1000);

console.log(`Total scholarships with >1000 clicks: ${list.length}`);
list.forEach(p => {
    console.log(`- ${p.url} (${p.clicks} clicks)`);
});
