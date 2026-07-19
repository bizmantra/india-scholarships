const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const https = require('https');

const NOTION_KEY = process.env.NOTION_API_KEY;
const BACKLOG_DB = process.env.NOTION_DATABASE_ID_BACKLOG;

if (!NOTION_KEY || !BACKLOG_DB) {
  console.error('❌ Missing Notion configuration in env.');
  process.exit(1);
}

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
          resolve(json);
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

const tasksToCreate = [
  {
    title: 'Optimize Low-CTR Page 2 Keywords (Position 5-15)',
    description: 'Audit Google Search Console for high-impression keywords on page 2. Optimize dynamic year metadata `${year}`, enrich DB detail fields, and implement structured FAQ schema to capture rich snippets and boost CTR.'
  },
  {
    title: 'Ingest High-Volume Missing Scholarships',
    description: 'Cross-reference keyword research CSVs against the database. Use Gemini grounding scripts to research and ingest high-volume missing targets (like Post Matriculation Scholarship, Jnanabhumi) into scholarships.db.'
  },
  {
    title: 'Establish Owned Channels (WhatsApp & Telegram)',
    description: 'Implement WhatsApp Channel invitation banners in details layout and footers. Set up automated Sunday cron jobs or triggers using post-new-to-telegram.js to broadcast verified scholarships.'
  },
  {
    title: 'Build Adjacent Verticals (Loans, DBT & Document Utilities)',
    description: 'Create guide clusters and tool links for Education Loans, Aadhaar-bank seeding for DBT, and state-wise caste/income certificate application checklists.'
  }
];

async function run() {
  console.log(`🚀 Creating ${tasksToCreate.length} tasks in the Backlog database...`);

  for (const t of tasksToCreate) {
    const body = {
      parent: { database_id: BACKLOG_DB },
      properties: {
        Task: {
          title: [
            {
              text: {
                content: t.title
              }
            }
          ]
        },
        Status: {
          select: {
            name: 'Backlog'
          }
        },
        Description: {
          rich_text: [
            {
              text: {
                content: t.description
              }
            }
          ]
        }
      }
    };

    const res = await notionRequest('/v1/pages', 'POST', body);
    if (res.id) {
      console.log(`✅ Created task: "${t.title}" (Page ID: ${res.id})`);
    } else {
      console.error(`❌ Failed to create task: "${t.title}"`, res);
    }
  }

  console.log('🏁 All growth backlog tasks created successfully!');
}

run().catch(console.error);
