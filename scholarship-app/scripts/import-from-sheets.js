const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Path to your exported CSV from Google Sheets
const CSV_FILE = process.argv[2] || path.join(__dirname, '..', 'data', 'scholarships.csv');
const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');

console.log('📊 Google Sheets to Database Import Script\n');
console.log(`Reading CSV from: ${CSV_FILE}`);
console.log(`Database: ${DB_PATH}\n`);

// Initialize database
const db = new Database(DB_PATH);

// Helper function to parse CSV (handles quoted fields with commas)
function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];

    for (let line of lines) {
        if (!line.trim()) continue;

        const row = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === ',' && !inQuotes) {
                row.push(current.trim());
                current = '';
            } else if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else {
                current += char;
            }
        }
        row.push(current.trim());
        result.push(row);
    }

    return result;
}

// Helper to generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-202[0-9]$/g, '')  // Remove year suffix like -2024, -2025, -2026
        .replace(/-202[0-9]-/g, '-'); // Remove year in middle like -2024-
}

// Helper to parse comma-separated values into JSON array
function parseArray(value) {
    if (!value || value === '') return JSON.stringify([]);
    return JSON.stringify(value.split(',').map(s => s.trim()).filter(s => s));
}

// Helper to parse boolean
function parseBoolean(value) {
    if (!value) return 0;
    const v = value.toString().toUpperCase();
    return (v === 'TRUE' || v === '1' || v === 'YES') ? 1 : 0;
}

// Helper to parse integer
function parseInt(value) {
    if (!value || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : Math.floor(num);
}

// Read and parse CSV
console.log('📖 Reading CSV file...');
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

// Handle different line endings and skip "Table 1" line from Numbers export
const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const lines = normalizedContent.split('\n').filter(line => line.trim() && line.trim() !== 'Table 1');
const rows = parseCSV(lines.join('\n'));

if (rows.length === 0) {
    console.error('❌ CSV file is empty!');
    process.exit(1);
}

// First row is headers
const headers = rows[0];
console.log(`✅ Found ${headers.length} columns`);
console.log(`📝 Found ${rows.length - 1} data rows\n`);

// Column mapping: Google Sheets → Database
const columnMap = {
    'ID': 'id',
    'Scholarship Title': 'title',
    'Provider': 'provider',
    'Scholarship Type': 'scholarship_type',
    'Provider Sub Type': 'provider_type',
    'State': 'state',
    'Residency Requirement': 'residency_requirement',
    'Course Stream': 'course_stream',
    'Age Limit': 'age_limit',
    'Total Awards': 'total_awards',
    'Community': 'caste',
    'Gender': 'gender',
    'Education Level': 'level',
    'Minimum Marks': 'min_marks',
    'Income Limit': 'income_limit',
    'Minimum Scholarship Amount': 'amount_min',
    'Annual Amount': 'amount_annual',
    'Amount Description': 'amount_description',
    'Deadline': 'deadline',
    'Deadline Description': 'deadline_description',
    'Official Website': 'official_source',
    'SEO Keywords': 'keywords',
    'Special conditions': 'special_conditions',
    'Tags': 'tags',
    'Thumbnail URL': 'thumbnail_url',
    'Documents Needed': 'docs_needed',
    'Apply URL': 'apply_url',
    'Introduction': 'intro_seo',
    'Benefits': 'benefits',
    'Application Step by Step Guide': 'step_guide',
    'Selection Process': 'selection',
    'FAQs': 'faq_json',
    'Verified': 'verified_status',
    'Last Verified Date': 'last_verified',
    'Verification year': 'verification_year',
    'Application Type': 'application_mode',
    'Show on Homepage': 'show_on_homepage',
    'Is Featured': 'is_featured',
    'Is Popular': 'is_popular',
    'Priority Score': 'priority_score',
    'Scholarship Status': 'status',
    'Time to apply (mins)': 'time_min',
    'Renewal': 'renewal',
    'Helpline': 'helpline',
    'Competitiveness': 'competitiveness',
    'Internal Notes': 'notes_actions',
    'Production Status': 'production_status'
};

// Create index map
const indexMap = {};
headers.forEach((header, index) => {
    const dbField = columnMap[header];
    if (dbField) {
        indexMap[dbField] = index;
    }
});

console.log('📋 Column mapping complete\n');

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO scholarships (
    id, title, slug, provider, provider_type, state, level, caste, gender,
    course_stream, app_type, amount_annual, amount_min, amount_description,
    benefits, income_limit, min_marks, age_limit, residency_requirement,
    docs_needed, application_mode, apply_url, deadline, deadline_description,
    time_min, step_guide, selection, total_awards, renewal, competitiveness,
    verified_status, last_verified, official_source, helpline, intro_seo,
    faq_json, notes_actions, keywords, scholarship_type, status,
    verification_year, show_on_homepage, is_featured, is_popular,
    priority_score, special_conditions, tags, thumbnail_url
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

// Process each row
let imported = 0;
let skipped = 0;

for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Get production status
    const productionStatus = row[indexMap['production_status']] || '';

    // Only import if status is "Ready for Production"
    if (productionStatus !== 'Ready for Production') {
        console.log(`⏭️  Skipping row ${i}: ${row[indexMap['title']]} (Status: ${productionStatus})`);
        skipped++;
        continue;
    }

    try {
        const title = row[indexMap['title']] || '';
        const id = row[indexMap['id']] || generateSlug(title);
        const slug = generateSlug(title);

        console.log(`✅ Importing: ${title}`);

        insertStmt.run(
            id,
            title,
            slug,
            row[indexMap['provider']] || '',
            row[indexMap['provider_type']] || '',
            row[indexMap['state']] || '',
            row[indexMap['level']] || '',
            parseArray(row[indexMap['caste']]),
            row[indexMap['gender']] || '',
            parseArray(row[indexMap['course_stream']]),
            row[indexMap['application_mode']] || '',
            parseInt(row[indexMap['amount_annual']]),
            parseInt(row[indexMap['amount_min']]),
            row[indexMap['amount_description']] || '',
            row[indexMap['benefits']] || '',
            parseInt(row[indexMap['income_limit']]),
            parseInt(row[indexMap['min_marks']]),
            row[indexMap['age_limit']] || '',
            row[indexMap['residency_requirement']] || '',
            parseArray(row[indexMap['docs_needed']]),
            row[indexMap['application_mode']] || '',
            row[indexMap['apply_url']] || '',
            row[indexMap['deadline']] || null,
            row[indexMap['deadline_description']] || '',
            parseInt(row[indexMap['time_min']]),
            row[indexMap['step_guide']] || '',
            row[indexMap['selection']] || '',
            parseInt(row[indexMap['total_awards']]),
            row[indexMap['renewal']] || '',
            row[indexMap['competitiveness']] || '',
            row[indexMap['verified_status']] || '',
            row[indexMap['last_verified']] || null,
            row[indexMap['official_source']] || '',
            row[indexMap['helpline']] || '',
            row[indexMap['intro_seo']] || '',
            row[indexMap['faq_json']] || '[]',
            row[indexMap['notes_actions']] || '',
            parseArray(row[indexMap['keywords']]),
            row[indexMap['scholarship_type']] || 'Government',
            row[indexMap['status']] || 'Active',
            parseInt(row[indexMap['verification_year']]),
            parseBoolean(row[indexMap['show_on_homepage']]),
            parseBoolean(row[indexMap['is_featured']]),
            parseBoolean(row[indexMap['is_popular']]),
            parseInt(row[indexMap['priority_score']]) || 50,
            row[indexMap['special_conditions']] || '',
            parseArray(row[indexMap['tags']]),
            row[indexMap['thumbnail_url']] || ''
        );

        imported++;
    } catch (error) {
        console.error(`❌ Error importing row ${i}:`, error.message);
    }
}

db.close();

console.log('\n' + '='.repeat(50));
console.log(`✅ Import complete!`);
console.log(`   Imported: ${imported} scholarships`);
console.log(`   Skipped: ${skipped} scholarships (not "Ready for Production")`);
console.log('='.repeat(50));
