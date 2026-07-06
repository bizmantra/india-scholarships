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
    title: 'Delhi University (DU) Hub & Scholarship Research',
    description: 'Research official DU internal fee waivers, college-specific awards, and build the DU scholarship hub landing page.'
  },
  {
    title: 'Category B University Hubs & Research (JNU, BHU, AMU, JMI, UoH)',
    description: 'Research official internal schemes and build scholarship hubs for JNU, BHU, AMU, JMI, and Hyderabad University (UoH).'
  },
  {
    title: 'Category C & D University Hubs & Research (Anna Uni, VTU, SPPU, AKTU, Ashoka, VIT, MAHE)',
    description: 'Research official internal schemes and build scholarship hubs for state technical universities (Anna University, VTU, SPPU, AKTU) and private universities (Ashoka, VIT, Manipal).'
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

  console.log('🏁 All backlog tasks created successfully!');
}

run().catch(console.error);
