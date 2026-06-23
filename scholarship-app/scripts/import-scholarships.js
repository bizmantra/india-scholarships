const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { parse } = require('csv-parse/sync');

// Configuration
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
}

function parseFAQs(faqText) {
    if (!faqText) return '[]';
    try {
        const parsed = JSON.parse(faqText);
        if (Array.isArray(parsed)) return faqText;
    } catch (e) {
        // Not JSON, try to parse Q: A: format
        const lines = faqText.split('\n').filter(l => l.trim() !== '');
        const faqs = [];
        let currentQ = '';
        let currentA = '';

        lines.forEach(line => {
            if (line.startsWith('Q:') || line.toLowerCase().startsWith('question:')) {
                if (currentQ) faqs.push({ question: currentQ, answer: currentA });
                currentQ = line.replace(/^(Q:|question:)\s*/i, '').trim();
                currentA = '';
            } else if (line.startsWith('A:') || line.toLowerCase().startsWith('answer:')) {
                currentA = line.replace(/^(A:|answer:)\s*/i, '').trim();
            } else if (currentQ) {
                currentA += (currentA ? ' ' : '') + line.trim();
            }
        });
        if (currentQ) faqs.push({ question: currentQ, answer: currentA });
        return JSON.stringify(faqs);
    }
    return '[]';
}

function importCSV(filePath) {
    console.log(`\n🚀 Starting Bulk Import: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const db = new Database(dbPath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    const columns = db.prepare("PRAGMA table_info(scholarships)").all().map(c => c.name);

    const insertStmt = db.prepare(`
        INSERT INTO scholarships (${columns.join(', ')})
        VALUES (${columns.map(c => '@' + c).join(', ')})
        ON CONFLICT(id) DO UPDATE SET
            ${columns.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`).join(', ')}
    `);

    let imported = 0;
    let failed = 0;

    const transaction = db.transaction((rows) => {
        for (const row of rows) {
            try {
                // Pre-processing
                const data = { ...row };

                // Ensure ID
                if (!data.id) {
                    data.id = data.slug || slugify(data.title);
                }

                // Ensure slug
                if (!data.slug) {
                    data.slug = data.id;
                }

                // Values parsing
                data.income_limit = data.income_limit === '' ? 0 : Number(data.income_limit);
                data.amount_annual = data.amount_annual === '' ? 0 : Number(data.amount_annual);
                data.amount_min = data.amount_min === '' ? 0 : Number(data.amount_min);

                // FAQ Processing
                data.faq_json = parseFAQs(data.faq_json);

                // Handle tags - ensure it is JSON
                if (data.tags && !data.tags.startsWith('[')) {
                    data.tags = JSON.stringify(data.tags.split(',').map(t => t.trim()));
                }

                // Handle caste - ensure it is JSON
                if (data.caste && !data.caste.startsWith('[')) {
                    data.caste = JSON.stringify(data.caste.split(',').map(c => c.trim()));
                }

                // Default status
                if (!data.status) data.status = 'Active';

                // Fill missing columns with NULL to avoid '@column not found' errors
                columns.forEach(col => {
                    if (data[col] === undefined) data[col] = null;
                });

                // Only keep keys that match DB columns
                const finalData = {};
                columns.forEach(col => finalData[col] = data[col]);

                insertStmt.run(finalData);
                imported++;
            } catch (e) {
                console.error(`❌ FAILED row "${row.title}":`, e.message);
                failed++;
            }
        }
    });

    transaction(records);
    db.close();

    console.log(`\n✅ Import Complete!`);
    console.log(`   ✨ Success: ${imported}`);
    console.log(`   💔 Failed: ${failed}`);
    console.log(`\nDatabase updated at ${dbPath}企`);
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.log("Usage: node scripts/import-scholarships.js <path-to-csv>企");
    process.exit(1);
}

importCSV(targetFile);
