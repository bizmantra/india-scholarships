const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i+1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.replace(/^"/, '').replace(/"$/, ''));
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ? row[idx].replace(/^"/, '').replace(/"$/, '') : '';
    });
    return obj;
  });
}

const devCsv = path.join(__dirname, '../scratch/csv_export/dev/IS Dev Backlog ca53d5c340bb4453aa021c0618ec585d_all.csv');
const contentCsv = path.join(__dirname, '../scratch/csv_export/content/IS Content Backlog 3952e0a03f1e81e8924cd53fc9668f32_all.csv');

const devTasks = parseCSV(devCsv);
const contentTasks = parseCSV(contentCsv);

console.log("Dev Tasks Count:", devTasks.length);
console.log("Content Tasks Count:", contentTasks.length);

const devByStatus = {};
devTasks.forEach(t => {
  const status = t['Status'] || 'Unspecified';
  if (!devByStatus[status]) devByStatus[status] = [];
  devByStatus[status].push(t);
});

console.log("\nDEV TASKS BY STATUS:");
for (let s in devByStatus) {
  console.log(`- ${s}: ${devByStatus[s].length} tasks`);
}

const contentByStatus = {};
contentTasks.forEach(t => {
  const status = t['Status'] || 'Unspecified';
  if (!contentByStatus[status]) contentByStatus[status] = [];
  contentByStatus[status].push(t);
});

console.log("\nCONTENT TASKS BY STATUS:");
for (let s in contentByStatus) {
  console.log(`- ${s}: ${contentByStatus[s].length} tasks`);
}
