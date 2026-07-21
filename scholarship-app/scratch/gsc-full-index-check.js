require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function runFullGSCIndexCheck() {
    console.log('=== GOOGLE SEARCH CONSOLE LIVE API AUDIT ===\n');

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

    // 1. Sitemaps Status
    console.log('1. Checking Sitemaps in GSC...');
    const sitemapsRes = await searchconsole.sitemaps.list({ siteUrl });
    const sitemapsList = sitemapsRes.data.sitemap || [];
    console.log(`Found ${sitemapsList.length} submitted sitemap(s):`);
    sitemapsList.forEach(s => {
        console.log(`- Path: ${s.path}`);
        console.log(`  Submitted: ${s.contents?.[0]?.submitted || 'N/A'}`);
        console.log(`  Last Downloaded: ${s.lastDownloaded}`);
        console.log(`  Errors: ${s.errors}, Warnings: ${s.warnings}`);
    });

    // 2. Search Analytics - 90 Days & 16 Months distinct URLs
    console.log('\n2. Querying Search Analytics for distinct URLs in GSC index...');
    
    async function getDistinctPages(startDate, endDate) {
        let pages = new Set();
        let startRow = 0;
        const rowLimit = 2500;
        while (true) {
            const res = await searchconsole.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['page'],
                    rowLimit,
                    startRow
                }
            });
            const rows = res.data.rows || [];
            rows.forEach(r => pages.add(r.keys[0]));
            if (rows.length < rowLimit) break;
            startRow += rows.length;
        }
        return Array.from(pages);
    }

    const pages30d = await getDistinctPages('2026-06-21', '2026-07-20');
    console.log(`- Pages with impressions in last 30 days: ${pages30d.length}`);

    const pages16m = await getDistinctPages('2025-03-01', '2026-07-20');
    console.log(`- Total distinct pages recorded in GSC index (last 16 months): ${pages16m.length}`);

    const outputDir = path.join(__dirname, '..', 'data');
    fs.writeFileSync(path.join(outputDir, 'gsc-active-urls.json'), JSON.stringify(pages16m, null, 2));

    // 3. Inspect a sample of URLs across different site sections using URL Inspection API
    console.log('\n3. Sampling URLs with GSC URL Inspection API...');
    
    const db = require('better-sqlite3')(path.join(__dirname, '..', 'data', 'scholarships.db'));
    const scholarships = db.prepare("SELECT slug FROM scholarships").all();
    const states = db.prepare("SELECT DISTINCT state FROM scholarships WHERE state IS NOT NULL AND state != ''").all();

    const subpageTypes = ['eligibility', 'income-limit', 'documents-required', 'last-date', 'selection-process', 'apply-online', 'renewal-process'];

    let urlSample = [];

    // Core pages
    urlSample.push('https://www.indiascholarships.in/');
    urlSample.push('https://www.indiascholarships.in/scholarships');
    urlSample.push('https://www.indiascholarships.in/states');
    urlSample.push('https://www.indiascholarships.in/categories');

    // Sample 25 scholarship main pages
    scholarships.slice(0, 25).forEach(s => {
        urlSample.push(`https://www.indiascholarships.in/scholarships/${s.slug}`);
    });

    // Sample 40 scholarship subpages
    scholarships.slice(0, 10).forEach(s => {
        subpageTypes.slice(0, 4).forEach(sub => {
            urlSample.push(`https://www.indiascholarships.in/scholarships/${s.slug}/${sub}`);
        });
    });

    // Sample 15 State hubs & state subpages
    states.slice(0, 10).forEach(st => {
        const stateSlug = st.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        urlSample.push(`https://www.indiascholarships.in/scholarships-in/${stateSlug}`);
        urlSample.push(`https://www.indiascholarships.in/scholarships-in/${stateSlug}/eligibility`);
    });

    // Sample Category routes
    ['girls', 'minority', 'merit-based', 'engineering', 'medical'].forEach(c => {
        urlSample.push(`https://www.indiascholarships.in/category/${c}`);
    });

    console.log(`Inspecting ${urlSample.length} sample URLs via URL Inspection API...`);

    const results = [];
    let indexedCount = 0;
    let notIndexedCount = 0;
    let errorsCount = 0;

    const coverageSummary = {};

    for (let i = 0; i < urlSample.length; i++) {
        const u = urlSample[i];
        try {
            const inspectRes = await searchconsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: u,
                    siteUrl: siteUrl
                }
            });
            const idxResult = inspectRes.data.inspectionResult?.indexStatusResult || {};
            const coverageState = idxResult.coverageState || 'UNKNOWN';
            const verdict = idxResult.verdict || 'UNKNOWN';
            const indexingState = idxResult.indexingState || 'UNKNOWN';
            const pageFetchState = idxResult.pageFetchState || 'UNKNOWN';
            const robotsTxtState = idxResult.robotsTxtState || 'UNKNOWN';
            const canonicalUrl = idxResult.userCanonical || idxResult.googleCanonical;

            if (verdict === 'PASS') indexedCount++;
            else notIndexedCount++;

            coverageSummary[coverageState] = (coverageSummary[coverageState] || 0) + 1;

            results.push({
                url: u,
                verdict,
                coverageState,
                indexingState,
                pageFetchState,
                robotsTxtState,
                canonicalUrl,
                lastCrawlTime: idxResult.lastCrawlTime
            });

            // Small delay to respect rate limit
            await new Promise(r => setTimeout(r, 120));

        } catch (err) {
            console.error(`Error inspecting ${u}:`, err.message);
            errorsCount++;
        }
    }

    console.log('\n=== URL INSPECTION API SAMPLE RESULTS ===');
    console.log(`Total Inspected: ${urlSample.length}`);
    console.log(`Indexed (Verdict PASS): ${indexedCount} (${((indexedCount / urlSample.length) * 100).toFixed(1)}%)`);
    console.log(`Not Indexed (Verdict NEUTRAL/FAIL): ${notIndexedCount} (${((notIndexedCount / urlSample.length) * 100).toFixed(1)}%)`);
    console.log(`Errors: ${errorsCount}`);
    
    console.log('\nCoverage State Breakdown (Sampled URLs):');
    Object.entries(coverageSummary).forEach(([state, count]) => {
        console.log(`- ${state}: ${count} (${((count / urlSample.length) * 100).toFixed(1)}%)`);
    });

    fs.writeFileSync(path.join(outputDir, 'gsc-inspection-sample-results.json'), JSON.stringify(results, null, 2));

    db.close();
}

runFullGSCIndexCheck().catch(console.error);
