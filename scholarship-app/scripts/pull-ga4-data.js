/**
 * Pulls GA4 traffic data (sessions, engaged sessions, conversions) for competing URLs
 * flagged as "Split / unclear" in the GSC audit.
 *
 * Output: data/query-ownership-ga4-traffic.md and data/query-ownership-ga4-traffic.csv
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

async function main() {
  const auditPath = path.join(__dirname, '..', 'data', 'query-ownership-audit-2026-07-20.csv');
  if (!fs.existsSync(auditPath)) {
    throw new Error(`Audit file not found at: ${auditPath}`);
  }

  const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

  if (!email || !privateKey || !propertyId) {
    throw new Error('Missing GA4 credentials or Property ID in .env.local.');
  }

  console.log('Parsing Split/unclear URLs from 2026-07-20 audit...');
  const fileContent = fs.readFileSync(auditPath, 'utf8');
  const lines = fileContent.split('\n').filter(Boolean);
  
  // Extract URLs from split/unclear rows
  const splitUrls = new Set();
  const queriesMapped = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parser for headers: Priority, Query, Intent, Clicks, Impressions, CTR, Position, Opportunity score, Owner, Owner type, Owner share, Ownership, Meaningful pages, Secondary pages, Recommended action
    const row = parseCsvLine(lines[i]);
    if (row[11] === 'Split / unclear') {
      const owner = row[8];
      const secondary = row[13];
      const query = row[1];

      const urlList = [];

      if (owner && owner.startsWith('http')) {
        const ownerPath = new URL(owner).pathname;
        splitUrls.add(ownerPath);
        urlList.push(ownerPath);
      }

      if (secondary) {
        // secondary looks like: "/scholarships/path (123) | /scholarships/path2 (456)"
        const parts = secondary.split('|').map(p => p.trim());
        for (const part of parts) {
          const match = part.match(/^(\/[^\s(]+)/);
          if (match) {
            splitUrls.add(match[1]);
            urlList.push(match[1]);
          }
        }
      }

      queriesMapped.push({ query, owner, urlList });
    }
  }

  const targetUrls = Array.from(splitUrls);
  console.log(`Found ${targetUrls.length} unique competing URLs to query in GA4.`);

  console.log('Initializing GA4 client...');
  const auth = new google.auth.JWT({
    email,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const ga4 = google.analyticsdata({ version: 'v1beta', auth });

  console.log('Querying GA4 properties.runReport...');
  const response = await ga4.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '2026-04-21', endDate: '2026-07-20' }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'conversions' }
      ],
      limit: '10000',
    },
  });

  const gaData = {};
  const rows = response.data.rows || [];
  console.log(`Received ${rows.length} landing pages from GA4.`);

  // Parse GA4 rows into mapping. Note: landingPage in GA4 might have query parameters or missing leading slashes.
  for (const row of rows) {
    let landingPage = row.dimensionValues[0].value;
    // Normalize landingPage to have a leading slash and no domain or query params (if present)
    if (!landingPage.startsWith('/')) {
      landingPage = '/' + landingPage;
    }
    const pathOnly = landingPage.split('?')[0].replace(/\/$/, ''); // Remove query params and trailing slash

    const sessions = parseInt(row.metricValues[0].value, 10) || 0;
    const engagedSessions = parseInt(row.metricValues[1].value, 10) || 0;
    const conversions = parseFloat(row.metricValues[2].value) || 0;

    const key = pathOnly || '/';
    if (!gaData[key]) {
      gaData[key] = { sessions: 0, engagedSessions: 0, conversions: 0 };
    }
    gaData[key].sessions += sessions;
    gaData[key].engagedSessions += engagedSessions;
    gaData[key].conversions += conversions;
  }

  // Generate Report
  console.log('Generating traffic report...');
  const reportData = [];
  for (const item of queriesMapped) {
    const pagesInfo = item.urlList.map(url => {
      const normUrl = url.replace(/\/$/, ''); // Normalize trailing slash for mapping
      const stats = gaData[normUrl] || gaData[normUrl + '/'] || { sessions: 0, engagedSessions: 0, conversions: 0 };
      return {
        url,
        sessions: stats.sessions,
        engagedSessions: stats.engagedSessions,
        conversions: stats.conversions
      };
    });

    reportData.push({
      query: item.query,
      pages: pagesInfo
    });
  }

  // Save CSV
  const csvHeaders = ['Query', 'URL', 'Sessions', 'Engaged Sessions', 'Conversions'];
  const csvLines = [csvHeaders.map(csv).join(',')];

  reportData.forEach(qItem => {
    qItem.pages.forEach(p => {
      csvLines.push([qItem.query, p.url, p.sessions, p.engagedSessions, p.conversions].map(csv).join(','));
    });
  });

  const outCsvPath = path.join(__dirname, '..', 'data', 'query-ownership-ga4-traffic.csv');
  fs.writeFileSync(outCsvPath, csvLines.join('\n') + '\n');
  console.log(`Saved GA4 report to CSV: ${outCsvPath}`);

  // Save MD
  const mdLines = [
    '# GA4 Traffic Data for Competing (Split/Unclear) Query Landing Pages',
    '',
    'Date range: **2026-04-21 to 2026-07-20** (90 days)',
    '',
    '| Query | Page URL | Sessions | Engaged Sessions | Conversions |',
    '|---|---|---:|---:|---:|',
  ];

  reportData.forEach(qItem => {
    qItem.pages.forEach((p, idx) => {
      // Bold the query only on the first row for that query for clean visual presentation
      const queryCol = idx === 0 ? `**${qItem.query}**` : '';
      mdLines.push(`| ${queryCol} | ${p.url} | ${p.sessions} | ${p.engagedSessions} | ${p.conversions} |`);
    });
  });

  const outMdPath = path.join(__dirname, '..', 'data', 'query-ownership-ga4-traffic.md');
  fs.writeFileSync(outMdPath, mdLines.join('\n') + '\n');
  console.log(`Saved GA4 report to Markdown: ${outMdPath}`);
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

main().catch(error => {
  console.error('GA4 traffic pull failed:', error);
  process.exitCode = 1;
});
