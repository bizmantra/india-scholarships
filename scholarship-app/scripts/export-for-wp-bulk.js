const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Paths
const dbPath = path.join(__dirname, '../data/scholarships.db');
const outputPath = path.join(__dirname, '../data/wp-migration-export.csv');

// Initialize DB
const db = new Database(dbPath);

/**
 * Escapes CSV values to handle commas and quotes correctly.
 */
function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    // Replace all double quotes with two double quotes
    str = str.replace(/"/g, '""');
    // Wrap in double quotes
    return `"${str}"`;
}

// Get all scholarships
const rows = db.prepare('SELECT * FROM scholarships').all();

if (rows.length === 0) {
    console.error('No scholarships found in the local database.');
    process.exit(1);
}

// Define CSV headers (Mapping to WP ACF field names where possible)
const headers = [
    'title',
    'slug',
    'provider',
    'provider_type',
    'state',
    'level',
    'caste',
    'gender',
    'amount_annual',
    'amount_min',
    'amount_description',
    'benefits',
    'income_limit',
    'min_marks',
    'age_limit',
    'docs_needed',
    'apply_url',
    'deadline',
    'step_guide',
    'selection',
    'renewal',
    'helpline',
    'intro_seo',
    'faq_json',
    'tags',
    'thumbnail_url'
];

// Combine headers and rows
let csvContent = headers.join(',') + '\n';

rows.forEach(row => {
    const line = headers.map(header => {
        let value = row[header];

        // Handle special formatting for arrays or complex strings
        if (header === 'docs_needed') {
            // Docs are stored as newline or JSON, let's make them clean strings for WP
            try {
                const parsed = JSON.parse(value);
                value = Array.isArray(parsed) ? parsed.join('\n') : value;
            } catch (e) { }
        }

        return escapeCSV(value);
    });
    csvContent += line.join(',') + '\n';
});

// Write to file
fs.writeFileSync(outputPath, csvContent);

console.log(`✅ Success! Exported ${rows.length} scholarships to ${outputPath}`);
console.log(`👉 You can now upload this CSV to WordPress using WP All Import.`);
