const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const projectRoot = path.join(__dirname, '..');
const articlesDir = path.join(projectRoot, 'content', 'articles');
const dbPath = path.join(projectRoot, 'data', 'scholarships.db');

const db = new Database(dbPath);

// Fetch all DB slugs
const dbRows = db.prepare('SELECT slug, title FROM scholarships').all();
const validDbSlugs = new Map(dbRows.map(r => [r.slug, r.title]));

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
let portalSlugs = new Set(['nsp', 'e-kalyan-jharkhand', 'digital-gujarat-mysy', 'ssp-karnataka', 'aikyashree-west-bengal', 'talliki-vandanam-ap', 'mptaas-mmvy-mp', 'e-grantz-kerala']);
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

// Map of valid tool routes
const validToolRoutes = new Set(['/tools/eligibility-checker', '/tools/deadline-calendar', '/tools/income-calculator']);

const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

console.log(`=======================================================`);
console.log(`  AUDITING ${articleFiles.length} ARTICLES FOR CONTENT & BROKEN LINKS`);
console.log(`=======================================================\n`);

const summary = {
  totalArticles: articleFiles.length,
  articlesWithBrokenLinks: 0,
  articlesWithThinContent: 0,
  totalBrokenLinks: 0,
  details: []
};

articleFiles.forEach(file => {
  const filePath = path.join(articlesDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace(/\.md$/, '');

  const frontmatterMatch = rawContent.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);
  const yamlText = frontmatterMatch ? frontmatterMatch[1] : '';
  const bodyText = frontmatterMatch ? frontmatterMatch[2] : rawContent;

  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;
  const brokenLinks = [];
  const contentIssues = [];

  if (wordCount < 400) {
    contentIssues.push(`Thin content: Only ${wordCount} words (minimum recommended: 500+ words)`);
  }

  // Check first-person pronouns and fake claims
  const fpMatch = bodyText.match(/\b(I|me|my)\b/g);
  if (fpMatch) {
    contentIssues.push(`Forbidden first-person pronoun(s): ${[...new Set(fpMatch)].join(', ')}`);
  }
  const fakeMatch = bodyText.match(/\b(we (tested|did|verified|checked|tried|found)|our team|our test)\b/gi);
  if (fakeMatch) {
    contentIssues.push(`Forbidden fake editorial claim(s): ${[...new Set(fakeMatch)].join(', ')}`);
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
        // check redirects
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

  summary.details.push({
    file,
    slug,
    wordCount,
    contentIssues,
    brokenLinks
  });
});

function checkUrl(url, context, brokenLinks) {
  // Ignore external absolute http/https links unless we check them or if they are internal domains
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('indiascholarships.in')) {
      // Internal full URL
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

function checkInternalPath(pathStr, context, brokenLinks, rawUrl) {
  const cleanPath = pathStr.split('#')[0];

  if (cleanPath.startsWith('/scholarships/')) {
    const sSlug = cleanPath.replace('/scholarships/', '').split('/')[0];
    if (sSlug && !validDbSlugs.has(sSlug)) {
      const redirect = redirects.find(r => r.source === `/scholarships/${sSlug}`);
      if (redirect) {
        brokenLinks.push({
          context,
          url: rawUrl,
          reason: `Outdated scholarship slug '${sSlug}' (Redirects to ${redirect.destination})`
        });
      } else {
        brokenLinks.push({
          context,
          url: rawUrl,
          reason: `DB scholarship slug '${sSlug}' DOES NOT EXIST in database`
        });
      }
    }
  } else if (cleanPath.startsWith('/articles/')) {
    const artSlug = cleanPath.replace('/articles/', '').split('/')[0];
    if (artSlug && !fs.existsSync(path.join(articlesDir, `${artSlug}.md`))) {
      brokenLinks.push({
        context,
        url: rawUrl,
        reason: `Article file '${artSlug}.md' DOES NOT EXIST`
      });
    }
  } else if (cleanPath.startsWith('/guides/')) {
    const portalSub = cleanPath.replace('/guides/', '').split('/')[0];
    if (portalSub && !portalSlugs.has(portalSub)) {
      brokenLinks.push({
        context,
        url: rawUrl,
        reason: `Portal guide '${portalSub}' NOT FOUND in portalsData`
      });
    }
  } else if (cleanPath.startsWith('/tools/')) {
    // Check tool routes
    const isExactTool = validToolRoutes.has(cleanPath);
    const pagePath = path.join(projectRoot, 'app', cleanPath);
    const exists = fs.existsSync(pagePath) || fs.existsSync(`${pagePath}.tsx`) || fs.existsSync(path.join(pagePath, 'page.tsx'));
    if (!isExactTool && !exists) {
      brokenLinks.push({
        context,
        url: rawUrl,
        reason: `Tool page '${cleanPath}' DOES NOT EXIST`
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

db.close();
