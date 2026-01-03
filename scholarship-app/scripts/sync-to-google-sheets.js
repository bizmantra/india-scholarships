#!/usr/bin/env node

/**
 * Sync scholarships from SQLite database back to Google Sheets
 * Updates existing rows and appends new scholarships
 */

const Database = require('better-sqlite3');
const path = require('path');
const { getSheetData, updateSheetRow, appendSheetRow } = require('../lib/google-sheets');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log('📤 Database to Google Sheets Sync Script\n');
console.log(`Database: ${dbPath}\n`);

// Column order for Google Sheets (must match your sheet structure)
const columns = [
    'id', 'title', 'provider', 'scholarship_type', 'provider_type', 'state',
    'residency_requirement', 'course_stream', 'age_limit', 'total_awards', 'caste',
    'gender', 'level', 'min_marks', 'income_limit', 'amount_min', 'amount_annual',
    'amount_description', 'deadline', 'deadline_description', 'official_source',
    'seo_keywords', 'special_conditions', 'tags', 'thumbnail_url', 'docs_needed',
    'apply_url', 'sc_intro_seo', 'benefits', 'step_guide', 'selection', 'faq_json',
    'verified', 'last_verified', 'verification_year', 'application_mode',
    'show_on_homepage', 'is_featured', 'is_popular', 'priority_score', 'status',
    'time_to_apply', 'renewal', 'helpline', 'competitiveness', 'internal_notes', 'production_status'
];

// Helper to format value for Google Sheets
function formatValue(value, field) {
    if (value === null || value === undefined) return '';

    // Parse JSON arrays back to comma-separated strings
    if (['course_stream', 'caste', 'tags', 'docs_needed'].includes(field)) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.join(', ') : value;
        } catch {
            return value;
        }
    }

    // Convert booleans to TRUE/FALSE
    if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE';
    }

    return String(value);
}

async function syncToGoogleSheets() {
    try {
        console.log('📖 Fetching current Google Sheets data...\n');
        const sheetData = await getSheetData();

        if (sheetData.length === 0) {
            console.error('❌ No data found in Google Sheets');
            process.exit(1);
        }

        const headers = sheetData[0];
        const sheetRows = sheetData.slice(1);

        // Create a map of existing scholarships by ID
        const idColumnIndex = headers.indexOf('ID');
        const existingIds = new Map();
        sheetRows.forEach((row, index) => {
            const id = row[idColumnIndex];
            if (id) {
                existingIds.set(id, index + 2); // +2 because: 1-indexed + header row
            }
        });

        console.log(`✅ Found ${sheetRows.length} existing rows in Google Sheets\n`);

        // Get all scholarships from database
        console.log('📖 Fetching scholarships from database...\n');
        const scholarships = db.prepare('SELECT * FROM scholarships').all();
        console.log(`✅ Found ${scholarships.length} scholarships in database\n`);

        let updated = 0;
        let added = 0;

        for (const scholarship of scholarships) {
            // Prepare row data
            const rowData = columns.map(col => {
                if (col === 'production_status') {
                    return 'Ready for Production'; // Always set to ready when syncing from DB
                }
                return formatValue(scholarship[col], col);
            });

            const scholarshipId = scholarship.id;

            if (existingIds.has(scholarshipId)) {
                // Update existing row
                const rowIndex = existingIds.get(scholarshipId);
                await updateSheetRow(rowIndex, rowData);
                updated++;
            } else {
                // Append new row
                await appendSheetRow(rowData);
                added++;
            }
        }

        console.log('\n==================================================');
        console.log('✅ Sync complete!');
        console.log(`   Updated: ${updated} scholarships`);
        console.log(`   Added: ${added} new scholarships`);
        console.log('==================================================\n');

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run the sync
syncToGoogleSheets();
