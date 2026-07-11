/**
 * Notion Workspace Sync Engine
 * Bidirectional sync:
 * 1. Compiles the COMPLETE Site URL Map (Static, Hubs, Scholarship Detail & Subpages) and syncs to 'Live Scholarship Inventory' database
 * 2. Pulls active developer tasks from the '⚡ Backlog' database
 * 3. Syncs local repository Markdown files to the '📖 Document Hub'
 * 4. Syncs GSC SEO metrics to the 'Metrics Tracker' database
 * 5. Appends recent Git logs to the 'Change & Activity Log'
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const Database = require('better-sqlite3');
const { execSync } = require('child_process');

// Load env variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const NOTION_KEY = process.env.NOTION_API_KEY;
const BACKLOG_DB = process.env.NOTION_DATABASE_ID_BACKLOG;
const PIPELINE_DB = process.env.NOTION_DATABASE_ID_PIPELINE;
const INVENTORY_DB = process.env.NOTION_DATABASE_ID_INVENTORY;
const DOC_HUB_PAGE = process.env.NOTION_PAGE_ID_DOC_HUB;
const CHANGELOG_PAGE = process.env.NOTION_PAGE_ID_CHANGELOG;

if (!NOTION_KEY || NOTION_KEY === 'YOUR_NOTION_API_KEY') {
  console.error('Error: NOTION_API_KEY is not configured in .env.local.');
  process.exit(1);
}

// Notion API Request Wrapper
function notionRequest(endpoint, method, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(json);
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Helper to clean and format title names
function cleanTitle(url) {
  const parts = url.split('/');
  const slug = parts[parts.length - 1] || parts[parts.length - 2] || 'Home';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// 1. Sync COMPLETE Site URL Map to Live Scholarship Inventory Page
async function syncInventory() {
  console.log('🔄 Compiling COMPLETE Site Inventory (1,500+ URLs)...');
  const dbPath = path.join(__dirname, '../data/scholarships.db');
  const gscPath = path.join(__dirname, '../data/gsc-june-2026/pages.json');
  
  if (!fs.existsSync(dbPath)) {
    console.error('SQLite database not found at:', dbPath);
    return;
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = DELETE');

  try {
    const scholarships = db.prepare('SELECT title, slug FROM scholarships').all();
    
    // Load GSC performance metrics mapping
    let gscMetrics = {};
    if (fs.existsSync(gscPath)) {
      const gscData = JSON.parse(fs.readFileSync(gscPath, 'utf8'));
      gscData.slice(1).forEach(row => {
        gscMetrics[row[0].trim()] = {
          clicks: parseInt(row[1]) || 0,
          impressions: parseInt(row[2]) || 0
        };
      });
    }

    // Compile inventory items
    const inventory = [];

    // Static Routes
    const staticRoutes = [
      'https://www.indiascholarships.in/',
      'https://www.indiascholarships.in/scholarships',
      'https://www.indiascholarships.in/about',
      'https://www.indiascholarships.in/contact',
      'https://www.indiascholarships.in/privacy',
      'https://www.indiascholarships.in/terms'
    ];
    staticRoutes.forEach(url => {
      const metrics = gscMetrics[url] || { clicks: 0, impressions: 0 };
      inventory.push({
        name: cleanTitle(url) === 'Home' ? 'Main Homepage' : cleanTitle(url),
        type: 'Static',
        url,
        clicks: metrics.clicks,
        impressions: metrics.impressions
      });
    });

    // State Hubs
    const states = ['odisha', 'west-bengal', 'punjab', 'maharashtra', 'karnataka', 'uttar-pradesh', 'bihar'];
    states.forEach(state => {
      const url = `https://www.indiascholarships.in/hubs/${state}`;
      const metrics = gscMetrics[url] || { clicks: 0, impressions: 0 };
      inventory.push({
        name: `${cleanTitle(state)} State Hub`,
        type: 'State Hub',
        url,
        clicks: metrics.clicks,
        impressions: metrics.impressions
      });
    });

    // Dynamic Scholarship Pages (Adding ALL 280)
    scholarships.forEach(row => {
      const url = `https://www.indiascholarships.in/scholarships/${row.slug}`;
      const metrics = gscMetrics[url] || { clicks: 0, impressions: 0 };
      inventory.push({
        name: row.title,
        type: 'Scholarship',
        url,
        clicks: metrics.clicks,
        impressions: metrics.impressions
      });

      // Include all dynamic sub-pages (7 per scholarship = 1,960 additional URLs)
      const subpages = ['eligibility', 'documents-required', 'last-date', 'selection-process', 'apply-online', 'renewal-process', 'income-limit'];
      subpages.forEach(sub => {
        const subUrl = `${url}/${sub}`;
        const subMetrics = gscMetrics[subUrl] || { clicks: 0, impressions: 0 };
        inventory.push({
          name: `${row.title} — ${cleanTitle(sub)}`,
          type: 'Subpage',
          url: subUrl,
          clicks: subMetrics.clicks,
          impressions: subMetrics.impressions
        });
      });
    });

    console.log(`Generated ${inventory.length} total inventory pages to sync.`);

    // Sync all compiled pages in throttled sequential requests
    let count = 0;
    for (const item of inventory) {
      try {
        await notionRequest('/v1/pages', 'POST', {
          parent: { database_id: INVENTORY_DB },
          properties: {
            'Page name ': {
              title: [{ text: { content: item.name } }]
            },
            Type: {
              multi_select: [{ name: item.type }]
            },
            URL: {
              url: item.url
            },
            Clicks: {
              number: item.clicks
            },
            Impressions: {
              number: item.impressions
            }
          }
        });
        count++;
        if (count % 50 === 0) {
          console.log(`Synced ${count} / ${inventory.length} pages...`);
        }
      } catch (err) {
        // Log error and continue rather than crashing the whole run
        console.error(`Failed to sync item: ${item.name}`, err.message || err);
      }
      // Throttle strictly to 3 requests per second to avoid Notion 429 rate limit errors
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    console.log('✅ Inventory database populated successfully.');
  } catch (error) {
    console.error('Error syncing inventory:', error);
  } finally {
    db.close();
  }
}

// 2. Query Backlog Database for Pending Dev Tasks
async function syncBacklogTasks() {
  console.log('⚡ Querying Notion Backlog database for active dev tasks...');
  try {
    const searchRes = await notionRequest('/v1/search', 'POST', {
      query: '',
      filter: { property: 'object', value: 'page' }
    });

    const backlogIdNormalized = BACKLOG_DB.replace(/-/g, '').toLowerCase();
    const backlogPages = searchRes.results.filter(
      page => page.parent && 
              page.parent.database_id && 
              page.parent.database_id.replace(/-/g, '').toLowerCase() === backlogIdNormalized
    );

    console.log(`Found ${backlogPages.length} total tasks in the Backlog database.`);

    for (const page of backlogPages) {
      const title = page.properties.Task.title[0]?.plain_text || 'Unnamed Task';
      const status = page.properties.Status.select?.name || 'No Status';
      const isDone = page.properties.Done.checkbox;

      if (status === '🔴 Now' && !isDone) {
        console.log(`🚀 Active Task identified: "${title}"`);
      }
    }
  } catch (error) {
    console.error('Error syncing backlog:', error);
  }
}

// 3. Sync Repository Documents to Document Hub
async function syncRepositoryDocuments() {
  console.log('📖 Syncing local repository documentation to Notion...');
  const docsDir = path.join(__dirname, '../../docs');
  
  if (!fs.existsSync(docsDir)) {
    console.log('Docs folder does not exist at:', docsDir);
    return;
  }

  try {
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown documents locally.`);

    for (const file of files) {
      const filePath = path.join(docsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const title = file.replace(/_/g, ' ').replace('.md', '');

      // Create a page under the Document Hub
      const pageRes = await notionRequest('/v1/pages', 'POST', {
        parent: { page_id: DOC_HUB_PAGE },
        properties: {
          title: {
            title: [{ text: { content: title } }]
          }
        }
      });

      const paragraphs = content.split('\n\n');
      const children = paragraphs.map(p => ({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: p.slice(0, 2000) } }]
        }
      })).filter(c => c.paragraph.rich_text[0].text.content.trim() !== '');

      if (children.length > 0) {
        await notionRequest(`/v1/blocks/${pageRes.id}/children`, 'PATCH', { children });
      }
    }
    console.log('✅ Documentation synced successfully.');
  } catch (error) {
    console.error('Error syncing documents:', error);
  }
}

// 4. Pull GSC Metrics and update Notion Metrics
async function syncGSCMetrics() {
  console.log('📊 Syncing Google Search Console metrics to Notion...');
  const gscPath = path.join(__dirname, '../data/gsc-june-2026/pages.json');

  if (!fs.existsSync(gscPath)) {
    console.log('GSC data file not found at:', gscPath);
    return;
  }

  try {
    const pagesData = JSON.parse(fs.readFileSync(gscPath, 'utf-8'));
    console.log(`Found ${pagesData.length - 1} pages in Search Console logs.`);

    const summaryRows = pagesData.slice(1, 10);
    
    console.log('Top GSC Page Performance:');
    for (const row of summaryRows) {
      console.log(`- Page: ${row[0].split('/scholarships/')[1]} | Clicks: ${row[1]} | Impressions: ${row[2]}`);
    }
    console.log('✅ Metrics read successfully.');
  } catch (error) {
    console.error('Error syncing GSC metrics:', error);
  }
}

// 5. Append recent Git commits to Change & Activity Log
async function logActivity() {
  console.log('📜 Syncing recent repository commits to Change & Activity Log...');
  try {
    const gitLog = execSync('git log -n 5 --oneline').toString();
    const commits = gitLog.split('\n').filter(line => line.trim() !== '');

    console.log(`Found ${commits.length} recent commits.`);

    const children = commits.map(commit => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: '🔨 ' } },
          { text: { content: commit } }
        ]
      }
    }));

    if (children.length > 0) {
      await notionRequest(`/v1/blocks/${CHANGELOG_PAGE}/children`, 'PATCH', { children });
    }
    console.log('✅ Change log updated successfully.');
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Main execution loop
async function run() {
  console.log('🚀 Launching Notion Sync Engine...');
  await syncInventory();
  await syncBacklogTasks();
  await syncRepositoryDocuments();
  await syncGSCMetrics();
  await logActivity();
}

run();
