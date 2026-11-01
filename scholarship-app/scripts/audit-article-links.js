const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const articlesDir = path.join(projectRoot, 'content', 'articles');
const dbPath = path.join(projectRoot, 'data', 'scholarships.db');

let db = null;
let dbRows = [];

try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
  dbRows = db.prepare('SELECT slug, title FROM scholarships').all();
} catch (e) {
  // Fallback to sqlite3 CLI
  try {
    const raw = execSync(`sqlite3 "${dbPath}" "SELECT slug, title FROM scholarships;"`, { encoding: 'utf8' });
    dbRows = raw.trim().split('\n').filter(Boolean).map(line => {
      const idx = line.indexOf('|');
      return { slug: line.substring(0, idx), title: line.substring(idx + 1) };
    });
  } catch (err) {
    console.error('Failed to load scholarships from database:', err.message);
    process.exit(1);
  }
}
const validDbSlugs = new Map(dbRows.map(r => [r.slug, r.title]));

// Fetch all articles and pillars slugs
const pillarsDir = path.join(projectRoot, 'content', 'pillars');
const newsDir = path.join(projectRoot, 'content', 'news');

const pillarFiles = fs.existsSync(pillarsDir) ? fs.readdirSync(pillarsDir).filter(f => f.endsWith('.md')) : [];
const validPillarSlugs = new Set(pillarFiles.map(f => f.replace(/\.md$/, '')));

const allArticleFiles = fs.existsSync(articlesDir) ? fs.readdirSync(articlesDir).filter(f => f.endsWith('.md')).map(f => path.join('articles', f)) : [];
const allNewsFiles = fs.existsSync(newsDir) ? fs.readdirSync(newsDir).filter(f => f.endsWith('.md')).map(f => path.join('news', f)) : [];
const validArticleSlugs = new Set(allArticleFiles.map(f => path.basename(f, '.md')));

// Fetch all redirect rules from next.config.ts if any
const nextConfigContent = fs.readFileSync(path.join(projectRoot, 'next.config.ts'), 'utf8');

// Parse redirects in next.config.ts
const redirects = [];
const redirectRegex = /source:\s*['"]([^'"]+)['"],\s*destination:\s*['"]([^'"]+)['"]/g;
let rm;
while ((rm = redirectRegex.exec(nextConfigContent)) !== null) {
  redirects.push({ source: rm[1], destination: rm[2] });
}

// Fetch all portals from portalsData.ts
let portalSlugs = new Set(['nsp', 'e-kalyan-jharkhand', 'digital-gujarat-mysy', 'ssp-karnataka', 'aikyashree-west-bengal', 'talliki-vandanam-ap', 'mptaas-mmvy-mp', 'e-grantz-kerala', 'up-scholarship', 'mahadbt-maharashtra']);
try {
  const { PORTALS_DATA } = require(path.join(projectRoot, 'lib', 'portalsData.ts'));
  Object.keys(PORTALS_DATA).forEach(k => {
    portalSlugs.add(k);
    if (PORTALS_DATA[k].aliases) {
      PORTALS_DATA[k].aliases.forEach(a => portalSlugs.add(a));
    }
  });
} catch (e) {
  // fallback set already initialized
}

// Parse CLI arguments
const rawArgs = process.argv.slice(2);
const isStrict = rawArgs.includes('--strict');
const forceStrictProse = rawArgs.includes('--strict-prose');

const targetedFiles = [];
for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--file' && rawArgs[i + 1]) {
    targetedFiles.push(rawArgs[i + 1]);
    i++;
  } else if (arg.startsWith('--file=')) {
    targetedFiles.push(arg.substring(arg.indexOf('=') + 1));
  } else if (arg.endsWith('.md') && !arg.startsWith('--')) {
    targetedFiles.push(arg);
  }
}

const isTargeted = targetedFiles.length > 0;
const checkProse = isTargeted || forceStrictProse;

let filesToAudit = [];
if (isTargeted) {
  filesToAudit = targetedFiles.map(filePath => {
    let resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const contentDir = path.join(projectRoot, 'content');
    if (resolved.startsWith(contentDir)) {
      return path.relative(contentDir, resolved);
    }
    if (filePath.startsWith('content/')) {
      return filePath.replace(/^content\//, '');
    }
    return filePath;
  });
} else {
  filesToAudit = [...allArticleFiles, ...allNewsFiles];
}

console.log(`=======================================================`);
console.log(`  AUDITING ${filesToAudit.length} ARTICLE(S) FOR CONTENT & BROKEN LINKS`);
if (checkProse) {
  console.log(`  [MODE] Strict Prose & Grammar Rules Enabled (≤15 words/sentence, 0 pronouns)`);
}
console.log(`=======================================================\n`);

const summary = {
  totalArticles: filesToAudit.length,
  articlesWithBrokenLinks: 0,
  articlesWithThinContent: 0,
  totalBrokenLinks: 0,
  missingFiles: 0,
  details: []
};

filesToAudit.forEach(relFile => {
  const filePath = path.isAbsolute(relFile) ? relFile : path.join(projectRoot, 'content', relFile);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ TARGET FILE NOT FOUND: ${filePath}`);
    summary.missingFiles++;
    summary.details.push({
      file: relFile,
      slug: path.basename(relFile, '.md'),
      wordCount: 0,
      contentIssues: [`File does not exist: ${filePath}`],
      brokenLinks: []
    });
    return;
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(relFile, '.md');

  const frontmatterMatch = rawContent.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);
  const yamlText = frontmatterMatch ? frontmatterMatch[1] : '';
  const bodyText = frontmatterMatch ? frontmatterMatch[2] : rawContent;

  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;
  const brokenLinks = [];
  const contentIssues = [];

  const minWords = checkProse ? 500 : 400;
  if (wordCount < minWords) {
    contentIssues.push(`Thin content: Only ${wordCount} words (minimum required: ${minWords}+ words)`);
  }

  // Pronoun verification (case-sensitive 'I', case-insensitive 'me/my/our/we')
  const proseWithoutQuestions = bodyText
    .split(/\r?\n/)
    .filter(line => !/\?[\s*_)"']*$/.test(line))
    .join('\n');

  // Strip official US immigration form designations from pronoun checks using explicit allowlist
  // Allowed form numbers: I-20, I-94, I-129, I-134, I-485, I-765, I-797, I-901 (with optional letter suffix and optional plural 's')
  const formAllowlistRegex = /\bI-(?:20|94|129[A-Za-z]?|134|485|765|797[A-Za-z]?|901)s?\b/g;
  // In targeted mode (checkProse), check the full text (including question headings) so new articles have 0 pronouns.
  // In global legacy mode (!checkProse), preserve compatibility with legacy FAQ headings ending in '?'.
  const textToScanForPronouns = checkProse ? bodyText : proseWithoutQuestions;
  const proseForPronouns = textToScanForPronouns.replace(formAllowlistRegex, 'FORM');

  const forbiddenFound = [];
  if (/\bI\b/.test(proseForPronouns)) {
    forbiddenFound.push('I');
  }
  const lowP = checkProse ? ['me', 'my', 'our', 'we'] : ['me', 'my'];
  const otherMatches = proseForPronouns.match(new RegExp(`\\b(${lowP.join('|')})\\b`, 'gi'));
  if (otherMatches) {
    otherMatches.forEach(m => forbiddenFound.push(m.toLowerCase()));
  }

  if (forbiddenFound.length > 0) {
    contentIssues.push(`Forbidden first-person pronoun(s): ${[...new Set(forbiddenFound)].join(', ')}`);
  }

  // Fake editorial claims (body and frontmatter)
  const allAuditedText = checkProse ? `${rawContent}` : bodyText;
  const fakeMatch = allAuditedText.match(/\b(we (tested|did|verified|checked|tried|found)|our team|our test)\b/gi);
  if (fakeMatch) {
    contentIssues.push(`Forbidden fake editorial claim(s): ${[...new Set(fakeMatch)].join(', ')}`);
  }

  // Frontmatter pronoun checks when strict prose is enabled
  if (checkProse && yamlText) {
    const yamlForPronouns = yamlText.replace(formAllowlistRegex, 'FORM');
    const fmForbidden = [];
    if (/\bI\b/.test(yamlForPronouns)) fmForbidden.push('I');
    const fmOther = yamlForPronouns.match(new RegExp(`\\b(${lowP.join('|')})\\b`, 'gi'));
    if (fmOther) fmOther.forEach(m => fmForbidden.push(m.toLowerCase()));
    if (fmForbidden.length > 0) {
      contentIssues.push(`Forbidden frontmatter pronoun(s): ${[...new Set(fmForbidden)].join(', ')}`);
    }
  }

  // Strict prose: sentence length & paragraph length
  if (checkProse) {
    const lines = bodyText.split(/\r?\n/);
    let inCode = false;
    const longSentences = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const rawLine = lines[lineIdx];
      const trimmed = rawLine.trim();
      if (trimmed.startsWith('```')) {
        inCode = !inCode;
        continue;
      }
      if (inCode || !trimmed || trimmed.startsWith('#') || trimmed.startsWith('|')) continue;

      let cleanLine = trimmed.replace(/^(?:[-*>]|\d{1,2}[.)]|[a-zA-Z][.)])\s+/, '');
      cleanLine = cleanLine
        .replace(/\bNo\.(?=\s+[0-9A-Z])/g, 'No@DOT@')
        .replace(/(?:\b[A-Za-z]{1,4}\.){2,}/g, m => m.replace(/\./g, '@DOT@'))
        .replace(/\b(e\.g\.|i\.e\.|vs\.|approx\.|viz\.|Rs\.)/gi, m => m.replace(/\./g, '@DOT@'))
        .replace(/\b(etc|Ltd|Govt|Pvt|Prof|Dr)\.(?=\s+[a-z])/gi, m => m.replace(/\./g, '@DOT@'));

      const segments = cleanLine.split(/(?:[.?!]+[\s\r\n]+|:\s+)/);
      for (const seg of segments) {
        const s = seg.replace(/@DOT@/g, '.').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
        if (!s) continue;
        const words = s.split(/\s+/).filter(Boolean);
        if (words.length > 15) {
          longSentences.push({ line: lineIdx + 1, count: words.length, text: s });
        }
      }
    }

    if (longSentences.length > 0) {
      longSentences.forEach(ls => {
        contentIssues.push(`Sentence exceeds 15 words (line ${ls.line}, ${ls.count} words): "${ls.text.substring(0, 70)}..."`);
      });
    }

    // Paragraph length: continuous unbulleted prose paragraphs ≤ 3 lines
    const paragraphs = bodyText.split(/\n\s*\n/);
    paragraphs.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('|') || trimmed.startsWith('```')) return;

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      let currentProse = [];
      const proseBlocks = [];
      for (const line of lines) {
        if (/^(?:[-*+>]|\d{1,2}[.)]|[a-zA-Z][.)])\s+/.test(line)) {
          if (currentProse.length > 0) {
            proseBlocks.push(currentProse);
            currentProse = [];
          }
        } else {
          currentProse.push(line);
        }
      }
      if (currentProse.length > 0) proseBlocks.push(currentProse);

      proseBlocks.forEach(block => {
        if (block.length > 3) {
          contentIssues.push(`Paragraph exceeds 3 lines (${block.length} lines): "${block[0].substring(0, 60)}..."`);
        }
      });
    });
  }

  // Check takeaways in frontmatter
  if (!yamlText.includes('takeaways:')) {
    contentIssues.push(`Missing 'takeaways' key in frontmatter`);
  }

  // Check targetMoneyLink in frontmatter
  const moneyMatch = yamlText.match(/targetMoneyLink:\s*["']?([^"'\r\n]+)["']?/);
  const targetMoneyLink = moneyMatch ? moneyMatch[1].trim() : null;
  if (targetMoneyLink) {
    checkUrl(targetMoneyLink, 'frontmatter targetMoneyLink', brokenLinks);
  } else {
    contentIssues.push(`Missing 'targetMoneyLink' in frontmatter`);
  }

  // Check relatedScholarships in frontmatter
  const relatedMatch = yamlText.match(/relatedScholarships:\s*\n((?:\s*-\s*["']?[^"'\r\n]+["']?\s*\n?)*)/);
  if (relatedMatch) {
    const lines = relatedMatch[1].split('\n');
    lines.forEach(l => {
      const relSlug = l.replace(/^\s*-\s*["']?|["']?\s*$/g, '').trim();
      if (relSlug && !validDbSlugs.has(relSlug)) {
        const redirect = redirects.find(r => r.source === `/scholarships/${relSlug}`);
        if (redirect) {
          brokenLinks.push({
            context: 'frontmatter relatedScholarships',
            url: relSlug,
            reason: `Outdated slug: Redirects to '${redirect.destination}'`
          });
        } else {
          brokenLinks.push({
            context: 'frontmatter relatedScholarships',
            url: relSlug,
            reason: `Invalid DB scholarship slug '${relSlug}'`
          });
        }
      }
    });
  }

  // Find all inline links in markdown body: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRegex.exec(bodyText)) !== null) {
    const text = m[1];
    const url = m[2].trim();
    checkUrl(url, `Inline link "${text}"`, brokenLinks);
  }

  if (brokenLinks.length > 0) summary.articlesWithBrokenLinks++;
  if (contentIssues.length > 0) summary.articlesWithThinContent++;
  summary.totalBrokenLinks += brokenLinks.length;

  if (brokenLinks.length > 0 || contentIssues.length > 0) {
    summary.details.push({
      file: relFile,
      slug,
      wordCount,
      contentIssues,
      brokenLinks
    });
  }
});

function checkUrl(url, context, brokenLinks) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('indiascholarships.in')) {
      const pathOnly = url.replace(/https?:\/\/(www\.)?indiascholarships\.in/, '');
      checkInternalPath(pathOnly || '/', context, brokenLinks, url);
    }
    return;
  }

  if (url.startsWith('/')) {
    checkInternalPath(url, context, brokenLinks, url);
  } else if (!url.startsWith('#') && !url.startsWith('mailto:')) {
    brokenLinks.push({
      context,
      url,
      reason: `Relative URL '${url}' should be absolute path starting with '/'`
    });
  }
}

function matchAppRoute(routePath) {
  const appDir = path.join(projectRoot, 'app');
  const parts = routePath.split('/').filter(Boolean);
  let currentDir = appDir;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!fs.existsSync(currentDir)) return false;

    // Check direct directory match
    const directPath = path.join(currentDir, part);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
      currentDir = directPath;
      continue;
    }

    // Check dynamic param directory like [slug], [country], [degree], etc.
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const dynamicDir = entries.find(e => e.isDirectory() && e.name.startsWith('[') && e.name.endsWith(']'));
    if (dynamicDir) {
      currentDir = path.join(currentDir, dynamicDir.name);
      continue;
    }

    return false;
  }

  return fs.existsSync(path.join(currentDir, 'page.tsx')) ||
         fs.existsSync(path.join(currentDir, 'page.ts')) ||
         fs.existsSync(path.join(currentDir, 'route.ts'));
}

function checkInternalPath(pathStr, context, brokenLinks, rawUrl) {
  // Normalize path: strip fragment (#), query (?), and trailing slash
  let cleanPath = pathStr.split('#')[0].split('?')[0].trim();
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (!cleanPath) cleanPath = '/';

  // 1. Generic redirect check across next.config.ts
  const redirect = redirects.find(r => r.source === cleanPath);
  if (redirect) {
    brokenLinks.push({
      context,
      url: rawUrl,
      reason: `Internal link targets redirected URL '${cleanPath}' (redirects to ${redirect.destination}). Use direct canonical path instead.`
    });
    return;
  }

  // 2. Specific routes check
  if (cleanPath.startsWith('/scholarships/')) {
    const sSlug = cleanPath.replace('/scholarships/', '').split('/')[0];
    if (sSlug && !validDbSlugs.has(sSlug)) {
      brokenLinks.push({
        context,
        url: rawUrl,
        reason: `DB scholarship slug '${sSlug}' DOES NOT EXIST in database`
      });
    }
  } else if (cleanPath.startsWith('/articles/')) {
    const artSlug = cleanPath.replace('/articles/', '').split('/')[0];
    brokenLinks.push({
      context,
      url: rawUrl,
      reason: "Deprecated path: Link uses '/articles/" + artSlug + "'. Please update to '/guides/" + artSlug + "'."
    });
  } else if (cleanPath.startsWith('/pillars/')) {
    const pilSlug = cleanPath.replace('/pillars/', '').split('/')[0];
    brokenLinks.push({
      context,
      url: rawUrl,
      reason: "Deprecated path: Link uses '/pillars/" + pilSlug + "'. Please update to '/guides/" + pilSlug + "'."
    });
  } else if (cleanPath.startsWith('/guides/')) {
    const guideSlug = cleanPath.replace('/guides/', '').split('/')[0];
    const isValidGuide = portalSlugs.has(guideSlug) || validArticleSlugs.has(guideSlug) || validPillarSlugs.has(guideSlug);
    if (guideSlug && !isValidGuide) {
      brokenLinks.push({
        context,
        url: rawUrl,
        reason: "Guide slug '" + guideSlug + "' not found (must be a valid Portal Guide, Article, or Pillar)."
      });
    }
  } else if (cleanPath.startsWith('/study-abroad') || cleanPath.startsWith('/tools/')) {
    if (!matchAppRoute(cleanPath)) {
      brokenLinks.push({
        context,
        url: rawUrl,
        reason: `Route '${cleanPath}' DOES NOT EXIST in application`
      });
    }
  }
}

// Display results
summary.details.forEach(item => {
  const hasIssues = item.contentIssues.length > 0 || item.brokenLinks.length > 0;
  if (hasIssues) {
    console.log(`📄 Article: ${item.file} (${item.wordCount} words)`);
    item.contentIssues.forEach(ci => console.log(`   ⚠️ CONTENT ISSUE: ${ci}`));
    item.brokenLinks.forEach(bl => console.log(`   ❌ BROKEN LINK [${bl.context}]: ${bl.url} -> ${bl.reason}`));
    console.log('');
  }
});

console.log(`\n=======================================================`);
console.log(`  AUDIT SUMMARY`);
console.log(`=======================================================`);
console.log(`Total Articles Scanned: ${summary.totalArticles}`);
console.log(`Articles with Content Issues: ${summary.articlesWithThinContent}`);
console.log(`Articles with Broken Links: ${summary.articlesWithBrokenLinks}`);
console.log(`Total Broken Links Identified: ${summary.totalBrokenLinks}`);

if (db) db.close();

const shouldFail = (isStrict || isTargeted) && (summary.articlesWithThinContent > 0 || summary.articlesWithBrokenLinks > 0 || summary.missingFiles > 0);
if (shouldFail) {
  console.error(`\n❌ Strict Quality Check Failed: Found articles with formatting/link issues.`);
  process.exit(1);
} else {
  console.log('✅ Article Links Audit Passed!');
}
