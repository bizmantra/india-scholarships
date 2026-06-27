const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const csvPath = path.join(__dirname, '..', '..', 'gsc-coverage-temp', 'Table.csv');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    process.exit(1);
}

if (!fs.existsSync(dbPath)) {
    console.error('Database not found at:', dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

// Helper for slugify function exactly as implemented in next.js app
const CATEGORY_SLUG_MAP = {
    'all categories (sc/st/obc/minority/general) - must possess valid unique disability id (udid) card issued by department for empowerment of persons with disabilities': 'students-with-disabilities',
    'general category - economically weaker section (ews). includes: children of defense personnel (sc/st parents in army/navy/airforce': 'general-ews',
    'government of india.': 'central-government',
    'jco/or/lower ranks - children of unorganized workers (auto drivers)': 'defense-unorganized-workers',
    'semi-nomadic tribes - caste must be in obc list notified by government of india or state government.': 'semi-nomadic-tribes',
    'students with disabilities (persons with disabilities - pwd) with valid udid': 'students-with-disabilities',
    'etc.). general category students with low income. brahmin community students (separate scheme under brahmin development board - verify).': 'general-brahmin',
    'minority communities: muslim': 'minority-muslim',
};

function slugify(text) {
    const input = text.toString().toLowerCase().trim();
    if (CATEGORY_SLUG_MAP[input]) {
        return CATEGORY_SLUG_MAP[input];
    }
    const slug = input
        .replace(/\(.*\)/g, '')    // Remove content inside parentheses
        .replace(/[:\/\\-]/g, ' ') // Replace special separators with spaces
        .replace(/[^\w\s-]/g, '')  // Remove other non-word chars except spaces/hyphens
        .replace(/\s+/g, '-')      // Replace spaces with -
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start
        .replace(/-+$/, '');        // Trim - from end
    const words = slug.split('-');
    if (words.length > 6) {
        return words.slice(0, 6).join('-');
    }
    return slug;
}

// Canonical Levels from Next.js app
const CANONICAL_LEVELS = {
    'class-1-10': {
        label: 'Class 1 to 10',
        rawLevels: [
            'Class 1 to Class 10',
            'Class 1 to Class 8 (Note: ONLY up to Class 8, unlike SC/ST/OBC which go to Class 10)',
            'Class 5-10',
            'Class 9, Class 10',
            'Class 9-10',
            'Pre-Matric (Class 9-10)',
            'School (1-5)',
            'School (9-10)'
        ]
    },
    'class-11-12': {
        label: 'Class 11 & 12',
        rawLevels: [
            'Class 11, Class 12',
            'Class 11-12',
            'Class 10, Class 12',
            'Higher Secondary',
            'Post-Matric (Class 11-12)',
            'School (11-12)'
        ]
    },
    'diploma-polytechnic': {
        label: 'Diploma / Polytechnic',
        rawLevels: [
            'Diploma',
            'Diploma, Undergraduate',
            'Diploma/Polytechnic, ITI/ITC',
            'Diploma/Polytechnic'
        ]
    },
    'iti-courses': {
        label: 'ITI Courses',
        rawLevels: [
            'ITI',
            'ITI/ITC'
        ]
    },
    'graduation-ug': {
        label: 'Graduation (UG)',
        rawLevels: [
            'UG',
            'Undergraduate',
            'Undergraduate (UG)',
            'Graduate',
            'Bachelor'
        ]
    },
    'post-graduation-pg': {
        label: 'Post-Graduation (PG)',
        rawLevels: [
            'PG',
            'Post-Graduate',
            'Postgraduate (PG)',
            'Master',
            'Postgraduate'
        ]
    },
    'phd-research': {
        label: 'PhD & Research',
        rawLevels: [
            'PhD',
            'Postdoctoral',
            'Research'
        ]
    }
};

// Parse CSV content simple CSV parser (handles quoted fields)
function parseCSV(content) {
    const lines = content.split('\n');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle double quotes in CSV
        let url = '';
        let lastCrawled = '';
        if (line.startsWith('"')) {
            const closingQuoteIndex = line.indexOf('"', 1);
            if (closingQuoteIndex !== -1) {
                url = line.substring(1, closingQuoteIndex);
                const rest = line.substring(closingQuoteIndex + 1);
                const parts = rest.split(',');
                lastCrawled = parts[parts.length - 1];
            } else {
                const parts = line.split(',');
                url = parts[0];
                lastCrawled = parts[parts.length - 1];
            }
        } else {
            const parts = line.split(',');
            url = parts[0];
            lastCrawled = parts[parts.length - 1];
        }
        result.push({ url: url.trim(), lastCrawled: lastCrawled.trim() });
    }
    return result;
}

const csvContent = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(csvContent);

console.log(`Analyzing ${rows.length} 404 URLs from GSC coverage report...\n`);

const results = [];

// Get all dynamic values from DB for validation
const dbScholarships = db.prepare('SELECT id, title, slug, status FROM scholarships').all();
const rawLevelsInDb = db.prepare('SELECT DISTINCT level FROM scholarships WHERE level IS NOT NULL').all().map(r => r.level);
const rawStatesInDb = db.prepare('SELECT DISTINCT state FROM scholarships WHERE state IS NOT NULL').all().map(r => r.state);

// For caste/category we need to parse JSON
const rawCastes = db.prepare('SELECT DISTINCT caste FROM scholarships WHERE caste IS NOT NULL').all();
const rawCastesInDb = new Set();
rawCastes.forEach(row => {
    try {
        const castes = JSON.parse(row.caste);
        if (Array.isArray(castes)) {
            castes.forEach(c => rawCastesInDb.add(c));
        } else {
            rawCastesInDb.add(row.caste);
        }
    } catch {
        if (row.caste) rawCastesInDb.add(row.caste);
    }
});

for (const row of rows) {
    const urlStr = row.url;
    let pathname = '';
    try {
        const urlObj = new URL(urlStr);
        pathname = urlObj.pathname;
    } catch (e) {
        pathname = urlStr.replace('https://www.indiascholarships.in', '');
    }

    let type = 'unknown';
    let exists = false;
    let dbMatchDetails = '';
    let actionItem = '';

    if (pathname.startsWith('/scholarships/')) {
        type = 'scholarship-detail';
        const slug = pathname.replace('/scholarships/', '');
        const match = dbScholarships.find(s => s.slug === slug);
        if (match) {
            exists = true;
            dbMatchDetails = `Matches scholarship ID "${match.id}" (Title: "${match.title}", Status: "${match.status}")`;
            actionItem = match.status !== 'Active' ? 'Page exists in DB but is inactive/hidden.' : 'Active in DB. Check route logic or dynamic rendering issues.';
        } else {
            const cleanSlug = slugify(slug);
            const closeMatch = dbScholarships.find(s => s.slug === cleanSlug || s.id === slug);
            if (closeMatch) {
                dbMatchDetails = `Close match: "${closeMatch.slug}" (ID: ${closeMatch.id})`;
                actionItem = `Malformed URL. Redirect old/messy slug to "${closeMatch.slug}".`;
            } else {
                dbMatchDetails = 'No matching slug in DB.';
                actionItem = 'Scholarship not in database or slug has changed.';
            }
        }
    } 
    else if (pathname.startsWith('/scholarships-level/')) {
        type = 'education-level';
        const levelSlug = decodeURIComponent(pathname.replace('/scholarships-level/', ''));
        
        // Check canonical
        const canonical = CANONICAL_LEVELS[levelSlug];
        if (canonical) {
            const placeholders = canonical.rawLevels.map(() => '?').join(',');
            const query = `
                SELECT COUNT(*) as count FROM scholarships 
                WHERE (level IN (${placeholders}) OR level LIKE ?) AND status = 'Active'
            `;
            const countRow = db.prepare(query).get(...canonical.rawLevels, `%${canonical.label}%`);
            exists = countRow.count > 0;
            dbMatchDetails = `Canonical level "${canonical.label}". Active scholarships count: ${countRow.count}`;
            actionItem = exists ? 'Valid canonical page. Verify dynamic routes.' : 'Canonical page exists but has 0 active scholarships (returns 404).';
        } else {
            // Check raw level slugs
            const matchingRaw = rawLevelsInDb.find(l => slugify(l) === levelSlug);
            if (matchingRaw) {
                const countRow = db.prepare('SELECT COUNT(*) as count FROM scholarships WHERE level = ? AND status = \'Active\'').get(matchingRaw);
                exists = countRow.count > 0;
                dbMatchDetails = `Raw level "${matchingRaw}". Active scholarships count: ${countRow.count}`;
                actionItem = exists ? 'Valid raw level page. Verify page query.' : 'Raw level exists in DB but has 0 active scholarships.';
            } else {
                dbMatchDetails = `Invalid level slug "${levelSlug}".`;
                actionItem = 'Malformed or non-existent level. Redirect to homepage or main education directory.';
            }
        }
    }
    else if (pathname.startsWith('/scholarships-for/')) {
        type = 'category-caste';
        const casteSlug = decodeURIComponent(pathname.replace('/scholarships-for/', ''));
        
        const matchingCaste = Array.from(rawCastesInDb).find(c => slugify(c) === casteSlug);
        if (matchingCaste) {
            const countRow = db.prepare('SELECT COUNT(*) as count FROM scholarships WHERE caste LIKE ? AND status = \'Active\'').get(`%${matchingCaste}%`);
            exists = countRow.count > 0;
            dbMatchDetails = `Caste in DB: "${matchingCaste}". Active count: ${countRow.count}`;
            actionItem = exists ? 'Valid category page.' : 'Category exists but has 0 active scholarships.';
        } else {
            dbMatchDetails = 'No matching category in DB.';
            actionItem = 'Malformed category slug. Check category mapper or redirect to /scholarships-by-category.';
        }
    }
    else if (pathname.startsWith('/scholarships-in/')) {
        type = 'state';
        const stateSlug = decodeURIComponent(pathname.replace('/scholarships-in/', ''));
        const matchingState = rawStatesInDb.find(s => slugify(s) === stateSlug);
        if (matchingState) {
            const countRow = db.prepare('SELECT COUNT(*) as count FROM scholarships WHERE state = ? AND status = \'Active\'').get(matchingState);
            exists = countRow.count > 0;
            dbMatchDetails = `State in DB: "${matchingState}". Active count: ${countRow.count}`;
            actionItem = exists ? 'Valid state page.' : 'State exists but has 0 active scholarships.';
        } else {
            dbMatchDetails = 'No matching state in DB.';
            actionItem = 'Invalid state slug. Redirect to /state-scholarships.';
        }
    }
    else if (pathname.startsWith('/state/')) {
        type = 'legacy-state-route';
        const stateSlug = decodeURIComponent(pathname.replace('/state/', ''));
        const matchingState = rawStatesInDb.find(s => slugify(s) === stateSlug);
        dbMatchDetails = matchingState ? `Legacy path. State exists: "${matchingState}"` : 'Legacy path. State not found in DB.';
        actionItem = matchingState ? `Redirect /state/${stateSlug} to /scholarships-in/${slugify(matchingState)}.` : 'Redirect to /state-scholarships.';
    }
    else {
        type = 'other-route';
        const knownRoutes = [
            '/', '/scholarships', '/state-scholarships', '/scholarships-by-category',
            '/scholarships-by-education', '/scholarships-by-income', '/government-scholarships',
            '/private-scholarships', '/corporate-scholarships', '/eligibility-checker',
            '/guides', '/about', '/privacy', '/terms', '/search', '/favicon.ico'
        ];
        
        if (knownRoutes.includes(pathname)) {
            exists = true;
            dbMatchDetails = 'Static or standard route.';
            actionItem = 'Check if page component exists in project and is deployed correctly.';
        } else if (pathname.endsWith('-scholarships')) {
            dbMatchDetails = 'Messy / old navigation route.';
            actionItem = 'Legacy or incorrect provider-type layout. Redirect to correct directory.';
        } else {
            dbMatchDetails = 'Completely unknown path.';
            actionItem = 'Invalid URL. Redirect to homepage.';
        }
    }

    results.push({
        url: urlStr,
        pathname,
        type,
        exists,
        dbMatchDetails,
        actionItem
    });
}

db.close();

// Write results to JSON file
fs.writeFileSync(
    path.join(__dirname, 'check_results.json'),
    JSON.stringify(results, null, 2),
    'utf8'
);

console.log('Analysis complete. Results written to check_results.json.');

// Print summary by type
const summary = {};
results.forEach(r => {
    summary[r.type] = (summary[r.type] || 0) + 1;
});
console.log('\nSummary of 404 URL types:');
console.log(JSON.stringify(summary, null, 2));

// Print first 30 invalid/unmatched items to show detail
console.log('\nSample of unmatched URLs and analysis:');
results.filter(r => !r.exists).slice(0, 30).forEach(r => {
    console.log(`- URL: ${r.url}`);
    console.log(`  Type: ${r.type}`);
    console.log(`  Detail: ${r.dbMatchDetails}`);
    console.log(`  Action: ${r.actionItem}\n`);
});
