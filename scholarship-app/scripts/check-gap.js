const { getSheetData } = require('../lib/google-sheets');
const fs = require('fs');
const path = require('path');

async function checkGap() {
    try {
        const sheetData = await getSheetData();
        const sheetTitles = new Set(sheetData.slice(1).map(r => r[1]?.trim()));

        const dbTitlesRaw = fs.readFileSync(path.join(__dirname, '../db_titles.txt'), 'utf8');
        const dbTitles = dbTitlesRaw.split('\n').map(t => t.trim()).filter(t => t.length > 0);

        const onlyInDb = dbTitles.filter(t => !sheetTitles.has(t));

        console.log('Total in DB:', dbTitles.length);
        console.log('Total uniquely titled in Sheet:', sheetTitles.size);
        console.log('\n--- Scholarships ONLY in Database (The Gap) ---');
        onlyInDb.forEach(t => console.log('- ' + t));

    } catch (e) {
        console.error('Error during gap analysis:', e.message);
    }
}

checkGap();
