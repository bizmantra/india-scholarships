#!/usr/bin/env node

/**
 * Import scholarships from Google Sheets to SQLite database
 * Uses Google Sheets API to fetch data directly
 */

const Database = require('better-sqlite3');
const path = require('path');
const { getSheetData, getSheetHeaders } = require('../lib/google-sheets');

const dbPath = path.join(__dirname, '../data/scholarships.db');
const db = new Database(dbPath);

console.log('📊 Google Sheets to Database Import Script\n');
console.log(`Database: ${dbPath}\n`);

// Column mapping from Google Sheets to database fields
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
    'SEO Keywords': 'seo_keywords',
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
    'Verified': 'verified',
    'Last Verified Date': 'last_verified',
    'Verification year': 'verification_year',
    'Application Type': 'application_mode',
    'Show on Homepage': 'show_on_homepage',
    'Is Featured': 'is_featured',
    'Is Popular': 'is_popular',
    'Priority Score': 'priority_score',
    'Scholarship Status': 'status',
    'Time to apply (mins)': 'time_to_apply',
    'Renewal': 'renewal',
    'Helpline': 'helpline',
    'Competitiveness': 'competitiveness',
    'Internal Notes': 'internal_notes',
    'Production Status': 'production_status',
};

// Helper function to generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/\d{4}(-\d{2,4})?$/g, '')
        .replace(/-+$/g, '');
}

// Helper to parse array fields
function parseArrayField(value) {
    if (!value) return [];
    return value.split(',').map(v => v.trim()).filter(v => v);
}

// Helper to parse boolean
function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
    }
    return false;
}

async function importFromGoogleSheets() {
    try {
        console.log('📖 Fetching data from Google Sheets...\n');

        const rows = await getSheetData();

        if (rows.length === 0) {
            console.error('❌ No data found in Google Sheets');
            process.exit(1);
        }

        const headers = rows[0];
        const dataRows = rows.slice(1);

        console.log(`✅ Found ${headers.length} columns`);
        console.log(`📝 Found ${dataRows.length} data rows\n`);

        // Create column index map (trim headers to handle trailing spaces)
        const columnIndices = {};
        headers.forEach((header, index) => {
            const trimmedHeader = header.trim();
            if (columnMap[trimmedHeader]) {
                columnIndices[columnMap[trimmedHeader]] = index;
            }
        });

        console.log('📋 Column mapping complete\n');

        let imported = 0;
        let skipped = 0;
        const importedIds = []; // Track which scholarships were imported

        for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
            const row = dataRows[rowIndex];
            const productionStatus = (row[columnIndices['production_status']] || '').trim();

            // Only import scholarships marked as "Ready for Production"
            if (productionStatus !== 'Ready for Production') {
                skipped++;
                continue;
            }

            const title = row[columnIndices['title']];
            if (!title) {
                skipped++;
                continue;
            }

            const slug = generateSlug(title);

            const scholarshipData = {
                id: row[columnIndices['id']] || slug,
                slug: slug,
                title: title,
                provider: row[columnIndices['provider']] || '',
                scholarship_type: row[columnIndices['scholarship_type']] || 'Government',
                provider_type: row[columnIndices['provider_type']] || '',
                state: row[columnIndices['state']] || '',
                residency_requirement: row[columnIndices['residency_requirement']] || '',
                course_stream: JSON.stringify(parseArrayField(row[columnIndices['course_stream']])),
                age_limit: row[columnIndices['age_limit']] || null,
                total_awards: row[columnIndices['total_awards']] ? parseInt(row[columnIndices['total_awards']]) : null,
                caste: JSON.stringify(parseArrayField(row[columnIndices['caste']])),
                gender: row[columnIndices['gender']] || '',
                level: row[columnIndices['level']] || '',
                min_marks: row[columnIndices['min_marks']] ? parseFloat(row[columnIndices['min_marks']]) : null,
                income_limit: row[columnIndices['income_limit']] ? parseInt(row[columnIndices['income_limit']]) : null,
                amount_min: row[columnIndices['amount_min']] ? parseInt(row[columnIndices['amount_min']]) : null,
                amount_annual: row[columnIndices['amount_annual']] ? parseInt(row[columnIndices['amount_annual']]) : null,
                amount_description: row[columnIndices['amount_description']] || '',
                deadline: row[columnIndices['deadline']] || null,
                deadline_description: row[columnIndices['deadline_description']] || '',
                official_source: row[columnIndices['official_source']] || '',
                special_conditions: row[columnIndices['special_conditions']] || '',
                tags: JSON.stringify(parseArrayField(row[columnIndices['tags']])),
                thumbnail_url: row[columnIndices['thumbnail_url']] || null,
                docs_needed: JSON.stringify(parseArrayField(row[columnIndices['docs_needed']])),
                apply_url: row[columnIndices['apply_url']] || '',
                intro_seo: row[columnIndices['intro_seo']] || '',
                benefits: row[columnIndices['benefits']] || '',
                step_guide: row[columnIndices['step_guide']] || '',
                selection: row[columnIndices['selection']] || '',
                faq_json: row[columnIndices['faq_json']] || '',
                verified_status: parseBoolean(row[columnIndices['verified']]) ? 'Verified' : 'Unverified',
                last_verified: row[columnIndices['last_verified']] || new Date().toISOString().split('T')[0],
                verification_year: row[columnIndices['verification_year']] ? parseInt(row[columnIndices['verification_year']]) : new Date().getFullYear(),
                application_mode: row[columnIndices['application_mode']] || 'Online',
                show_on_homepage: parseBoolean(row[columnIndices['show_on_homepage']]) ? 1 : 0,
                is_featured: parseBoolean(row[columnIndices['is_featured']]) ? 1 : 0,
                is_popular: parseBoolean(row[columnIndices['is_popular']]) ? 1 : 0,
                priority_score: row[columnIndices['priority_score']] ? parseInt(row[columnIndices['priority_score']]) : 50,
                status: row[columnIndices['status']] || 'Active',
                time_min: row[columnIndices['time_to_apply']] ? parseInt(row[columnIndices['time_to_apply']]) : null,
                renewal: row[columnIndices['renewal']] || '',
                helpline: row[columnIndices['helpline']] || '',
                competitiveness: row[columnIndices['competitiveness']] || 'Medium',
                internal_notes: row[columnIndices['internal_notes']] || '',
            };

            try {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO scholarships (
                        id, slug, title, provider, scholarship_type, provider_type, state,
                        residency_requirement, course_stream, age_limit, total_awards, caste,
                        gender, level, min_marks, income_limit, amount_min, amount_annual,
                        amount_description, deadline, deadline_description, official_source,
                        special_conditions, tags, thumbnail_url, docs_needed,
                        apply_url, intro_seo, benefits, step_guide, selection, faq_json,
                        verified_status, last_verified, verification_year, application_mode,
                        show_on_homepage, is_featured, is_popular, priority_score, status,
                        time_min, renewal, helpline, competitiveness
                    ) VALUES (
                        @id, @slug, @title, @provider, @scholarship_type, @provider_type, @state,
                        @residency_requirement, @course_stream, @age_limit, @total_awards, @caste,
                        @gender, @level, @min_marks, @income_limit, @amount_min, @amount_annual,
                        @amount_description, @deadline, @deadline_description, @official_source,
                        @special_conditions, @tags, @thumbnail_url, @docs_needed,
                        @apply_url, @intro_seo, @benefits, @step_guide, @selection, @faq_json,
                        @verified_status, @last_verified, @verification_year, @application_mode,
                        @show_on_homepage, @is_featured, @is_popular, @priority_score, @status,
                        @time_min, @renewal, @helpline, @competitiveness
                    )
                `);

                stmt.run(scholarshipData);
                console.log(`✅ Importing: ${title}`);
                imported++;
            } catch (error) {
                console.error(`❌ Error importing ${title}:`, error.message);
            }
        }

        console.log('\n==================================================');
        console.log('✅ Import complete!');
        console.log(`   Imported: ${imported} scholarships`);
        console.log(`   Skipped: ${skipped} scholarships (not "Ready for Production")`);
        console.log('==================================================\n');

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run the import
importFromGoogleSheets();
