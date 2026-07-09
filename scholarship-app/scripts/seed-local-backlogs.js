const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Paths
const DEV_CSV = path.join(__dirname, '../Notion-Tracker/extracted/dev-backlog/Private & Shared/IS Dev Backlog ca53d5c340bb4453aa021c0618ec585d_all.csv');
const CONTENT_CSV = path.join(__dirname, '../Notion-Tracker/extracted/content-backlog/Private & Shared/IS Content Backlog 3952e0a03f1e81e8924cd53fc9668f32_all.csv');

const DATA_DIR = path.join(__dirname, '../data');

function mapStatus(notionStatus) {
  if (!notionStatus) return 'Backlog';
  const clean = notionStatus.trim().toLowerCase();
  if (clean.includes('done') || clean.includes('completed') || clean.includes('✅')) {
    return 'Done';
  }
  if (clean.includes('now') || clean.includes('progress') || clean.includes('⏳') || clean.includes('in progress')) {
    return 'In Progress';
  }
  if (clean.includes('deferred') || clean.includes('parked') || clean.includes('cancelled')) {
    return 'Parked';
  }
  return 'Backlog';
}

function generateMarkdown(title, tasks) {
  let md = `# ${title}\n\n`;
  
  const columns = {
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Backlog': tasks.filter(t => t.status === 'Backlog'),
    'Done': tasks.filter(t => t.status === 'Done'),
    'Parked': tasks.filter(t => t.status === 'Parked')
  };

  for (const [colName, colTasks] of Object.entries(columns)) {
    md += `## ${colName} (${colTasks.length})\n\n`;
    if (colTasks.length === 0) {
      md += `*No tasks in this section.*\n\n`;
      continue;
    }
    for (const t of colTasks) {
      const check = colName === 'Done' ? '[x]' : '[ ]';
      md += `- ${check} **${t.id}**: ${t.title}\n`;
      if (t.impact) md += `  - **Impact**: ${t.impact}\n`;
      if (t.type) md += `  - **Type**: ${t.type}\n`;
      if (t.description) {
        // Indent description lines
        const descLines = t.description.split('\n').map(line => '    ' + line).join('\n');
        md += `  - **Description**:\n${descLines}\n`;
      }
      md += `\n`;
    }
  }
  return md;
}

function processCSV(csvPath, isDev) {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found at: ${csvPath}`);
    return [];
  }

  const rawContent = fs.readFileSync(csvPath, 'utf8');
  const records = parse(rawContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`Parsed ${records.length} records from ${path.basename(csvPath)}`);

  return records.map((r, index) => {
    const taskName = r.Task || r['﻿Task'] || r['Page name '] || '';
    const id = r.ID || (isDev ? `IS-${index + 1}` : `CNT-${index + 1}`);
    return {
      id,
      title: taskName,
      description: r.Description || '',
      impact: r.Impact || '',
      status: mapStatus(r.Status),
      type: r.Type || ''
    };
  });
}

function run() {
  console.log('🚀 Seeding local backlogs...');
  
  // Dev Backlog
  const devTasks = processCSV(DEV_CSV, true);
  if (devTasks.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'backlog-dev.json'), JSON.stringify(devTasks, null, 2));
    const devMd = generateMarkdown('IndiaScholarships Dev Backlog', devTasks);
    fs.writeFileSync(path.join(DATA_DIR, 'backlog-dev.md'), devMd);
    console.log(`✅ Saved dev backlog: ${devTasks.length} tasks`);
  }

  // Content Backlog
  const contentTasks = processCSV(CONTENT_CSV, false);
  if (contentTasks.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'backlog-content.json'), JSON.stringify(contentTasks, null, 2));
    const contentMd = generateMarkdown('IndiaScholarships Content Backlog', contentTasks);
    fs.writeFileSync(path.join(DATA_DIR, 'backlog-content.md'), contentMd);
    console.log(`✅ Saved content backlog: ${contentTasks.length} tasks`);
  }
}

run();
