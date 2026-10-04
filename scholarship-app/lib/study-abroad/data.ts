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
