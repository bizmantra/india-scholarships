const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');

function getServiceAccountAuth(scopes) {
  const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  return new google.auth.JWT({ email, key: privateKey.replace(/\\n/g, '\n'), scopes });
}
function getOAuth2Auth() {
  const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;
  const c = new google.auth.OAuth2(clientId, clientSecret);
  c.setCredentials({ refresh_token: refreshToken });
  return c;
}

async function main() {
  const out = {};

  // AdSense: this week vs last week, plus top pages
  try {
    const auth = getOAuth2Auth();
    const adsense = google.adsense({ version: 'v2', auth });
    const accountId = process.env.GOOGLE_ADSENSE_ACCOUNT_ID;

    const daily = await adsense.accounts.reports.generate({
      account: `accounts/${accountId}`,
      dateRange: 'LAST_30_DAYS',
      metrics: ['ESTIMATED_EARNINGS', 'CLICKS', 'IMPRESSIONS', 'PAGE_VIEWS', 'IMPRESSIONS_RPM', 'AD_REQUESTS'],
      dimensions: ['DATE'],
    });
    out.adsenseDaily = daily.data;

    const byPage = await adsense.accounts.reports.generate({
      account: `accounts/${accountId}`,
      dateRange: 'LAST_14_DAYS',
      metrics: ['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'IMPRESSIONS', 'IMPRESSIONS_RPM'],
      dimensions: ['PAGE_PATH'],
      orderBy: ['-ESTIMATED_EARNINGS'],
      limit: '20',
    });
    out.adsenseTopPages14d = byPage.data;
  } catch (e) {
    out.adsenseError = e.message;
  }

  // GA4 top pages, this week vs last week
  try {
    const auth = getServiceAccountAuth(['https://www.googleapis.com/auth/analytics.readonly']);
    const ga4 = google.analyticsdata({ version: 'v1beta', auth });
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    const thisWeek = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 25,
      },
    });
    out.ga4TopPagesThisWeek = thisWeek.data;

    const lastWeek = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '14daysAgo', endDate: '8daysAgo' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 25,
      },
    });
    out.ga4TopPagesLastWeek = lastWeek.data;

    const weekTotals = await ga4.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [
          { startDate: '7daysAgo', endDate: 'today', name: 'this_week' },
          { startDate: '14daysAgo', endDate: '8daysAgo', name: 'last_week' },
        ],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'activeUsers' }],
      },
    });
    out.ga4WeekTotals = weekTotals.data;
  } catch (e) {
    out.ga4Error = e.message;
  }

  console.log(JSON.stringify(out, null, 2));
}
main().catch((e) => { console.error('FATAL', e); process.exit(1); });
