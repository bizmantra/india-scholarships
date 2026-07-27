const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'scholarships.db');
const db = new Database(dbPath);

const allDbRows = db.prepare('SELECT id, slug, title, state, provider_type FROM scholarships').all();
const dbSlugMap = new Map(allDbRows.map(r => [r.slug, r.title]));

const articlesDir = path.join(projectRoot, 'content', 'articles');
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

console.log('=== DETAILED ARTICLE-BY-ARTICLE BREAKDOWN ===\n');

files.forEach(file => {
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  const slug = file.replace(/\.md$/, '');
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  console.log(`--------------------------------------------------`);
  console.log(`Article File: ${file}`);
  console.log(`Slug: ${slug}`);
  console.log(`Word Count: ${wordCount}`);

  // Extract frontmatter
  const fmMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);
  if (!fmMatch) {
    console.log('  ⚠️ NO FRONTMATTER FOUND!');
    return;
  }
  const yaml = fmMatch[1];
  const body = fmMatch[2];

  // Extract frontmatter links
  const targetMoneyMatch = yaml.match(/targetMoneyLink:\s*["']?([^"'\r\n]+)["']?/);
  const targetMoney = targetMoneyMatch ? targetMoneyMatch[1].trim() : 'NONE';
  console.log(`  targetMoneyLink: ${targetMoney}`);

  const relatedMatch = yaml.match(/relatedScholarships:\s*\n((?:\s*-\s*["']?[^"'\r\n]+["']?\s*\n?)*)/);
  const related = [];
  if (relatedMatch) {
    relatedMatch[1].split('\n').forEach(l => {
      const s = l.replace(/^\s*-\s*["']?|["']?\s*$/g, '').trim();
      if (s) related.push(s);
    });
  }
  console.log(`  relatedScholarships (${related.length}):`);
  related.forEach(r => {
    const exists = dbSlugMap.has(r);
    console.log(`    - ${r} ${exists ? '✅ (DB Match)' : '❌ (BROKEN - NOT IN DB)'}`);
  });

  // Extract all inline links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  const inlineLinks = [];
  while ((m = linkRegex.exec(body)) !== null) {
    inlineLinks.push({ text: m[1], url: m[2].trim() });
  }

  console.log(`  inlineLinks (${inlineLinks.length}):`);
  inlineLinks.forEach(l => {
    let status = '✅ OK';
    if (l.url.startsWith('/scholarships/')) {
      const sSlug = l.url.replace('/scholarships/', '').split('#')[0].split('/')[0];
      if (!dbSlugMap.has(sSlug)) {
        // find candidate in DB
        const candidates = allDbRows.filter(r => 
          r.slug.includes(sSlug) || sSlug.includes(r.slug) ||
          r.title.toLowerCase().includes(l.text.toLowerCase().replace(/scholarship|guide|2026|scheme/gi, '').trim())
        );
        status = `❌ BROKEN (DB Slug '${sSlug}' not found). Candidates: ${candidates.slice(0,3).map(c=>c.slug).join(', ')}`;
      }
    } else if (l.url.startsWith('/tools/')) {
      if (l.url === '/tools/eligibility-checker') {
        status = `❌ BROKEN (Should be /eligibility-checker or /tools/scholarship-eligibility-checker)`;
      }
    } else if (l.url.startsWith('/guides/')) {
      if (l.url.includes('/guides/nsp')) {
        status = `❌ BROKEN (Should be /guides/national-scholarship-portal-nsp)`;
      }
    }
    console.log(`    - [${l.text}](${l.url}) -> ${status}`);
  });
  console.log('');
});

db.close();
