import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { UNIVERSITIES } from './universities';

const useLocal = process.env.USE_LOCAL_DB === 'true' || !process.env.TURSO_DATABASE_URL;
const dbUrl = (useLocal ? 'file:data/scholarships.db' : process.env.TURSO_DATABASE_URL) || 'file:data/scholarships.db';
const dbToken = useLocal ? undefined : process.env.TURSO_AUTH_TOKEN;

let clientInstance: any = null;

export function getClient() {
    if (!clientInstance) {
        clientInstance = createClient({
            url: dbUrl,
            authToken: dbToken,
        });
    }
    return clientInstance;
}

// Bypassed to make Turso DB the main source of truth; WordPress remains a backup/secondary target.
const WP_API_URL = null; // process.env.WORDPRESS_API_URL;

// Helper to fetch from WordPress if configured
async function wpFetch(endpoint: string, params: Record<string, string | number> = {}) {
    if (!WP_API_URL) return null;

    const url = new URL(`${WP_API_URL}${endpoint}`);
    url.searchParams.append('_embed', '1');
    url.searchParams.append('per_page', '100');

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
    });

    try {
        const res = await fetch(url.toString(), {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('WP Fetch Error:', error);
        return null;
    }
}

// Simple helper to decode basic HTML entities from WP titles
function decodeHtmlEntities(text: string): string {
    if (!text) return "";
    return text
        .replace(/&#038;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

/**
 * Maps a WordPress Post (with ACF fields) to our internal Scholarship interface.
 */
function mapWpPostToScholarship(post: any) {
    if (!post) return null;

    const fields = post.acf || {};

    const getTaxonomyNames = (taxKey: string) => {
        const embedded = post._embedded?.['wp:term'];
        if (!embedded) return [];

        const taxCollection = embedded.find((coll: any[]) =>
            coll.some(term => term.taxonomy === taxKey)
        );

        return taxCollection ? taxCollection.map((t: any) => t.name) : [];
    };

    const states = getTaxonomyNames('scholarship_states');
    const categories = getTaxonomyNames('scholarship_category');
    const levels = getTaxonomyNames('scholarship_level');

    const currentYear = new Date().getFullYear();

    return {
        id: post.id.toString(),
        title: decodeHtmlEntities(typeof post.title === 'object' ? post.title.rendered : post.title),
        slug: post.slug,
        provider: fields.provider || "",
        provider_type: fields.provider_type || "Government",
        state: fields.state || (states.length > 0 ? states[0] : "All India"),
        level: fields.level || (levels.length > 0 ? levels.join(', ') : ""),
        caste: parseCasteField(fields.caste || (categories.length > 0 ? categories : [])),
        gender: fields.gender || "All",
        course_stream: fields.course_stream ? (Array.isArray(fields.course_stream) ? fields.course_stream : [fields.course_stream]) : [],
        app_type: "",
        amount_annual: fields.amount_annual ? Number(fields.amount_annual) : 0,
        amount_min: fields.amount_min ? Number(fields.amount_min) : 0,
        amount_description: fields.amount_description || "",
        benefits: fields.benefits || "",
        income_limit: fields.income_limit ? Number(fields.income_limit) : 0,
        min_marks: fields.min_marks ? Number(fields.min_marks) : 0,
        age_limit: fields.age_limit || "NA",
        residency_requirement: fields.state || (states.length > 0 ? states[0] : ""),
        docs_needed: parseDocsField(fields.docs_needed),
        application_mode: fields.application_mode || "Online",
        apply_url: fields.apply_url || "",
        deadline: fields.deadline || "",
        deadline_description: fields.deadline_description || "",
        time_min: 15,
        step_guide: fields.application_process || fields.step_guide || "",
        selection: fields.selection || "",
        total_awards: fields.total_awards ? Number(fields.total_awards) : 0,
        renewal: fields.renewal_policy || fields.renewal || "",
        competitiveness: "High",
        verified_status: "Verified",
        last_verified: post.modified || new Date().toISOString(),
        verification_year: fields.verification_year ? Number(fields.verification_year) : currentYear,
        official_source: fields.official_source || fields.apply_url || "",
        helpline: fields.helpline || "",
        intro_seo: fields.intro_seo || "",
        faq_json: tryParseJSON(fields.faq_json, []),
        notes_actions: "",
        keywords: "",
        scholarship_type: fields.provider_type || "Government",
        status: post.status === 'publish' ? "Active" : "Closed",
        tags: fields.tags ? (Array.isArray(fields.tags) ? fields.tags : fields.tags.split(',').map((s: string) => s.trim())) : [],
        thumbnail_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || fields.thumbnail_url || ""
    };
}

// Get all scholarships
export async function getAllScholarships() {
    if (WP_API_URL) {
        const posts = await wpFetch('/scholarship?per_page=500');
        if (posts && Array.isArray(posts)) {
            return posts.map(mapWpPostToScholarship);
        }
    }
    const client = getClient();
    const res = await client.execute('SELECT * FROM scholarships');
    return res.rows.map(parseScholarship);
}

// Get scholarship by slug
export async function getScholarshipBySlug(slug: string) {
    if (WP_API_URL) {
        const posts = await wpFetch(`/scholarship?slug=${slug}`);
        if (posts && Array.isArray(posts) && posts.length > 0) {
            return mapWpPostToScholarship(posts[0]);
        }
    }
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE slug = ?',
        args: [slug]
    });
    const scholarship = res.rows[0];
    return scholarship ? parseScholarship(scholarship) : null;
}

// Get localized scholarship by slug
export async function getLocalizedScholarshipBySlug(slug: string, locale?: string) {
    if (!locale || locale === 'en') {
        return getScholarshipBySlug(slug);
    }
    
    const base = await getScholarshipBySlug(slug);
    if (!base) return null;
    
    const client = getClient();
    const sqliteRowRes = await client.execute({
        sql: 'SELECT id FROM scholarships WHERE slug = ?',
        args: [slug]
    });
    const sqliteRow = sqliteRowRes.rows[0];
    const sqliteId = sqliteRow ? String(sqliteRow.id) : base.id;
    
    const translationRes = await client.execute({
        sql: 'SELECT * FROM scholarship_translations WHERE scholarship_id = ? AND locale = ?',
        args: [sqliteId, locale]
    });
    const translation = translationRes.rows[0];
    
    if (translation) {
        return {
            ...base,
            title: translation.title || base.title,
            amount_description: translation.amount_description || base.amount_description,
            benefits: translation.benefits || base.benefits,
            selection: translation.selection || base.selection,
            renewal: translation.renewal || base.renewal,
            step_guide: translation.step_guide || base.step_guide,
            faq_json: tryParseJSON(translation.faq_json, []),
            intro_seo: translation.intro_seo || base.intro_seo
        };
    }
    
    return base;
}

// Get scholarships by state
export async function getScholarshipsByState(state: string) {
    if (WP_API_URL) {
        const terms = await wpFetch('/scholarship_states', { slug: state.toLowerCase().replace(/\s+/g, '-') });
        if (terms && Array.isArray(terms) && terms.length > 0) {
            const posts = await wpFetch('/scholarship', { scholarship_states: terms[0].id });
            if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
        }

        const posts = await wpFetch('/scholarship', { search: state });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
    }
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE state = ?',
        args: [state]
    });
    return res.rows.map(parseScholarship);
}

// Get all unique states
export async function getAllStates() {
    if (WP_API_URL) {
        const terms = await wpFetch('/scholarship_states?per_page=100');
        if (terms && Array.isArray(terms)) {
            return terms.map((t: any) => t.name);
        }
    }
    const client = getClient();
    const res = await client.execute(`
        SELECT DISTINCT state FROM scholarships 
        WHERE state IS NOT NULL 
        AND state != '' 
        AND state != 'All India' 
        AND state != 'Multiple States'
        AND state != 'Selected Cities'
        AND state != 'Selected States'
        ORDER BY state
    `);
    return res.rows.map((row: any) => row.state);
}

// Get all unique categories (castes)
export async function getAllCategories() {
    if (WP_API_URL) {
        const terms = await wpFetch('/scholarship_category?per_page=100');
        if (terms && Array.isArray(terms)) {
            return terms.map((t: any) => t.name);
        }
    }
    const client = getClient();
    const res = await client.execute('SELECT DISTINCT caste FROM scholarships WHERE caste IS NOT NULL');

    const categories = new Set<string>();
    res.rows.forEach((row: any) => {
        try {
            const castes = JSON.parse(row.caste);
            castes.forEach((c: string) => categories.add(c));
        } catch {
            if (row.caste) categories.add(row.caste);
        }
    });

    return Array.from(categories).sort();
}

// Get scholarships by category
export async function getScholarshipsByCategory(category: string) {
    if (WP_API_URL) {
        const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const terms = await wpFetch('/scholarship_category', { slug });
        if (terms && Array.isArray(terms) && terms.length > 0) {
            const posts = await wpFetch('/scholarship', { scholarship_category: terms[0].id });
            if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
        }

        const posts = await wpFetch('/scholarship', { search: category });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship).filter((s: any) =>
            s.caste.some((c: string) => c.toLowerCase().includes(category.toLowerCase()))
        );
    }
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE caste LIKE ?',
        args: [`%${category}%`]
    });
    return res.rows.map(parseScholarship);
}

// Re-export canonical levels and mapping helpers from utils.ts
import {
    CANONICAL_LEVELS,
    getCanonicalSlugForLevel,
    getCanonicalSlugForIncome,
    getCanonicalSlugForCategory
} from './utils';

export {
    CANONICAL_LEVELS,
    getCanonicalSlugForLevel,
    getCanonicalSlugForIncome,
    getCanonicalSlugForCategory
};

// Get all unique education levels (raw)
export async function getAllLevels() {
    if (WP_API_URL) {
        const terms = await wpFetch('/scholarship_level?per_page=100');
        if (terms && Array.isArray(terms)) {
            return terms.map((t: any) => t.name);
        }
    }
    const client = getClient();
    const res = await client.execute('SELECT DISTINCT level FROM scholarships WHERE level IS NOT NULL ORDER BY level');
    return res.rows.map((row: any) => row.level);
}

// Get scholarships by education level (supports raw level or canonical slug)
export async function getScholarshipsByLevel(levelOrSlug: string) {
    if (WP_API_URL) {
        const terms = await wpFetch('/scholarship_level', { slug: levelOrSlug });
        if (terms && Array.isArray(terms) && terms.length > 0) {
            const posts = await wpFetch('/scholarship', { scholarship_level: terms[0].id });
            if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
        }

        const posts = await wpFetch('/scholarship', { search: levelOrSlug });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
    }
    
    // Check if it's a canonical slug
    const canonical = CANONICAL_LEVELS[levelOrSlug];
    const client = getClient();

    if (canonical) {
        const likeClauses = canonical.rawLevels.map(() => 'level LIKE ?').join(' OR ');
        const query = `
            SELECT * FROM scholarships 
            WHERE ${likeClauses}
            OR level LIKE ?
        `;

        const likeParams = canonical.rawLevels.map(raw => `%${raw}%`);
        const broadLike = `%${canonical.label}%`;
        const res = await client.execute({
            sql: query,
            args: [...likeParams, broadLike]
        });
        return res.rows.map(parseScholarship);
    }

    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE level = ?',
        args: [levelOrSlug]
    });
    return res.rows.map(parseScholarship);
}

// Get scholarships by income range
export async function getScholarshipsByIncomeRange(minIncome: number, maxIncome: number) {
    const client = getClient();

    let res;
    if (minIncome === -1) {
        res = await client.execute(
            "SELECT * FROM scholarships WHERE (income_limit IS NULL OR income_limit = 0 OR income_limit = '')"
        );
    } else {
        res = await client.execute({
            sql: 'SELECT * FROM scholarships WHERE (income_limit >= ? AND income_limit <= ?)',
            args: [minIncome, maxIncome]
        });
    }

    return res.rows.map(parseScholarship);
}

// Get all income ranges with counts
export async function getIncomeRanges() {
    const client = getClient();
    const res = await client.execute('SELECT income_limit FROM scholarships');

    const ranges = [
        { label: 'No Income Bar', min: -1, max: 0, slug: 'no-income-bar' },
        { label: '0-1L', min: 1, max: 100000, slug: '0-1l' },
        { label: '1-2.5L', min: 100001, max: 250000, slug: '1-2.5l' },
        { label: '2.5-5L', min: 250001, max: 500000, slug: '2.5-5l' },
        { label: '5L+', min: 500001, max: 10000000, slug: '5l-plus' },
    ];

    return ranges.map(range => ({
        ...range,
        count: res.rows.filter((s: any) => {
            const limit = s.income_limit === null || s.income_limit === "" ? 0 : Number(s.income_limit);
            if (range.min === -1) return limit === 0;
            return limit >= range.min && limit <= range.max;
        }).length
    }));
}

// Get scholarships by provider type
export async function getScholarshipsByProviderType(providerType: string) {
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE provider_type = ?',
        args: [providerType]
    });
    return res.rows.map(parseScholarship);
}

// Get all unique provider types
export async function getAllProviderTypes() {
    const client = getClient();
    const res = await client.execute('SELECT DISTINCT provider_type FROM scholarships WHERE provider_type IS NOT NULL ORDER BY provider_type');
    return res.rows.map((row: any) => row.provider_type);
}

// Search scholarships by name, provider, or state
export async function searchScholarships(query: string) {
    const client = getClient();
    const searchTerm = `%${query}%`;
    const res = await client.execute({
        sql: `
            SELECT * FROM scholarships 
            WHERE title LIKE ? 
            OR provider LIKE ? 
            OR state LIKE ?
            ORDER BY title
        `,
        args: [searchTerm, searchTerm, searchTerm]
    });
    return res.rows.map(parseScholarship);
}

// Get scholarships by multiple IDs (for comparison)
export async function getScholarshipsByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const client = getClient();
    const placeholders = ids.map(() => '?').join(',');
    const res = await client.execute({
        sql: `SELECT * FROM scholarships WHERE id IN (${placeholders})`,
        args: ids
    });
    return res.rows.map(parseScholarship);
}

// Get featured scholarships
export async function getFeaturedScholarships(limit: number = 6) {
    if (WP_API_URL) {
        const posts = await wpFetch('/scholarship', { per_page: limit });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
    }
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE is_featured = 1 ORDER BY priority_score DESC LIMIT ?',
        args: [limit]
    });
    return res.rows.map(parseScholarship);
}

// Get scholarships by type
export async function getScholarshipsByType(type: string) {
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE scholarship_type = ?',
        args: [type]
    });
    return res.rows.map(parseScholarship);
}

// Helper to generate search patterns for levels
function getLevelSearchPatterns(levelStr: string): string[] {
    if (!levelStr) return ['%All Level%', '%All level%', '%All Levels%', '%All levels%'];
    const patterns: string[] = ['%All Level%', '%All level%', '%All Levels%', '%All levels%'];
    const lower = levelStr.toLowerCase();

    if (lower.includes('ug') || lower.includes('undergrad') || lower.includes('bachelor') || lower.includes('graduate') || lower.includes('graduation')) {
        patterns.push('%ug%', '%undergrad%', '%bachelor%', '%graduate%', '%graduation%');
    }
    if (lower.includes('pg') || lower.includes('postgrad') || lower.includes('master')) {
        patterns.push('%pg%', '%postgrad%', '%master%');
    }
    if (lower.includes('11') || lower.includes('12') || lower.includes('higher secondary') || lower.includes('post-matric') || lower.includes('puc')) {
        patterns.push('%11%', '%12%', '%higher secondary%', '%post-matric%', '%puc%');
    }
    if (lower.includes('1') || lower.includes('2') || lower.includes('3') || lower.includes('4') || lower.includes('5') || lower.includes('6') || lower.includes('7') || lower.includes('8') || lower.includes('9') || lower.includes('10') || lower.includes('school') || lower.includes('pre-matric')) {
        patterns.push('%class 1%', '%class 2%', '%class 3%', '%class 4%', '%class 5%', '%class 6%', '%class 7%', '%class 8%', '%class 9%', '%class 10%', '%school%', '%pre-matric%');
    }
    if (lower.includes('diploma') || lower.includes('polytechnic')) {
        patterns.push('%diploma%', '%polytechnic%');
    }
    if (lower.includes('iti') || lower.includes('vocational')) {
        patterns.push('%iti%', '%vocational%');
    }
    if (lower.includes('phd') || lower.includes('ph.d') || lower.includes('research') || lower.includes('doctoral')) {
        patterns.push('%phd%', '%ph.d%', '%research%', '%doctoral%');
    }

    return patterns;
}

// Get related scholarships based on State, Level, and Category
export async function getRelatedScholarships(currentId: string, limit: number = 3) {
    const scholarship = (await getScholarshipsByIds([currentId]))[0];
    if (!scholarship) return [];

    const client = getClient();

    const state = scholarship.state || 'All India';
    const level = scholarship.level || '';
    const category = scholarship.caste[0] || 'General';

    const patterns = getLevelSearchPatterns(level);
    const placeholders = patterns.map(() => 'level LIKE ?').join(' OR ');

    const query = `
        SELECT * FROM scholarships 
        WHERE id != ? 
        AND status = 'Active'
        AND (${placeholders})
        AND (
            always_open = 1
            OR deadline IS NULL 
            OR deadline = '' 
            OR deadline = 'Not specified'
            OR deadline = 'Open Now'
            OR deadline = 'Rolling'
            OR deadline NOT LIKE '____-__-%'
            OR deadline >= date('now')
        )
        ORDER BY 
            (CASE WHEN state = ? THEN 2 ELSE 0 END) + 
            (CASE WHEN caste LIKE ? THEN 1 ELSE 0 END) DESC,
            priority_score DESC 
        LIMIT ?
    `;

    const categorySearch = `%${category}%`;
    const params = [currentId, ...patterns, state, categorySearch, limit];

    const res = await client.execute({ sql: query, args: params });
    let related = [...res.rows];

    if (related.length < limit) {
        const remaining = limit - related.length;
        const excludedIds = [currentId, ...related.map((r: any) => r.id)];
        const placeholdersExclude = excludedIds.map(() => '?').join(',');

        const fallbackQuery = `
            SELECT * FROM scholarships
            WHERE id NOT IN (${placeholdersExclude})
            AND status = 'Active'
            AND (
                always_open = 1
                OR deadline IS NULL 
                OR deadline = '' 
                OR deadline = 'Not specified'
                OR deadline = 'Open Now'
                OR deadline = 'Rolling'
                OR deadline NOT LIKE '____-__-%'
                OR deadline >= date('now')
            )
            ORDER BY priority_score DESC
            LIMIT ?
        `;

        const fallbackRes = await client.execute({
            sql: fallbackQuery,
            args: [...excludedIds, remaining]
        });
        related = [...related, ...fallbackRes.rows];
    }

    return related.map(parseScholarship);
}

// Get sibling variants for dynamic disambiguation panels
export async function getSiblingVariants(currentId: string | number, slug: string, title: string) {
    const client = getClient();
    const cleanTitle = title.toLowerCase();
    
    // Identify common brand/portal keywords
    const keywords = [
        'digital gujarat', 'gujarat', 'oasis', 'aikyashree', 'ssp', 'nsp', 
        'e kalyan', 'e-kalyan', 'mptaas', 'mahadbt', 'mmvy', 'tata', 'hdfc', 
        'reliance', 'lic', 'azim premji', 'jindal', 'airtel', 'bharti', 
        'post matric scholarship', 'pre matric scholarship'
    ];
    
    let matchedKeyword = null;
    for (const kw of keywords) {
        if (cleanTitle.includes(kw) || slug.includes(kw.replace(/\s+/g, '-'))) {
            if (!matchedKeyword || kw.length > matchedKeyword.length) {
                matchedKeyword = kw;
            }
        }
    }
    
    if (!matchedKeyword) return [];
    
    const queryPattern = `%${matchedKeyword.replace(/\s+/g, '%')}%`;
    const res = await client.execute({
        sql: "SELECT * FROM scholarships WHERE (title LIKE ? OR slug LIKE ?) AND id != ? AND status = 'Active' LIMIT 4",
        args: [queryPattern, queryPattern, currentId]
    });
    
    return res.rows.map(parseScholarship);
}

// Get global stats for pillar pages
export async function getScholarshipStats() {
    const client = getClient();
    const res = await client.execute(`
        SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT state) as stateCount,
            SUM(CASE WHEN scholarship_type = 'Government' THEN 1 ELSE 0 END) as govCount,
            SUM(CASE WHEN scholarship_type = 'Private' OR scholarship_type = 'Corporate' THEN 1 ELSE 0 END) as privateCount
        FROM scholarships
    `);
    return res.rows[0];
}

// Get scholarships by course cluster (e.g., Engineering, Medical)
export async function getScholarshipsByCourse(course: string) {
    const client = getClient();
    const res = await client.execute({
        sql: 'SELECT * FROM scholarships WHERE course_stream LIKE ?',
        args: [`%${course}%`]
    });
    return res.rows.map(parseScholarship);
}

// Get predefined list of high-value courses for SEO
export function getMajorCourses() {
    return [
        { name: 'Engineering', slug: 'engineering' },
        { name: 'Medical', slug: 'medical' },
        { name: 'Commerce', slug: 'commerce' },
        { name: 'Science', slug: 'science' },
        { name: 'Arts', slug: 'arts' },
        { name: 'Nursing', slug: 'nursing' },
        { name: 'Pharmacy', slug: 'pharmacy' },
        { name: 'Agriculture', slug: 'agriculture' },
        { name: 'Law', slug: 'law' },
        { name: 'Management', slug: 'management' },
    ];
}

// Helper to parse JSON fields
function parseScholarship(row: any) {
    return {
        ...row,
        caste: parseCasteField(row.caste),
        course_stream: tryParseJSON(row.course_stream, []),
        docs_needed: parseDocsField(row.docs_needed),
        keywords: tryParseJSON(row.keywords, []),
        faq_json: tryParseJSON(row.faq_json, []),
    };
}

function tryParseJSON(value: any, fallback: any) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export function parseCasteField(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((c: any) => String(c).replace(/[\[\]"']/g, '').trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return [];
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map((c: any) => String(c).replace(/[\[\]"']/g, '').trim()).filter(Boolean);
                }
            } catch {}
        }
        return trimmed.split(',').map((c: string) => c.replace(/[\[\]"']/g, '').trim()).filter(Boolean);
    }
    return [];
}

export function parseDocsField(value: any): string[] {
    if (!value) return [];
    let list: string[] = [];
    if (Array.isArray(value)) {
        list = value;
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return [];
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    list = parsed;
                } else {
                    list = [parsed];
                }
            } catch {
                list = [trimmed];
            }
        } else {
            list = trimmed.split('\n');
        }
    }

    if (list.length === 1 && typeof list[0] === 'string' && list[0].includes(',')) {
        list = list[0].split(',').map(s => s.trim()).filter(Boolean);
    } else {
        list = list.flatMap(item => {
            if (typeof item === 'string') {
                return item.split('\n').map(s => s.trim()).filter(Boolean);
            }
            return item;
        });
    }

    return list.map(s => String(s).trim()).filter(Boolean);
}

export function getCleanSteps(text: string | null): string[] {
    if (!text) return [];
    
    let rawItems: string[] = [];
    const trimmed = text.trim();
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                rawItems = parsed.map(s => String(s));
            }
        } catch (e) {
            const matches: string[] = [];
            const regex = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
            let match;
            while ((match = regex.exec(trimmed)) !== null) {
                matches.push(match[1] !== undefined ? match[1] : match[2]);
            }
            if (matches.length > 0) {
                rawItems = matches.map(s => s.replace(/\\'/g, "'").replace(/\\"/g, '"'));
            }
        }
    }
    
    if (rawItems.length === 0) {
        if (/Step \d+:/i.test(trimmed)) {
            rawItems = trimmed.split(/Step \d+:/i).map(s => s.trim()).filter(Boolean);
        } else if (/\b\d{1,2}\.\s+/.test(trimmed)) {
            rawItems = trimmed.split(/(?=\b\d{1,2}\.\s+)/).map(s => s.trim()).filter(Boolean);
        } else {
            rawItems = trimmed.split('\n').map(s => s.trim()).filter(Boolean);
        }
    }
    
    if (rawItems.length > 1 && !/^\s*(\d+|Step)/i.test(rawItems[0])) {
        rawItems.shift();
    }
    
    const cleanItems = rawItems.map(item => {
        let cleaned = item.trim();
        cleaned = cleaned.replace(/^['"\[\s,]+|['"\]\s,]+$/g, '');
        cleaned = cleaned.replace(/^\b\d+[\.\)]\s*/, '');
        cleaned = cleaned.replace(/^Step\s+\d+:\s*/i, '');
        return cleaned.trim();
    }).filter(Boolean);
    
    return cleanItems;
}

// Get scholarships by university (Option 1 matching)
export async function getScholarshipsByUniversity(slug: string) {
    const uni = UNIVERSITIES.find(u => u.slug === slug);
    if (!uni) return { specific: [], general: [] };

    const client = getClient();

    const likeClauses = uni.keywords.map(() => '(title LIKE ? OR provider LIKE ? OR tags LIKE ? OR special_conditions LIKE ?)').join(' OR ');
    const querySpecific = `
        SELECT * FROM scholarships 
        WHERE status = 'Active' 
        AND (${likeClauses})
    `;
    const paramsSpecific = uni.keywords.flatMap(kw => [`%${kw}%`, `%${kw}%`, `%${kw}%`, `%${kw}%`]);
    const resSpecific = await client.execute({ sql: querySpecific, args: paramsSpecific });

    let generalRows: any[] = [];
    if (uni.nationalEligible) {
        const queryGeneral = `
            SELECT * FROM scholarships 
            WHERE status = 'Active' 
            AND (level LIKE '%Graduation%' OR level LIKE '%Post-Graduation%' OR level LIKE '%PhD%')
            AND (state = 'All India' OR state IS NULL OR state = '')
            AND (provider_type = 'Corporate' OR provider_type = 'Private' OR scholarship_type = 'Government')
            AND NOT (${likeClauses})
            ORDER BY priority_score DESC 
            LIMIT 10
        `;
        const resGeneral = await client.execute({ sql: queryGeneral, args: paramsSpecific });
        generalRows = resGeneral.rows;
    }

    return {
        specific: resSpecific.rows.map(parseScholarship),
        general: generalRows.map(parseScholarship)
    };
}

// Get all universities with active counts
export async function getAllUniversitiesWithCounts() {
    const client = getClient();
    const result = [];
    for (const uni of UNIVERSITIES) {
        const likeClauses = uni.keywords.map(() => '(title LIKE ? OR provider LIKE ? OR tags LIKE ? OR special_conditions LIKE ?)').join(' OR ');
        const queryCount = `
            SELECT COUNT(*) as count FROM scholarships 
            WHERE status = 'Active' 
            AND (${likeClauses})
        `;
        const params = uni.keywords.flatMap(kw => [`%${kw}%`, `%${kw}%`, `%${kw}%`, `%${kw}%`]);
        const res = await client.execute({ sql: queryCount, args: params });
        const countVal = Number(res.rows[0]?.count || 0);
        result.push({
            ...uni,
            count: countVal
        });
    }
    return result;
}

// Get all international scholarships for the hub/tracker page
export async function getInternationalScholarships() {
    const client = getClient();
    const res = await client.execute(`
        SELECT * FROM scholarships
        WHERE LOWER(scholarship_scope) = 'international'
        ORDER BY
            CASE
                WHEN deadline IS NULL OR deadline = 'Not specified' OR deadline = 'NA' THEN 2
                WHEN deadline < date('now') THEN 1
                ELSE 0
            END ASC,
            deadline ASC
    `);
    return res.rows.map(parseScholarship);
}

// Get recently added/verified scholarships
export async function getRecentlyAddedScholarships(limit: number = 6) {
    const client = getClient();
    const res = await client.execute({
        sql: `
            SELECT * FROM scholarships 
            WHERE status = 'Active' 
            AND (always_open = 1 OR deadline IS NULL OR deadline = '' OR deadline = 'NA' OR deadline = 'Not specified' OR deadline = 'Open Year-Round' OR deadline = 'Rolling' OR deadline = 'Open Now' OR deadline >= date('now'))
            ORDER BY created_at DESC, last_verified DESC, id DESC
            LIMIT ?
        `,
        args: [limit]
    });
    return res.rows.map(parseScholarship);
}

// Get scholarships closing soon
export async function getClosingSoonScholarships(limit: number = 6) {
    const client = getClient();
    const res = await client.execute({
        sql: `
            SELECT * FROM scholarships 
            WHERE status = 'Active' 
            AND (always_open IS NULL OR always_open = 0)
            AND deadline IS NOT NULL 
            AND deadline != '' 
            AND deadline NOT LIKE '%VERIFY%'
            AND deadline NOT LIKE '%tentative%'
            AND deadline NOT LIKE '%some sources%'
            AND deadline NOT LIKE '%verify on%'
            AND deadline >= date('now')
            ORDER BY deadline ASC, priority_score DESC, id DESC
            LIMIT ?
        `,
        args: [limit]
    });
    return res.rows.map(parseScholarship);
}

// Get trending scholarships based on priority score and popularity
export async function getTrendingScholarships(limit: number = 6) {
    const client = getClient();
    const res = await client.execute({
        sql: `
            SELECT * FROM scholarships 
            WHERE status = 'Active' 
            AND (always_open = 1 OR deadline IS NULL OR deadline = '' OR deadline = 'NA' OR deadline = 'Not specified' OR deadline = 'Open Year-Round' OR deadline = 'Rolling' OR deadline = 'Open Now' OR deadline >= date('now'))
            ORDER BY priority_score DESC, is_popular DESC, id DESC
            LIMIT ?
        `,
        args: [limit]
    });
    return res.rows.map(parseScholarship);
}

// Get scholarships by combination of level and country
export async function getScholarshipsByLevelAndCountry(levelSlug: string, countrySlug: string) {
    const client = getClient();
    
    // 1. Map country slug to database patterns
    let countryPattern = `%${countrySlug}%`;
    if (countrySlug === 'usa') countryPattern = '%United States%';
    else if (countrySlug === 'uk') countryPattern = '%United Kingdom%';
    else if (countrySlug === 'europe') countryPattern = '%Europe%';
    
    // 2. Map level slug to database pattern
    let levelPattern = `%${levelSlug}%`;
    if (levelSlug === 'phd') levelPattern = '%PhD%';
    else if (levelSlug === 'mba') levelPattern = '%MBA%';
    else if (levelSlug === 'masters') levelPattern = '%Master%';
    else if (levelSlug === 'undergraduate') levelPattern = '%Undergraduate%';
    else if (levelSlug === 'postgraduate') levelPattern = '%Postgraduate%';

    const query = `
        SELECT * FROM scholarships 
        WHERE (level LIKE ? OR course_stream LIKE ? OR title LIKE ?)
          AND (country_of_study LIKE ? OR country_of_study = 'Any Country')
    `;

    const res = await client.execute({
        sql: query,
        args: [levelPattern, levelPattern, levelPattern, countryPattern]
    });
    
    return res.rows.map(parseScholarship);
}

// Get international scholarships by level only (across all countries)
export async function getInternationalScholarshipsByLevel(levelSlug: string) {
    const client = getClient();
    let levelPattern = `%${levelSlug}%`;
    if (levelSlug === 'phd') levelPattern = '%PhD%';
    else if (levelSlug === 'mba') levelPattern = '%MBA%';
    else if (levelSlug === 'masters') levelPattern = '%Master%';
    else if (levelSlug === 'undergraduate') levelPattern = '%Undergraduate%';
    
    const res = await client.execute({
        sql: `
            SELECT * FROM scholarships 
            WHERE LOWER(scholarship_scope) = 'international'
              AND (level LIKE ? OR course_stream LIKE ? OR title LIKE ?)
        `,
        args: [levelPattern, levelPattern, levelPattern]
    });
    return res.rows.map(parseScholarship);
}

// Get international scholarships by country only (across all levels)
export async function getInternationalScholarshipsByCountry(countrySlug: string) {
    const client = getClient();
    let countryPattern = `%${countrySlug}%`;
    if (countrySlug === 'usa') countryPattern = '%United States%';
    else if (countrySlug === 'uk') countryPattern = '%United Kingdom%';
    else if (countrySlug === 'europe') countryPattern = '%Europe%';
    
    const res = await client.execute({
        sql: `
            SELECT * FROM scholarships 
            WHERE LOWER(scholarship_scope) = 'international'
              AND (country_of_study LIKE ? OR country_of_study = 'Any Country')
        `,
        args: [countryPattern]
    });
    return res.rows.map(parseScholarship);
}

// Get live active scholarship counts grouped by state
export async function getStateScholarshipCounts(): Promise<Record<string, number>> {
    const client = getClient();
    const res = await client.execute({
        sql: `
            SELECT state, COUNT(*) as count FROM scholarships 
            WHERE status = 'Active' 
            AND state IS NOT NULL AND state != '' AND state != 'All India' AND state != 'NA'
            GROUP BY state
        `
    });
    const map: Record<string, number> = {};
    for (const row of res.rows) {
        if (row.state) {
            map[String(row.state).trim()] = Number(row.count || 0);
        }
    }
    return map;
}

// Get live active scholarship counts grouped by main caste category
export async function getCategoryScholarshipCounts(): Promise<Record<string, number>> {
    const client = getClient();
    const scholarships = (await client.execute({
        sql: "SELECT caste FROM scholarships WHERE status = 'Active'"
    })).rows;

    const counts: Record<string, number> = {
        'SC': 0, 'ST': 0, 'OBC': 0, 'EBC': 0, 'Minority': 0, 'General': 0, 'PWD': 0, 'Sports': 0
    };

    for (const s of scholarships) {
        let casteArr: string[] = [];
        try {
            if (typeof s.caste === 'string') casteArr = JSON.parse(s.caste);
            else if (Array.isArray(s.caste)) casteArr = s.caste as string[];
        } catch {
            if (typeof s.caste === 'string') casteArr = [s.caste];
        }

        const casteStr = casteArr.join(' ').toLowerCase();
        if (casteStr.includes('sc') || casteStr.includes('scheduled caste')) counts['SC']++;
        if (casteStr.includes('st') || casteStr.includes('scheduled tribe')) counts['ST']++;
        if (casteStr.includes('obc') || casteStr.includes('backward class')) counts['OBC']++;
        if (casteStr.includes('ebc')) counts['EBC']++;
        if (casteStr.includes('minority') || casteStr.includes('muslim') || casteStr.includes('christian')) counts['Minority']++;
        if (casteStr.includes('general') || casteStr.includes('ews') || casteStr.includes('open')) counts['General']++;
        if (casteStr.includes('pwd') || casteStr.includes('disabilit')) counts['PWD']++;
        if (casteStr.includes('sport')) counts['Sports']++;
    }

    return counts;
}

// Get live active counts grouped by education level key
export async function getEducationLevelCounts(): Promise<Record<string, number>> {
    const client = getClient();
    const scholarships = (await client.execute({
        sql: "SELECT level FROM scholarships WHERE status = 'Active'"
    })).rows;

    const counts: Record<string, number> = {
        'class-1-10': 0,
        'class-11-12': 0,
        'diploma-polytechnic': 0,
        'iti-courses': 0,
        'undergraduate-degree': 0,
        'postgraduate-degree': 0,
        'phd-doctoral': 0
    };

    for (const s of scholarships) {
        const lvl = String(s.level || '').toLowerCase();
        if (lvl.includes('1') || lvl.includes('pre-matric') || lvl.includes('school')) counts['class-1-10']++;
        if (lvl.includes('11') || lvl.includes('12') || lvl.includes('post-matric') || lvl.includes('higher secondary')) counts['class-11-12']++;
        if (lvl.includes('diploma') || lvl.includes('polytechnic')) counts['diploma-polytechnic']++;
        if (lvl.includes('iti')) counts['iti-courses']++;
        if (lvl.includes('undergraduate') || lvl.includes('ug') || lvl.includes('bachelor')) counts['undergraduate-degree']++;
        if (lvl.includes('postgraduate') || lvl.includes('pg') || lvl.includes('master')) counts['postgraduate-degree']++;
        if (lvl.includes('phd') || lvl.includes('doctoral') || lvl.includes('research')) counts['phd-doctoral']++;
    }

    return counts;
}

