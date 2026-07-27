const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { google } = require('googleapis');

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Auth helpers
function getServiceAccountAuth(scopes) {
    const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;

    if (!email || !privateKey) {
        throw new Error('Google Service Account credentials missing in environment.');
    }

    return new google.auth.JWT({
        email,
        key: privateKey.replace(/\\n/g, '\n'),
        scopes
    });
}

function getOAuth2Auth() {
    const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Google AdSense OAuth credentials missing.');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
}

async function main() {
    console.log('🔍 Running Google API Connection & Performance Audit...');
    
    const results = {
        adsense: null,
        gsc: null,
        ga4: null,
        errors: []
    };

    // 1. Fetch AdSense Data
    try {
        console.log('💸 Connecting to Google AdSense...');
        const auth = getOAuth2Auth();
        const adsense = google.adsense({ version: 'v2', auth });
        const accountId = process.env.GOOGLE_ADSENSE_ACCOUNT_ID;
        const account = `accounts/${accountId}`;

        console.log('Retrieving AdSense Account Info...');
        const accInfo = await adsense.accounts.get({ name: account });
        console.log(`✅ AdSense Connected: ${accInfo.data.displayName} (${accInfo.data.name})`);

        console.log('Fetching AdSense Last 30 Days Stats...');
        const rep30 = await adsense.accounts.reports.generate({
            account,
            dateRange: 'LAST_30_DAYS',
            metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'CLICKS', 'PAGE_VIEWS', 'AD_REQUESTS', 'MATCHED_AD_REQUESTS']
        });
        
        const row = rep30.data.rows?.[0] || { cells: [] };
        const adsenseSummary = {
            earnings: parseFloat(row.cells?.[0]?.value || '0') || 0,
            impressions: parseInt(row.cells?.[1]?.value || '0') || 0,
            clicks: parseInt(row.cells?.[2]?.value || '0') || 0,
            views: parseInt(row.cells?.[3]?.value || '0') || 0,
            adRequests: parseInt(row.cells?.[4]?.value || '0') || 0,
            matchedRequests: parseInt(row.cells?.[5]?.value || '0') || 0,
        };

        // Fetch top URLs/Ad Units
        const unitRep = await adsense.accounts.reports.generate({
            account,
            dateRange: 'LAST_30_DAYS',
            metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'CLICKS'],
            dimensions: ['AD_UNIT_NAME'],
            limit: 10
        });

        const topUnits = (unitRep.data.rows || []).map(r => ({
            name: r.cells[0].value,
            earnings: parseFloat(r.cells[1].value) || 0,
            impressions: parseInt(r.cells[2].value) || 0,
            clicks: parseInt(r.cells[3].value) || 0
        }));

        results.adsense = { summary: adsenseSummary, units: topUnits };
    } catch (e) {
        console.error('❌ AdSense Audit Failed:', e.message);
        results.errors.push({ service: 'adsense', message: e.message });
    }

    // 2. Fetch GSC Data
    try {
        console.log('📈 Connecting to Google Search Console...');
        const auth = getServiceAccountAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
        const gsc = google.webmasters({ version: 'v3', auth });
        const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';
        
        const today = new Date();
        const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days ago for safety
        const startDate = new Date(today.getTime() - 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        console.log(`Querying GSC data from ${startDate} to ${endDate} for ${siteUrl}...`);
        const gscRes = await gsc.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query'],
                rowLimit: 20
            }
        });

        const queries = (gscRes.data.rows || []).map(r => ({
            query: r.keys[0],
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position
        }));

        // Query GSC Page stats
        const gscPageRes = await gsc.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['page'],
                rowLimit: 20
            }
        });

        const pages = (gscPageRes.data.rows || []).map(r => ({
            page: r.keys[0],
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position
        }));

        results.gsc = { queries, pages };
    } catch (e) {
        console.error('❌ GSC Audit Failed:', e.message);
        results.errors.push({ service: 'gsc', message: e.message });
    }

    // 3. Fetch GA4 Data
    try {
        console.log('📊 Connecting to GA4 Analytics...');
        const auth = getServiceAccountAuth(['https://www.googleapis.com/auth/analytics.readonly']);
        const ga4 = google.analyticsdata({ version: 'v1beta', auth });
        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

        if (!propertyId) throw new Error('GOOGLE_ANALYTICS_PROPERTY_ID is missing.');

        console.log(`Querying GA4 properties.runReport for property: ${propertyId}...`);
        const ga4Res = await ga4.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'landingPage' }],
                metrics: [
                    { name: 'sessions' },
                    { name: 'screenPageViews' },
                    { name: 'activeUsers' }
                ],
                limit: '20'
            }
        });

        const topLandingPages = (ga4Res.data.rows || []).map(r => ({
            page: r.dimensionValues[0].value,
            sessions: parseInt(r.metricValues[0].value) || 0,
            views: parseInt(r.metricValues[1].value) || 0,
            activeUsers: parseInt(r.metricValues[2].value) || 0
        }));

        results.ga4 = { topLandingPages };
    } catch (e) {
        console.error('❌ GA4 Audit Failed:', e.message);
        results.errors.push({ service: 'ga4', message: e.message });
    }

    // Output final diagnostic report to scratch JSON
    const reportPath = path.join(__dirname, 'adsense-diagnostics-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n🎉 Diagnostics complete! Results saved to: ${reportPath}`);
}

main().catch(err => {
    console.error('Fatal execution error:', err);
});
