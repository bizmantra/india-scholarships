/**
 * Maps high-opportunity Google Search queries to their actual landing pages.
 *
 * Output: data/query-ownership-audit-YYYY-MM-DD.{csv,md}
 * Required: GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_CLIENT_EMAIL in .env.local
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SITE_URL = 'sc-domain:indiascholarships.in';
const APP_URL = 'https://www.indiascholarships.in';
const DAYS = 90;
const TOP_QUERY_COUNT = 250;

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function dateRange() {
  const end = new Date();
  end.setDate(end.getDate() - 2); // Search Console data is commonly delayed.
  const start = new Date(end);
  start.setDate(start.getDate() - DAYS);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function scoreOpportunity(row) {
  const ctrGap = Math.max(0, 0.08 - row.ctr);
  const rankWeight = Math.max(0.25, 1 - Math.abs(row.position - 5) / 20);
  return row.impressions * ctrGap * rankWeight;
}

function intent(query) {
  const q = query.toLowerCase();
  if (/status|track|payment|pending|rejected|not received/.test(q)) return 'status/troubleshooting';
  if (/login|register|apply|application|online form/.test(q)) return 'apply/login';
  if (/last date|deadline|date|renewal/.test(q)) return 'deadline/renewal';
  if (/document|certificate|income|aadhaar|bank|pfms/.test(q)) return 'documents/eligibility';
  if (/eligibility|eligible|criteria|amount|benefit/.test(q)) return 'details/eligibility';
  return 'entity lookup';
}

function routeType(url) {
  const route = url.replace(APP_URL, '');
  if (route.startsWith('/articles/')) return 'article';
  if (route.startsWith('/guides/')) return 'portal guide';
  if (route.startsWith('/scholarships-in/')) return 'state hub';
  if (route.startsWith('/scholarships/')) return route.split('/').length > 3 ? 'scholarship subpage' : 'scholarship detail';
  return 'other';
}

function actionFor(queryIntent, topPage, split) {
  const type = routeType(topPage);
  if (split) return 'Consolidate: choose one primary owner, strengthen internal links, and differentiate or canonicalise competing pages.';
  if (queryIntent === 'status/troubleshooting' && !['portal guide', 'article', 'scholarship subpage'].includes(type)) return 'Create/upgrade a status-check or troubleshooting owner page and link it prominently from the current ranking page.';
  if (queryIntent === 'apply/login' && !['portal guide', 'article', 'scholarship subpage'].includes(type)) return 'Create/upgrade an apply or login guide; retain the scholarship detail page for entity lookup intent.';
  if (queryIntent === 'deadline/renewal' && type === 'scholarship detail') return 'Strengthen the dedicated last-date or renewal subpage, with verified current-cycle dates and a clear link from the detail page.';
  if (queryIntent === 'documents/eligibility' && type === 'scholarship detail') return 'Strengthen the dedicated eligibility/documents subpage and use the detail page as the cluster hub.';
  if (type === 'article' && queryIntent === 'entity lookup') return 'Check cannibalisation: the scholarship detail page should normally own direct entity queries; refocus the article on a procedural angle.';
  return 'Improve the existing owner: refresh current-cycle facts, title/meta, answer-first copy, and relevant internal links.';
}

async function main() {
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  if (!key || !email) throw new Error('Missing Google Search Console credentials in .env.local.');

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const gsc = google.searchconsole({ version: 'v1', auth });
  const { startDate, endDate } = dateRange();

  console.log(`Fetching high-opportunity queries for ${startDate} to ${endDate}...`);
  const response = await gsc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 1000 },
  });

  const queries = (response.data.rows || [])
    .map((row) => ({
      query: row.keys[0], clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position,
    }))
    .filter((row) => row.impressions >= 500 && row.position >= 2 && row.position <= 20)
    .map((row) => ({ ...row, opportunity: scoreOpportunity(row) }))
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, TOP_QUERY_COUNT);

  const findings = [];
  for (const [index, query] of queries.entries()) {
    console.log(`Mapping ${index + 1}/${queries.length}: ${query.query}`);
    const pageResponse = await gsc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 25,
        dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'equals', expression: query.query }] }],
      },
    });
    const pages = (pageResponse.data.rows || [])
      .map((row) => ({ url: row.keys[0], clicks: row.clicks, impressions: row.impressions, position: row.position }))
      .sort((a, b) => b.impressions - a.impressions);
    const top = pages[0] || { url: 'No page returned', clicks: 0, impressions: 0, position: 0 };
    const share = query.impressions ? top.impressions / query.impressions : 0;
    const meaningfulPages = pages.filter((page) => page.impressions >= Math.max(50, top.impressions * 0.2));
    const split = meaningfulPages.length >= 2 || share < 0.75;
    const queryIntent = intent(query.query);
    findings.push({
      ...query,
      intent: queryIntent,
      topPage: top.url,
      topPageType: routeType(top.url),
      topPageShare: share,
      pagesReturned: pages.length,
      meaningfulPages: meaningfulPages.length,
      secondaryPages: meaningfulPages.slice(1, 4).map((page) => `${page.url.replace(APP_URL, '')} (${page.impressions})`).join(' | '),
      ownership: split ? 'Split / unclear' : 'Clear owner',
      action: actionFor(queryIntent, top.url, split),
    });
  }

  const stamp = endDate;
  const dataDir = path.join(__dirname, '..', 'data');
  const csvPath = path.join(dataDir, `query-ownership-audit-${stamp}.csv`);
  const mdPath = path.join(dataDir, `query-ownership-audit-${stamp}.md`);
  const headers = ['Priority', 'Query', 'Intent', 'Clicks', 'Impressions', 'CTR', 'Position', 'Opportunity score', 'Owner', 'Owner type', 'Owner share', 'Ownership', 'Meaningful pages', 'Secondary pages', 'Recommended action'];
  const csvLines = [headers.map(csv).join(',')];
  findings.forEach((item, index) => csvLines.push([
    index + 1, item.query, item.intent, item.clicks, item.impressions, (item.ctr * 100).toFixed(2), item.position.toFixed(2),
    item.opportunity.toFixed(0), item.topPage, item.topPageType, (item.topPageShare * 100).toFixed(1), item.ownership,
    item.meaningfulPages, item.secondaryPages, item.action,
  ].map(csv).join(',')));
  fs.writeFileSync(csvPath, `${csvLines.join('\n')}\n`);

  const splitCount = findings.filter((item) => item.ownership !== 'Clear owner').length;
  const markdown = [
    '# Query-to-Landing-Page Ownership Audit',
    '',
    `Search Console period: **${startDate} to ${endDate}** (last ${DAYS} complete days).`,
    '',
    `Analysed **${findings.length}** high-opportunity queries. **${splitCount}** have unclear or split landing-page ownership.`,
    '',
    '## Priority Actions',
    '',
    ...findings.slice(0, 20).map((item, index) => `${index + 1}. **${item.query}** — ${item.ownership}; owner: ${item.topPage.replace(APP_URL, '')} (${(item.topPageShare * 100).toFixed(0)}% of query impressions). ${item.action}`),
    '',
    '## Full Audit',
    '',
    '| Query | Intent | Owner | Share | Ownership | Action |',
    '|---|---|---|---:|---|---|',
    ...findings.map((item) => `| ${item.query.replaceAll('|', '\\|')} | ${item.intent} | ${item.topPage.replace(APP_URL, '').replaceAll('|', '\\|')} | ${(item.topPageShare * 100).toFixed(0)}% | ${item.ownership} | ${item.action.replaceAll('|', '\\|')} |`),
    '',
  ].join('\n');
  fs.writeFileSync(mdPath, markdown);

  console.log(`Analysed ${findings.length} queries from ${startDate} to ${endDate}.`);
  console.log(`Flagged ${splitCount} queries with unclear/split ownership.`);
  console.log(`CSV: ${csvPath}`);
  console.log(`Report: ${mdPath}`);
}

main().catch((error) => {
  console.error(`Ownership audit failed: ${error.message}`);
  process.exitCode = 1;
});
