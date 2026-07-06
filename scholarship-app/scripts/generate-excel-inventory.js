const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const XLSX = require('xlsx');

const DB_PATH = path.join(__dirname, '../data/scholarships.db');
const OUTPUT_FILE = path.join(__dirname, '../data/scholarships_inventory.xlsx');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found at:', DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

// Helper for slugifying
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
    console.log('Generating Excel Workbook...');
    
    // Create new workbook
    const wb = XLSX.utils.book_new();

    // 1. Fetch data
    const scholarships = db.prepare(`
        SELECT id, title, slug, provider, state, level, caste, amount_annual, amount_min, amount_description, min_marks, income_limit, scholarship_type, status, apply_url, official_source 
        FROM scholarships 
        ORDER BY title ASC
    `).all();

    const statesRaw = db.prepare(`
        SELECT DISTINCT state FROM scholarships 
        WHERE state IS NOT NULL AND state != '' AND state != 'All India' AND state != 'Multiple States'
    `).all();
    
    const states = [];
    statesRaw.forEach(r => {
        const count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE state = ?').get(r.state).cnt;
        states.push({
            'State Name': r.state,
            'Slug': slugify(r.state),
            'Active Scholarships': count,
            'Hub Page URL': `${BASE_URL}/scholarships-in/${slugify(r.state)}`
        });
    });
    states.sort((a, b) => b['Active Scholarships'] - a['Active Scholarships']);

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

    const categories = [];
    Array.from(categoriesSet).forEach(cat => {
        const count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE caste LIKE ?').get(`%${cat}%`).cnt;
        categories.push({
            'Category Name': cat,
            'Slug': slugify(cat),
            'Active Scholarships': count,
            'Hub Page URL': `${BASE_URL}/scholarships-for/${slugify(cat)}`
        });
    });
    categories.sort((a, b) => b['Active Scholarships'] - a['Active Scholarships']);

    const levels = [];
    Object.keys(CANONICAL_LEVELS).forEach(levelKey => {
        const levelConfig = CANONICAL_LEVELS[levelKey];
        const likeClauses = levelConfig.rawLevels.map(() => 'level LIKE ?').join(' OR ');
        const countQuery = `
            SELECT COUNT(*) as cnt FROM scholarships 
            WHERE ${likeClauses}
            OR level LIKE ?
        `;
        const likeParams = levelConfig.rawLevels.map(raw => `%${raw}%`);
        likeParams.push(`%${levelConfig.label}%`);
        const count = db.prepare(countQuery).get(...likeParams).cnt;
        levels.push({
            'Education Level': levelConfig.label,
            'Slug': levelKey,
            'Active Scholarships': count,
            'Hub Page URL': `${BASE_URL}/scholarships-level/${levelKey}`
        });
    });

    // 2. Format Sheets
    // Tab 1: Summary Sheet
    const summaryData = [
        { 'Metric': 'Total Scholarships in Database', 'Value': scholarships.length },
        { 'Metric': 'Total State Hubs', 'Value': states.length },
        { 'Metric': 'Total Category Hubs', 'Value': categories.length },
        { 'Metric': 'Total Education Level Hubs', 'Value': levels.length },
        { 'Metric': 'Total Main Subpages per Scholarship', 'Value': 8 },
        { 'Metric': 'Total Indexable Pages on Site', 'Value': (scholarships.length * 8) + states.length + categories.length + levels.length + 9 },
        { 'Metric': 'Generation Date', 'Value': new Date().toISOString().split('T')[0] }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    // Tab 2: Scholarships Sheet
    const scholarshipsData = scholarships.map(s => {
        let casteStr = '';
        try {
            const parsed = JSON.parse(s.caste);
            casteStr = Array.isArray(parsed) ? parsed.join(', ') : s.caste;
        } catch {
            casteStr = s.caste || '';
        }
        return {
            'Title': s.title,
            'Provider': s.provider || '',
            'Type': s.scholarship_type || 'Government',
            'State': s.state || 'All India',
            'Education Level': s.level || 'Not Specified',
            'Caste/Category': casteStr,
            'Annual Amount (INR)': s.amount_annual || 'Varies',
            'Min Marks Required (%)': s.min_marks || '',
            'Income Limit (INR)': s.income_limit || 'No Limit',
            'Status': s.status || 'Active',
            'Main URL': `${BASE_URL}/scholarships/${s.slug}`,
            'Apply URL': s.apply_url || '',
            'Official Source': s.official_source || ''
        };
    });
    const wsScholarships = XLSX.utils.json_to_sheet(scholarshipsData);

    // Tab 3: Scholarship Subpages Sheet
    const subpagesData = [];
    const subpageTypes = [
        { suffix: '', type: 'Main Detail Page', titleSuffix: '' },
        { suffix: '/eligibility', type: 'Eligibility Criteria', titleSuffix: ' - Eligibility Criteria' },
        { suffix: '/income-limit', type: 'Income Limits & EWS', titleSuffix: ' - Income Limits & EWS' },
        { suffix: '/documents-required', type: 'Required Documents', titleSuffix: ' - Required Documents' },
        { suffix: '/last-date', type: 'Last Date & Deadlines', titleSuffix: ' - Last Date & Deadlines' },
        { suffix: '/selection-process', type: 'Selection Process', titleSuffix: ' - Selection Process' },
        { suffix: '/apply-online', type: 'Apply Online & Instructions', titleSuffix: ' - Apply Online & Instructions' },
        { suffix: '/renewal-process', type: 'Renewal Process', titleSuffix: ' - Renewal Process' }
    ];

    scholarships.forEach(s => {
        subpageTypes.forEach(sp => {
            subpagesData.push({
                'Scholarship Title': s.title,
                'Page Type': sp.type,
                'Title Tag / Active Title': `${s.title}${sp.titleSuffix}`,
                'Relative Path': `/scholarships/${s.slug}${sp.suffix}`,
                'Absolute URL': `${BASE_URL}/scholarships/${s.slug}${sp.suffix}`,
                'State': s.state || 'All India',
                'Status': s.status || 'Active'
            });
        });
    });
    const wsSubpages = XLSX.utils.json_to_sheet(subpagesData);

    // Tab 4: State Hubs Sheet
    const wsStates = XLSX.utils.json_to_sheet(states);

    // Tab 5: Category Hubs Sheet
    const wsCategories = XLSX.utils.json_to_sheet(categories);

    // Tab 6: Level Hubs Sheet
    const wsLevels = XLSX.utils.json_to_sheet(levels);

    // Append sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, wsScholarships, 'Scholarships');
    XLSX.utils.book_append_sheet(wb, wsSubpages, 'Scholarship Subpages');
    XLSX.utils.book_append_sheet(wb, wsStates, 'State Hubs');
    XLSX.utils.book_append_sheet(wb, wsCategories, 'Category Hubs');
    XLSX.utils.book_append_sheet(wb, wsLevels, 'Education Hubs');

    // Write file
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log('✅ Excel file successfully written to:', OUTPUT_FILE);
}

main().catch(console.error);
