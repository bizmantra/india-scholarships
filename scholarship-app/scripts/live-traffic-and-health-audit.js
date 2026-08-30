const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const https = require('https');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

function getServiceAccountAuth(scopes) {
  const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  return new google.auth.JWT({ email, key: privateKey, scopes });
}

function fetchUrl(urlStr) {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (IndiaScholarships-HealthCheck)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url: urlStr,
          statusCode: res.statusCode,
          headers: res.headers,
          location: res.headers.location,
          durationMs: Date.now() - start,
          bodyLength: data.length,
          bodySnippet: data.slice(0, 300)
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        url: urlStr,
        error: err.message,
        durationMs: Date.now() - start
      });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({
        url: urlStr,
        error: 'TIMEOUT',
        durationMs: Date.now() - start
      });
    });
  });
}

async function runHealthChecks() {
  console.log('\n========================================');
  console.log('🌐 1. LIVE PRODUCTION SITE HEALTH CHECKS');
  console.log('========================================\n');

  const testUrls = [
    'https://www.indiascholarships.in/',
    'https://www.indiascholarships.in/robots.txt',
    'https://www.indiascholarships.in/sitemap.xml',
    'https://www.indiascholarships.in/scholarships',
    'https://www.indiascholarships.in/scholarships/pm-yashasvi-scholarship',
    'https://www.indiascholarships.in/scholarships/sitaram-jindal-foundation-scholarship',
    'https://www.indiascholarships.in/scholarships/tata-capital-pankh-scholarship',
    'https://www.indiascholarships.in/scholarships/hdfc-bank-parivartan-ecss-scholarship',
    'https://www.indiascholarships.in/scholarships-in/uttar-pradesh',
    'https://www.indiascholarships.in/scholarships-in/karnataka',
    'https://www.indiascholarships.in/guides',
    'https://www.indiascholarships.in/guides/national-scholarship-portal-nsp',
    'https://www.indiascholarships.in/guides/ssp-karnataka',
    'https://www.indiascholarships.in/eligibility-checker',
    // Redirect Tests
    'https://www.indiascholarships.in/scholarships/pm-yashasvi-scholarship/eligibility',
    'https://www.indiascholarships.in/articles/digital-gujarat-scholarship-portal-guide',
    'https://www.indiascholarships.in/pillars/nsp-national-scholarship-portal-guide',
    'https://www.indiascholarships.in/state/uttar-pradesh'
  ];

  for (const u of testUrls) {
    const res = await fetchUrl(u);
    if (res.error) {
      console.log(`❌ FAIL [${res.durationMs}ms] ${u} -> Error: ${res.error}`);
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ OK   [${res.statusCode}] [${res.durationMs}ms] ${u} (${res.bodyLength} bytes)`);
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      console.log(`🔀 REDIR [${res.statusCode}] [${res.durationMs}ms] ${u} -> Location: ${res.location}`);
    } else {
      console.log(`⚠️ WARN [${res.statusCode}] [${res.durationMs}ms] ${u}`);
    }
  }
}

async function runGA4Audit() {
  console.log('\n========================================');
  console.log('📈 2. LIVE GA4 TRAFFIC METRICS (AUGUST 2026)');
  console.log('========================================\n');

  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!propertyId) {
    console.log('Skipping GA4: GOOGLE_ANALYTICS_PROPERTY_ID not found');
    return;
  }

  try {
    const auth = getServiceAccountAuth(['https://www.googleapis.com/auth/analytics.readonly']);
    const ga4 = google.analyticsdata({ version: 'v1beta', auth });

    // 1. Daily Trend: Last 30 Days (Aug 1 to Aug 30)
    console.log('Fetching 30-day daily traffic trend...');
    const dailyReport = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-30' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'activeUsers' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      }
    });

    console.log('\n--- Daily Trend (August 2026) ---');
    console.log('| Date | Sessions | Pageviews | Active Users |');
    console.log('|---|---|---|---|');
    if (dailyReport.data.rows) {
      for (const r of dailyReport.data.rows) {
        const d = r.dimensionValues[0].value;
        const formattedDate = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
        const sess = r.metricValues[0].value;
        const pvs = r.metricValues[1].value;
        const users = r.metricValues[2].value;
        console.log(`| ${formattedDate} | ${sess} | ${pvs} | ${users} |`);
      }
    } else {
      console.log('No rows returned for daily report.');
    }

    // 2. Top 20 Landing Pages in August 2026
    console.log('\nFetching Top 20 Landing Pages in August 2026...');
    const topPagesReport = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-30' }],
        dimensions: [{ name: 'landingPage' }],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'bounceRate' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20
      }
    });

    console.log('\n--- Top 20 Landing Pages (August 1 - 30, 2026) ---');
    console.log('| Landing Page | Sessions | Pageviews | Active Users | Bounce Rate |');
    console.log('|---|---|---|---|---|');
    if (topPagesReport.data.rows) {
      for (const r of topPagesReport.data.rows) {
        const page = r.dimensionValues[0].value;
        const sess = r.metricValues[0].value;
        const pvs = r.metricValues[1].value;
        const users = r.metricValues[2].value;
        const bounce = (parseFloat(r.metricValues[3].value || 0) * 100).toFixed(1) + '%';
        console.log(`| ${page} | ${sess} | ${pvs} | ${users} | ${bounce} |`);
      }
    }

    // 3. Traffic Channels in August
    console.log('\nFetching Traffic Channels in August 2026...');
    const channelReport = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-30' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      }
    });

    console.log('\n--- Traffic Sources (August 2026) ---');
    console.log('| Channel Group | Sessions | Active Users |');
    console.log('|---|---|---|');
    if (channelReport.data.rows) {
      for (const r of channelReport.data.rows) {
        console.log(`| ${r.dimensionValues[0].value} | ${r.metricValues[0].value} | ${r.metricValues[1].value} |`);
      }
    }

    // 4. Comparison: July (July 2 - July 31) vs August (Aug 1 - Aug 30)
    console.log('\nFetching Month-over-Month Comparison (July vs August)...');
    const momReport = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [
          { startDate: '2026-08-01', endDate: '2026-08-30', name: 'august' },
          { startDate: '2026-07-02', endDate: '2026-07-31', name: 'july' }
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'activeUsers' }
        ]
      }
    });

    console.log('\n--- Month-over-Month Totals ---');
    if (momReport.data.rows) {
      for (const r of momReport.data.rows) {
        console.log(`DateRange: ${r.dimensionValues ? r.dimensionValues.map(d=>d.value).join(', ') : 'total'} | Sessions: ${r.metricValues[0].value} | Pageviews: ${r.metricValues[1].value} | Users: ${r.metricValues[2].value}`);
      }
    }

  } catch (err) {
    console.error('GA4 Query Failed:', err.message);
  }
}

async function runAdSenseAudit() {
  console.log('\n========================================');
  console.log('💰 3. LIVE ADSENSE REVENUE METRICS');
  console.log('========================================\n');

  const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;
  const accountId = process.env.GOOGLE_ADSENSE_ACCOUNT_ID;

  if (!clientId || !clientSecret || !refreshToken || !accountId) {
    console.log('Skipping AdSense: Missing OAuth credentials');
    return;
  }

  try {
    const c = new google.auth.OAuth2(clientId, clientSecret);
    c.setCredentials({ refresh_token: refreshToken });
    const adsense = google.adsense({ version: 'v2', auth: c });

    const daily = await adsense.accounts.reports.generate({
      account: `accounts/${accountId}`,
      dateRange: 'LAST_30_DAYS',
      metrics: ['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'IMPRESSIONS', 'CLICKS', 'IMPRESSIONS_RPM'],
      dimensions: ['DATE'],
    });

    console.log('AdSense Last 30 Days:');
    if (daily.data.rows) {
      console.log(`Received ${daily.data.rows.length} daily rows from AdSense.`);
      for (const r of daily.data.rows.slice(-10)) {
        console.log(r.cells.map(c => c.value).join(' | '));
      }
    } else {
      console.log('No AdSense rows returned or empty report.');
    }
  } catch (err) {
    console.error('AdSense Query Failed:', err.message);
  }
}

async function main() {
  await runHealthChecks();
  await runGA4Audit();
  await runAdSenseAudit();
}

main().catch(console.error);
