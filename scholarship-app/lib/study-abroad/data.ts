// Study Abroad data access (/study-abroad section). Tables are described in
// scripts/lib/study-abroad-tables.js. Only 'published' rows are ever shown.
import { getClient } from '@/lib/db';

// launched:false countries are hidden: isCountry() rejects them, so their routes 404
// and they stay out of static params, sitemap and nav until the launch checklist passes.
export const COUNTRIES = {
    germany: { slug: 'germany', name: 'Germany', currency: 'EUR', scholarshipCountry: 'Germany', launched: true },
    usa: { slug: 'usa', name: 'USA', currency: 'USD', scholarshipCountry: 'United States', launched: true },
    uk: { slug: 'uk', name: 'UK', currency: 'GBP', scholarshipCountry: 'United Kingdom', launched: false },
    canada: { slug: 'canada', name: 'Canada', currency: 'CAD', scholarshipCountry: 'Canada', launched: false },
    australia: { slug: 'australia', name: 'Australia', currency: 'AUD', scholarshipCountry: 'Australia', launched: false },
    ireland: { slug: 'ireland', name: 'Ireland', currency: 'EUR', scholarshipCountry: 'Ireland', launched: false },
} as const;
export type CountrySlug = keyof typeof COUNTRIES;
export const LAUNCHED_COUNTRIES = (Object.keys(COUNTRIES) as CountrySlug[]).filter(c => COUNTRIES[c].launched);
export const isCountry = (slug: string): slug is CountrySlug => slug in COUNTRIES && COUNTRIES[slug as CountrySlug].launched;

export interface SaUniversity {
    slug: string; name: string; country: CountrySlug; city: string | null; summary: string | null;
    seo_title: string | null; meta_description: string | null; who_for: string | null;
    tuition_per_year: number | null; tuition_currency: string | null;
    living_cost_per_year: number | null; living_currency: string | null;
    gre_required: string | null; stem_opt: string | null; coop_program: string | null;
    ranking: string | null; acceptance_rate: string | null; application_deadlines: string | null;
    infobox_json: string | null; body_md: string | null; faq_json: string | null; related_json: string | null;
    official_source: string | null; checked_at: string | null; updated_at: string | null;
}
export interface SaGuide {
    slug: string; kind: 'guide' | 'visa' | 'loan'; country: CountrySlug; title: string; summary: string | null;
    seo_title: string | null; meta_description: string | null; who_for: string | null;
    infobox_json: string | null; body_md: string | null; faq_json: string | null; related_json: string | null;
    data_json: string | null; official_source: string | null; checked_at: string | null; updated_at: string | null;
}
export interface SaProgram {
    id: string; slug: string; university_slug: string; country: CountrySlug; degree: string; field: string | null;
    title: string; tuition_per_year: number | null; tuition_currency: string | null;
    living_cost_per_year: number | null; living_currency: string | null; gpa_min: string | null;
    ielts_min: number | null; gre: string | null; location: string | null; application_deadlines: string | null;
    official_source: string | null; checked_at: string | null; university_name?: string;
    // Article fields (IS-158); absent on databases not yet migrated with scripts/study-abroad/add-columns.mjs
    summary?: string | null; seo_title?: string | null; meta_description?: string | null; body_md?: string | null; faq_json?: string | null;
    language?: string | null; duration?: string | null; intakes?: string | null; english_requirements?: string | null;
    application_portal?: string | null; application_fee?: string | null; stem_designated?: string | null; updated_at?: string | null;
}
export interface SaFact {
    key: string; label: string; country: string | null; value: string; unit: string | null;
    official_source: string | null; checked_at: string | null;
}

async function query<T>(sql: string, args: (string | number | null)[] = []): Promise<T[]> {
    const res = await getClient().execute({ sql, args });
    return res.rows.map((r: Record<string, unknown>) => ({ ...r })) as unknown as T[];
}

export const getUniversities = (country?: CountrySlug) =>
    query<SaUniversity>(`SELECT * FROM sa_universities WHERE status = 'published' ${country ? 'AND country = ?' : ''} ORDER BY name`, country ? [country] : []);
export const getUniversity = async (slug: string) =>
    (await query<SaUniversity>(`SELECT * FROM sa_universities WHERE slug = ? AND status = 'published'`, [slug]))[0] || null;

export const getGuides = (kind: SaGuide['kind'], country?: CountrySlug) =>
    query<SaGuide>(`SELECT * FROM sa_guides WHERE status = 'published' AND kind = ? ${country ? 'AND country = ?' : ''} ORDER BY title`, country ? [kind, country] : [kind]);
export const getGuide = async (kind: SaGuide['kind'], slug: string) =>
    (await query<SaGuide>(`SELECT * FROM sa_guides WHERE slug = ? AND kind = ? AND status = 'published'`, [slug, kind]))[0] || null;

const PROGRAM_SELECT = `SELECT p.*, u.name AS university_name FROM sa_programs p JOIN sa_universities u ON u.slug = p.university_slug AND u.status = 'published'`;
export const getPrograms = (country?: CountrySlug) =>
    query<SaProgram>(`${PROGRAM_SELECT} WHERE p.status = 'published' ${country ? 'AND p.country = ?' : ''} ORDER BY u.name`, country ? [country] : []);
export const getProgramsForCombo = (country: string, degree: string, field: string) =>
    query<SaProgram>(`${PROGRAM_SELECT} WHERE p.status = 'published' AND p.country = ? AND p.degree = ? AND p.field = ? ORDER BY u.name`, [country, degree, field]);
export const getProgramsForUniversity = (slug: string) =>
    query<SaProgram>(`${PROGRAM_SELECT} WHERE p.status = 'published' AND p.university_slug = ? ORDER BY p.title`, [slug]);
export const getProgram = async (universitySlug: string, programSlug: string) =>
    (await query<SaProgram>(`${PROGRAM_SELECT} WHERE p.status = 'published' AND p.university_slug = ? AND p.slug = ?`, [universitySlug, programSlug]))[0] || null;

// A comparison page needs at least this many universities to be worth indexing
export const MIN_INDEXABLE_UNIVERSITIES = 3;
export const getProgramCombos = () =>
    query<{ country: CountrySlug; degree: string; field: string; universities: number }>(
        `SELECT p.country, p.degree, p.field, COUNT(DISTINCT p.university_slug) AS universities ${PROGRAM_SELECT.replace('SELECT p.*, u.name AS university_name', '')}
         WHERE p.status = 'published' AND p.field IS NOT NULL GROUP BY p.country, p.degree, p.field`);

// ---------- Automatic link blocks (docs/study-abroad/templates/LINKING_RULES.md) ----------

export const fieldLabel = (field: string) => field.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());

/** Comparison pages (published, enough universities) for the degree + subject pairs in these programs. */
export async function getComparisonLinks(country: CountrySlug, programs: { degree: string; field: string | null }[]) {
    const wanted = new Set(programs.filter(p => p.field).map(p => `${p.degree}/${p.field}`));
    if (!wanted.size) return [];
    return (await getProgramCombos())
        .filter(c => c.country === country && wanted.has(`${c.degree}/${c.field}`) && c.universities >= MIN_INDEXABLE_UNIVERSITIES)
        .map(c => ({ href: `/study-abroad/programs/${c.country}/${c.degree}/${c.field}`, title: `${c.degree.toUpperCase()} in ${fieldLabel(c.field)} in ${COUNTRIES[c.country].name}`, universities: c.universities }));
}

/** 3–5 similar universities: same country, most subjects in common, then closest tuition, then name. */
export async function getSimilarUniversities(u: Pick<SaUniversity, 'slug' | 'country' | 'tuition_per_year'>, fields: string[], limit = 5) {
    const rows = await query<{ slug: string; name: string; city: string | null; tuition_per_year: number | null; tuition_currency: string | null; fields: string | null }>(
        `SELECT u.slug, u.name, u.city, u.tuition_per_year, u.tuition_currency, GROUP_CONCAT(DISTINCT p.field) AS fields
         FROM sa_universities u LEFT JOIN sa_programs p ON p.university_slug = u.slug AND p.status = 'published'
         WHERE u.status = 'published' AND u.country = ? AND u.slug <> ? GROUP BY u.slug`, [u.country, u.slug]);
    const mine = new Set(fields);
    const overlap = (r: { fields: string | null }) => (r.fields || '').split(',').filter(f => mine.has(f)).length;
    const gap = (r: { tuition_per_year: number | null }) =>
        r.tuition_per_year != null && u.tuition_per_year != null ? Math.abs(r.tuition_per_year - u.tuition_per_year) : Number.MAX_SAFE_INTEGER;
    return rows
        .sort((a, b) => overlap(b) - overlap(a) || gap(a) - gap(b) || a.name.localeCompare(b.name))
        .slice(0, limit);
}

/** Most similar courses: same country, degree and subject; closest tuition, then the same GRE rule; never alphabetical. */
export function rankSimilarPrograms(p: SaProgram, peers: SaProgram[], limit = 6) {
    const greOf = (x: SaProgram) => (/not required|no\b|false/i.test(x.gre || '') ? 'no' : x.gre ? 'yes' : '');
    const gap = (x: SaProgram) =>
        x.tuition_per_year != null && p.tuition_per_year != null ? Math.abs(x.tuition_per_year - p.tuition_per_year) : Number.MAX_SAFE_INTEGER;
    return peers
        .filter(x => x.id !== p.id)
        .sort((a, b) => gap(a) - gap(b) || Number(greOf(b) === greOf(p)) - Number(greOf(a) === greOf(p)) || (a.university_name || '').localeCompare(b.university_name || ''))
        .slice(0, limit);
}

// The proof-of-funds calculator for each country
export const FUNDS_CALCULATOR: Partial<Record<CountrySlug, { href: string; label: string }>> = {
    germany: { href: '/study-abroad/tools/blocked-account-calculator', label: 'Blocked account calculator' },
    usa: { href: '/study-abroad/tools/i20-cost-calculator', label: 'I-20 proof of funds calculator' },
};

export async function getFacts(): Promise<Record<string, SaFact>> {
    const rows = await query<SaFact>('SELECT * FROM sa_facts');
    return Object.fromEntries(rows.map(r => [r.key, r]));
}
export const factNumber = (facts: Record<string, SaFact>, key: string, fallback: number) => {
    const n = Number(facts[key]?.value);
    return Number.isFinite(n) ? n : fallback;
};

// International scholarships from the main scholarships table, with the fields ScholarshipCard shows
// Shape ScholarshipCard reads (see app/components/ScholarshipCard.tsx)
export interface CardScholarship {
    id: number; slug: string; title: string; provider: string; state: string; caste: string[];
    amount_annual: number; amount_min?: number; deadline?: string; application_mode: string; level: string;
    last_verified: string; created_at?: string;
}
export const getScholarshipsForCountry = (country: CountrySlug, limit = 100) =>
    query<CardScholarship>(
        `SELECT id, slug, title, provider, state, '[]' AS caste, amount_annual, amount_min, amount_description, deadline, application_mode, level, last_verified, created_at
         FROM scholarships
         WHERE scholarship_scope = 'International' AND (status = 'Active' OR status IS NULL) AND country_of_study LIKE ?
           AND (always_open = 1 OR deadline IS NULL OR deadline NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*' OR deadline >= date('now'))
         ORDER BY priority_score DESC, title LIMIT ?`, [`%${COUNTRIES[country].scholarshipCountry}%`, limit]);

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback;
    try { return JSON.parse(value) as T; } catch { return fallback; }
}
