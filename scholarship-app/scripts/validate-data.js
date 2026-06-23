const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Load canonical data from db.ts (mocking or requiring if possible, but better to define standard lists here for standalone use)
const CANONICAL_LEVELS = [
    'Class 1-10',
    'Class 11-12',
    'Diploma / Polytechnic',
    'ITI Courses',
    'Graduation (UG)',
    'Post-Graduation (PG)',
    'PhD & Research'
];

const VALID_PROVIDER_TYPES = ['Government', 'Corporate', 'Private'];

function validateCSV(filePath) {
    console.log(`\n🔍 Validating: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    let errors = 0;
    let warnings = 0;

    records.forEach((row, index) => {
        const lineNum = index + 2; // 1-indexed, +1 for header
        const id = row.id || row.slug || "MISSING_ID";

        // 1. Check ID/Slug
        if (!id || id === "MISSING_ID") {
            console.error(`[Line ${lineNum}] ❌ ERROR: Missing ID/Slug. Title: ${row.title || 'Untitled'}`);
            errors++;
        }

        // 2. Check Numeric Fields
        const income = Number(row.income_limit);
        if (isNaN(income)) {
            console.error(`[Line ${lineNum}] ❌ ERROR: income_limit must be a number (got "${row.income_limit}"). Use 0 for no limit.`);
            errors++;
        }

        const amount = Number(row.amount_annual);
        if (isNaN(amount) && row.amount_annual !== '') {
            console.warn(`[Line ${lineNum}] ⚠️ WARNING: amount_annual is not a number ("${row.amount_annual}").`);
            warnings++;
        }

        // 3. Check Canonical Levels
        if (row.level) {
            const levels = row.level.split(',').map(l => l.trim());
            levels.forEach(l => {
                if (!CANONICAL_LEVELS.includes(l)) {
                    console.warn(`[Line ${lineNum}] ⚠️ WARNING: Non-canonical level: "${l}". Expected one of: ${CANONICAL_LEVELS.join(', ')}`);
                    warnings++;
                }
            });
        }

        // 4. Check Provider Type
        if (row.provider_type && !VALID_PROVIDER_TYPES.includes(row.provider_type)) {
            console.error(`[Line ${lineNum}] ❌ ERROR: Invalid provider_type: "${row.provider_type}". Must be: ${VALID_PROVIDER_TYPES.join(', ')}`);
            errors++;
        }

        // 5. Check FAQ format
        if (row.faq_json) {
            try {
                const faqs = JSON.parse(row.faq_json);
                if (!Array.isArray(faqs)) throw new Error();
            } catch {
                if (!row.faq_json.includes('Q:') && !row.faq_json.includes('A:')) {
                    console.warn(`[Line ${lineNum}] ⚠️ WARNING: faq_json column is neither valid JSON nor standard Q: A: format.`);
                    warnings++;
                }
            }
        }
    });

    console.log(`\n📊 Validation Complete for ${records.length} records.`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   ⚠️ Warnings: ${warnings}`);

    if (errors > 0) {
        console.log(`\n🚨 PLEASE FIX ERRORS BEFORE IMPORTING.企`);
        process.exit(1);
    } else {
        console.log(`\n✅ DATA IS READY FOR IMPORT.企`);
    }
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.log("Usage: node scripts/validate-data.js <path-to-csv>企");
    process.exit(1);
}

validateCSV(targetFile);
