/**
 * One-off migration of the old Study Abroad app (separate database) into the sa_* tables of the
 * main database. Run it on the local working copy, then push:
 *
 *   node scripts/pull-from-turso.js --target=staging
 *   node scripts/study-abroad/migrate-legacy.mts --legacy-db=<study_abroad.db> --programs=<programs.json>
 *   node scripts/check-data-formats.js
 *   node scripts/push-to-turso.js --target=staging
 *
 * What it does:
 *   - Parses every article once with the old app's parser (scripts/study-abroad/legacy) and stores
 *     clean fields: breadcrumb blocks, "Primary SEO Title" notes, internal labels and .md links are
 *     removed; title / SEO title / meta description / infobox / FAQs / related links become columns.
 *   - Prefixes internal links with /study-abroad (the old app used a basePath; the main app does not).
 *   - Merges the 6 duplicate universities into one record each (the richer one wins).
 *   - Does NOT copy scholarships: those live in the main `scholarships` table. It writes redirects for
 *     their old URLs and a Scout leads file for the ones the main site does not have yet.
 *   - Seeds sa_facts from the numbers that were hard-coded in the old app (no source yet → flagged).
 *
 * Outputs: lib/study-abroad/redirects.json, data/study-abroad/scout-leads.json,
 *          data/study-abroad/migration-report.md
 * Safe to re-run: rows are upserted by primary key.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseDossierMarkdown } from './legacy/legacyDossierParser.ts';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const { ensureStudyAbroadTables } = require('../lib/study-abroad-tables');

const APP_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (name: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const LEGACY_DB = arg('legacy-db');
const PROGRAMS_JSON = arg('programs');
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(APP_DIR, 'data', 'scholarships.db');
const OUT_DIR = path.join(APP_DIR, 'data', 'study-abroad');
const REDIRECTS_PATH = path.join(APP_DIR, 'lib', 'study-abroad', 'redirects.json');
if (!LEGACY_DB || !PROGRAMS_JSON) {
    console.error('Usage: node scripts/study-abroad/migrate-legacy.mts --legacy-db=<study_abroad.db> --programs=<programs.json>');
    process.exit(1);
}

// Duplicate university records in the old app: both slugs are live URLs today
const DUPLICATE_UNIVERSITIES = [
    ['karlsruhe-institute-of-technology', 'kit-karlsruhe-institute-of-technology'],
    ['tu-berlin', 'tu-berlin-technical-university'],
    ['northeastern-university-boston', 'neu-northeastern-university'],
    ['texas-a-m-university', 'tamu-texas-a-m'],
    ['university-of-texas-dallas', 'ut-dallas-utd'],
    ['university-at-buffalo-suny', 'suny-buffalo'],
];
// programs.json uses a few slugs that differ from the university records
const PROGRAM_UNIVERSITY_ALIASES: Record<string, string> = {
    'university-at-buffalo': 'university-at-buffalo-suny',
    'university-of-texas-arlington': 'ut-arlington-uta',
};
// Old Study Abroad scholarship slugs that exist on the main site under another slug
const SCHOLARSHIP_SLUG_MAP: Record<string, string> = {
    'kc-mahindra-scholarship': 'kc-mahindra-scholarship-for-post-graduate-studies-abroad',
    'jn-tata-endowment-loan-scholarship': 'jn-tata-endowment-for-higher-education',
    'stanford-knight-hennessy': 'knight-hennessy-scholars-program',
    'narotam-seksaria-scholarship': 'narotam-sekhsaria-postgraduate-scholarship',
};
// Internal documents the old app published as guide pages: kept as drafts, URLs sent to the real tool
const INTERNAL_GUIDES: Record<string, string> = {
    'archive_readme': '/study-abroad',
    'germany-bavarian-calculator-spec': '/study-abroad/tools/bavarian-grade-calculator',
    'germany-blocked-account-calc-spec': '/study-abroad/tools/blocked-account-calculator',
    'germany-ects-evaluator-spec': '/study-abroad/tools',
    'usa-wes-gpa-calculator-spec': '/study-abroad/tools/bavarian-grade-calculator',
    'usa-i20-proof-of-funds-calc-spec': '/study-abroad/tools/i20-cost-calculator',
    'usa-stem-opt-timeline-calc-spec': '/study-abroad/tools',
};
// Sections written for developers, not readers
const INTERNAL_SECTION = /Programmatic DB Component Schema|Technical SEO|Schema Markup/i;

// Numbers hard-coded in the old app's constants.ts. No source was recorded, so official_source and
// checked_at stay empty until someone (or the facts agent) confirms each one.
const SEED_FACTS = [
    ['germany.blocked_account.annual_eur', 'Blocked account deposit per year', 'germany', '11904', 'EUR'],
    ['germany.blocked_account.monthly_withdrawal_eur', 'Blocked account monthly withdrawal limit', 'germany', '992', 'EUR'],
    ['germany.blocked_account.buffer_eur', 'Recommended buffer for bank transfer fees', 'germany', '100', 'EUR'],
    ['germany.aps.fee_inr', 'APS India certificate fee', 'germany', '18000', 'INR'],
    ['germany.vfs.service_fee_inr', 'VFS Germany service fee', 'germany', '2300', 'INR'],
    ['germany.visa.national_fee_eur', 'German national (student) visa fee', 'germany', '75', 'EUR'],
    ['germany.fx.eur_inr', 'Exchange rate used for estimates (EUR → INR)', 'germany', '90.50', 'INR per EUR'],
    ['germany.blocked_account.expatrio_setup_eur', 'Expatrio blocked account setup fee', 'germany', '119', 'EUR'],
    ['germany.blocked_account.fintiba_setup_eur', 'Fintiba blocked account setup fee', 'germany', '159', 'EUR'],
    ['germany.blocked_account.coracle_setup_eur', 'Coracle blocked account setup fee', 'germany', '99', 'EUR'],
    ['germany.blocked_account.expatrio_monthly_eur', 'Expatrio blocked account monthly fee', 'germany', '9', 'EUR'],
    ['germany.blocked_account.fintiba_monthly_eur', 'Fintiba blocked account monthly fee', 'germany', '9.90', 'EUR'],
    ['germany.blocked_account.coracle_monthly_eur', 'Coracle blocked account monthly fee', 'germany', '0', 'EUR'],
    ['usa.visa.f1_mrv_fee_usd', 'US F-1 visa application (MRV) fee', 'usa', '185', 'USD'],
    ['usa.visa.sevis_i901_fee_usd', 'SEVIS I-901 fee (F-1)', 'usa', '350', 'USD'],
    ['usa.living.monthly_average_usd', 'Average monthly living cost used for estimates', 'usa', '1200', 'USD'],
    ['usa.fx.usd_inr', 'Exchange rate used for estimates (USD → INR)', 'usa', '83.80', 'INR per USD'],
];

const legacy = new Database(LEGACY_DB, { readonly: true });
const db = new Database(DB_PATH);
ensureStudyAbroadTables(db);
const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
// programs.json has no dates; a fixed date keeps re-runs from rewriting every row
const MIGRATED_AT = '2026-09-27 00:00:00';

const mainScholarshipSlugs = new Set(db.prepare('SELECT slug FROM scholarships').all().map((r: any) => r.slug));
const universitySlugRedirect = new Map<string, string>(); // dropped slug → kept slug (filled below)

// ---------------------------------------------------------------------------
// Links: the old app's paths had no /study-abroad prefix (Next.js basePath added it)
// ---------------------------------------------------------------------------
const SA_ROUTES = ['study-in', 'universities', 'visas', 'loans', 'tools', 'programs', 'program-detail'];
function scholarshipTarget(slug: string, country: string | null): string {
    const mapped = SCHOLARSHIP_SLUG_MAP[slug] || slug;
    if (mainScholarshipSlugs.has(mapped)) return `/scholarships/${mapped}`;
    return `/study-abroad/study-in/${country || 'germany'}/scholarships`;
}
const legacyScholarshipCountry = new Map<string, string>();
function fixHref(href: string): string {
    const m = href.match(/^\/([a-z-]+)\/([^)#?\s]*)(.*)$/);
    if (!m) return href;
    const [, route, rest, tail] = m;
    if (route === 'scholarships') {
        const slug = rest.replace(/\/$/, '');
        return scholarshipTarget(slug, legacyScholarshipCountry.get(slug) || null) + tail;
    }
    if (route === 'universities' && universitySlugRedirect.has(rest)) return `/study-abroad/universities/${universitySlugRedirect.get(rest)}${tail}`;
    if (SA_ROUTES.includes(route)) return `/study-abroad/${route}/${rest}${tail}`;
    return href;
}
const fixLinksInMarkdown = (md: string) => md
    .replace(/\]\((\/[^)\s]+)\)/g, (_, href) => `](${fixHref(href)})`)
    // Internal file codes in link text: "[DE-VISA-01: National Student Visa Guide]" → "[National Student Visa Guide]"
    .replace(/\[(?:DE|US)-[A-Z]+-\d+[a-z]?:?\s*/g, '[')
    // Hub pages describing their own database widgets to developers
    .replace(/^.*Programmatic DB (?:Component|Record).*\n?/gm, '');
const fixLinksDeep = (value: any): any =>
    typeof value === 'string' ? fixLinksInMarkdown(value.startsWith('/') ? fixHref(value) : value)
        : Array.isArray(value) ? value.map(fixLinksDeep)
            : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fixLinksDeep(v)])) : value;

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------
const JUNK_SUMMARY = /\.md\b|breadcrumb|primary seo title|target url route|\/Users\//i;
const report = { parsed: 0, warnings: [] as string[], samples: [] as { slug: string; before: string; after: string }[], programsWithoutUniversity: [] as string[] };

function parseArticle(entity: any, data: any) {
    const raw: string = data.markdown_body || '';
    if (!raw.trim()) return null;
    const p = parseDossierMarkdown(raw);
    report.parsed++;
    p.warnings.forEach(w => report.warnings.push(`${entity.slug}: ${w}`));
    const internal = p.sections.filter(s => INTERNAL_SECTION.test(s.heading));
    if (internal.length) report.warnings.push(`${entity.slug}: removed ${internal.length} developer section(s): ${internal.map(s => s.heading).join(', ')}`);
    const body = p.sections
        .filter(s => !INTERNAL_SECTION.test(s.heading))
        .map(s => (s.depth ? `${'#'.repeat(s.depth)} ${s.heading}\n\n` : '') + s.html.trim())
        .filter(Boolean)
        .join('\n\n');
    if (report.samples.length < 3 && /Navigation Breadcrumb|Primary SEO Title/.test(raw)) {
        report.samples.push({ slug: entity.slug, before: raw.slice(0, 900), after: body.slice(0, 600) });
    }
    return {
        title: p.title,
        seo_title: p.seoTitle,
        meta_description: p.metaDescription,
        who_for: p.whoIsThisFor,
        infobox_json: p.infobox ? JSON.stringify(fixLinksDeep(p.infobox)) : null,
        body_md: fixLinksInMarkdown(body),
        faq: p.faq,
        related_json: p.related.length ? JSON.stringify(fixLinksDeep(p.related)) : null,
        verified_date: p.verified.date,
    };
}

function mergeFaq(entity: any, parsedFaq: { q: string; a: string }[] = []) {
    let stored: any[] = [];
    try { stored = JSON.parse(entity.faq_json || '[]') || []; } catch { stored = []; }
    const items = [...stored.map((f: any) => ({ q: f.q || f.question, a: f.a || f.answer })), ...parsedFaq]
        .filter(f => f.q && f.a);
    const seen = new Set<string>();
    const unique = items.filter(f => !seen.has(f.q.toLowerCase()) && seen.add(f.q.toLowerCase()));
    return unique.length ? JSON.stringify(fixLinksDeep(unique)) : null;
}

function cleanSummary(entity: any, parsed: any): string | null {
    const summary = (entity.summary || '').trim();
    if (summary && !JUNK_SUMMARY.test(summary)) return summary;
    return parsed?.meta_description || null; // Phase 2 rewrites summaries; never keep internal notes
}

const entities = legacy.prepare('SELECT * FROM content_entities').all();
entities.filter((e: any) => e.entity_type === 'scholarship').forEach((e: any) => legacyScholarshipCountry.set(e.slug, e.country_slug));

// Universities: decide which duplicate survives before any links are rewritten
const unis = entities.filter((e: any) => e.entity_type === 'university');
const uniBySlug = new Map(unis.map((u: any) => [u.slug, u]));
// The record with the longer article keeps its URL; structured fields missing from it come from the other
const bodyLength = (u: any) => (JSON.parse(u.data_json || '{}').markdown_body || '').length;
const mergedUniversityData = new Map<string, any>();
const droppedUniversities: string[] = [];
for (const pair of DUPLICATE_UNIVERSITIES) {
    const present = pair.filter(s => uniBySlug.has(s));
    if (present.length < 2) continue;
    const [keep, drop] = present.sort((a, b) => bodyLength(uniBySlug.get(b)) - bodyLength(uniBySlug.get(a)));
    const keepData = JSON.parse(uniBySlug.get(keep).data_json || '{}');
    const dropData = JSON.parse(uniBySlug.get(drop).data_json || '{}');
    mergedUniversityData.set(keep, { ...dropData, ...Object.fromEntries(Object.entries(keepData).filter(([, v]) => v != null && v !== '')) });
    universitySlugRedirect.set(drop, keep);
    droppedUniversities.push(`${drop} → ${keep}`);
}

const upsert = (table: string, row: Record<string, any>) => {
    const cols = Object.keys(row);
    db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
        ON CONFLICT DO UPDATE SET ${cols.map(c => `${c} = excluded.${c}`).join(', ')}`).run(cols.map(c => row[c] ?? null));
};

const migrate = db.transaction(() => {
    for (const u of unis) {
        if (universitySlugRedirect.has(u.slug)) continue;
        const d = mergedUniversityData.get(u.slug) || JSON.parse(u.data_json || '{}');
        const parsed = parseArticle(u, d);
        const usd = u.country_slug === 'usa';
        upsert('sa_universities', {
            slug: u.slug,
            name: u.title,
            country: u.country_slug,
            city: d.location || null,
            summary: cleanSummary(u, parsed),
            seo_title: parsed?.seo_title, meta_description: parsed?.meta_description, who_for: parsed?.who_for,
            // The old data stored costs in USD fields for every country; only US figures are really in USD
            // (German universities show their euro costs in the article's fact box instead)
            tuition_per_year: usd ? d.tuition_usd ?? null : null, tuition_currency: usd && d.tuition_usd != null ? 'USD' : null,
            living_cost_per_year: usd ? d.living_usd ?? null : null, living_currency: usd && d.living_usd != null ? 'USD' : null,
            gre_required: d.gre_required != null ? String(d.gre_required) : null,
            stem_opt: usd && d.stem_opt != null ? String(d.stem_opt) : null,
            coop_program: d.coop_program != null ? String(d.coop_program) : null,
            ranking: d.ranking ?? d.world_ranking ?? null,
            acceptance_rate: d.acceptance_rate != null ? String(d.acceptance_rate) : null,
            application_deadlines: d.application_deadlines ? JSON.stringify(d.application_deadlines) : null,
            infobox_json: parsed?.infobox_json, body_md: parsed?.body_md,
            faq_json: mergeFaq(u, parsed?.faq), related_json: parsed?.related_json,
            official_source: d.official_source || null,
            checked_at: null, // the old app never recorded when a university was checked
            status: 'published',
            created_at: u.published_at || now, updated_at: u.updated_at || u.published_at || now,
        });
    }

    const KIND: Record<string, string> = { guide: 'guide', visa_guide: 'visa', financial_product: 'loan' };
    // archive_readme is instructions for AI agents, not content: not migrated (its URL still redirects)
    for (const g of entities.filter((e: any) => KIND[e.entity_type] && e.slug !== 'archive_readme')) {
        const d = JSON.parse(g.data_json || '{}');
        const parsed = parseArticle(g, d);
        const { markdown_body, official_source, ...structured } = d;
        upsert('sa_guides', {
            slug: g.slug,
            kind: KIND[g.entity_type],
            country: g.country_slug,
            title: parsed?.title && !JUNK_SUMMARY.test(g.title) ? g.title : (parsed?.title || g.title),
            summary: cleanSummary(g, parsed),
            seo_title: parsed?.seo_title, meta_description: parsed?.meta_description, who_for: parsed?.who_for,
            infobox_json: parsed?.infobox_json, body_md: parsed?.body_md,
            faq_json: mergeFaq(g, parsed?.faq), related_json: parsed?.related_json,
            data_json: Object.keys(structured).length ? JSON.stringify(structured) : null,
            official_source: official_source || null,
            checked_at: null,
            status: INTERNAL_GUIDES[g.slug] || g.country_slug === 'global' ? 'draft' : 'published',
            created_at: g.published_at || now, updated_at: g.updated_at || g.published_at || now,
        });
    }

    const programs = JSON.parse(fs.readFileSync(PROGRAMS_JSON, 'utf8'));
    const universityPages = new Set(db.prepare('SELECT slug FROM sa_universities').all().map((r: any) => r.slug));
    const programsWithoutUniversity: string[] = [];
    for (const p of programs) {
        const d = typeof p.data_json === 'string' ? JSON.parse(p.data_json || '{}') : (p.data_json || {});
        const alias = PROGRAM_UNIVERSITY_ALIASES[p.university_slug] || p.university_slug;
        const uni = universitySlugRedirect.get(alias) || alias;
        const hasUniversityPage = universityPages.has(uni);
        if (!hasUniversityPage) programsWithoutUniversity.push(`${p.title} → needs a university page "${uni}"`);
        const eur = d.tuition_eur != null || p.country_slug === 'germany';
        upsert('sa_programs', {
            id: p.id,
            slug: p.slug,
            university_slug: uni,
            country: p.country_slug,
            degree: String(p.degree_level || '').toLowerCase().replace(/[^a-z]/g, '') === 'msc' ? 'ms' : String(p.degree_level || '').toLowerCase().replace(/[^a-z]/g, ''),
            field: p.field_slug || null,
            title: p.title,
            tuition_per_year: (eur ? d.tuition_eur : d.tuition_usd) ?? null,
            tuition_currency: eur ? 'EUR' : 'USD',
            living_cost_per_year: (eur ? d.living_eur : d.living_usd) ?? null,
            living_currency: eur ? 'EUR' : 'USD',
            gpa_min: d.gpa_min != null ? String(d.gpa_min) : null,
            ielts_min: d.ielts_min ?? null,
            gre: d.gre_cutoff != null ? String(d.gre_cutoff) : null,
            location: d.location || null,
            application_deadlines: d.application_deadlines ? JSON.stringify(d.application_deadlines) : null,
            official_source: p.official_source || d.official_source || null,
            checked_at: p.last_verified || d.last_verified || null,
            // Drafts until the field is known and the university has a page (Phase 2)
            status: p.field_slug && hasUniversityPage ? 'published' : 'draft',
            created_at: p.updated_at || MIGRATED_AT, updated_at: p.updated_at || MIGRATED_AT,
        });
    }

    report.programsWithoutUniversity = programsWithoutUniversity;
    for (const [key, label, country, value, unit] of SEED_FACTS) {
        const exists = db.prepare('SELECT 1 FROM sa_facts WHERE key = ?').get(key);
        if (!exists) upsert('sa_facts', { key, label, country, value, unit, official_source: null, checked_at: null, recheck_after: null, notes: 'Carried over from the old Study Abroad app; source not yet recorded', updated_at: now });
    }
});
migrate();

// ---------------------------------------------------------------------------
// Redirects for old URLs, and Scout leads for scholarships the main site does not have
// ---------------------------------------------------------------------------
const redirects: { source: string; destination: string; permanent: boolean }[] = [
    { source: '/study-abroad/index', destination: '/study-abroad', permanent: true },
    { source: '/study-abroad/visas/germany-student-visa', destination: '/study-abroad/visas/germany-national-student-visa', permanent: true },
    { source: '/study-abroad/programs', destination: '/study-abroad/programs/germany/ms/computer-science', permanent: false },
];
const guideCountry = new Map(entities.map((e: any) => [e.slug, e.country_slug]));
for (const [slug, destination] of Object.entries(INTERNAL_GUIDES)) {
    redirects.push({ source: `/study-abroad/study-in/${guideCountry.get(slug) || 'global'}/${slug}`, destination, permanent: true });
}
for (const [drop, keep] of universitySlugRedirect) {
    redirects.push({ source: `/study-abroad/universities/${drop}`, destination: `/study-abroad/universities/${keep}`, permanent: true });
}
const leads: { name: string; provider: string; evidence: string; country: string }[] = [];
for (const s of entities.filter((e: any) => e.entity_type === 'scholarship')) {
    const target = scholarshipTarget(s.slug, s.country_slug);
    const onMainSite = target.startsWith('/scholarships/');
    redirects.push({ source: `/study-abroad/scholarships/${s.slug}`, destination: target, permanent: onMainSite });
    if (!onMainSite) {
        const d = JSON.parse(s.data_json || '{}');
        leads.push({ name: s.title, provider: '', evidence: d.official_source || `Previously listed at /study-abroad/scholarships/${s.slug}`, country: s.country_slug });
    }
}
fs.mkdirSync(path.dirname(REDIRECTS_PATH), { recursive: true });
fs.writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 2) + '\n');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'scout-leads.json'), JSON.stringify(leads, null, 2) + '\n');

// ---------------------------------------------------------------------------
// Report: what is left for Phase 2
// ---------------------------------------------------------------------------
const count = (sql: string) => (db.prepare(sql).get() as any).n;
const junk = (col: string, pattern: string) =>
    count(`SELECT (SELECT COUNT(*) FROM sa_universities WHERE ${col} LIKE '${pattern}') + (SELECT COUNT(*) FROM sa_guides WHERE ${col} LIKE '${pattern}') AS n`);
const lines = [
    '# Study Abroad migration report',
    '',
    `Run: ${now}. Source: old Study Abroad app database (${entities.length} records) + programs.json.`,
    '',
    '## Rows written',
    `- sa_universities: ${count('SELECT COUNT(*) n FROM sa_universities')} (duplicates merged: ${droppedUniversities.length})`,
    `- sa_guides: ${count("SELECT COUNT(*) n FROM sa_guides")} (guide ${count("SELECT COUNT(*) n FROM sa_guides WHERE kind='guide'")}, visa ${count("SELECT COUNT(*) n FROM sa_guides WHERE kind='visa'")}, loan ${count("SELECT COUNT(*) n FROM sa_guides WHERE kind='loan'")})`,
    `- sa_programs: ${count('SELECT COUNT(*) n FROM sa_programs')}`,
    `- sa_facts: ${count('SELECT COUNT(*) n FROM sa_facts')}`,
    `- Scholarships: not copied. ${redirects.filter(r => r.source.includes('/scholarships/') && r.permanent).length} redirect to the main site; ${leads.length} sent to the Scout as leads (data/study-abroad/scout-leads.json)`,
    '',
    '## Duplicate universities merged (dropped → kept)',
    ...droppedUniversities.map(d => `- ${d}`),
    '',
    '## Leftover problems in the migrated text (Phase 2)',
    `- "Navigation Breadcrumb" in body: ${junk('body_md', '%Navigation Breadcrumb%')}`,
    `- "Primary SEO Title" in body: ${junk('body_md', '%Primary SEO Title%')}`,
    `- Raw <div> in body: ${junk('body_md', '%<div%')}`,
    `- ".md" link or file name in body: ${junk('body_md', '%.md)%')}`,
    `- /Users/ paths: ${junk('body_md', '%/Users/%')}`,
    `- Universities with no article: ${count("SELECT COUNT(*) n FROM sa_universities WHERE body_md IS NULL OR body_md = ''")}`,
    `- Guides with no article (visa/loan pages built from structured data are expected): ${count("SELECT COUNT(*) n FROM sa_guides WHERE (body_md IS NULL OR body_md = '') AND status = 'published'")}`,
    `- Internal documents set to draft: ${Object.keys(INTERNAL_GUIDES).length}`,
    `- Boilerplate summary ("Complete 2026 guide to…"): ${junk('summary', 'Complete 2026 guide to%')}`,
    `- Missing summary: ${count("SELECT (SELECT COUNT(*) FROM sa_universities WHERE summary IS NULL) + (SELECT COUNT(*) FROM sa_guides WHERE summary IS NULL) AS n")}`,
    `- Facts without a source: ${count('SELECT COUNT(*) n FROM sa_facts WHERE official_source IS NULL')}`,
    `- Programs kept as draft because their university has no page (${report.programsWithoutUniversity.length}):`,
    ...report.programsWithoutUniversity.map(p => `  - ${p}`),
    '',
    `## Parser warnings (${report.warnings.length})`,
    ...report.warnings.slice(0, 60).map(w => `- ${w}`),
    '',
    '## Before / after samples',
    ...report.samples.flatMap(s => [`### ${s.slug}`, '', 'Before:', '```', s.before, '```', 'After:', '```', s.after, '```', '']),
];
fs.writeFileSync(path.join(OUT_DIR, 'migration-report.md'), lines.join('\n'));
console.log(lines.slice(0, 32).join('\n'));
console.log(`\nFull report: data/study-abroad/migration-report.md`);
