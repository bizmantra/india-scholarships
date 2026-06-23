const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

function authenticateGoogleSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
}

async function readSheet() {
    const sheets = authenticateGoogleSheets();
    const spreadsheetId = '1lK0rWFubzRlhwiC37bNpb8L_1YG3grmiEPpinjbkGaU';

    try {
        console.log('Fetching spreadsheet metadata...');
        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        const tabs = meta.data.sheets.map(s => s.properties.title);
        console.log('Available tabs:', tabs);

        const fs = require('fs');
        const path = require('path');
        const outputDir = path.join(__dirname, '..', 'data', 'gsc-june-2026');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        for (const tab of tabs) {
            console.log(`Fetching tab: ${tab}...`);
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${tab}!A:AZ`,
            });
            const rows = response.data.values || [];
            console.log(`Fetched ${rows.length} rows for tab ${tab}`);

            // Save to JSON
            const outputPath = path.join(outputDir, `${tab.toLowerCase().replace(/\s+/g, '_')}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
            console.log(`Saved to ${outputPath}`);
        }
        console.log('\nAll data fetched successfully!');
    } catch (error) {
        console.error('Error reading Google Sheet:', error.message);
        if (error.message.includes('permission') || error.message.includes('caller does not have permission')) {
            console.log('\nTIP: Please make sure the sheet is shared with your service account email:');
            console.log(process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
            console.log('Or set the sharing settings of the Google Sheet to "Anyone with the link can view".');
        }
    }
}

readSheet();
