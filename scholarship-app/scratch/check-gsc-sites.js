const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { google } = require('googleapis');

async function listGSCSites() {
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/webmasters'
        ],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    try {
        const sites = await searchconsole.sites.list({});
        console.log('✅ Accessible GSC Sites:');
        console.log(JSON.stringify(sites.data.siteEntry, null, 2));
    } catch (err) {
        console.log('❌ Error listing sites:', err.message);
    }
}

listGSCSites();
