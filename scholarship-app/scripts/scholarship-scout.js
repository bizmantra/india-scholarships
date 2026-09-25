/**
 * New Scholarship Scout
 *
 * Weekly agent that discovers scholarships we do NOT yet list:
 *   1. Scans Google News RSS for newly announced / newly opened scholarships (last 7 days).
 *   2. Asks Gemini to pick out distinct scholarship names that are missing from our database.
 *   3. Researches each candidate with Gemini + Google Search grounding into a full record.
 *   4. Writes each candidate to data/scout/candidates/<slug>.json for human review.
 *
 * Nothing is written to the database here. Candidates go live only after the weekly
 * pull request is merged (see scripts/publish-scout-approved.js).
 *
 * Usage: node scripts/scholarship-scout.js [--dry-run] [--max=8]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const Parser = require('rss-parser');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const maxArg = args.find(a => a.startsWith('--max='));
const MAX_CANDIDATES = maxArg ? parseInt(maxArg.split('=')[1], 10) : 8;

const DB_PATH = path.join(__dirname, '..', 'data', 'scholarships.db');
const SCOUT_DIR = path.join(__dirname, '..', 'data', 'scout');
const CANDIDATES_DIR = path.join(SCOUT_DIR, 'candidates');
const PUBLISHED_DIR = path.join(SCOUT_DIR, 'published');
const SEEN_PATH = path.join(SCOUT_DIR, 'seen-links.json');
const REPORT_PATH = path.join(SCOUT_DIR, 'scout-report.md');

// Discovery feeds: broad "new / applications open" queries, limited to the last 7 days.
const gnews = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:7d')}&hl=en-IN&gl=IN&ceid=IN:en`;
const FEEDS = [
    { name: 'New scholarships launched', url: gnews('new scholarship launched India students') },
    { name: 'Applications open', url: gnews('scholarship applications open 2026 India') },
    { name: 'State government schemes', url: gnews('state government scholarship scheme announced students') },
    { name: 'Central government schemes', url: gnews('central government scholarship scheme ministry students') },
    { name: 'Corporate CSR scholarships', url: gnews('CSR scholarship programme students India apply') },
    { name: 'Girls & women scholarships', url: gnews('scholarship for girls India apply online') },
    { name: 'University & merit scholarships', url: gnews('merit scholarship university India announced') },
    { name: 'Study abroad for Indians', url: gnews('fully funded scholarship Indian students abroad 2026') },
];

const parser = new Parser();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .slice(0, 90);
}

// Normalised word set used for fuzzy duplicate detection
const STOP_WORDS = new Set(['scholarship', 'scholarships', 'scheme', 'yojana', 'the', 'for', 'of', 'and', 'program', 'programme', 'students', 'india', '2025', '2026', '2027']);
function titleTokens(text) {
    return new Set(
        (text || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w))
    );
}
function similarity(a, b) {
    const A = titleTokens(a), B = titleTokens(b);
    if (A.size === 0 || B.size === 0) return 0;
    let overlap = 0;
    for (const w of A) if (B.has(w)) overlap++;
    return overlap / Math.min(A.size, B.size);
}

function readJson(filePath, fallback) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return fallback; }
}

function listJsonTitles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
        const rec = readJson(path.join(dir, f), {});
        return { title: rec.title || f, slug: rec.slug || f.replace(/\.json$/, '') };
    });
}

function extractJson(text) {
    let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start === -1 || end === -1) throw new Error('No JSON found in Gemini response');
    return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGemini(prompt, { grounded }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    if (grounded) payload.tools = [{ googleSearch: {} }];

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
    }
    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) throw new Error('No response candidates returned from Gemini');
    return extractJson(parts.map(p => p.text || '').join(''));
}

// Step 1: collect fresh headlines from all feeds
async function collectHeadlines(seenLinks) {
    const headlines = [];
    const seenTitles = new Set();
    for (const feed of FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            let added = 0;
            for (const item of feedData.items.slice(0, 20)) {
                const key = (item.title || '').toLowerCase();
                if (!item.link || seenLinks.has(item.link) || seenTitles.has(key)) continue;
                seenTitles.add(key);
                headlines.push({ feed: feed.name, title: item.title, link: item.link, pubDate: item.pubDate || '' });
                added++;
            }
            console.log(`📰 ${feed.name}: ${feedData.items.length} items, ${added} new`);
        } catch (error) {
            console.error(`❌ Error fetching feed ${feed.name}: ${error.message}`);
        }
    }
    return headlines;
}

// Step 2: triage headlines into distinct scholarship names we don't have
async function triageHeadlines(headlines, knownTitles) {
    const headlineList = headlines.map((h, i) => `${i}. ${h.title}`).join('\n');
    const knownList = knownTitles.map(t => `- ${t}`).join('\n');

    const prompt = `You are the research lead for IndiaScholarships.in, a directory of scholarships for Indian students.

Below are this week's news headlines, followed by the scholarships we ALREADY list.

Identify specific, named scholarship programmes mentioned in the headlines that:
- are open to Indian students (in India or abroad),
- are a real, named scholarship/fellowship/fee-waiver scheme (not generic news, exam results, loans, or coaching ads),
- are NOT already in our list (treat renamed/abbreviated versions of a listed scholarship as already listed).

HEADLINES:
${headlineList}

ALREADY LISTED:
${knownList}

Return at most ${MAX_CANDIDATES * 2} items, most useful to students first, as a JSON array:
[{"name": "Official scholarship name", "provider": "Organisation offering it", "headline_ids": [0, 3]}]
Return [] if nothing qualifies. Provide ONLY the raw JSON array.`;

    const result = await callGemini(prompt, { grounded: false });
    return Array.isArray(result) ? result : [];
}

// Step 3: research one candidate into a full database-ready record
async function researchCandidate(candidate, newsLinks) {
    const prompt = `Research the "${candidate.name}" scholarship offered by ${candidate.provider || 'unknown provider'} for Indian students.
Use Google Search and rely ONLY on official sources (government portals, provider websites, university pages). News articles for context: ${newsLinks.join(', ')}

If you cannot confirm it is a real scholarship currently or recently accepting applications from Indian students, set "is_valid" to false and explain in "rejection_reason".
Never guess numbers, dates or URLs. Use null (or an empty string) when a fact is not stated by an official source.

Respond with a single JSON object:
{
  "is_valid": true,
  "rejection_reason": "",
  "confidence": "High | Medium | Low",
  "title": "Official scholarship name",
  "provider": "Organisation name",
  "provider_type": "Government | Corporate | Private | Trust | University | Study Abroad",
  "state": "Indian state it is restricted to, or 'All India'",
  "level": "e.g. 'Class 11-12, UG, PG'",
  "caste": "e.g. 'All', 'SC, ST, OBC'",
  "gender": "All | Female | Male",
  "course_stream": "e.g. 'All Courses', 'Engineering, Medical'",
  "amount_annual": 50000,
  "amount_min": 10000,
  "amount_description": "Plain-English description of the award amount",
  "benefits": "What the scholarship covers",
  "income_limit": 250000,
  "min_marks": 60,
  "age_limit": "e.g. 'Below 25 years' or 'Not Specified'",
  "residency_requirement": "e.g. 'Permanent resident of Kerala'",
  "docs_needed": ["Aadhaar Card", "Income Certificate"],
  "application_mode": "Online | Offline",
  "apply_url": "Official application URL",
  "deadline": "YYYY-MM-DD student application deadline, or empty string if unknown",
  "deadline_description": "e.g. 'Applications close 31 October 2026'",
  "always_open": false,
  "step_guide": "1. Step one\\n2. Step two\\n3. Step three",
  "selection": "How recipients are selected",
  "renewal": "Renewal rules, or 'One-time award'",
  "official_source": "Official page URL that confirms these details",
  "helpline": "Official phone/email if published",
  "intro_seo": "2 short sentences (max 15 words each) explaining who it is for and what it gives",
  "faq_json": [{"question": "...", "answer": "..."}],
  "keywords": ["search phrase 1", "search phrase 2"],
  "tags": ["government", "state-name"],
  "scholarship_scope": "Domestic | International",
  "country_of_study": "India or destination country"
}
Write in simple English with short sentences. Provide 3 FAQs. Provide ONLY the raw JSON object.`;

    return callGemini(prompt, { grounded: true });
}

function isDuplicate(title, existing) {
    const slug = slugify(title);
    return existing.find(e => e.slug === slug || similarity(title, e.title) >= 0.85);
}

// Mirrors the main rules in content-quality-audit.js so reviewers see gaps before approving
function qualityGaps(r) {
    const gaps = [];
    const international = (r.scholarship_scope || '').toLowerCase() === 'international';
    if (!r.deadline && !r.always_open) gaps.push('no exact deadline');
    if (!r.apply_url) gaps.push('no apply link');
    if (international) return gaps;
    if (!r.amount_annual) gaps.push('no annual amount');
    if (!r.amount_min) gaps.push('no minimum amount');
    if (!r.selection || r.selection.length < 15) gaps.push('thin selection criteria');
    if (!r.renewal || r.renewal.length < 15) gaps.push('thin renewal policy');
    if (!r.step_guide || r.step_guide.length < 20) gaps.push('thin step guide');
    if (r.docs_needed.length === 0) gaps.push('no documents list');
    if (!r.helpline) gaps.push('no helpline');
    if (r.faq_json.length === 0) gaps.push('no FAQs');
    return gaps;
}

function buildReport(accepted, rejected, headlineCount) {
    const today = new Date().toISOString().slice(0, 10);
    const lines = [
        `# 🔭 New Scholarship Scout — ${today}`,
        '',
        `Scanned **${headlineCount}** fresh news headlines. Found **${accepted.length}** scholarship(s) not yet on the site.`,
        '',
        '### How to review',
        '- **Approve all:** merge this pull request. The scholarships go live automatically within a few minutes.',
        '- **Reject one:** open the *Files changed* tab, click `⋯` on that candidate\'s file → *Delete file*, then merge.',
        '- **Fix a detail:** in *Files changed*, click `⋯` → *Edit file*, correct the value, commit, then merge.',
        '- **Reject all:** close this pull request.',
        '',
    ];

    accepted.forEach((c, i) => {
        const r = c.record;
        lines.push(
            `## ${i + 1}. ${r.title}`,
            '',
            '| Field | Value |',
            '|---|---|',
            `| Provider | ${r.provider || '—'} (${r.provider_type || '—'}) |`,
            `| For | ${[r.level, r.state, r.gender !== 'All' ? r.gender : null, r.caste && r.caste !== 'All' ? r.caste : null].filter(Boolean).join(' · ') || '—'} |`,
            `| Amount | ${r.amount_description || (r.amount_annual ? `₹${r.amount_annual}` : '—')} |`,
            `| Deadline | ${r.deadline || r.deadline_description || '—'} |`,
            `| Official source | ${r.official_source || '—'} |`,
            `| Apply link | ${r.apply_url || '—'} |`,
            `| AI confidence | **${c.confidence}** |`,
            `| Missing info | ${qualityGaps(r).join(', ') || 'None ✅'} |`,
            `| Found via | ${c.news.map(n => `[${n.title.replace(/[|\[\]]/g, ' ').slice(0, 70)}](${n.link})`).join('<br>')} |`,
            `| File | \`scholarship-app/data/scout/candidates/${r.slug}.json\` |`,
            ''
        );
    });

    if (rejected.length > 0) {
        lines.push('<details><summary>Skipped by the scout (' + rejected.length + ')</summary>', '');
        rejected.forEach(r => lines.push(`- **${r.name}** — ${r.reason}`));
        lines.push('', '</details>', '');
    }

    lines.push('_Always double-check amounts, deadlines and eligibility against the official source before merging._');
    return lines.join('\n');
}

// Coerce Gemini output into the scholarships table's column shapes
function toRecord(data) {
    const int = v => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Math.round(Number(v)));
    const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(data.deadline || '') ? data.deadline : '';
    const slug = slugify(data.title);
    return {
        id: slug,
        title: data.title.trim(),
        slug,
        provider: data.provider || null,
        provider_type: data.provider_type || 'Government',
        state: data.state || 'All India',
        level: data.level || null,
        caste: data.caste || 'All',
        gender: data.gender || 'All',
        course_stream: data.course_stream || 'All Courses',
        app_type: data.application_mode || 'Online',
        amount_annual: int(data.amount_annual),
        amount_min: int(data.amount_min),
        amount_description: data.amount_description || null,
        benefits: data.benefits || null,
        income_limit: int(data.income_limit),
        min_marks: int(data.min_marks),
        age_limit: data.age_limit || 'Not Specified',
        residency_requirement: data.residency_requirement || null,
        docs_needed: arr(data.docs_needed),
        application_mode: data.application_mode || 'Online',
        apply_url: data.apply_url || data.official_source,
        deadline,
        deadline_description: data.deadline_description || null,
        always_open: data.always_open ? 1 : 0,
        step_guide: data.step_guide || null,
        selection: data.selection || null,
        renewal: data.renewal || null,
        official_source: data.official_source,
        helpline: data.helpline || null,
        intro_seo: data.intro_seo || null,
        faq_json: arr(data.faq_json),
        keywords: arr(data.keywords),
        tags: arr(data.tags),
        scholarship_type: data.provider_type || 'Government',
        scholarship_scope: data.scholarship_scope || 'Domestic',
        country_of_study: data.country_of_study || 'India',
    };
}

async function runScout() {
    console.log('🔭 New Scholarship Scout');
    console.log(`- Dry Run: ${dryRun}`);
    console.log(`- Max candidates: ${MAX_CANDIDATES}\n`);

    fs.mkdirSync(CANDIDATES_DIR, { recursive: true });

    const db = new Database(DB_PATH, { readonly: true });
    const dbRows = db.prepare('SELECT title, slug FROM scholarships').all();
    db.close();

    // Anything already live, already awaiting review, or already published counts as "known"
    const existing = [...dbRows, ...listJsonTitles(CANDIDATES_DIR), ...listJsonTitles(PUBLISHED_DIR)];
    const seenLinks = new Set(readJson(SEEN_PATH, []));

    const headlines = await collectHeadlines(seenLinks);
    console.log(`\n🗞️  ${headlines.length} fresh headlines to triage.`);

    const accepted = [];
    const rejected = [];

    if (headlines.length > 0) {
        const shortlist = await triageHeadlines(headlines, existing.map(e => e.title));
        console.log(`🧐 Gemini shortlisted ${shortlist.length} possible new scholarships.\n`);

        for (const item of shortlist) {
            if (accepted.length >= MAX_CANDIDATES) break;
            if (!item?.name) continue;

            const dup = isDuplicate(item.name, existing);
            if (dup) {
                rejected.push({ name: item.name, reason: `Already listed as "${dup.title}"` });
                continue;
            }

            const news = (item.headline_ids || []).map(i => headlines[i]).filter(Boolean);
            console.log(`🔍 Researching: "${item.name}" (${item.provider || 'unknown provider'})`);
            try {
                const data = await researchCandidate(item, news.map(n => n.link));
                if (!data.is_valid) {
                    rejected.push({ name: item.name, reason: data.rejection_reason || 'Could not be verified' });
                    console.log(`   ⏭️  Rejected: ${data.rejection_reason}`);
                } else if (!data.title || !/^https?:\/\//.test(data.official_source || '')) {
                    rejected.push({ name: item.name, reason: 'No official source URL found' });
                    console.log('   ⏭️  Rejected: no official source');
                } else if (data.confidence === 'Low') {
                    rejected.push({ name: item.name, reason: 'Low confidence in researched details' });
                    console.log('   ⏭️  Rejected: low confidence');
                } else {
                    const record = toRecord(data);
                    const researchedDup = isDuplicate(record.title, existing);
                    if (researchedDup) {
                        rejected.push({ name: record.title, reason: `Already listed as "${researchedDup.title}"` });
                        console.log(`   ⏭️  Duplicate of "${researchedDup.title}"`);
                    } else {
                        accepted.push({ record, confidence: data.confidence || 'Medium', news });
                        existing.push({ title: record.title, slug: record.slug });
                        console.log(`   ✅ Candidate ready: ${record.slug}`);
                    }
                }
            } catch (error) {
                rejected.push({ name: item.name, reason: `Research failed: ${error.message.slice(0, 120)}` });
                console.error(`   ❌ Research failed: ${error.message}`);
            }
            await sleep(6000); // respect Gemini rate limits
        }
    }

    const report = buildReport(accepted, rejected, headlines.length);
    console.log('\n' + report);

    if (dryRun) {
        console.log('\n🧪 Dry run: no files written.');
        return;
    }

    for (const { record, confidence, news } of accepted) {
        const file = { ...record, _scout: { confidence, found_via: news.map(n => n.link), discovered_at: new Date().toISOString() } };
        fs.writeFileSync(path.join(CANDIDATES_DIR, `${record.slug}.json`), JSON.stringify(file, null, 2) + '\n');
    }
    // Remember processed headlines so they are not re-triaged next week (keep the list bounded)
    const allSeen = [...seenLinks, ...headlines.map(h => h.link)].slice(-3000);
    fs.writeFileSync(SEEN_PATH, JSON.stringify(allSeen, null, 2) + '\n');
    fs.writeFileSync(REPORT_PATH, report + '\n');

    // Expose result count to GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `candidates=${accepted.length}\n`);
    }
    console.log(`\n🏁 Scout complete: ${accepted.length} candidate(s) written to data/scout/candidates/`);
}

runScout().catch(error => {
    console.error(`❌ Scout failed: ${error.message}`);
    process.exit(1);
});
