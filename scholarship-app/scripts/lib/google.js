/**
 * Google Search Console and Analytics access for agents (service account).
 *
 * Credentials: GOOGLE_SERVICES_CLIENT_EMAIL / GOOGLE_SERVICES_PRIVATE_KEY (GitHub secrets), falling back to the
 * older GOOGLE_SHEETS_* names used on local machines. GSC_SITE_URL defaults to the domain property.
 * GOOGLE_ANALYTICS_PROPERTY_ID is optional: without it, agents use Search Console data only.
 */
const { google } = require('googleapis');

const SITE = process.env.SITE_URL || 'https://www.indiascholarships.in';
const GSC_PROPERTY = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';

function credentials() {
    const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const key = (process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!email || !key) throw new Error('Google service account is not configured (GOOGLE_SERVICES_CLIENT_EMAIL / GOOGLE_SERVICES_PRIVATE_KEY)');
    return { email, key };
}

function client(scopes) {
    const { email, key } = credentials();
    return new google.auth.JWT({ email, key, scopes });
}

const isoDate = d => d.toISOString().slice(0, 10);
const daysAgo = n => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d; };

function searchConsole({ write = false } = {}) {
    const auth = client([write ? 'https://www.googleapis.com/auth/webmasters' : 'https://www.googleapis.com/auth/webmasters.readonly']);
    return google.searchconsole({ version: 'v1', auth });
}

// Search Console totals or per-dimension rows for a date range (dates as YYYY-MM-DD)
async function gscQuery({ startDate, endDate, dimensions = [], rowLimit = 1000, filters }) {
    const res = await searchConsole().searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
            startDate, endDate, dimensions, rowLimit,
            ...(filters ? { dimensionFilterGroups: [{ filters }] } : {}),
        },
    });
    return (res.data.rows || []).map(r => ({
        keys: r.keys || [],
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position || 0,
    }));
}

// Daily sessions from Google Analytics, or null when no property id is configured
async function ga4DailySessions(startDate, endDate) {
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    if (!propertyId) return null;
    const ga = google.analyticsdata({ version: 'v1beta', auth: client(['https://www.googleapis.com/auth/analytics.readonly']) });
    const res = await ga.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
    });
    return (res.data.rows || []).map(r => ({
        date: `${r.dimensionValues[0].value.slice(0, 4)}-${r.dimensionValues[0].value.slice(4, 6)}-${r.dimensionValues[0].value.slice(6, 8)}`,
        sessions: Number(r.metricValues[0].value) || 0,
    }));
}

// Google's own view of one page: indexed or not, and when it was last crawled
async function inspectUrl(url) {
    const res = await searchConsole().urlInspection.index.inspect({ requestBody: { inspectionUrl: url, siteUrl: GSC_PROPERTY } });
    const r = res.data.inspectionResult?.indexStatusResult || {};
    return { verdict: r.verdict || 'UNKNOWN', coverageState: r.coverageState || '', lastCrawlTime: r.lastCrawlTime || null };
}

async function submitSitemap(sitemapUrl = `${SITE}/sitemap.xml`) {
    await searchConsole({ write: true }).sitemaps.submit({ siteUrl: GSC_PROPERTY, feedpath: sitemapUrl });
}

module.exports = { SITE, GSC_PROPERTY, isoDate, daysAgo, gscQuery, ga4DailySessions, inspectUrl, submitSitemap };
