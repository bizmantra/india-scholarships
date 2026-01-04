import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'scholarships.db');

// Create or open database
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
export function getAllScholarships() {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships').all();
    db.close();
    return scholarships.map(parseScholarship);
}

// Get scholarship by slug
export function getScholarshipBySlug(slug: string) {
    const db = getDatabase();
    const scholarship = db.prepare('SELECT * FROM scholarships WHERE slug = ?').get(slug);
    db.close();
    return scholarship ? parseScholarship(scholarship) : null;
}

// Get scholarships by state
export function getScholarshipsByState(state: string) {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE state = ?').all(state);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get all unique states
export function getAllStates() {
    const db = getDatabase();
    const states = db.prepare('SELECT DISTINCT state FROM scholarships WHERE state IS NOT NULL ORDER BY state').all();
    db.close();
    return states.map((row: any) => row.state);
}

// Get all unique categories (castes)
export function getAllCategories() {
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
export function getScholarshipsByCategory(category: string) {
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

// Get all unique education levels (raw)
export function getAllLevels() {
    const db = getDatabase();
    const levels = db.prepare('SELECT DISTINCT level FROM scholarships WHERE level IS NOT NULL ORDER BY level').all();
    db.close();
    return levels.map((row: any) => row.level);
}

// Get scholarships by education level (supports raw level or canonical slug)
export function getScholarshipsByLevel(levelOrSlug: string) {
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
export function getScholarshipsByIncomeRange(minIncome: number, maxIncome: number) {
    const db = getDatabase();
    const scholarships = db.prepare(
        'SELECT * FROM scholarships WHERE income_limit >= ? AND income_limit <= ?'
    ).all(minIncome, maxIncome);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get all income ranges with counts
export function getIncomeRanges() {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT income_limit FROM scholarships WHERE income_limit IS NOT NULL').all();
    db.close();

    const ranges = [
        { label: '0-1L', min: 0, max: 100000, slug: '0-1l' },
        { label: '1-2.5L', min: 100001, max: 250000, slug: '1-2.5l' },
        { label: '2.5-5L', min: 250001, max: 500000, slug: '2.5-5l' },
        { label: '5L+', min: 500001, max: 10000000, slug: '5l-plus' },
    ];

    return ranges.map(range => ({
        ...range,
        count: scholarships.filter((s: any) => s.income_limit >= range.min && s.income_limit <= range.max).length
    }));
}

// Get scholarships by provider type
export function getScholarshipsByProviderType(providerType: string) {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE provider_type = ?').all(providerType);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get all unique provider types
export function getAllProviderTypes() {
    const db = getDatabase();
    const types = db.prepare('SELECT DISTINCT provider_type FROM scholarships WHERE provider_type IS NOT NULL ORDER BY provider_type').all();
    db.close();
    return types.map((row: any) => row.provider_type);
}

// Search scholarships by name, provider, or state
export function searchScholarships(query: string) {
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
export function getScholarshipsByIds(ids: string[]) {
    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    const scholarships = db.prepare(`SELECT * FROM scholarships WHERE id IN (${placeholders})`).all(...ids);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get featured scholarships
export function getFeaturedScholarships(limit: number = 6) {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE is_featured = 1 ORDER BY priority_score DESC LIMIT ?').all(limit);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get scholarships by type
export function getScholarshipsByType(type: string) {
    const db = getDatabase();
    const scholarships = db.prepare('SELECT * FROM scholarships WHERE scholarship_type = ?').all(type);
    db.close();
    return scholarships.map(parseScholarship);
}

// Get global stats for pillar pages
export function getScholarshipStats() {
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
export function getScholarshipsByCourse(course: string) {
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
        caste: tryParseJSON(row.caste, []),
        course_stream: tryParseJSON(row.course_stream, []),
        docs_needed: tryParseJSON(row.docs_needed, []),
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
