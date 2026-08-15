const https = require('https');

const key = process.env.NOTION_API_KEY || "";
const dbs = [
  { name: "Gov Dev Backlog", id: "9ec6898d-35ec-4350-a727-e2d1b5f28255" },
  { name: "Gov Content Ops Tracker", id: "666ce494-c9ba-4f7c-aa96-211069baca4a" },
  { name: "Backlog (Legacy/Scholarship)", id: "ca53d5c3-40bb-4453-aa02-1c0618ec585d" },
  { name: "Pipeline", id: "3952e0a0-3f1e-81e8-924c-d53fc9668f32" }
];

function queryDb(db) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify({});
    const options = {
      hostname: 'api.notion.com',
      path: `/v1/databases/${db.id.replace(/-/g, '')}/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ db, status: res.statusCode, data: parsed });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(dataString);
    req.end();
  });
}

async function main() {
  for (const db of dbs) {
    try {
      const res = await queryDb(db);
      console.log(`\n========================================`);
      console.log(`DATABASE: ${res.db.name} (Status Code: ${res.status})`);
      console.log(`========================================`);
      if (res.data.results) {
        console.log(`Total Items: ${res.data.results.length}`);
        res.data.results.forEach((page, i) => {
          const props = page.properties;
          let title = "";
          for (let k in props) {
            if (props[k].type === "title") {
              title = props[k].title.map(t => t.plain_text).join("");
            }
          }
          let status = props.Status?.select?.name || props.Status?.status?.name || "N/A";
          let priority = props.Priority?.select?.name || "N/A";
          let area = props.Area?.select?.name || props.Type?.select?.name || "N/A";
          let effort = props.Effort?.select?.name || "N/A";
          let notes = props.Notes?.rich_text?.map(t => t.plain_text).join("") || "";
          
          console.log(`\n[${i+1}] ID: ${props.id?.unique_id ? props.id.unique_id.prefix + '-' + props.id.unique_id.number : 'N/A'}`);
          console.log(`    Task: ${title}`);
          console.log(`    Status: ${status} | Priority: ${priority} | Area/Type: ${area} | Effort: ${effort}`);
          if (notes) console.log(`    Notes: ${notes.substring(0, 150)}${notes.length > 150 ? '...' : ''}`);
        });
      } else {
        console.log("Error:", res.data);
      }
    } catch (err) {
      console.error(`Error querying ${db.name}:`, err.message);
    }
  }
}

main();
