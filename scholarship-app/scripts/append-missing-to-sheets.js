const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { appendSheetRow, getSheetHeaders } = require('../lib/google-sheets');
require('dotenv').config({ path: '.env.local' });

/**
 * Slugify a string to use as an ID
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
}

async function appendMissingScholarships() {
    console.log('🚀 Starting ingestion of missing scholarships...\n');

    const csvPath = path.join(__dirname, '../missing_scholarships.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ Error: missing_scholarships.csv not found!');
        process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`📖 Loaded ${records.length} records from CSV.`);

    // Get current sheet headers to ensure correct mapping
    const headers = await getSheetHeaders();
    console.log(`✅ Fetched ${headers.length} headers from Google Sheets.`);

    let successCount = 0;
    let failCount = 0;

    for (const record of records) {
        const title = record['Scholarship Name'];
        const provider = record['Provider Name'];

        // Map CSV fields to Sheet columns
        // Standard headers: ["ID","Scholarship Title ","Provider ","Scholarship Type","Provider Sub Type ","State ","Residency Requirement ","Course Stream ","Age Limit ","Total Awards ","Community ","Gender ","Education Level ","Minimum Marks ","Income Limit ","Minimum Scholarship Amount ","Annual Amount ","Amount Description ","Deadline ","Deadline Description","Official Website ","SEO Keywords ","Special conditions ","Tags ","Thumbnail URL","Documents Needed ","Apply URL","Introduction ","Benefits ","Application Step by Step Guide ","Selection Process ","FAQs ","Verified ","Last Verified Date ","Verification year ","Application Type ","Show on Homepage ","Is Featured ","Is Popular ","Priority Score ","Scholarship Status","Time to apply (mins)","Renewal ","Helpline ","Competitiveness","Internal Notes ","Production Status ","Localhost URL"]

        const rowData = headers.map(header => {
            const h = header.trim();
            if (h === 'ID') return slugify(title);
            if (h === 'Scholarship Title' || h === 'Scholarship Title ') return title;
            if (h === 'Provider' || h === 'Provider ') return provider;
            if (h === 'Scholarship Type') return record['Scholarship Type '] || '';
            if (h === 'Provider Sub Type' || h === 'Provider Sub Type ') return record['Provider Type'] || '';
            if (h === 'State' || h === 'State ') return record['Applicable States'] || '';
            if (h === 'Education Level' || h === 'Education Level ') return record['Education Level'] || '';
            if (h === 'Community' || h === 'Community ') return record['Category'] || '';
            if (h === 'Annual Amount' || h === 'Annual Amount ') return record['Scholarship Amount (approx)'] || '';
            if (h === 'Amount Description' || h === 'Amount Description ') return record['Type of Support '] || '';
            if (h === 'Deadline' || h === 'Deadline ') return record['Last Date (if available)'] || '';
            if (h === 'Apply URL' || h === 'Apply URL ') return record['Application URL'] || '';
            if (h === 'Official Website' || h === 'Official Website ') return record['Official Source URL'] || '';

            // Default fields for new records
            if (h === 'Production Status' || h === 'Production Status ') return 'Pending Research';
            if (h === 'Verification year' || h === 'Verification year ') return '2026';
            if (h === 'Show on Homepage' || h === 'Show on Homepage ') return '0';
            if (h === 'Is Featured' || h === 'Is Featured ') return '0';
            if (h === 'Is Popular' || h === 'Is Popular ') return '0';
            if (h === 'Verified' || h === 'Verified ') return '0';

            return ''; // Empty for everything else
        });

        try {
            if (process.env.DEBUG === 'true') {
                console.log(`[DRY RUN] Would append: ${title}`);
                successCount++;
            } else {
                await appendSheetRow(rowData);
                console.log(`✅ Appended: ${title}`);
                successCount++;
                // Throttle to avoid quota issues
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        } catch (error) {
            console.error(`❌ Failed to append ${title}:`, error.message);
            failCount++;
        }
    }

    console.log('\n==================================================');
    console.log('🏁 Ingestion Complete!');
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log('==================================================\n');
}

appendMissingScholarships();
