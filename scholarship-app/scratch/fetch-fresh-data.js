const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';

if (!email || !privateKey) {
    console.error('❌ Google Service Account credentials missing in .env.local');
    process.exit(1);
}

const formattedKey = privateKey.replace(/\\n/g, '\n');

// 1. Fetch Search Console Data
async function fetchGSC() {
    console.log('🔄 Fetching Google Search Console data...');
    try {
        const auth = new google.auth.JWT({
            email,
            key: formattedKey,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });
        const gsc = google.webmasters({ version: 'v3', auth });

        // Date range: last 30 days
        const today = new Date();
        const endDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // GSC has ~2 days delay
        const startDate = new Date(today.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        console.log(`Querying GSC from ${startDate} to ${endDate} for ${siteUrl}...`);

        const res = await gsc.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query'],
                rowLimit: 50
            }
        });

        console.log('✅ GSC Fetch Successful!');
        return res.data.rows || [];
    } catch (err) {
        console.error('❌ GSC Fetch Failed:', err.message);
        return null;
    }
}

// 2. Fetch GA4 Data
async function fetchGA4() {
    if (!propertyId) {
        console.warn('⚠️ GOOGLE_ANALYTICS_PROPERTY_ID not set in .env.local. Skipping GA4.');
        return null;
    }
    console.log(`🔄 Fetching Google Analytics 4 data (Property: ${propertyId})...`);
    try {
        const auth = new google.auth.JWT({
            email,
            key: formattedKey,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        });
        const ga4 = google.analyticsdata({ version: 'v1beta', auth });

        const res = await ga4.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
                limit: 50
            }
        });

        console.log('✅ GA4 Fetch Successful!');
        return res.data.rows || [];
    } catch (err) {
        console.error('❌ GA4 Fetch Failed:', err.message);
        return null;
    }
}

async function main() {
    const gscRows = await fetchGSC();
    const ga4Rows = await fetchGA4();

    const output = {
        timestamp: new Date().toISOString(),
        gsc: gscRows,
        ga4: ga4Rows
    };

    const outPath = path.join(__dirname, '../data/fresh-analytics-report.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`\n🎉 Done! Saved fresh reports to: ${outPath}`);
}

main();
