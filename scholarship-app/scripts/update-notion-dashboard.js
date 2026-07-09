#!/usr/bin/env node
/**
 * update-notion-dashboard.js
 * ─────────────────────────────────────────────────────────────────
 * Queries the local dev & content backlogs and the scholarships SQLite DB,
 * then writes a fresh status dashboard to a local Markdown file (data/dashboard.md)
 * and attempts to sync to Notion if API keys are active.
 *
 * RUN ONCE MANUALLY OR AT THE START OF EVERY SESSION:
 *   node scripts/update-notion-dashboard.js
 * ─────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────
const ENV_PATH       = path.join(__dirname, '../.env.local');
const CACHE_PATH     = path.join(__dirname, '../data/notion-dashboard-id.txt');
const DB_PATH        = path.join(__dirname, '../data/scholarships.db');
const LOCAL_DASHBOARD_PATH = path.join(__dirname, '../data/dashboard.md');
const DASHBOARD_TITLE = '📊 IndiaScholarships — Project Dashboard';

// Live tools tracking
const LIVE_TOOLS = [
  'Scholarship Eligibility Checker  →  /eligibility-checker',
  'Family Income Calculator  →  /tools/family-income-calculator',
  'Scholarship Amount Calculator  →  /tools/scholarship-amount-calculator',
  'Study Cost Calculator  →  /tools/study-cost-calculator',
  'Education Loan EMI Calculator  →  /tools/education-loan-emi-calculator',
  'CGPA to Percentage Converter  →  /tools/cgpa-percentage-converter',
  'Tools Hub  →  /tools',
];

const PARKED_TOOLS = [
  'Scholarship Finder Wizard (IS-71) — Parked: needs UX + lead capture decision',
  'Scholarship Compare Tool (IS-73) — Parked: deprioritised',
];

// ── Env loader ───────────────────────────────────────────────────
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const get = (key) => {
    const m = raw.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'));
    return m ? m[1].trim() : null;
  };
  return {
    token:        get('NOTION_API_KEY'),
    backlogDbId:  get('NOTION_DATABASE_ID_BACKLOG'),
    contentDbId:  get('NOTION_DATABASE_ID_PIPELINE'),
    docHubPageId: get('NOTION_PAGE_ID_DOC_HUB'),
  };
}

// ── Notion API helper ────────────────────────────────────────────
function notion(token) {
  return async function call(method, endpoint, body) {
    const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
      method,
      headers: {
        Authorization:    `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type':   'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Notion ${method} ${endpoint} → ${err.message}`);
    }
    return res.json();
  };
}

// ── Scholarship DB stats ─────────────────────────────────────────
function getScholarshipStats() {
  try {
    const Database = require('better-sqlite3');
    const db    = new Database(DB_PATH, { readonly: true });
    const stats = db.prepare(
      `SELECT COUNT(*) as total, COALESCE(SUM(amount_annual),0) as total_value
       FROM scholarships WHERE status = 'Active'`
    ).get();
    db.close();
    return stats;
  } catch (e) {
    return { total: '?', total_value: 0 };
  }
}

// ── Local Backlog Stats loader ───────────────────────────────────
function getLocalBacklogStats() {
  const devPath = path.join(__dirname, '../data/backlog-dev.json');
  const contentPath = path.join(__dirname, '../data/backlog-content.json');

  let devTasks = [];
  let contentTasks = [];

  if (fs.existsSync(devPath)) {
    try {
      devTasks = JSON.parse(fs.readFileSync(devPath, 'utf8'));
    } catch (e) {}
  }
  if (fs.existsSync(contentPath)) {
    try {
      contentTasks = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    } catch (e) {}
  }

  const categorize = (tasks) => {
    const done = tasks.filter(t => t.status === 'Done');
    const inProgress = tasks.filter(t => t.status === 'In Progress');
    const backlog = tasks.filter(t => t.status === 'Backlog');
    const parked = tasks.filter(t => t.status === 'Parked');
    return { done, inProgress, backlog, parked };
  };

  return {
    dev: categorize(devTasks),
    content: categorize(contentTasks)
  };
}

// ── Markdown Dashboard Builder ──────────────────────────────────
function buildMarkdownDashboard(stats, dev, content) {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short',
  });

  const valueStr = stats.total_value
    ? `₹${(stats.total_value / 10000000).toFixed(0)}Cr+`
    : '₹?';

  let md = `# ${DASHBOARD_TITLE}\n\n`;
  md += `> 🌐 **Live**: https://www.indiascholarships.in | **GitHub**: bizmantra/india-scholarships | **Hosting**: Vercel\n`;
  md += `> 🕐 **Last Refreshed**: ${now} IST\n\n`;

  md += `## 📊 Key Metrics\n\n`;
  md += `- **Scholarships Indexed**: ${stats.total}+ active schemes\n`;
  md += `- **Total Scholarship Value**: ${valueStr}\n`;
  md += `- **Live Tools**: ${LIVE_TOOLS.length}\n`;
  md += `- **Dev Tasks**: ${dev.done.length} completed, ${dev.inProgress.length} in progress, ${dev.backlog.length} in backlog\n`;
  md += `- **Content Tasks**: ${content.done.length} completed, ${content.inProgress.length} in progress, ${content.backlog.length} in backlog\n\n`;

  md += `## ⚡ Currently In Progress\n\n`;
  const allActive = [...dev.inProgress.map(t => `[Dev] ${t.id} - ${t.title}`), ...content.inProgress.map(t => `[Content] ${t.id} - ${t.title}`)];
  if (allActive.length > 0) {
    allActive.forEach(item => {
      md += `- **${item}**\n`;
    });
  } else {
    md += `*No active tasks right now — ready to pick up next item.*\n`;
  }
  md += `\n`;

  md += `## 🛠 Live Tools (${LIVE_TOOLS.length})\n\n`;
  LIVE_TOOLS.forEach(t => {
    md += `- ✅ ${t}\n`;
  });
  md += `\n### ⏸ Parked / Coming Soon\n\n`;
  PARKED_TOOLS.forEach(t => {
    md += `- ⏸ ${t}\n`;
  });
  md += `\n`;

  md += `## 📋 Backlog — Up Next (Dev)\n\n`;
  if (dev.backlog.length > 0) {
    dev.backlog.slice(0, 5).forEach(t => {
      md += `- ${t.id} — ${t.title}\n`;
    });
  } else {
    md += `*Backlog is empty.*\n`;
  }
  md += `\n`;

  md += `## 📋 Backlog — Up Next (Content)\n\n`;
  if (content.backlog.length > 0) {
    content.backlog.slice(0, 5).forEach(t => {
      md += `- ${t.id} — ${t.title}\n`;
    });
  } else {
    md += `*Backlog is empty.*\n`;
  }
  md += `\n`;

  md += `## ✅ Recently Completed (Dev - Last 5)\n\n`;
  dev.done.slice(0, 5).forEach(t => {
    md += `- ${t.id} — ${t.title}\n`;
  });
  md += `\n`;

  md += `## ✅ Recently Completed (Content - Last 5)\n\n`;
  content.done.slice(0, 5).forEach(t => {
    md += `- ${t.id} — ${t.title}\n`;
  });
  md += `\n`;

  return md;
}

// ── Notion Block formatters ──────────────────────────────────────
const rt  = (text, bold = false) => ({ type: 'text', text: { content: text }, annotations: { bold } });
const h1  = (t) => ({ type: 'heading_1',  heading_1:  { rich_text: [rt(t)] } });
const h2  = (t) => ({ type: 'heading_2',  heading_2:  { rich_text: [rt(t)] } });
const h3  = (t) => ({ type: 'heading_3',  heading_3:  { rich_text: [rt(t)] } });
const p   = (t) => ({ type: 'paragraph',  paragraph:  { rich_text: [rt(t)] } });
const div = ()  => ({ type: 'divider',    divider:    {} });
const bul = (t, bold = false) => ({
  type: 'bulleted_list_item',
  bulleted_list_item: { rich_text: [rt(t, bold)] },
});
const callout = (text, emoji, color) => ({
  type: 'callout',
  callout: { rich_text: [rt(text)], icon: { type: 'emoji', emoji }, color },
});

function buildNotionBlocks(dev, content, stats) {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short',
  });

  const valueStr = stats.total_value
    ? `₹${(stats.total_value / 10000000).toFixed(0)}Cr+`
    : '₹?';

  return [
    callout(`🟢  Live: https://www.indiascholarships.in   |   GitHub: bizmantra/india-scholarships   |   Hosting: Vercel (auto-deploy on main push)`, '🌐', 'green_background'),
    callout(`Last refreshed: ${now} IST`, '🕐', 'gray_background'),
    div(),

    h2('📊 Key Metrics'),
    bul(`Scholarships indexed: ${stats.total}+ active schemes`),
    bul(`Total scholarship value: ${valueStr}`),
    bul(`Live tools: ${LIVE_TOOLS.length}`),
    bul(`Dev tasks completed: ${dev.done.length}`),
    bul(`Dev tasks in backlog: ${dev.backlog.length}`),
    bul(`Content tasks completed: ${content.done.length}`),
    bul(`Content tasks in backlog: ${content.backlog.length}`),
    div(),

    h2('⚡ Currently In Progress'),
    ...[
      ...dev.inProgress.map(t => bul(`[Dev] ${t.id} — ${t.title}`, true)),
      ...content.inProgress.map(t => bul(`[Content] ${t.id} — ${t.title}`, true))
    ],
    ...(dev.inProgress.length === 0 && content.inProgress.length === 0
      ? [callout('No active tasks right now — ready to pick up next item.', '✅', 'green_background')]
      : []
    ),
    div(),

    h2('🛠 Live Tools  (' + LIVE_TOOLS.length + ')'),
    ...LIVE_TOOLS.map(t => bul(`✅  ${t}`)),
    h3('⏸ Parked / Coming Soon'),
    ...PARKED_TOOLS.map(t => bul(`⏸  ${t}`)),
    div(),

    h2('📋 Backlog — Up Next (Dev)'),
    ...(dev.backlog.length
      ? dev.backlog.slice(0, 5).map(t => bul(`${t.id}  —  ${t.title}`))
      : [p('Dev backlog is empty.')]),
    div(),

    h2('📋 Backlog — Up Next (Content)'),
    ...(content.backlog.length
      ? content.backlog.slice(0, 5).map(t => bul(`${t.id}  —  ${t.title}`))
      : [p('Content backlog is empty.')]),
    div(),

    h2('✅ Recently Completed (Dev)'),
    ...dev.done.slice(0, 5).map(t => bul(`${t.id}  —  ${t.title}`)),
    div(),

    h2('✅ Recently Completed (Content)'),
    ...content.done.slice(0, 5).map(t => bul(`${t.id}  —  ${t.title}`)),
    div(),

    p('This dashboard is auto-generated locally. Run node scripts/update-notion-dashboard.js to refresh.'),
  ];
}

// ── Notion sync routines ─────────────────────────────────────────
async function syncToNotion(env, dev, content, stats) {
  if (!env.token || !env.docHubPageId) {
    console.log('ℹ️ Notion token or page ID is missing. Skipping Notion sync.');
    return;
  }

  const api = notion(env.token);

  let pageId = null;
  if (fs.existsSync(CACHE_PATH)) {
    pageId = fs.readFileSync(CACHE_PATH, 'utf8').trim();
  }

  if (!pageId) {
    console.log('📄 Creating new Notion dashboard page...');
    const page = await api('POST', '/pages', {
      parent: { page_id: env.docHubPageId },
      icon:   { type: 'emoji', emoji: '📊' },
      properties: {
        title: [{ type: 'text', text: { content: DASHBOARD_TITLE } }],
      },
      children: [p('Generating dashboard...')],
    });
    pageId = page.id;
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, page.id);
    console.log(`📄 Created: ${page.id}`);
  } else {
    console.log(`📄 Reusing existing Notion dashboard page: ${pageId}`);
  }

  const blocks = buildNotionBlocks(dev, content, stats);

  console.log('🧹 Clearing old content on Notion...');
  const res = await api('GET', `/blocks/${pageId}/children?page_size=100`);
  for (const block of res.results || []) {
    await api('DELETE', `/blocks/${block.id}`);
  }

  console.log('✍️  Writing new content to Notion...');
  for (let i = 0; i < blocks.length; i += 100) {
    await api('PATCH', `/blocks/${pageId}/children`, {
      children: blocks.slice(i, i + 100),
    });
  }

  const url = `https://app.notion.com/p/${pageId.replace(/-/g, '')}`;
  console.log(`\n✅ Notion dashboard updated → ${url}\n`);
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Updating Project Dashboard...\n');

  const stats = getScholarshipStats();
  const backlog = getLocalBacklogStats();

  console.log(`📊 Local stats compiled:`);
  console.log(`   📚 Scholarships: ${stats.total} | Value: ${stats.total_value ? 'Active' : 'N/A'}`);
  console.log(`   💻 Dev Backlog: ${backlog.dev.done.length} Done | ${backlog.dev.inProgress.length} In Progress | ${backlog.dev.backlog.length} Backlog`);
  console.log(`   📝 Content Backlog: ${backlog.content.done.length} Done | ${backlog.content.inProgress.length} In Progress | ${backlog.content.backlog.length} Backlog`);

  // Write Local Markdown Dashboard
  const mdContent = buildMarkdownDashboard(stats, backlog.dev, backlog.content);
  fs.writeFileSync(LOCAL_DASHBOARD_PATH, mdContent);
  console.log(`\n✅ Local dashboard updated → data/dashboard.md`);

  // Attempt Notion sync
  const env = loadEnv();
  try {
    await syncToNotion(env, backlog.dev, backlog.content, stats);
  } catch (err) {
    console.log(`⚠️ Notion Sync bypassed/failed: ${err.message}`);
    console.log(`💡 Local data was saved successfully. You do not need Notion to keep working.`);
  }
}

main().catch((err) => {
  console.error('❌ Dashboard update script execution failed:', err);
  process.exit(1);
});
