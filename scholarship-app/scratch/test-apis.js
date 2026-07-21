const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { google } = require('googleapis');

async function testGSC() {
    console.log('Testing GSC API with Service Account...');
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
        console.log('❌ Missing service account credentials');
        return;
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/analytics.readonly'
        ],
    });

    try {
        const searchconsole = google.searchconsole({ version: 'v1', auth });
        const res = await searchconsole.searchanalytics.query({
            siteUrl: 'https://www.indiascholarships.in/',
            requestBody: {
                startDate: '2026-07-01',
                endDate: '2026-07-20',
                dimensions: ['query'],
                rowLimit: 10
            }
        });
        console.log('✅ GSC API SUCCESS!');
        console.log(res.data.rows);
    } catch (err) {
        console.log('❌ GSC API Error:', err.message);
    }

    try {
        console.log('\nTesting GA4 Data API...');
        const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
        const gaRes = await analyticsdata.properties.runReport({
            property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
                dimensions: [{ name: 'pagePath' }],
                limit: 10
            }
        });
        console.log('✅ GA4 API SUCCESS!');
        console.log(gaRes.data.rows);
    } catch (err) {
        console.log('❌ GA4 API Error:', err.message);
    }
}

testGSC();
