const { getSheetData } = require('../lib/google-sheets');

async function debugSheet() {
    try {
        console.log("🔍 Reading Sheet Data...");
        const rows = await getSheetData();

        if (!rows || rows.length === 0) {
            console.log("❌ Sheet is empty or unreadable.");
            return;
        }

        const headers = rows[0];
        console.log("✅ Headers:", headers);

        const idIndex = headers.indexOf('ID'); // Case sensitive check
        console.log(`ℹ️ ID Column Index: ${idIndex}`);

        if (idIndex === -1) {
            console.log("❌ 'ID' column not found in headers!");
            return;
        }

        const targetID1 = "lila-poonawalla-foundation-scholarship";

        console.log(`\n🔍 Searching for ALL occurrences of: ${targetID1}`);
        rows.forEach((row, index) => {
            if (row[idIndex]) {
                const id = row[idIndex].trim();
                if (id === targetID1) {
                    console.log(`✅ Found IDENTICAL ID at Row ${index + 1}.`);
                } else if (id.includes('lila') && id.includes('poonawalla')) {
                    console.log(`ℹ️  Found similar ID at Row ${index + 1}: '${id}'`);
                }
            }
        });

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

debugSheet();
