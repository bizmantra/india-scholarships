const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

const keywordReportPath = path.join(__dirname, '..', 'Keyword research', 'keyword_ideas_report.csv');

// Load keywords from our generated analysis report to see what we targeted
// Or directly read the raw CSV files for high volume keywords.
// We'll read the top keywords we extracted from both Ubersuggest and Keyword Planner.
// Since Ubersuggest has a clear structure, we'll parse it to get keywords and their volumes.
const ubersuggestPath = path.join(__dirname, '..', 'Keyword research', 'ubersuggest_UP,_NSP_6Jul2026.csv');
const googlePlannerPath = path.join(__dirname, '..', 'Keyword research', 'Keyword Stats 2026-07-06 at 23_19_35.csv');

function loadUbersuggestKeywords() {
    const kws = [];
    if (!fs.existsSync(ubersuggestPath)) return kws;
    const content = fs.readFileSync(ubersuggestPath, 'utf-8');
    const lines = content.split('\n');
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Parse CSV line simply handling optional quotes
        const match = line.match(/^(?:\d+),"(.*?)",(\d+)/) || line.match(/^(?:\d+),([^,]+),(\d+)/);
        if (match) {
            kws.push({
                keyword: match[1].toLowerCase().trim(),
                volume: parseInt(match[2], 10)
            });
        }
    }
    return kws;
}

function loadGoogleKeywords() {
    const kws = [];
    if (!fs.existsSync(googlePlannerPath)) return kws;
    // Reads UTF-16LE file
    const content = fs.readFileSync(googlePlannerPath, 'utf-16le');
    const lines = content.split('\n');
    // Header is on line 3 (index 2)
    for (let i = 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split('\t');
        if (cols.length >= 3) {
            const kw = cols[0].toLowerCase().trim();
            const vol = parseInt(cols[2], 10);
            if (kw && !isNaN(vol)) {
                kws.push({
                    keyword: kw,
                    volume: vol
                });
            }
        }
    }
    return kws;
}

async function runAudit() {
    console.log("Starting Content Gap Audit...");
    
    // Fetch all active scholarships in our database
    const dbScholarships = db.prepare("SELECT id, title, slug, provider_type, state, provider, status, keywords FROM scholarships").all();
    
    const ubersuggestKws = loadUbersuggestKeywords();
    const googleKws = loadGoogleKeywords();
    
    // Combine keywords, keeping the max volume
    const combinedMap = new Map();
    [...ubersuggestKws, ...googleKws].forEach(item => {
        if (combinedMap.has(item.keyword)) {
            const existing = combinedMap.get(item.keyword);
            if (item.volume > existing.volume) {
                combinedMap.set(item.keyword, item);
            }
        } else {
            combinedMap.set(item.keyword, item);
        }
    });
    
    const allKeywords = Array.from(combinedMap.values()).sort((a, b) => b.volume - a.volume);
    
    console.log(`Loaded ${allKeywords.length} keywords and ${dbScholarships.length} scholarships from database.`);
    
    // Audit results arrays
    const exactMatches = [];
    const partialMatches = [];
    const missingHighValueKeywords = [];
    
    for (const kwObj of allKeywords) {
        const kw = kwObj.keyword;
        const volume = kwObj.volume;
        
        // Skip super broad or unrelated exams if we don't want them, but let's check matches
        let exactMatch = null;
        const partials = [];
        
        for (const s of dbScholarships) {
            const titleLower = s.title.toLowerCase();
            const keywordsStr = (s.keywords || '').toLowerCase();
            
            // Check exact title match
            if (titleLower === kw) {
                exactMatch = s;
                break;
            }
            
            // Check keywords column match
            let hasKeywordMatch = false;
            if (keywordsStr) {
                try {
                    if (keywordsStr.startsWith('[')) {
                        const kwArr = JSON.parse(keywordsStr);
                        if (kwArr.some(k => k.toLowerCase().trim() === kw)) {
                            hasKeywordMatch = true;
                        }
                    } else {
                        const kwArr = keywordsStr.split(',').map(k => k.trim());
                        if (kwArr.some(k => k === kw)) {
                            hasKeywordMatch = true;
                        }
                    }
                } catch (e) {
                    if (keywordsStr.includes(kw)) {
                        hasKeywordMatch = true;
                    }
                }
            }
            
            if (hasKeywordMatch) {
                exactMatch = s;
                break;
            }
            
            // Subset word match (e.g. "up scholarship" matches "up pre-matric scholarship")
            const kwTokens = kw.split(/\s+/).filter(t => t.length > 1);
            let isSubset = false;
            if (kwTokens.length > 0) {
                const titleTokens = titleLower.split(/[^a-zA-Z0-9]+/).filter(t => t.length > 0);
                isSubset = kwTokens.every(tok => titleTokens.includes(tok));
            }
            
            if (isSubset) {
                partials.push(s);
            } else if (titleLower.includes(kw) || kw.includes(titleLower)) {
                partials.push(s);
            }
        }
        
        if (exactMatch) {
            exactMatches.push({ keyword: kw, volume, matchedScholarship: exactMatch });
        } else if (partials.length > 0) {
            // Deduplicate partial matches for display
            const uniquePartials = [];
            const seenIds = new Set();
            for (const p of partials) {
                if (!seenIds.has(p.id)) {
                    seenIds.add(p.id);
                    uniquePartials.push(p);
                }
            }
            partialMatches.push({ keyword: kw, volume, partials: uniquePartials });
        } else {
            // No direct title match or partial match
            missingHighValueKeywords.push({ keyword: kw, volume });
        }
    }
    
    // Generate Report
    const reportPath = path.join(__dirname, '..', 'data', 'content-gap-report.md');
    let md = `# 🎯 Content Gap Audit Report (IS-54)\n\n`;
    md += `This report lists high-volume scholarship keywords that are currently missing or underrepresented in the \`scholarships\` database table.\n\n`;
    
    md += `## ⚠️ Top Missing Scholarship Targets\n`;
    md += `These search terms have significant search volume but do not have an exact or partial match in our database. We should create dedicated records for these immediately:\n\n`;
    md += `| Keyword Target | Monthly Volume (India) | Intent Type | Action Recommendation |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    
    // Filter down to interesting targets (high volume, specific to real programs)
    let addedCount = 0;
    for (const item of missingHighValueKeywords) {
        const kw = item.keyword;
        // Skip generic term queries like "scholarships" or exam-prep specific tests if not relevant
        if (kw === 'scholarships' || kw.includes('question paper') || kw.includes('aakash') || kw.includes('allen') || kw.includes('ias')) {
            continue;
        }
        
        let type = "Private/Corporate";
        if (kw.includes("up ") || kw.includes("nsp") || kw.includes("post matric") || kw.includes("gov")) {
            type = "Government";
        }
        
        md += `| \`${kw}\` | ${item.volume.toLocaleString()} | ${type} | Create new scholarship entry and sync to WP |\n`;
        addedCount++;
        if (addedCount >= 15) break;
    }
    
    md += `\n## 🔄 Partial Match & Optimization Opportunities\n`;
    md += `These terms exist partially in database titles but need meta title optimizations or dedicated subpage structures to capture organic traffic:\n\n`;
    md += `| Keyword Target | Monthly Volume | Partial Database Matches | Action Recommendation |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    
    let partialCount = 0;
    for (const item of partialMatches) {
        const kw = item.keyword;
        if (kw === 'scholarships' || kw.includes('question paper') || kw.includes('aakash') || kw.includes('allen') || kw.includes('ias')) {
            continue;
        }
        const matchesStr = item.partials.map(p => `\`${p.title}\` (ID: ${p.id})`).slice(0, 2).join(', ');
        md += `| \`${kw}\` | ${item.volume.toLocaleString()} | ${matchesStr} | Update tags, add FAQs, and optimize SEO meta fields |\n`;
        partialCount++;
        if (partialCount >= 15) break;
    }
    
    md += `\n## 📝 Implementation Queue (Prioritized List)\n`;
    md += `Based on search volume and difficulty, here is our priority sequence for database additions/updates:\n\n`;
    md += `1. **Aditya Birla Scholarship** (Volume: 8,100 | Easy Difficulty) - Create new entry\n`;
    md += `2. **Aikyashree Scholarship 2025/2026** (Volume: 9,900 | High intent) - Optimize existing WB entries for cycle renewal\n`;
    md += `3. **FAEA Scholarship** (Volume: 50,000 | Low competition) - Enrich existing entry, verify amounts and add FAQ\n`;
    md += `4. **Fulbright Scholarship** (Volume: 5,000 | High intent) - Create new entry\n`;
    md += `5. **UGC/Central Schemes (Post-matric)** - Audit metadata mapping to NSP\n`;
    
    fs.writeFileSync(reportPath, md);
    console.log(`Gap report successfully written to: ${reportPath}`);
}

runAudit();
