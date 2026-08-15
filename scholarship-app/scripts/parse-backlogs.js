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

console.log("==========================================");
console.log("1. DEV BACKLOG TASKS");
console.log("==========================================");
const devCsv = path.join(__dirname, '../scratch/csv_export/dev/IS Dev Backlog ca53d5c340bb4453aa021c0618ec585d_all.csv');
const devTasks = parseCSV(devCsv);
console.log(`Found ${devTasks.length} tasks in Dev Backlog CSV:\n`);
devTasks.forEach((t, i) => {
  const taskName = t['Task'] || t['Task Name'] || t['Name'] || Object.values(t)[0];
  console.log(`${i+1}. [${t['Status'] || 'No Status'}] [${t['Priority'] || 'No Priority'}] [${t['Area'] || 'No Area'}] ${taskName}`);
});

console.log("\n==========================================");
console.log("2. CONTENT BACKLOG TASKS");
console.log("==========================================");
const contentCsv = path.join(__dirname, '../scratch/csv_export/content/IS Content Backlog 3952e0a03f1e81e8924cd53fc9668f32_all.csv');
const contentTasks = parseCSV(contentCsv);
console.log(`Found ${contentTasks.length} tasks in Content Backlog CSV:\n`);
contentTasks.forEach((t, i) => {
  const taskName = t['Task'] || t['Task Name'] || t['Name'] || Object.values(t)[0];
  console.log(`${i+1}. [${t['Status'] || 'No Status'}] [${t['Priority'] || 'No Priority'}] [${t['Area'] || t['Type'] || 'No Area'}] ${taskName}`);
});
