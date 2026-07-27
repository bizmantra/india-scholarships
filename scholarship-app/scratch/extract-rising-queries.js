const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { google } = require('googleapis');

async function main() {
    console.log('🚀 Initiating GSC & GA4 Rising Queries Analysis...');

    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
        console.error('❌ Error: Missing GSC / Sheets API credentials in .env.local');
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

    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const siteUrl = 'sc-domain:indiascholarships.in';

    // Calculate dates
    // Period B (recent 30 days): e.g. 2026-06-24 to 2026-07-23
    // Period A (previous 30 days): e.g. 2026-05-25 to 2026-06-23
    const today = new Date();
    
    const endB = new Date(today);
    endB.setDate(today.getDate() - 1); // Yesterday
    const startB = new Date(today);
    startB.setDate(today.getDate() - 30);

    const endA = new Date(startB);
    endA.setDate(startB.getDate() - 1);
    const startA = new Date(endA);
    startA.setDate(endA.getDate() - 30);

    const formatDate = (d) => d.toISOString().split('T')[0];

    const dateRangeB = { start: formatDate(startB), end: formatDate(endB) };
    const dateRangeA = { start: formatDate(startA), end: formatDate(endA) };

    console.log(`📅 Period A (Earlier): ${dateRangeA.start} to ${dateRangeA.end}`);
    console.log(`📅 Period B (Recent):  ${dateRangeB.start} to ${dateRangeB.end}\n`);

    // Fetch page & query data for both periods
    async function fetchGSCData(startDate, endDate) {
        let allRows = [];
        let startRow = 0;
        const rowLimit = 5000;
        
        while (true) {
            console.log(`Fetching GSC rows from ${startRow} for ${startDate} to ${endDate}...`);
            const res = await searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['page', 'query'],
                    rowLimit,
                    startRow
                }
            });
            const rows = res.data.rows || [];
            allRows.push(...rows);
            if (rows.length < rowLimit || allRows.length >= 15000) break;
            startRow += rows.length;
        }
        return allRows;
    }

    try {
        console.log('📊 Fetching Period A (Earlier) performance...');
        const rowsA = await fetchGSCData(dateRangeA.start, dateRangeA.end);
        console.log(`✅ Fetched ${rowsA.length} page-query rows for Period A.`);

        console.log('\n📊 Fetching Period B (Recent) performance...');
        const rowsB = await fetchGSCData(dateRangeB.start, dateRangeB.end);
        console.log(`✅ Fetched ${rowsB.length} page-query rows for Period B.`);

        // Map and compare
        // Map key: "page|||query" -> data
        const comparisonMap = new Map();

        // Process Period A
        for (const row of rowsA) {
            const page = row.keys[0];
            const query = row.keys[1];
            const key = `${page}|||${query}`;
            comparisonMap.set(key, {
                page,
                query,
                clicksA: row.clicks,
                impressionsA: row.impressions,
                positionA: row.position,
                clicksB: 0,
                impressionsB: 0,
                positionB: 0
            });
        }

        // Process Period B
        for (const row of rowsB) {
            const page = row.keys[0];
            const query = row.keys[1];
            const key = `${page}|||${query}`;
            if (comparisonMap.has(key)) {
                const existing = comparisonMap.get(key);
                existing.clicksB = row.clicks;
                existing.impressionsB = row.impressions;
                existing.positionB = row.position;
            } else {
                comparisonMap.set(key, {
                    page,
                    query,
                    clicksA: 0,
                    impressionsA: 0,
                    positionA: 0,
                    clicksB: row.clicks,
                    impressionsB: row.impressions,
                    positionB: row.position
                });
            }
        }

        // Roll up by page
        const pageData = new Map();
        for (const [key, item] of comparisonMap.entries()) {
            if (!pageData.has(item.page)) {
                pageData.set(item.page, {
                    page: item.page,
                    clicksA: 0,
                    impressionsA: 0,
                    clicksB: 0,
                    impressionsB: 0,
                    queries: []
                });
            }
            const pObj = pageData.get(item.page);
            pObj.clicksA += item.clicksA;
            pObj.impressionsA += item.impressionsA;
            pObj.clicksB += item.clicksB;
            pObj.impressionsB += item.impressionsB;
            pObj.queries.push(item);
        }

        // Find rising pages:
        // - "not getting much traffic earlier": e.g. clicksA < 50
        // - "rising traffic/visibility now": clicksB >= 40 OR impressionsB >= 2000
        // - and clicksB > clicksA or impressionsB > impressionsA * 1.5
        const risingPages = [];
        for (const [page, data] of pageData.entries()) {
            const pathUrl = page.replace('https://www.indiascholarships.in', '');
            
            const isLowTrafficEarlier = data.clicksA < 50;
            const isRisingNow = data.clicksB >= 40 || (data.impressionsB >= 2000 && data.clicksB > data.clicksA);
            const isSignificantGrowth = data.clicksB > data.clicksA || data.impressionsB > data.impressionsA * 1.2;

            if (isLowTrafficEarlier && isRisingNow && isSignificantGrowth) {
                // Find top rising queries for this page
                // Sort queries by growth in impressions or clicks
                const queriesWithGrowth = data.queries.map(q => {
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
                }).sort((a, b) => b.impressionDiff - a.impressionDiff); // sort by rising impressions to catch demand shifts early

                risingPages.push({
                    page: pathUrl,
                    fullPage: page,
                    clicksA: data.clicksA,
                    clicksB: data.clicksB,
                    impressionsA: data.impressionsA,
                    impressionsB: data.impressionsB,
                    clickDiff: data.clicksB - data.clicksA,
                    impressionDiff: data.impressionsB - data.impressionsA,
                    topQueries: queriesWithGrowth.slice(0, 5)
                });
            }
        }

        // Sort rising pages by highest impression growth or click growth
        risingPages.sort((a, b) => b.impressionDiff - a.impressionDiff);

        console.log(`\nFound ${risingPages.length} pages that match the rising queries/low historical traffic criteria.`);

        // Print top 10
        console.log('\n--- TOP 10 RISING PAGES AND THEIR RISING QUERIES ---');
        risingPages.slice(0, 10).forEach((p, idx) => {
            console.log(`\n#${idx + 1}. Page: ${p.page}`);
            console.log(`   Clicks: ${p.clicksA} ➡️ ${p.clicksB} (Diff: +${p.clickDiff})`);
            console.log(`   Impressions: ${p.impressionsA} ➡️ ${p.impressionsB} (Diff: +${p.impressionDiff})`);
            console.log(`   Rising Queries:`);
            p.topQueries.forEach(q => {
                console.log(`     - "${q.query}": Clicks: ${q.clicksA} ➡️ ${q.clicksB} | Imps: ${q.impressionsA} ➡️ ${q.impressionsB} | Pos: ${q.positionA ? q.positionA.toFixed(1) : 'N/A'} ➡️ ${q.positionB ? q.positionB.toFixed(1) : 'N/A'}`);
            });
        });

        // Write output json
        const outPath = path.join(__dirname, '..', 'data', 'rising-queries-report.json');
        fs.writeFileSync(outPath, JSON.stringify(risingPages, null, 2));
        console.log(`\n💾 Detailed results saved to ${outPath}`);

    } catch (e) {
        console.error('Error during analysis:', e);
    }
}

main();
