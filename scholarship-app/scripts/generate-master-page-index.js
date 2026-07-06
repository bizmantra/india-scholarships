#!/usr/bin/env node

/**
 * Generate Master Page Index CSV (Webmaster Spreadsheet)
 * Lists every single crawlable URL on the site with metadata, page class, variables, and quality indicators.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../data/scholarships.db');
const OUTPUT_CSV_PATH = path.join(__dirname, '../data/master-page-index.csv');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found at:', DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

// Helper for slugifying (copied from lib/utils.ts for clean node compatibility)
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
    if (!text) return '';
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

// Canonical Levels mapping
const CANONICAL_LEVELS = {
    'class-1-10': { label: 'Class 1 to 10', rawLevels: ['Class 1 to Class 10', 'Class 1 to Class 8 (Note: ONLY up to Class 8, unlike SC/ST/OBC which go to Class 10)', 'Class 5-10', 'Class 9, Class 10', 'Class 9-10', 'Pre-Matric (Class 9-10)', 'School (1-5)', 'School (9-10)'] },
    'class-11-12': { label: 'Class 11 & 12', rawLevels: ['Class 11, Class 12', 'Class 11-12', 'Class 10, Class 12', 'Higher Secondary', 'Post-Matric (Class 11-12)', 'School (11-12)'] },
    'diploma-polytechnic': { label: 'Diploma / Polytechnic', rawLevels: ['Diploma', 'Diploma, Undergraduate', 'Diploma/Polytechnic, ITI/ITC', 'Diploma/Polytechnic'] },
    'iti-courses': { label: 'ITI Courses', rawLevels: ['ITI', 'ITI/ITC'] },
    'graduation-ug': { label: 'Graduation (UG)', rawLevels: ['UG', 'Undergraduate', 'Undergraduate (UG)', 'Graduate', 'Bachelor'] },
    'post-graduation-pg': { label: 'Post-Graduation (PG)', rawLevels: ['PG', 'Postgraduate', 'Postgraduate (PG)', 'Master'] },
    'phd-research': { label: 'PhD & Research', rawLevels: ['PhD', 'Doctoral', 'Fellowship', 'Research'] }
};

const BASE_URL = 'https://www.indiascholarships.in';

async function main() {
    console.log('📊 Compiling Master Page Index Spreadsheet...\n');

    const csvRows = [];
    // CSV Header row
    csvRows.push([
        'Clean Path',
        'Absolute URL',
        'Page Class',
        'Template Code File',
        'Title Tag Template / Active Title',
        'Primary Dynamic Variable',
        'Database Reference ID',
        'Active Scholarships Count',
        'Sitemap Priority',
        'Verification Status',
        'Content Quality Checklist Status'
    ].map(col => `"${col.replace(/"/g, '""')}"`).join(','));

    // 1. Static Routes
    const staticRoutes = [
        { path: '/', title: 'Home Page', priority: '1.0' },
        { path: '/scholarships', title: 'Scholarships Directory', priority: '0.8' },
        { path: '/state-scholarships', title: 'Scholarships by Indian States', priority: '0.8' },
        { path: '/scholarships-by-category', title: 'Scholarships by Category', priority: '0.8' },
        { path: '/scholarships-by-education', title: 'Scholarships by Education Level', priority: '0.8' },
        { path: '/scholarships-by-income', title: 'Scholarships by Family Income Limit', priority: '0.8' },
        { path: '/government-scholarships', title: 'Government Scholarships', priority: '0.8' },
        { path: '/private-scholarships', title: 'Private Scholarships', priority: '0.8' },
        { path: '/corporate-scholarships', title: 'Corporate Scholarships', priority: '0.8' },
        { path: '/eligibility-checker', title: 'Scholarship Eligibility Checker', priority: '0.8' },
        { path: '/guides', title: 'Scholarship Application Guides Hub', priority: '0.8' },
        { path: '/guides/nsp', title: 'National Scholarship Portal (NSP) Guide', priority: '0.8' },
        { path: '/guides/ssp', title: 'State Scholarship Portal (SSP) Guide', priority: '0.8' },
        { path: '/guides/tracking', title: 'Tracking Application Status Guide', priority: '0.8' },
        { path: '/guides/documents', title: 'Required Documents Guide', priority: '0.8' },
        { path: '/about', title: 'About Us', priority: '0.8' }
    ];

    staticRoutes.forEach(r => {
        csvRows.push([
            r.path,
            `${BASE_URL}${r.path === '/' ? '' : r.path}`,
            'Static Route',
            r.path === '/' ? 'app/page.tsx' : `app${r.path}/page.tsx`,
            r.title,
            'None',
            'N/A',
            'All',
            r.priority,
            'System',
            'Always Complete'
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
    });

    console.log(`✅ Indexed ${staticRoutes.length} Static Routes.`);

    // 2. Fetch scholarships from DB
    const scholarships = db.prepare('SELECT id, title, slug, state, level, caste, amount_annual, verified_status, status FROM scholarships').all();
    console.log(`📖 Loaded ${scholarships.length} Scholarships from DB.`);

    // 3. Dynamic State listing pages
    // Run DB query to get distinct states like sitemap.ts
    const statesResult = db.prepare(`
        SELECT DISTINCT state FROM scholarships 
        WHERE state IS NOT NULL 
        AND state != '' 
        AND state != 'All India' 
        AND state != 'Multiple States'
        AND state != 'Selected Cities'
        AND state != 'Selected States'
        ORDER BY state
    `).all();
    
    statesResult.forEach(row => {
        const stateName = row.state;
        const slug = slugify(stateName);
        const urlPath = `/scholarships-in/${slug}`;
        
        // Count active scholarships for this state
        const count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE state = ?').get(stateName).cnt;
        
        csvRows.push([
            urlPath,
            `${BASE_URL}${urlPath}`,
            'State Hub Listing',
            'app/scholarships-in/[state]/page.tsx',
            `Scholarships in ${stateName} 2026 - Apply Online`,
            stateName,
            'N/A',
            count,
            '0.6',
            'Dynamic',
            count > 0 ? 'Active content' : 'Empty hub warning'
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
    });
    console.log(`✅ Indexed ${statesResult.length} State Hub listing pages.`);

    // 4. Dynamic Category listing pages
    const categoriesSet = new Set();
    scholarships.forEach(row => {
        try {
            const castes = JSON.parse(row.caste);
            if (Array.isArray(castes)) {
                castes.forEach(c => categoriesSet.add(c));
            } else if (row.caste) {
                categoriesSet.add(row.caste);
            }
        } catch {
            if (row.caste) categoriesSet.add(row.caste);
        }
    });

    const sortedCategories = Array.from(categoriesSet).sort();
    sortedCategories.forEach(catName => {
        const slug = slugify(catName);
        const urlPath = `/scholarships-for/${slug}`;

        // Count active
        const count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE caste LIKE ?').get(`%${catName}%`).cnt;

        csvRows.push([
            urlPath,
            `${BASE_URL}${urlPath}`,
            'Category Hub Listing',
            'app/scholarships-for/[category]/page.tsx',
            `Scholarships for ${catName} Students 2026`,
            catName,
            'N/A',
            count,
            '0.6',
            'Dynamic',
            count > 0 ? 'Active content' : 'Empty hub warning'
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
    });
    console.log(`✅ Indexed ${sortedCategories.length} Category Hub listing pages.`);

    // 5. Dynamic Education Level listing pages
    Object.keys(CANONICAL_LEVELS).forEach(levelKey => {
        const levelConfig = CANONICAL_LEVELS[levelKey];
        const urlPath = `/scholarships-level/${levelKey}`;

        // Build a broad count query
        const likeClauses = levelConfig.rawLevels.map(() => 'level LIKE ?').join(' OR ');
        const countQuery = `
            SELECT COUNT(*) as cnt FROM scholarships 
            WHERE ${likeClauses}
            OR level LIKE ?
        `;
        const likeParams = levelConfig.rawLevels.map(raw => `%${raw}%`);
        likeParams.push(`%${levelConfig.label}%`);
        const count = db.prepare(countQuery).get(...likeParams).cnt;

        csvRows.push([
            urlPath,
            `${BASE_URL}${urlPath}`,
            'Education Level Hub Listing',
            'app/scholarships-level/[level]/page.tsx',
            `Scholarships for ${levelConfig.label} Students 2026`,
            levelConfig.label,
            'N/A',
            count,
            '0.6',
            'Dynamic',
            count > 0 ? 'Active content' : 'Empty hub warning'
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
    });
    console.log(`✅ Indexed ${Object.keys(CANONICAL_LEVELS).length} Education Level Hub listing pages.`);

    // 6. Dynamic Income listing pages
    const incomeRanges = [
        { label: 'No Income Bar', min: -1, max: 0, slug: 'no-income-bar' },
        { label: '0-1L', min: 1, max: 100000, slug: '0-1l' },
        { label: '1-2.5L', min: 100001, max: 250000, slug: '1-2.5l' },
        { label: '2.5-5L', min: 250001, max: 500000, slug: '2.5-5l' },
        { label: '5L+', min: 500001, max: 10000000, slug: '5l-plus' },
    ];
    incomeRanges.forEach(range => {
        const urlPath = `/scholarships-income/${range.slug}`;
        
        let count = 0;
        if (range.min === -1) {
            count = db.prepare("SELECT COUNT(*) as cnt FROM scholarships WHERE (income_limit IS NULL OR income_limit = 0 OR income_limit = '')").get().cnt;
        } else {
            count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE income_limit >= ? AND income_limit <= ?').get(range.min, range.max).cnt;
        }

        csvRows.push([
            urlPath,
            `${BASE_URL}${urlPath}`,
            'Income Hub Listing',
            'app/scholarships-income/[range]/page.tsx',
            `Scholarships with ${range.label} Income Limit`,
            range.label,
            'N/A',
            count,
            '0.5',
            'Dynamic',
            count > 0 ? 'Active content' : 'Empty hub warning'
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
    });
    console.log(`✅ Indexed ${incomeRanges.length} Income Hub listing pages.`);

    // 7. Dynamic Course listing pages
    const courses = [
        { name: 'Engineering', slug: 'engineering' },
        { name: 'Medical', slug: 'medical' },
        { name: 'Commerce', slug: 'commerce' },
        { name: 'Science', slug: 'science' },
        { name: 'Arts', slug: 'arts' },
        { name: 'Nursing', slug: 'nursing' },
        { name: 'Pharmacy', slug: 'pharmacy' },
        { name: 'Agriculture', slug: 'agriculture' },
        { name: 'Law', slug: 'law' },
        { name: 'Management', slug: 'management' },
    ];
    courses.forEach(course => {
        const urlPath = `/scholarships-by-course/${course.slug}`;
        const count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE course_stream LIKE ?').get(`%${course.name}%`).cnt;

        csvRows.push([
            urlPath,
            `${BASE_URL}${urlPath}`,
            'Course Hub Listing',
            'app/scholarships-by-course/[course]/page.tsx',
            `Scholarships for ${course.name} Courses 2026`,
            course.name,
            'N/A',
            count,
            '0.5',
            'Dynamic',
            count > 0 ? 'Active content' : 'Empty hub warning'
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
    });
    console.log(`✅ Indexed ${courses.length} Course Hub listing pages.`);

    // 8. Dynamic Scholarship Leaf Pages and Subpage Clusters
    const subpages = [
        { key: 'eligibility', name: 'Eligibility Criteria' },
        { key: 'income-limit', name: 'Income Limit' },
        { key: 'documents-required', name: 'Documents Required' },
        { key: 'last-date', name: 'Last Date' },
        { key: 'selection-process', name: 'Selection Process' },
        { key: 'apply-online', name: 'Apply Online Step Guide' },
        { key: 'renewal-process', name: 'Renewal Process' }
    ];

    let leafCount = 0;
    let clusterCount = 0;

    scholarships.forEach(s => {
        const isLegacy = s.title.startsWith('[LEGACY]') || s.slug.startsWith('legacy-');
        const isVerified = s.verified_status && ['yes', 'verified', 'true'].includes(String(s.verified_status).toLowerCase());
        const completeness = isVerified ? 'Audited & Verified' : 'Draft / Unverified';
        
        // Leaf Page
        const leafPath = `/scholarships/${s.slug}`;
        csvRows.push([
            leafPath,
            `${BASE_URL}${leafPath}`,
            isLegacy ? 'Legacy Scholarship Detail' : 'Scholarship Detail',
            'app/scholarships/[slug]/page.tsx',
            `${s.title} 2026 - Apply Online`,
            s.title,
            s.id,
            '1',
            '0.7',
            isVerified ? 'Verified' : 'Pending Verification',
            completeness
        ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
        leafCount++;

        // Subpage Clusters
        subpages.forEach(sub => {
            const clusterPath = `/scholarships/${s.slug}/${sub.key}`;
            csvRows.push([
                clusterPath,
                `${BASE_URL}${clusterPath}`,
                `Scholarship Detail Subpage (${sub.key})`,
                'app/scholarships/[slug]/[subpage]/page.tsx',
                `${s.title} ${sub.name} 2026`,
                `${s.title} - ${sub.name}`,
                s.id,
                '1',
                '0.65',
                isVerified ? 'Verified' : 'Pending Verification',
                `${completeness} (Dynamic Cluster)`
            ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(','));
            clusterCount++;
        });
    });

    console.log(`✅ Indexed ${leafCount} Scholarship detail pages.`);
    console.log(`✅ Indexed ${clusterCount} Scholarship subpage cluster pages.`);

    // Write CSV
    fs.writeFileSync(OUTPUT_CSV_PATH, csvRows.join('\n'), 'utf8');
    console.log(`\n🎉 SUCCESS: Master Page Index CSV saved successfully to:`);
    console.log(`   ${OUTPUT_CSV_PATH}\n`);
    console.log(`Total URLs mapped: ${csvRows.length - 1}`);

    db.close();
}

main().catch(err => {
    console.error('❌ Error generating Master Page Index:', err);
    process.exit(1);
});
