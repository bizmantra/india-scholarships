require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';

if (!email || !privateKey) {
    console.error('❌ Service Account credentials missing in .env.local');
    process.exit(1);
}

const auth = new google.auth.JWT({
    email,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/webmasters'
    ]
});

const searchconsole = google.searchconsole({ version: 'v1', auth });
const webmasters = google.webmasters({ version: 'v3', auth });

const LOCALES = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];

async function main() {
    console.log('🔍 Querying Google Search Console API for Localized Pages...\n');

    // 1. Check offline exported pages.json first
    const offlinePagesPath = path.join(__dirname, '..', 'data', 'gsc-june-2026', 'pages.json');
    if (fs.existsSync(offlinePagesPath)) {
        try {
            const offlinePages = JSON.parse(fs.readFileSync(offlinePagesPath, 'utf-8'));
            console.log(`📁 Checking local offline export (${offlinePagesPath}):`);
            const offlineLocalized = offlinePages.filter(row => {
                const url = row[0];
                return LOCALES.some(loc => url.includes(`/${loc}/`) || url.endsWith(`/${loc}`));
            });
            console.log(`   Found ${offlineLocalized.length} localized URLs in June 2026 offline data.`);
            offlineLocalized.forEach(row => console.log(`   - ${row[0]} (Clicks: ${row[1]}, Impressions: ${row[2]})`));
        } catch (e) {
            console.log('   Error parsing offline pages.json:', e.message);
        }
    }

    // 2. Fetch Live Search Analytics Data (Last 90 Days)
    console.log('\n📡 Querying Live GSC Search Analytics (Last 90 days)...');
    const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
        const res = await webmasters.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['page'],
                rowLimit: 25000
            }
        });

        const rows = res.data.rows || [];
        console.log(`   Fetched total ${rows.length} indexed/ranked pages from GSC.`);

        const localizedRows = rows.filter(r => {
            const page = r.keys[0];
            return LOCALES.some(loc => page.includes(`/${loc}/`) || page.endsWith(`/${loc}`));
        });

        console.log(`\n🌐 Localized Pages with Impressions/Clicks in GSC (${localizedRows.length} total):`);
        if (localizedRows.length === 0) {
            console.log('   ❌ No localized pages (/hi/, /bn/, /ta/, /te/, /or/, /kn/) have recorded impressions or clicks in the last 90 days.');
        } else {
            console.log('Page URL | Clicks | Impressions | CTR | Position');
            console.log('---|---|---|---|---');
            localizedRows.forEach(r => {
                const ctr = ((r.ctr || 0) * 100).toFixed(2) + '%';
                const pos = (r.position || 0).toFixed(1);
                console.log(`${r.keys[0]} | ${r.clicks} | ${r.impressions} | ${ctr} | ${pos}`);
            });
        }

        // Break down by locale
        console.log('\n📊 Breakdown by Locale Code:');
        LOCALES.forEach(loc => {
            const count = rows.filter(r => r.keys[0].includes(`/${loc}/`) || r.keys[0].endsWith(`/${loc}`)).length;
            console.log(`- /${loc}/: ${count} pages indexed & receiving search traffic`);
        });

    } catch (err) {
        console.error('❌ Search Analytics query error:', err.message);
    }

    // 3. Inspect specific URLs using URL Inspection API
    console.log('\n🔎 Running URL Inspection API on key localized sample URLs...');

    const sampleUrls = [
        'https://www.indiascholarships.in/hi',
        'https://www.indiascholarships.in/hi/scholarships',
        'https://www.indiascholarships.in/ta/scholarships',
        'https://www.indiascholarships.in/te/scholarships',
        'https://www.indiascholarships.in/bn/scholarships',
        'https://www.indiascholarships.in/kn/scholarships',
        'https://www.indiascholarships.in/or/scholarships',
        'https://www.indiascholarships.in/hi/scholarships-in/uttar-pradesh',
        'https://www.indiascholarships.in/ta/scholarships-in/tamil-nadu'
    ];

    for (const inspectionUrl of sampleUrls) {
        try {
            const inspectRes = await searchconsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: inspectionUrl,
                    siteUrl: 'sc-domain:indiascholarships.in'
                }
            });

            const result = inspectRes.data.inspectionResult;
            const indexStatus = result?.indexStatusResult?.coverageState || 'UNKNOWN';
            const verdict = result?.indexStatusResult?.verdict || 'UNKNOWN';
            const pageFetchState = result?.indexStatusResult?.pageFetchState || 'UNKNOWN';
            const indexingState = result?.indexStatusResult?.indexingState || 'UNKNOWN';

            console.log(`\nURL: ${inspectionUrl}`);
            console.log(`   - Verdict: ${verdict}`);
            console.log(`   - Coverage State: ${indexStatus}`);
            console.log(`   - Indexing State: ${indexingState}`);
            console.log(`   - Page Fetch State: ${pageFetchState}`);

        } catch (e) {
            console.log(`\nURL: ${inspectionUrl}`);
            console.log(`   ❌ Inspection Error: ${e.message}`);
        }
    }
}

main().catch(console.error);
