const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../data/scholarships.db');
const OUTPUT_FILE = path.join(__dirname, '../data/scholarships-claude-inventory.md');

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
    console.log('Generating inventory...');
    
    // Fetch all scholarships
    const scholarships = db.prepare(`
        SELECT id, title, slug, state, level, caste, amount_annual, provider, scholarship_type, status 
        FROM scholarships 
        ORDER BY title ASC
    `).all();

    // Fetch unique states with counts
    const statesRaw = db.prepare(`
        SELECT DISTINCT state FROM scholarships 
        WHERE state IS NOT NULL AND state != '' AND state != 'All India' AND state != 'Multiple States'
    `).all();
    
    const states = [];
    statesRaw.forEach(r => {
        const count = db.prepare('SELECT COUNT(*) as cnt FROM scholarships WHERE state = ?').get(r.state).cnt;
        states.push({ name: r.state, slug: slugify(r.state), count });
    });
    states.sort((a, b) => b.count - a.count);

    // Fetch unique categories (castes)
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
        categories.push({ name: cat, slug: slugify(cat), count });
    });
    categories.sort((a, b) => b.count - a.count);

    // Education levels
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
        levels.push({ key: levelKey, label: levelConfig.label, count });
    });

    // Write content
    let out = `# India Scholarships Portal - Current Database & Page Inventory\n\n`;
    out += `Generated on: ${new Date().toISOString().split('T')[0]}\n`;
    out += `Total Scholarships in Database: **${scholarships.length}**\n`;
    out += `Total Hub Pages: **${states.length + categories.length + levels.length + 9}** (States, Categories, Levels, Income Ranges, Types)\n`;
    out += `Total Crawlable Pages (including 7 Subpages per Scholarship): **${scholarships.length * 8 + states.length + categories.length + levels.length + 9}**\n\n`;

    out += `## 1. Structure of Pages per Scholarship\n`;
    out += `For every individual scholarship (e.g., \`[slug]\`), the site renders the following pages:\n`;
    out += `1. **Main Detail Page**: \`/scholarships/[slug]\`\n`;
    out += `2. **Eligibility Criteria**: \`/scholarships/[slug]/eligibility\`\n`;
    out += `3. **Income Limits & EWS**: \`/scholarships/[slug]/income-limit\`\n`;
    out += `4. **Required Documents**: \`/scholarships/[slug]/documents-required\`\n`;
    out += `5. **Last Date & Deadlines**: \`/scholarships/[slug]/last-date\`\n`;
    out += `6. **Selection Process**: \`/scholarships/[slug]/selection-process\`\n`;
    out += `7. **Apply Online/Instructions**: \`/scholarships/[slug]/apply-online\`\n`;
    out += `8. **Renewal Process**: \`/scholarships/[slug]/renewal-process\`\n\n`;

    out += `## 2. State Hub Pages\n`;
    out += `These hub pages group scholarships by Indian State (URL pattern: \`/scholarships-in/[state-slug]\`):\n\n`;
    out += `| State | Slug | Active Scholarships |\n`;
    out += `| :--- | :--- | :---: |\n`;
    states.forEach(s => {
        out += `| ${s.name} | \`${s.slug}\` | ${s.count} |\n`;
    });
    out += `\n`;

    out += `## 3. Category/Caste Hub Pages\n`;
    out += `These hub pages group scholarships by target category (URL pattern: \`/scholarships-for/[category-slug]\`):\n\n`;
    out += `| Category/Caste | Slug | Active Scholarships |\n`;
    out += `| :--- | :--- | :---: |\n`;
    categories.forEach(c => {
        out += `| ${c.name} | \`${c.slug}\` | ${c.count} |\n`;
    });
    out += `\n`;

    out += `## 4. Education Level Hub Pages\n`;
    out += `These hub pages group scholarships by education level (URL pattern: \`/scholarships-level/[level-slug]\`):\n\n`;
    out += `| Level | Slug | Active Scholarships |\n`;
    out += `| :--- | :--- | :---: |\n`;
    levels.forEach(l => {
        out += `| ${l.label} | \`${l.key}\` | ${l.count} |\n`;
    });
    out += `\n`;

    out += `## 5. Main Scholarships Directory (Complete List)\n`;
    out += `Here is the full list of all active scholarships in the database with their key filtering criteria to help identify content gaps and expansion opportunities:\n\n`;
    out += `| Title | State | Education Level | Caste/Category | Annual Amount | Type | Slug |\n`;
    out += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    scholarships.forEach(s => {
        let casteStr = '';
        try {
            const parsed = JSON.parse(s.caste);
            casteStr = Array.isArray(parsed) ? parsed.join(', ') : s.caste;
        } catch {
            casteStr = s.caste || 'All';
        }
        out += `| ${s.title} | ${s.state || 'All India'} | ${s.level || 'Not Specified'} | ${casteStr} | ₹${s.amount_annual ? s.amount_annual.toLocaleString('en-IN') : 'Varies'} | ${s.scholarship_type || 'Government'} | \`${s.slug}\` |\n`;
    });

    fs.writeFileSync(OUTPUT_FILE, out);
    console.log('✅ Inventory generated at:', OUTPUT_FILE);
}

main().catch(console.error);
