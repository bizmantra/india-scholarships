const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { google } = require('googleapis');

async function main() {
    console.log('🚀 Extracting Rising Pages from GA4 and mapping to GSC Queries...\n');

    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    if (!privateKey || !clientEmail || !propertyId) {
        console.error('❌ Error: Missing API credentials or GA4 Property ID in .env.local');
        return;
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/analytics.readonly'
        ],
    });

    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const siteUrl = 'sc-domain:indiascholarships.in';

    // 1. Fetch GA4 Period A (60daysAgo to 31daysAgo)
    async function fetchGA4Report(startDate, endDate) {
        console.log(`Fetching GA4 report for ${startDate} to ${endDate}...`);
        const res = await analyticsdata.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'screenPageViews' }
                ],
                dimensions: [{ name: 'pagePath' }],
                limit: 10000
            }
        });
        
        const map = new Map();
        const rows = res.data.rows || [];
        for (const row of rows) {
            const pagePath = row.dimensionValues[0].value;
            const activeUsers = parseInt(row.metricValues[0].value, 10);
            const pageViews = parseInt(row.metricValues[1].value, 10);
            map.set(pagePath, { pagePath, activeUsers, pageViews });
        }
        return map;
    }

    try {
        const ga4PeriodA = await fetchGA4Report('60daysAgo', '31daysAgo');
        const ga4PeriodB = await fetchGA4Report('30daysAgo', 'today');

        console.log(`GA4 Period A loaded: ${ga4PeriodA.size} pages.`);
        console.log(`GA4 Period B loaded: ${ga4PeriodB.size} pages.`);

        // Find rising pages in GA4
        const ga4RisingPages = [];
        for (const [pagePath, dataB] of ga4PeriodB.entries()) {
            // Exclude static files, assets, API routes, or admin paths
            if (pagePath.includes('.') || pagePath.includes('/api/') || pagePath.includes('_next')) continue;
            
            const dataA = ga4PeriodA.get(pagePath) || { activeUsers: 0, pageViews: 0 };
            
            // Logic: Low traffic earlier (viewsA < 150), rising now (viewsB >= 150), and views have increased significantly
            const viewsA = dataA.pageViews;
            const viewsB = dataB.pageViews;
            const usersA = dataA.activeUsers;
            const usersB = dataB.activeUsers;
            
            const diffViews = viewsB - viewsA;
            const pctGrowth = viewsA > 0 ? (diffViews / viewsA) * 100 : 9999; // 9999% for new pages

            if (viewsA < 200 && viewsB >= 100 && (viewsB > viewsA * 1.5 || viewsA === 0)) {
                ga4RisingPages.push({
                    pagePath,
                    viewsA,
                    viewsB,
                    usersA,
                    usersB,
                    diffViews,
                    pctGrowth
                });
            }
        }

        // Sort by highest absolute page view growth
        ga4RisingPages.sort((a, b) => b.diffViews - a.diffViews);

        console.log(`\nFound ${ga4RisingPages.length} rising pages in GA4 (views A < 200, views B >= 100, growth > 50%).`);
        console.log('\n🔍 Fetching GSC Search Queries for these GA4 Rising Pages...\n');

        // Let's get the date range for GSC
        const today = new Date();
        const endB = new Date(today);
        endB.setDate(today.getDate() - 1);
        const startB = new Date(today);
        startB.setDate(today.getDate() - 30);

        const endA = new Date(startB);
        endA.setDate(startB.getDate() - 1);
        const startA = new Date(endA);
        startA.setDate(endA.getDate() - 30);

        const formatDate = (d) => d.toISOString().split('T')[0];
        const gscStartA = formatDate(startA);
        const gscEndA = formatDate(endA);
        const gscStartB = formatDate(startB);
        const gscEndB = formatDate(endB);

        const finalResults = [];

        // For the top 15 GA4 rising pages, get search queries
        for (const risingPage of ga4RisingPages.slice(0, 15)) {
            const absoluteUrl = `https://www.indiascholarships.in${risingPage.pagePath}`;
            console.log(`Analyzing GSC queries for: ${risingPage.pagePath} (GA4 Views: ${risingPage.viewsA} ➡️ ${risingPage.viewsB})`);
            
            try {
                // Query GSC for Period A and B for this specific page
                const gscA = await searchconsole.searchanalytics.query({
                    siteUrl,
                    requestBody: {
                        startDate: gscStartA,
                        endDate: gscEndA,
                        dimensions: ['query'],
                        dimensionFilterGroups: [{
                            filters: [{
                                dimension: 'page',
                                operator: 'equals',
                                expression: absoluteUrl
                            }]
                        }],
                        rowLimit: 50
                    }
                });

                const gscB = await searchconsole.searchanalytics.query({
                    siteUrl,
                    requestBody: {
                        startDate: gscStartB,
                        endDate: gscEndB,
                        dimensions: ['query'],
                        dimensionFilterGroups: [{
                            filters: [{
                                dimension: 'page',
                                operator: 'equals',
                                expression: absoluteUrl
                            }]
                        }],
                        rowLimit: 50
                    }
                });

                const queriesA = gscA.data.rows || [];
                const queriesB = gscB.data.rows || [];

                const queryMap = new Map();
                for (const q of queriesA) {
                    const queryStr = q.keys[0];
                    queryMap.set(queryStr, {
                        query: queryStr,
                        clicksA: q.clicks,
                        impressionsA: q.impressions,
                        positionA: q.position,
                        clicksB: 0,
                        impressionsB: 0,
                        positionB: 0
                    });
                }

                for (const q of queriesB) {
                    const queryStr = q.keys[0];
                    if (queryMap.has(queryStr)) {
                        const existing = queryMap.get(queryStr);
                        existing.clicksB = q.clicks;
                        existing.impressionsB = q.impressions;
                        existing.positionB = q.position;
                    } else {
                        queryMap.set(queryStr, {
                            query: queryStr,
                            clicksA: 0,
                            impressionsA: 0,
                            positionA: 0,
                            clicksB: q.clicks,
                            impressionsB: q.impressions,
                            positionB: q.position
                        });
                    }
                }

                const queriesWithGrowth = Array.from(queryMap.values()).map(q => {
                    return {
                        query: q.query,
                        clicksA: q.clicksA,
                        clicksB: q.clicksB,
                        clickDiff: q.clicksB - q.clicksA,
                        impressionsA: q.impressionsA,
                        impressionsB: q.impressionsB,
                        impressionDiff: q.impressionsB - q.impressionsA,
                        positionA: q.positionA,
                        positionB: q.positionB
                    };
                }).sort((a, b) => b.impressionDiff - a.impressionDiff);

                finalResults.push({
                    pagePath: risingPage.pagePath,
                    viewsA: risingPage.viewsA,
                    viewsB: risingPage.viewsB,
                    diffViews: risingPage.diffViews,
                    pctGrowth: risingPage.pctGrowth,
                    topQueries: queriesWithGrowth.slice(0, 5)
                });

            } catch (err) {
                console.error(`❌ GSC query error for page ${risingPage.pagePath}:`, err.message);
            }
        }

        // Save detailed output
        const outPath = path.join(__dirname, '..', 'data', 'ga4-rising-queries-report.json');
        fs.writeFileSync(outPath, JSON.stringify(finalResults, null, 2));
        console.log(`\n💾 GA4-linked rising queries saved to ${outPath}`);

        // Output summary table
        console.log('\n--- 📊 GA4 RISING PAGES & GSC QUERIES SUMMARY ---');
        finalResults.forEach((p, idx) => {
            console.log(`\n#${idx + 1}. Page: ${p.pagePath}`);
            console.log(`   GA4 Views: ${p.viewsA} ➡️ ${p.viewsB} (Growth: +${p.diffViews} views, ${p.pctGrowth.toFixed(1)}%)`);
            console.log(`   Top GSC Keywords Driving Demand:`);
            p.topQueries.forEach(q => {
                console.log(`     - "${q.query}": Clicks: ${q.clicksA} ➡️ ${q.clicksB} | Imps: ${q.impressionsA} ➡️ ${q.impressionsB} | Position: ${q.positionA ? q.positionA.toFixed(1) : 'N/A'} ➡️ ${q.positionB ? q.positionB.toFixed(1) : 'N/A'}`);
            });
        });

    } catch (e) {
        console.error('Error conducting GA4-GSC comparison:', e);
    }
}

main();
