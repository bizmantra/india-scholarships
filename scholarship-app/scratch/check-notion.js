const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const NOTION_KEY = process.env.NOTION_API_KEY;

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
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('Searching for databases containing "Scholarship", "Inventory", or "Pipeline"...');
  const res = await notionRequest('/v1/search', 'POST', {
    query: ''
  });
  if (res.status === 200) {
    const dbs = res.data.results.filter(obj => {
      const title = obj.object === 'database' 
        ? (obj.title?.[0]?.plain_text || '')
        : (obj.properties?.title?.title?.[0]?.plain_text || obj.properties?.Name?.title?.[0]?.plain_text || obj.properties?.Task?.title?.[0]?.plain_text || obj.properties?.['Page name ']?.title?.[0]?.plain_text || '');
      return title.toLowerCase().includes('scholarship') || title.toLowerCase().includes('inventory') || title.toLowerCase().includes('pipeline') || obj.object === 'database';
    });
    console.log(`Found ${dbs.length} matches:`);
    dbs.forEach(obj => {
      const title = obj.object === 'database' 
        ? (obj.title?.[0]?.plain_text || 'Untitled DB')
        : (obj.properties?.title?.title?.[0]?.plain_text || obj.properties?.Name?.title?.[0]?.plain_text || obj.properties?.Task?.title?.[0]?.plain_text || obj.properties?.['Page name ']?.title?.[0]?.plain_text || 'Untitled Page');
      console.log(`- ${obj.object} ID: ${obj.id}`);
      console.log(`  Title: ${title}`);
    });
  } else {
    console.log('Error:', res.data);
  }
}

run();
