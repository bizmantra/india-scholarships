const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const KEYWORD_DIR = path.join(__dirname, '..', 'Keyword research');
const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');

const db = new Database(DB_PATH);
const dbScholarships = db.prepare("SELECT id, title, slug, deadline, verification_year, is_featured, amount_annual FROM scholarships").all();

const csvFiles = fs.readdirSync(KEYWORD_DIR).filter(f => f.endsWith('.csv'));
const keywordMap = new Map();

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

csvFiles.forEach(file => {
    const filePath = path.join(KEYWORD_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const lines = raw.split('\n');
    if (lines.length < 2) return;

    let kwColIndex = 0;
    let volColIndex = 1;

    // Detect header
    const header = parseCsvLine(lines[0]);
    header.forEach((col, idx) => {
        const lower = col.toLowerCase();
        if (lower.includes('keyword') || lower.includes('search term') || lower.includes('query')) {
            kwColIndex = idx;
        }
        if (lower.includes('volume') || lower.includes('search volume') || lower.includes('vol')) {
            volColIndex = idx;
        }
    });

    lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const cols = parseCsvLine(line);
        if (cols.length > kwColIndex) {
            const kw = cols[kwColIndex].toLowerCase().trim();
            if (kw && kw.length > 2 && isNaN(kw)) {
                let vol = 0;
                if (cols.length > volColIndex) {
                    vol = parseInt(cols[volColIndex].replace(/,/g, ''), 10) || 0;
                }
                keywordMap.set(kw, (keywordMap.get(kw) || 0) + (vol > 0 ? vol : 10));
            }
        }
    });
});

const sortedKeywords = Array.from(keywordMap.entries()).sort((a, b) => b[1] - a[1]);

console.log('=== REAL TOP 30 SEARCH KEYWORD DEMANDS ===');
sortedKeywords.slice(0, 30).forEach(([kw, vol], i) => {
    console.log(`${(i + 1).toString().padStart(2, ' ')}. ${kw.padEnd(45, ' ')} | Search Volume/Score: ${vol}`);
});
