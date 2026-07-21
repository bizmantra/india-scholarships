const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { google } = require('googleapis');

async function runLiveAnalysis() {
    console.log('🚀 IndiaScholarships - Live GSC & GA4 API Mining\n');

    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/analytics.readonly'
        ],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDateObj = new Date();
    startDateObj.setDate(today.getDate() - 30);
    const startDate = startDateObj.toISOString().split('T')[0];

    console.log(`📅 Date Range: ${startDate} to ${endDate} (Last 30 Days)\n`);

    // 1. Live GSC Queries Analysis
    console.log('--- 🔍 LIVE SEARCH CONSOLE DATA (Last 30 Days) ---');
    try {
        const gscRes = await searchconsole.searchanalytics.query({
            siteUrl: 'sc-domain:indiascholarships.in',
            requestBody: {
                startDate: startDate,
                endDate: endDate,
                dimensions: ['query'],
                rowLimit: 500
            }
        });

        const rows = gscRes.data.rows || [];
        console.log(`Fetched ${rows.length} search queries.`);

        // Total GSC stats
        let totalClicks = 0;
        let totalImpressions = 0;
        rows.forEach(r => {
            totalClicks += r.clicks;
            totalImpressions += r.impressions;
        });

        console.log(`Total Clicks: ${totalClicks.toLocaleString()}`);
        console.log(`Total Impressions: ${totalImpressions.toLocaleString()}`);
        console.log(`Avg CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%\n`);

        console.log('🏆 Top 15 Queries by Clicks:');
        console.log('Query | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        rows.slice(0, 15).forEach(r => {
            console.log(`${r.keys[0]} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)}`);
        });

        console.log('\n💡 HIGH-IMPRESSION LOW-CTR OPPORTUNITIES (Position 3-15, Impressions > 1,000, CTR < 3%):');
        console.log('Query | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        const lowCtrQueries = rows
            .filter(r => r.position >= 3 && r.position <= 15 && r.impressions >= 1000 && r.ctr < 0.03)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 15);

        lowCtrQueries.forEach(r => {
            console.log(`${r.keys[0]} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)}`);
        });

    } catch (err) {
        console.error('❌ GSC Error:', err.message);
    }

    // 2. Live GSC Pages Analysis
    console.log('\n--- 📄 LIVE TOP GSC LANDING PAGES (Last 30 Days) ---');
    try {
        const pageRes = await searchconsole.searchanalytics.query({
            siteUrl: 'sc-domain:indiascholarships.in',
            requestBody: {
                startDate: startDate,
                endDate: endDate,
                dimensions: ['page'],
                rowLimit: 100
            }
        });

        const pageRows = pageRes.data.rows || [];
        console.log('Page | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        pageRows.slice(0, 15).forEach(r => {
            const pathUrl = r.keys[0].replace('https://www.indiascholarships.in', '');
            console.log(`${pathUrl} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)}`);
        });

        console.log('\n⚠️ HIGH-IMPRESSION UNDERPERFORMING PAGES (Impressions > 10,000, CTR < 2%):');
        console.log('Page | Clicks | Impressions | CTR | Position');
        console.log('--- | --- | --- | --- | ---');
        const lowCtrPages = pageRows
            .filter(r => r.impressions >= 10000 && r.ctr < 0.02)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 10);

        lowCtrPages.forEach(r => {
            const pathUrl = r.keys[0].replace('https://www.indiascholarships.in', '');
            console.log(`${pathUrl} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)}`);
        });

    } catch (err) {
        console.error('❌ GSC Page Error:', err.message);
    }

    // 3. Live GA4 Traffic Analysis
    console.log('\n--- 📊 LIVE GOOGLE ANALYTICS 4 DATA (Last 30 Days) ---');
    try {
        const gaRes = await analyticsdata.properties.runReport({
            property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'screenPageViews' },
                    { name: 'averageSessionDuration' },
                    { name: 'bounceRate' }
                ],
                dimensions: [{ name: 'pagePath' }],
                limit: 20
            }
        });

        const gaRows = gaRes.data.rows || [];
        console.log('Page Path | Active Users | Page Views | Avg Session Duration (s) | Bounce Rate');
        console.log('--- | --- | --- | --- | ---');
        gaRows.forEach(r => {
            const pathStr = r.dimensionValues[0].value;
            const users = r.metricValues[0].value;
            const views = r.metricValues[1].value;
            const duration = parseFloat(r.metricValues[2].value).toFixed(1);
            const bounce = (parseFloat(r.metricValues[3].value) * 100).toFixed(1);
            console.log(`${pathStr} | ${users} | ${views} | ${duration}s | ${bounce}%`);
        });

    } catch (err) {
        console.error('❌ GA4 Error:', err.message);
    }
}

runLiveAnalysis();
