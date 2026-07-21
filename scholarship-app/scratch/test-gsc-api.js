require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testGSC() {
    console.log('Testing GSC API with sc-domain:indiascholarships.in...');
    
    const authSA = new google.auth.JWT({
        email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/webmasters.readonly'
        ],
    });
    
    const searchconsole = google.searchconsole({ version: 'v1', auth: authSA });
    const siteUrl = 'sc-domain:indiascholarships.in';

    // 1. Sitemaps
    try {
        console.log('\n--- SITEMAPS ---');
        const sitemaps = await searchconsole.sitemaps.list({ siteUrl });
        console.log('Sitemaps:', JSON.stringify(sitemaps.data, null, 2));
    } catch (e) {
        console.error('Sitemaps error:', e.message);
    }

    // 2. Search Analytics - page count in GSC index with impressions/clicks in last 30 days
    try {
        console.log('\n--- SEARCH ANALYTICS (PAGES IN GSC) ---');
        let allPages = [];
        let startRow = 0;
        const rowLimit = 2500;
        
        while (true) {
            const res = await searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate: '2026-06-21',
                    endDate: '2026-07-20',
                    dimensions: ['page'],
                    rowLimit: rowLimit,
                    startRow: startRow
                }
            });
            const rows = res.data.rows || [];
            allPages.push(...rows);
            console.log(`Fetched ${rows.length} pages (total so far: ${allPages.length})`);
            if (rows.length < rowLimit) break;
            startRow += rows.length;
        }

        console.log(`Total active pages with performance in last 30 days: ${allPages.length}`);
        
    } catch (e) {
        console.error('SearchAnalytics error:', e.message);
    }

    // 3. Inspect Index Status for sample URLs (URL Inspection API)
    try {
        console.log('\n--- URL INSPECTION TEST ---');
        const testUrls = [
            'https://www.indiascholarships.in/',
            'https://www.indiascholarships.in/scholarships-in/maharashtra',
            'https://www.indiascholarships.in/scholarships/tata-capital-pankh-scholarship',
            'https://www.indiascholarships.in/scholarships/tata-capital-pankh-scholarship/eligibility'
        ];

        for (const inspectionUrl of testUrls) {
            const inspectRes = await searchconsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: inspectionUrl,
                    siteUrl: siteUrl
                }
            });
            console.log(`URL: ${inspectionUrl}`);
            console.log(`Coverage State: ${inspectRes.data.inspectionResult?.indexStatusResult?.coverageState}`);
            console.log(`Verdict: ${inspectRes.data.inspectionResult?.indexStatusResult?.verdict}`);
            console.log(`Indexing State: ${inspectRes.data.inspectionResult?.indexStatusResult?.indexingState}`);
            console.log(`Last Crawl Time: ${inspectRes.data.inspectionResult?.indexStatusResult?.lastCrawlTime}\n`);
        }

    } catch (e) {
        console.error('URL Inspection error:', e.message);
    }
}

testGSC();
