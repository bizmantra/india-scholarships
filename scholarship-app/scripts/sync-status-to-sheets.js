const { getSheetData, getSheetHeaders, updateSheetRow, batchUpdateSheetRows } = require('../lib/google-sheets');
const Database = require('better-sqlite3');

// Helper function to generate slug from title (same as import script)
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

function getColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode((index % 26) + 65) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
}

async function syncStatusAndUrls() {
    const db = new Database('./data/scholarships.db');

    try {
        console.log('🔄 Syncing status and URLs to Google Sheets (Better-Sqlite3 Mode)...\n');

        const headers = await getSheetHeaders();
        const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

        let statusIndex = headers.findIndex(h => h.trim() === 'Production Status');
        let urlIndex = headers.findIndex(h => h.trim() === 'Localhost URL');

        // Add Localhost URL column if it doesn't exist
        if (urlIndex === -1) {
            console.log('Adding "Localhost URL" column to headers...');
            const newHeaders = [...headers, 'Localhost URL'];
            await updateSheetRow(1, newHeaders);
            urlIndex = newHeaders.length - 1;
        }

        const data = await getSheetData();
        if (data.length <= 1) {
            console.log('No data to sync.');
            return;
        }

        const statusColLetter = getColumnLetter(statusIndex);
        const urlColLetter = getColumnLetter(urlIndex);

        // Map titles to slugs from DB to ensure accuracy
        const titleToSlug = {};
        const rows = db.prepare('SELECT title, slug FROM scholarships').all();
        rows.forEach(r => titleToSlug[r.title.trim()] = r.slug);

        const updates = [];
        let syncedCount = 0;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const title = (row[1] || '').trim();
            const currentStatus = (row[statusIndex] || '').trim();

            // Note: urlIndex might be out of range if column was just added
            const currentUrl = row[urlIndex] || '';

            const slug = titleToSlug[title] || generateSlug(title);
            const localhostUrl = `http://localhost:3000/scholarships/${slug}`;

            let needsUpdate = false;

            // Update status to "In Localhost" if it was "Ready for Production"
            if (currentStatus === 'Ready for Production') {
                const rowIndex = i + 1;
                updates.push({
                    range: `${sheetName}!${statusColLetter}${rowIndex}`,
                    values: 'In Localhost'
                });
                needsUpdate = true;
            }

            // Update Localhost URL if missing or different
            if (currentUrl !== localhostUrl) {
                const rowIndex = i + 1;
                updates.push({
                    range: `${sheetName}!${urlColLetter}${rowIndex}`,
                    values: localhostUrl
                });
                needsUpdate = true;
            }

            if (needsUpdate) syncedCount++;
        }

        if (updates.length > 0) {
            console.log(`Sending batch update for ${updates.length} changes across ${syncedCount} rows...`);
            await batchUpdateSheetRows(updates);
            console.log(`\n✅ Successfully synced ${syncedCount} rows.`);
        } else {
            console.log('Everything is already in sync.');
        }

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
    } finally {
        db.close();
    }
}

syncStatusAndUrls();
