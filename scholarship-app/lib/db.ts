import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'scholarships.db');
const WP_API_URL = process.env.WORDPRESS_API_URL;

// Helper to fetch from WordPress if configured
async function wpFetch(endpoint: string, params: Record<string, string | number> = {}) {
    if (!WP_API_URL) return null;

    const url = new URL(`${WP_API_URL}${endpoint}`);
    // Always add _embed to get taxonomy names and featured images
    url.searchParams.append('_embed', '1');
    url.searchParams.append('per_page', '100'); // Default to 100 for our needs

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
    });

    try {
        const res = await fetch(url.toString(), {
            next: { revalidate: 3600 } // Cache for 1 hour for better performance
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

    // Get taxonomy names from embedded data if available
    const getTaxonomyNames = (taxKey: string) => {
        const embedded = post._embedded?.['wp:term'];
        if (!embedded) return [];

        // Find the collection for this taxonomy
        const taxCollection = embedded.find((coll: any[]) =>
            coll.some(term => term.taxonomy === taxKey)
        );

        return taxCollection ? taxCollection.map((t: any) => t.name) : [];
    };

    const states = getTaxonomyNames('scholarship_states');
    const categories = getTaxonomyNames('scholarship_category');
    const levels = getTaxonomyNames('scholarship_level');

    // Use current year as fallback for verification if not provided
    const currentYear = new Date().getFullYear();

    return {
        id: post.id.toString(),
        title: decodeHtmlEntities(typeof post.title === 'object' ? post.title.rendered : post.title),
        slug: post.slug,

        // Basic Info
        provider: fields.provider || "",
        provider_type: fields.provider_type || "Government",

        // Taxonomy Fields - Prefer ACF if set, otherwise use WordPress Taxonomies
        state: fields.state || (states.length > 0 ? states[0] : "All India"),
        level: fields.level || (levels.length > 0 ? levels.join(', ') : ""),
        caste: parseCasteField(fields.caste || (categories.length > 0 ? categories : [])),
        gender: fields.gender || "All",
        course_stream: fields.course_stream ? (Array.isArray(fields.course_stream) ? fields.course_stream : [fields.course_stream]) : [],
        app_type: "",

        // Amount & Financial
        amount_annual: fields.amount_annual ? Number(fields.amount_annual) : 0,
        amount_min: fields.amount_min ? Number(fields.amount_min) : 0,
        amount_description: fields.amount_description || "",
        benefits: fields.benefits || "",

        // Eligibility Criteria
        income_limit: fields.income_limit ? Number(fields.income_limit) : 0,
        min_marks: fields.min_marks ? Number(fields.min_marks) : 0,
        age_limit: fields.age_limit || "NA",
        residency_requirement: fields.state || (states.length > 0 ? states[0] : ""),

        // Application Details
        docs_needed: parseDocsField(fields.docs_needed),
        application_mode: fields.application_mode || "Online",
        apply_url: fields.apply_url || "",
        deadline: fields.deadline || "",
        deadline_description: fields.deadline_description || "",
        time_min: 15,

        // Process & Selection
        step_guide: fields.application_process || fields.step_guide || "",
        selection: fields.selection || "",
        total_awards: fields.total_awards ? Number(fields.total_awards) : 0,
        renewal: fields.renewal_policy || fields.renewal || "",
        competitiveness: "High",

        // Trust & Verification
        verified_status: "Verified",
        last_verified: post.modified || new Date().toISOString(),
        verification_year: fields.verification_year ? Number(fields.verification_year) : currentYear,
        official_source: fields.official_source || fields.apply_url || "",
        helpline: fields.helpline || "",

        // SEO & Content
        intro_seo: fields.intro_seo || "",
        faq_json: tryParseJSON(fields.faq_json, []),
        notes_actions: "",
        keywords: "",

        // Status & Metadata
        scholarship_type: fields.provider_type || "Government",
        status: post.status === 'publish' ? "Active" : "Closed",
        tags: fields.tags ? (Array.isArray(fields.tags) ? fields.tags : fields.tags.split(',').map((s: string) => s.trim())) : [],
        thumbnail_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || fields.thumbnail_url || ""
    };
}
export function getDatabase() {
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    return db;
}

// Initialize database schema
export function initializeDatabase() {
    const db = getDatabase();

    db.exec(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      
      -- Basic Info
      provider TEXT,
      provider_type TEXT,
      
      -- Taxonomy Fields (for filtering & programmatic SEO)
      state TEXT,
      level TEXT,
      caste TEXT,
      gender TEXT,
      course_stream TEXT,
      app_type TEXT,
      
      -- Amount & Financial
      amount_annual INTEGER,
      amount_min INTEGER,
      amount_description TEXT,
      benefits TEXT,
      
      -- Eligibility Criteria
      income_limit INTEGER,
      min_marks INTEGER,
      age_limit TEXT,
      residency_requirement TEXT,
      
      -- Application Details
      docs_needed TEXT,
      application_mode TEXT,
      apply_url TEXT,
      deadline TEXT,
      deadline_description TEXT,
      time_min INTEGER,
      
      -- Process & Selection
      step_guide TEXT,
      selection TEXT,
      total_awards INTEGER,
      renewal TEXT,
      competitiveness TEXT,
      
      -- Trust & Verification
      verified_status TEXT,
      last_verified TEXT,
      official_source TEXT,
      helpline TEXT,
      
      -- SEO & Content
      intro_seo TEXT,
      faq_json TEXT,
      notes_actions TEXT,
      keywords TEXT,
      
      -- New: Scholarship Type & Status
      scholarship_type TEXT DEFAULT 'Government',
      status TEXT DEFAULT 'Active',
      
      -- New: Year Verification (for private scholarships)
      verification_year INTEGER,
      verification_date TEXT,
      
      -- New: Display & Ranking Logic
      show_on_homepage INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      priority_score INTEGER DEFAULT 50,
      
      -- New: Enhanced Content
      special_conditions TEXT,
      tags TEXT,
      thumbnail_url TEXT
    );
    
    -- Indexes for filtering
    CREATE INDEX IF NOT EXISTS idx_state ON scholarships(state);
    CREATE INDEX IF NOT EXISTS idx_level ON scholarships(level);
    CREATE INDEX IF NOT EXISTS idx_caste ON scholarships(caste);
    CREATE INDEX IF NOT EXISTS idx_gender ON scholarships(gender);
    CREATE INDEX IF NOT EXISTS idx_provider_type ON scholarships(provider_type);
    CREATE INDEX IF NOT EXISTS idx_app_type ON scholarships(app_type);
    CREATE INDEX IF NOT EXISTS idx_slug ON scholarships(slug);
    CREATE INDEX IF NOT EXISTS idx_scholarship_type ON scholarships(scholarship_type);
    CREATE INDEX IF NOT EXISTS idx_status ON scholarships(status);
  `);

    db.close();
}

// Get all scholarships
export async function getAllScholarships() {
    if (WP_API_URL) {
        const posts = await wpFetch('/scholarship?per_page=500');
        if (posts && Array.isArray(posts)) {
            return posts.map(mapWpPostToScholarship);
        }
    }
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships').all();
    db.close();
    return scholarships.map(parseScholarship);
}

// Get scholarship by slug
export async function getScholarshipBySlug(slug: string) {
    if (WP_API_URL) {
        const posts = await wpFetch(`/scholarship?slug=${slug}`);
        if (posts && Array.isArray(posts) && posts.length > 0) {
            return mapWpPostToScholarship(posts[0]);
        }
    }
    const db = getDatabase();
    const scholarship = db.prepare('SELECT * FROM scholarships WHERE slug = ?').get(slug);
    db.close();
    return scholarship ? parseScholarship(scholarship) : null;
}

// Get scholarships by state
export async function getScholarshipsByState(state: string) {
    if (WP_API_URL) {
        // Find the term ID for the state first to ensure accurate filtering
        const terms = await wpFetch('/scholarship_states', { slug: state.toLowerCase().replace(/\s+/g, '-') });
        if (terms && Array.isArray(terms) && terms.length > 0) {
            const posts = await wpFetch('/scholarship', { scholarship_states: terms[0].id });
            if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
        }

        // Fallback to search if slug lookup fails
        const posts = await wpFetch('/scholarship', { search: state });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
    }
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE state = ?').all(state);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get all unique states
export async function getAllStates() {
    if (WP_API_URL) {
        // Fetch from scholarship_states taxonomy
        const terms = await wpFetch('/scholarship_states?per_page=100');
        if (terms && Array.isArray(terms)) {
            return terms.map((t: any) => t.name);
        }
    }
    const db = getDatabase();
    const states = db.prepare('SELECT DISTINCT state FROM scholarships WHERE state IS NOT NULL ORDER BY state').all();
    db.close();
    return states.map((row: any) => row.state);
}

// Get all unique categories (castes)
export async function getAllCategories() {
    if (WP_API_URL) {
        // Fetch from scholarship_category taxonomy
        const terms = await wpFetch('/scholarship_category?per_page=100');
        if (terms && Array.isArray(terms)) {
            return terms.map((t: any) => t.name);
        }
    }
    const db = getDatabase();
    const scholarships = db.prepare('SELECT DISTINCT caste FROM scholarships WHERE caste IS NOT NULL').all();
    db.close();

    const categories = new Set<string>();
    scholarships.forEach((row: any) => {
        try {
            const castes = JSON.parse(row.caste);
            castes.forEach((c: string) => categories.add(c));
        } catch {
            // If not JSON, treat as single value
            if (row.caste) categories.add(row.caste);
        }
    });

    return Array.from(categories).sort();
}

// Get scholarships by category
export async function getScholarshipsByCategory(category: string) {
    if (WP_API_URL) {
        // Try filtering by taxonomy term slug
        const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const terms = await wpFetch('/scholarship_category', { slug });
        if (terms && Array.isArray(terms) && terms.length > 0) {
            const posts = await wpFetch('/scholarship', { scholarship_category: terms[0].id });
            if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
        }

        // Fallback to search
        const posts = await wpFetch('/scholarship', { search: category });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship).filter((s: any) =>
            s.caste.some((c: string) => c.toLowerCase().includes(category.toLowerCase()))
        );
    }
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE caste LIKE ?').all(`%${category}%`);
    db.close();
    return scholarships.map(parseScholarship);
}

// Canonical mapping for education levels
export const CANONICAL_LEVELS: Record<string, { label: string; rawLevels: string[]; description: string; icon: string }> = {
    'class-1-10': {
        label: 'Class 1 to 10',
        rawLevels: [
            'Class 1 to Class 10',
            'Class 1 to Class 8 (Note: ONLY up to Class 8, unlike SC/ST/OBC which go to Class 10)',
            'Class 5-10',
            'Class 9, Class 10',
            'Class 9-10',
            'Pre-Matric (Class 9-10)',
            'School (1-5)',
            'School (9-10)'
        ],
        description: 'Scholarships for primary and secondary school students.',
        icon: '🎒'
    },
    'class-11-12': {
        label: 'Class 11 & 12',
        rawLevels: [
            'Class 11, Class 12',
            'Class 11-12',
            'Class 10, Class 12',
            'Higher Secondary',
            'Post-Matric (Class 11-12)',
            'School (11-12)'
        ],
        description: 'Scholarships for Higher Secondary / Intermediate students.',
        icon: '📖'
    },
    'diploma-polytechnic': {
        label: 'Diploma / Polytechnic',
        rawLevels: [
            'Diploma',
            'Diploma, Undergraduate',
            'Diploma/Polytechnic, ITI/ITC',
            'Diploma/Polytechnic'
        ],
        description: 'Professional and technical diplomas and polytechnic courses.',
        icon: '🛠️'
    },
    'iti-courses': {
        label: 'ITI Courses',
        rawLevels: [
            'ITI',
            'ITI/ITC'
        ],
        description: 'Vocational training and industrial trade certificates.',
        icon: '🔧'
    },
    'graduation-ug': {
        label: 'Graduation (UG)',
        rawLevels: [
            'UG',
            'Undergraduate',
            'Undergraduate (UG)',
            'Graduate',
            'Bachelor'
        ],
        description: 'Bachelor\'s degrees like B.Tech, B.Com, B.Sc, B.A.',
        icon: '🎓'
    },
    'post-graduation-pg': {
        label: 'Post-Graduation (PG)',
        rawLevels: [
            'PG',
            'Post-Graduate',
            'Postgraduate (PG)',
            'Master',
            'Postgraduate'
        ],
        description: 'Master\'s degrees like M.Tech, M.Com, MBA, M.Sc.',
        icon: '📜'
    },
    'phd-research': {
        label: 'PhD & Research',
        rawLevels: [
            'PhD',
            'Postdoctoral',
            'Research'
        ],
        description: 'Doctoral programs and advanced research fellowships.',
        icon: '🔬'
    }
};

/**
 * Returns the canonical slug for a given raw level text.
 * Handles messy strings like "Class 9 to 12, UG, PG" by matching the first likely category.
 */
export function getCanonicalSlugForLevel(levelText: any): string {
    // Handle null, undefined, arrays, objects
    if (!levelText) return 'graduation-ug';

    // If it's an array, take the first element
    if (Array.isArray(levelText)) {
        levelText = levelText[0] || '';
    }

    // Convert to string if it's not already
    const levelStr = String(levelText);
    if (!levelStr || levelStr === 'undefined' || levelStr === 'null') return 'graduation-ug';

    const lower = levelStr.toLowerCase();

    // Check canonical list first
    for (const [slug, config] of Object.entries(CANONICAL_LEVELS)) {
        if (config.rawLevels.some(raw => raw.toLowerCase() === lower)) return slug;
    }

    // Heuristics for messy strings
    if (lower.includes('class 9') || lower.includes('class 11') || lower.includes('class 12')) return 'class-11-12';
    if (lower.includes('class 1') || lower.includes('class 8') || lower.includes('class 10')) return 'class-1-10';
    if (lower.includes('ug') || lower.includes('undergraduate') || lower.includes('bachelor') || lower.includes('graduation')) return 'graduation-ug';
    if (lower.includes('pg') || lower.includes('postgraduate') || lower.includes('master')) return 'post-graduation-pg';
    if (lower.includes('diploma') || lower.includes('polytechnic')) return 'diploma-polytechnic';
    if (lower.includes('iti')) return 'iti-courses';
    if (lower.includes('phd') || lower.includes('research')) return 'phd-research';

    return 'graduation-ug'; // Default fallback
}

/**
 * Returns the canonical slug for income range based on the numeric limit.
 */
export function getCanonicalSlugForIncome(incomeLimit: number | null): string {
    if (incomeLimit === null || incomeLimit === 0 || incomeLimit < 0) return 'no-income-bar';
    if (incomeLimit <= 100000) return '0-1l';
    if (incomeLimit <= 250000) return '1-2.5l';
    if (incomeLimit <= 500000) return '2.5-5l';
    return '5l-plus';
}

/**
 * Returns a clean, URL-safe slug for a category/caste.
 * Handles messy strings like "All (50% reservation...)"
 */
export function getCanonicalSlugForCategory(category: any): string {
    // Handle null, undefined, arrays, objects
    if (!category) return 'general';

    // If it's an array, take the first element
    if (Array.isArray(category)) {
        category = category[0] || 'general';
    }

    // Convert to string
    const categoryStr = String(category);
    if (!categoryStr || categoryStr === 'undefined' || categoryStr === 'null') return 'general';

    const lower = categoryStr.toLowerCase();

    // Heuristics for common messy strings
    if (lower.includes('obc')) return 'obc';
    if (lower.includes('sc') && lower.includes('st')) return 'sc-st';
    if (lower.includes('sc')) return 'sc';
    if (lower.includes('st')) return 'st';
    if (lower.includes('minority') || lower.includes('muslim') || lower.includes('christian')) return 'minority';
    if (lower.includes('general')) return 'general';
    if (lower.includes('all')) return 'general'; // Usually 'All students' implies General/Open

    // Fallback: Clean the string of all non-alphanumeric characters
    return lower
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Get all unique education levels (raw)
export async function getAllLevels() {
    if (WP_API_URL) {
        // Fetch from scholarship_level taxonomy
        const terms = await wpFetch('/scholarship_level?per_page=100');
        if (terms && Array.isArray(terms)) {
            return terms.map((t: any) => t.name);
        }
    }
    const db = getDatabase();
    const levels = db.prepare('SELECT DISTINCT level FROM scholarships WHERE level IS NOT NULL ORDER BY level').all();
    db.close();
    return levels.map((row: any) => row.level);
}

// Get scholarships by education level (supports raw level or canonical slug)
export async function getScholarshipsByLevel(levelOrSlug: string) {
    if (WP_API_URL) {
        // Look up by taxonomy slug first
        const terms = await wpFetch('/scholarship_level', { slug: levelOrSlug });
        if (terms && Array.isArray(terms) && terms.length > 0) {
            const posts = await wpFetch('/scholarship', { scholarship_level: terms[0].id });
            if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
        }

        // Fallback to search
        const posts = await wpFetch('/scholarship', { search: levelOrSlug });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
    }
    const db = getDatabase();

    // Check if it's a canonical slug
    const canonical = CANONICAL_LEVELS[levelOrSlug];

    if (canonical) {
        // Build a query for all raw levels in this bucket
        const placeholders = canonical.rawLevels.map(() => '?').join(',');
        const query = `
            SELECT * FROM scholarships 
            WHERE level IN (${placeholders})
            OR level LIKE ?
        `;

        // Also add a broad LIKE check for safety if the level contains the label string
        const broadLike = `%${canonical.label}%`;
        const scholarships = db.prepare(query).all(...canonical.rawLevels, broadLike);
        db.close();
        return scholarships.map(parseScholarship);
    }

    // Otherwise fall back to exact match for raw level
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE level = ?').all(levelOrSlug);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get scholarships by income range
export async function getScholarshipsByIncomeRange(minIncome: number, maxIncome: number) {
    const db = getDatabase();

    let scholarships;
    if (minIncome === -1) {
        // "No Income Bar" case: includes NULL, 0, or empty string
        scholarships = db.prepare(
            "SELECT * FROM scholarships WHERE (income_limit IS NULL OR income_limit = 0 OR income_limit = '')"
        ).all();
    } else {
        scholarships = db.prepare(
            'SELECT * FROM scholarships WHERE (income_limit >= ? AND income_limit <= ?)'
        ).all(minIncome, maxIncome);
    }

    db.close();
    return scholarships.map(parseScholarship);
}

// Get all income ranges with counts
export async function getIncomeRanges() {
    const db = getDatabase();
    // Include NULLs this time
    const scholarships = db.prepare('SELECT income_limit FROM scholarships').all();
    db.close();

    const ranges = [
        { label: 'No Income Bar', min: -1, max: 0, slug: 'no-income-bar' },
        { label: '0-1L', min: 1, max: 100000, slug: '0-1l' },
        { label: '1-2.5L', min: 100001, max: 250000, slug: '1-2.5l' },
        { label: '2.5-5L', min: 250001, max: 500000, slug: '2.5-5l' },
        { label: '5L+', min: 500001, max: 10000000, slug: '5l-plus' },
    ];

    return ranges.map(range => ({
        ...range,
        count: scholarships.filter((s: any) => {
            const limit = s.income_limit === null || s.income_limit === "" ? 0 : Number(s.income_limit);
            if (range.min === -1) return limit === 0;
            return limit >= range.min && limit <= range.max;
        }).length
    }));
}

// Get scholarships by provider type
export async function getScholarshipsByProviderType(providerType: string) {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE provider_type = ?').all(providerType);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get all unique provider types
export async function getAllProviderTypes() {
    const db = getDatabase();
    const types = db.prepare('SELECT DISTINCT provider_type FROM scholarships WHERE provider_type IS NOT NULL ORDER BY provider_type').all();
    db.close();
    return types.map((row: any) => row.provider_type);
}

// Search scholarships by name, provider, or state
export async function searchScholarships(query: string) {
    const db = getDatabase();
    const searchTerm = `%${query}%`;
    const scholarships = db.prepare(`
        SELECT * FROM scholarships 
        WHERE title LIKE ? 
        OR provider LIKE ? 
        OR state LIKE ?
        ORDER BY title
    `).all(searchTerm, searchTerm, searchTerm);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get scholarships by multiple IDs (for comparison)
export async function getScholarshipsByIds(ids: string[]) {
    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    const scholarships = db.prepare(`SELECT * FROM scholarships WHERE id IN (${placeholders})`).all(...ids);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get featured scholarships
export async function getFeaturedScholarships(limit: number = 6) {
    if (WP_API_URL) {
        // Fetch posts and filter for featured in mapping or use a specific tag if you set one up
        // For now, let's just fetch the latest published scholarships as "featured" 
        // Or if you added a 'featured' tag/category, we could filter by that.
        const posts = await wpFetch('/scholarship', { per_page: limit });
        if (posts && Array.isArray(posts)) return posts.map(mapWpPostToScholarship);
    }
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE is_featured = 1 ORDER BY priority_score DESC LIMIT ?').all(limit);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get scholarships by type
export async function getScholarshipsByType(type: string) {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE scholarship_type = ?').all(type);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get related scholarships based on State, Level, and Category
export async function getRelatedScholarships(currentId: string, limit: number = 3) {
    const scholarship = (await getScholarshipsByIds([currentId]))[0];
    if (!scholarship) return [];

    const db = getDatabase();

    // We try to find scholarships that match:
    // 1. Same Level (Critical)
    // 2. Same State (High)
    // 3. Same Category/Caste (Medium)

    const state = scholarship.state || 'All India';
    const level = scholarship.level;
    const category = scholarship.caste[0] || 'General';

    // Step 1: Broad match by Level (most important for students)
    // Then sort by priority_score and then by matching state/category
    const query = `
        SELECT * FROM scholarships 
        WHERE id != ? 
        AND status = 'Active'
        AND (level = ? OR level LIKE ?)
        ORDER BY 
            (CASE WHEN state = ? THEN 2 ELSE 0 END) + 
            (CASE WHEN caste LIKE ? THEN 1 ELSE 0 END) DESC,
            priority_score DESC 
        LIMIT ?
    `;

    const searchTerm = `%${level}%`;
    const categorySearch = `%${category}%`;

    const related = db.prepare(query).all(currentId, level, searchTerm, state, categorySearch, limit);
    db.close();

    return related.map(parseScholarship);
}

// Get global stats for pillar pages
export async function getScholarshipStats() {
    const db = getDatabase();
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT state) as stateCount,
            SUM(CASE WHEN scholarship_type = 'Government' THEN 1 ELSE 0 END) as govCount,
            SUM(CASE WHEN scholarship_type = 'Private' OR scholarship_type = 'Corporate' THEN 1 ELSE 0 END) as privateCount
        FROM scholarships
    `).get() as any;
    db.close();
    return stats;
}

// Get scholarships by course cluster (e.g., Engineering, Medical)
export async function getScholarshipsByCourse(course: string) {
    const db = getDatabase();
    // Use LIKE to match the course within the course_stream JSON or text
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE course_stream LIKE ?').all(`%${course}%`);
    db.close();
    return scholarships.map(parseScholarship);
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
        // Fallback: split by commas
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
    
    // 1. Check if it is a string representation of an array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            // Try parsing as JSON
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                rawItems = parsed.map(s => String(s));
            }
        } catch (e) {
            // Fallback: extract string literals from python-like list representation
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
    
    // 2. If it wasn't parsed as a stringified array, treat it as a single string
    if (rawItems.length === 0) {
        if (/Step \d+:/i.test(trimmed)) {
            rawItems = trimmed.split(/Step \d+:/i).map(s => s.trim()).filter(Boolean);
        } else if (/\b\d+\.\s+/.test(trimmed)) {
            rawItems = trimmed.split(/(?=\b\d+\.\s+)/).map(s => s.trim()).filter(Boolean);
        } else {
            rawItems = trimmed.split('\n').map(s => s.trim()).filter(Boolean);
        }
    }
    
    // 3. Clean up each item (strip leading numbers, Step X: prefixes, etc.)
    const cleanItems = rawItems.map(item => {
        let cleaned = item.trim();
        // Remove leading quote/brackets if any escaped characters remain
        cleaned = cleaned.replace(/^['"\[\s,]+|['"\]\s,]+$/g, '');
        // Strip leading number prefix like "1. ", "01. ", "1) "
        cleaned = cleaned.replace(/^\b\d+[\.\)]\s*/, '');
        // Strip leading "Step X: " prefix
        cleaned = cleaned.replace(/^Step\s+\d+:\s*/i, '');
        return cleaned.trim();
    }).filter(Boolean);
    
    return cleanItems;
}


