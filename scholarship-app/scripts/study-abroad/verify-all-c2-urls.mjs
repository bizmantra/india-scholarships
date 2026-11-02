import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostAllowed, htmlToText, normalizeText } from '../lib/source-verify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const dbPath = process.env.LOCAL_DB_PATH || resolve(root, 'data', 'scholarships.db');
const allowedPath = resolve(root, 'data', 'study-abroad', 'official-domains.json');
const proposalPath = resolve(here, 'proposals', 'c2-second-pass-sources-2026-11-02.json');

if (!existsSync(dbPath)) {
  console.error(`❌ Database not found at ${dbPath}`);
  process.exit(1);
}

if (!existsSync(proposalPath)) {
  console.error(`❌ Proposal file not found at ${proposalPath}`);
  process.exit(1);
}

console.log(`📂 Using database: ${dbPath}`);

const allowed = JSON.parse(readFileSync(allowedPath, 'utf8')).domains;
const proposal = JSON.parse(readFileSync(proposalPath, 'utf8'));

let dbGuides = [];
try {
  const rawGuides = execFileSync('sqlite3', ['-json', dbPath, 'SELECT slug, country, title, official_source FROM sa_guides ORDER BY country, slug;'], {
    encoding: 'utf8'
  });
  dbGuides = JSON.parse(rawGuides || '[]');
} catch (e) {
  console.error(`❌ Failed to query sa_guides from ${dbPath}: ${e.message}`);
  process.exit(1);
}

const guideMap = new Map(dbGuides.map(g => [g.slug, g]));
// Map of existing official_sources across the entire database to ensure global 1-to-1 uniqueness
const existingSourcesMap = new Map();
for (const g of dbGuides) {
  if (g.official_source && g.official_source.trim() !== '') {
    existingSourcesMap.set(g.official_source.trim(), g.slug);
  }
}

function checkUrlAndBody(url, expectedTerms) {
  if (!Array.isArray(expectedTerms) || expectedTerms.length < 2) {
    return { ok: false, error: 'expected_terms must be an array of at least 2 specific phrases' };
  }

  // Reject overlapping phrases where one is a substring of another
  for (let i = 0; i < expectedTerms.length; i++) {
    for (let j = 0; j < expectedTerms.length; j++) {
      if (i !== j) {
        const termA = normalizeText(expectedTerms[i]);
        const termB = normalizeText(expectedTerms[j]);
        if (termA.includes(termB) || termB.includes(termA)) {
          return { ok: false, error: `Overlapping phrases not permitted: "${expectedTerms[i]}" overlaps with "${expectedTerms[j]}"` };
        }
      }
    }
  }

  try {
    let rawOut = '';
    const curlArgs = [
      '-s',
      '-L',
      '--max-redirs', '5',
      '--max-time', '15',
      '-w', '\n__CURL_METADATA__:%{http_code}:%{url_effective}'
    ];

    try {
      rawOut = execFileSync('curl', [...curlArgs, url], {
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024
      });
    } catch {
      // Retry with browser user-agent if initial curl errors
      rawOut = execFileSync('curl', [
        ...curlArgs,
        '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        url
      ], {
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024
      });
    }

    const marker = '\n__CURL_METADATA__:';
    const splitIdx = rawOut.lastIndexOf(marker);
    if (splitIdx === -1) {
      return { ok: false, error: 'Could not extract metadata from curl output' };
    }

    const meta = rawOut.slice(splitIdx + marker.length).trim().split(':');
    let code = meta[0];
    let finalUrl = meta.slice(1).join(':') || url;

    // If initial attempt returned 403, retry with standard browser user-agent
    if (code === '403') {
      try {
        rawOut = execFileSync('curl', [
          ...curlArgs,
          '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          url
        ], {
          encoding: 'utf8',
          maxBuffer: 20 * 1024 * 1024
        });
        const retrySplitIdx = rawOut.lastIndexOf(marker);
        if (retrySplitIdx !== -1) {
          const retryMeta = rawOut.slice(retrySplitIdx + marker.length).trim().split(':');
          code = retryMeta[0];
          finalUrl = retryMeta.slice(1).join(':') || url;
        }
      } catch (e) {
        return { ok: false, error: `Retry with UA failed: ${e.message}` };
      }
    }

    if (code !== '200') {
      return { ok: false, error: `HTTP ${code}` };
    }

    // Verify final redirected URL is still within allowlist
    if (!hostAllowed(finalUrl, allowed)) {
      return { ok: false, error: `Redirected to disallowed host: ${finalUrl}` };
    }

    // Verify visible page text length >= 200 chars (prevents empty JS shells or soft-404s)
    const rawHtml = rawOut.slice(0, splitIdx);
    const visibleText = normalizeText(htmlToText(rawHtml));
    if (visibleText.length < 200) {
      return { ok: false, error: `Visible page text is too short (${visibleText.length} chars < 200 min)` };
    }

    // Verify ALL expected terms are present in normalized visible body text
    const missing = expectedTerms.filter(term => !visibleText.includes(normalizeText(term)));
    if (missing.length > 0) {
      return { ok: false, error: `Missing required terms in page body: ${missing.join(', ')}` };
    }

    return { ok: true, finalUrl };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function run() {
  console.log(`🔍 Verifying ${proposal.changes.length} proposals from JSON against DB, allowlist, live HTTP, and normalized body content...`);
  const failures = [];
  const verified = [];
  const seenUrls = new Set();
  const seenSlugs = new Set();

  for (const change of proposal.changes) {
    const slug = change.key;
    const url = change.fields?.official_source;
    const expectedTerms = change.expected_terms;

    // 1. Mandatory expected_terms assertion (minimum 2 terms)
    if (!Array.isArray(expectedTerms) || expectedTerms.length < 2) {
      failures.push({ slug, url, reason: `Mandatory expected_terms must have at least 2 specific phrases` });
      continue;
    }

    // 2. Proposal consistency: source must match fields.official_source
    if (change.source !== url) {
      failures.push({ slug, url, reason: `change.source (${change.source}) does not match fields.official_source (${url})` });
      continue;
    }

    // 3. Uniqueness checks within proposal
    if (seenSlugs.has(slug)) {
      failures.push({ slug, url, reason: `Duplicate slug in proposal JSON: ${slug}` });
      continue;
    }
    seenSlugs.add(slug);

    if (seenUrls.has(url)) {
      failures.push({ slug, url, reason: `URL is duplicated across guides in proposal: ${url}` });
      continue;
    }
    seenUrls.add(url);

    // 4. DB existence check
    const guide = guideMap.get(slug);
    if (!guide) {
      failures.push({ slug, url, reason: `Slug does NOT exist in sa_guides database table` });
      continue;
    }

    // 5. Global 1-to-1 uniqueness check across entire database
    if (existingSourcesMap.has(url) && existingSourcesMap.get(url) !== slug) {
      failures.push({ slug, url, reason: `URL already used in DB by another guide: ${existingSourcesMap.get(url)}` });
      continue;
    }

    // 6. Overwrite check: allow null, empty, or already-applied identical official_source
    if (guide.official_source && guide.official_source.trim() !== '' && guide.official_source.trim() !== url.trim()) {
      failures.push({ slug, url, reason: `Guide already has a different official_source: ${guide.official_source}` });
      continue;
    }

    // 7. Allowlist domain check
    if (!hostAllowed(url, allowed)) {
      failures.push({ slug, url, reason: `Host is NOT in official-domains.json` });
      continue;
    }

    // 8. Live HTTP check with redirect validation and normalized body keyword verification
    const checkResult = checkUrlAndBody(url, expectedTerms);
    if (!checkResult.ok) {
      failures.push({ slug, url, reason: `Live check failed: ${checkResult.error}` });
      continue;
    }

    verified.push({ slug, url });
    process.stdout.write('.');
  }

  console.log(`\n\n📊 Audit Complete:`);
  console.log(`   ✅ Verified clean: ${verified.length}`);
  console.log(`   ❌ Failures: ${failures.length}`);

  if (failures.length > 0) {
    console.error(`\nDetailed Failures:`);
    for (const f of failures) {
      console.error(` - [${f.slug}]: ${f.reason} (${f.url})`);
    }
    process.exit(1);
  }

  console.log(`\n🎉 All ${verified.length} guides in proposal JSON successfully verified!\n`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
