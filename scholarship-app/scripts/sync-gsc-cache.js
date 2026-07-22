const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');
const Database = require('better-sqlite3');

const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

if (!email || !privateKey) {
    console.error('❌ Service Account credentials missing in .env.local');
    process.exit(1);
}

const auth = new google.auth.JWT({
    email,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});

const webmasters = google.webmasters({ version: 'v3', auth });

async function syncGscCache() {
    console.log('📡 Fetching Search Analytics from GSC API...');
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
        console.log(`✅ Fetched ${rows.length} pages from GSC.`);

        const db = new Database(dbPath);
        
        // Let's count how many we actually process
        let inserted = 0;

        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO gsc_traffic_cache (slug, clicks, impressions, ctr, position, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `);

        db.transaction(() => {
            for (const r of rows) {
                const url = r.keys[0]; // e.g., https://www.indiascholarships.in/scholarships/tata-capital-pankh-scholarship
                if (url.includes('/scholarships/')) {
                    // Extract slug: everything after /scholarships/
                    // Handle trailing slashes or subpages if any, but usually we just want the direct slug:
                    // e.g. /scholarships/some-slug or /scholarships/some-slug/apply (we ignore subpages or match main slug)
                    const match = url.match(/\/scholarships\/([^/]+)/);
                    if (match) {
                        const slug = match[1].trim();
                        // Ignore subpages (e.g. status-check, eligibility, etc. which are handled dynamically)
                        const ignoredSubpages = ['status-check', 'documents', 'apply', 'eligibility', 'selection', 'renewal', 'faq', 'status', 'login'];
                        if (ignoredSubpages.includes(slug)) continue;

                        const clicks = r.clicks || 0;
                        const impressions = r.impressions || 0;
                        const ctr = r.ctr || 0.0;
                        const position = r.position || 0.0;

                        insertStmt.run(slug, clicks, impressions, ctr, position);
                        inserted++;
                    }
                }
            }
        })();

        console.log(`💾 GSC Traffic Cache sync complete. Cached ${inserted} scholarship slugs.`);
        db.close();
    } catch (err) {
        console.error('❌ Failed to sync GSC search analytics:', err.message);
        process.exit(1);
    }
}

syncGscCache();
