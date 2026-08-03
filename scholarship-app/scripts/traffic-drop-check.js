/**
 * Ad-hoc diagnostic: checks GA4 + GSC trend for a traffic drop, and checks
 * indexing/traffic status for pages published in the last N days.
 *
 * Usage: node scripts/traffic-drop-check.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';
const HOST = 'https://www.indiascholarships.in';

if (!email || !privateKey || !propertyId) {
  console.error('Missing GA4/GSC credentials or Property ID in .env.local.');
  process.exit(1);
}

const auth = new google.auth.JWT({
  email,
  key: privateKey.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ],
});

const ga4 = google.analyticsdata({ version: 'v1beta', auth });
const webmasters = google.webmasters({ version: 'v3', auth });
const searchconsole = google.searchconsole({ version: 'v1', auth });

const fmt = (d) => d.toISOString().split('T')[0];
const today = new Date();
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

async function ga4DailyTrend(days) {
  const res = await ga4.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: fmt(daysAgo(days)), endDate: fmt(daysAgo(1)) }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    },
  });
  return (res.data.rows || []).map(r => ({
    date: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value, 10) || 0,
    users: parseInt(r.metricValues[1].value, 10) || 0,
  }));
}

async function gscDailyTrend(days) {
  const res = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(daysAgo(days)),
      endDate: fmt(daysAgo(3)), // GSC has ~2-3 day data lag
      dimensions: ['date'],
      rowLimit: 1000,
    },
  });
  return (res.data.rows || []).map(r => ({
    date: r.keys[0],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));
}

async function gscPageStats(pageUrl, days) {
  const res = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(daysAgo(days)),
      endDate: fmt(daysAgo(1)),
      dimensions: ['page'],
      dimensionFilterGroups: [{
        filters: [{ dimension: 'page', operator: 'equals', expression: pageUrl }],
      }],
      rowLimit: 10,
    },
  });
  const row = (res.data.rows || [])[0];
  return row ? { clicks: row.clicks || 0, impressions: row.impressions || 0, position: row.position || 0 } : { clicks: 0, impressions: 0, position: 0 };
}

async function ga4PageSessions(pagePath, days) {
  const res = await ga4.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: fmt(daysAgo(days)), endDate: fmt(daysAgo(1)) }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: {
        filter: { fieldName: 'landingPage', stringFilter: { matchType: 'EXACT', value: pagePath } },
      },
      limit: '10',
    },
  });
  const row = (res.data.rows || [])[0];
  return row ? parseInt(row.metricValues[0].value, 10) || 0 : 0;
}

async function urlInspect(pageUrl) {
  try {
    const res = await searchconsole.urlInspection.index.inspect({
      requestBody: { inspectionUrl: pageUrl, siteUrl },
    });
    const result = res.data.inspectionResult?.indexStatusResult;
    return {
      verdict: result?.verdict || 'UNKNOWN',
      coverageState: result?.coverageState || 'unknown',
      lastCrawl: result?.lastCrawlTime || 'never',
    };
  } catch (err) {
    return { verdict: 'ERROR', coverageState: err.message, lastCrawl: 'n/a' };
  }
}

function getRecentlyAddedSlugs(days) {
  const repoRoot = execSync('git rev-parse --show-toplevel', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
  const out = execSync(
    `git log --since="${days} days ago" --name-only --diff-filter=A --pretty=format:"" -- content/articles content/news content/pillars`,
    { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
  );
  let files = out.split('\n').filter(Boolean);
  if (files.length === 0) {
    // repo root may be a parent directory (paths prefixed with scholarship-app/)
    const out2 = execSync(
      `git log --since="${days} days ago" --name-only --diff-filter=A --pretty=format:"" -- scholarship-app/content/articles scholarship-app/content/news scholarship-app/content/pillars`,
      { cwd: repoRoot, encoding: 'utf8' }
    );
    files = out2.split('\n').filter(Boolean).map(f => f.replace(/^scholarship-app\//, ''));
  }
  const pages = [];
  for (const f of files) {
    const m = f.match(/^content\/(articles|news|pillars)\/([^/]+)\.md$/);
    if (m) {
      const [, type, slug] = m;
      const urlType = type === 'articles' ? 'articles' : type === 'news' ? 'news' : 'pillars';
      pages.push({ slug, type: urlType, path: `/${urlType}/${slug}` });
    }
  }
  // de-dupe
  const seen = new Set();
  return pages.filter(p => (seen.has(p.path) ? false : (seen.add(p.path), true)));
}

async function main() {
  console.log('=== GA4 daily sessions trend (last 30 days) ===');
  const gaTrend = await ga4DailyTrend(30);
  gaTrend.forEach(d => console.log(`${d.date}  sessions=${d.sessions}  users=${d.users}`));

  console.log('\n=== GSC daily clicks/impressions trend (last 30 days, ~3 day lag) ===');
  const gscTrend = await gscDailyTrend(33);
  gscTrend.forEach(d => console.log(`${d.date}  clicks=${d.clicks}  impressions=${d.impressions}  ctr=${(d.ctr*100).toFixed(2)}%  pos=${d.position.toFixed(1)}`));

  console.log('\n=== Pages published in the last 10 days ===');
  const recentPages = getRecentlyAddedSlugs(10);
  console.log(`Found ${recentPages.length} recently added content pages.`);

  const results = [];
  for (const p of recentPages) {
    const fullUrl = `${HOST}${p.path}`;
    const [gsc, gaSessions, inspection] = await Promise.all([
      gscPageStats(fullUrl, 16),
      ga4PageSessions(p.path, 16),
      urlInspect(fullUrl),
    ]);
    results.push({ ...p, url: fullUrl, gsc, gaSessions, inspection });
    console.log(`${p.path}  |  GSC clicks=${gsc.clicks} impr=${gsc.impressions}  |  GA4 sessions=${gaSessions}  |  index=${inspection.verdict}/${inspection.coverageState}`);
  }

  const outPath = path.join(__dirname, '..', 'data', 'traffic-drop-check.json');
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), gaTrend, gscTrend, recentPages: results }, null, 2));
  console.log(`\nSaved full results to ${outPath}`);
}

main().catch(err => {
  console.error('traffic-drop-check failed:', err);
  process.exitCode = 1;
});
