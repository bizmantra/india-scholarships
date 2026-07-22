// Custom mapping for messy database strings to clean, SEO-friendly slugs
const CATEGORY_SLUG_MAP: Record<string, string> = {
    'all categories (sc/st/obc/minority/general) - must possess valid unique disability id (udid) card issued by department for empowerment of persons with disabilities': 'students-with-disabilities',
    'general category - economically weaker section (ews). includes: children of defense personnel (sc/st parents in army/navy/airforce': 'general-ews',
    'government of india.': 'central-government',
    'jco/or/lower ranks - children of unorganized workers (auto drivers)': 'defense-unorganized-workers',
    'semi-nomadic tribes - caste must be in obc list notified by government of india or state government.': 'semi-nomadic-tribes',
    'students with disabilities (persons with disabilities - pwd) with valid udid': 'students-with-disabilities',
    'etc.). general category students with low income. brahmin community students (separate scheme under brahmin development board - verify).': 'general-brahmin',
    'minority communities: muslim': 'minority-muslim',
};

export function slugify(text: string): string {
    const input = text.toString().toLowerCase().trim();

    // Check for manual overrides first
    if (CATEGORY_SLUG_MAP[input]) {
        return CATEGORY_SLUG_MAP[input];
    }

    const slug = input
        .replace(/\(.*\)/g, '')    // Remove content inside parentheses
        .replace(/[:\/\\-]/g, ' ') // Replace special separators with spaces
        .replace(/[^\w\s-]/g, '')  // Remove other non-word chars except spaces/hyphens
        .replace(/\s+/g, '-')      // Replace spaces with -
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start
        .replace(/-+$/, '');        // Trim - from end

    // Truncate to a reasonable length (max 6 words)
    const words = slug.split('-');
    if (words.length > 6) {
        return words.slice(0, 6).join('-');
    }
    return slug;
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
    if (!levelText) return 'graduation-ug';
    if (Array.isArray(levelText)) {
        levelText = levelText[0] || '';
    }
    const levelStr = String(levelText);
    if (!levelStr || levelStr === 'undefined' || levelStr === 'null') return 'graduation-ug';
    const lower = levelStr.toLowerCase();
    for (const [slug, config] of Object.entries(CANONICAL_LEVELS)) {
        if (config.rawLevels.some(raw => raw.toLowerCase() === lower)) return slug;
    }
    if (lower.includes('class 9') || lower.includes('class 11') || lower.includes('class 12')) return 'class-11-12';
    if (lower.includes('class 1') || lower.includes('class 8') || lower.includes('class 10')) return 'class-1-10';
    if (lower.includes('ug') || lower.includes('undergraduate') || lower.includes('bachelor') || lower.includes('graduation')) return 'graduation-ug';
    if (lower.includes('pg') || lower.includes('postgraduate') || lower.includes('master')) return 'post-graduation-pg';
    if (lower.includes('diploma') || lower.includes('polytechnic')) return 'diploma-polytechnic';
    if (lower.includes('iti')) return 'iti-courses';
    if (lower.includes('phd') || lower.includes('research')) return 'phd-research';
    return 'graduation-ug';
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
    if (!category) return 'general';
    if (Array.isArray(category)) {
        category = category[0] || 'general';
    }
    const categoryStr = String(category);
    if (!categoryStr || categoryStr === 'undefined' || categoryStr === 'null') return 'general';
    const lower = categoryStr.toLowerCase();
    if (lower.includes('obc')) return 'obc';
    if (lower.includes('sc') && lower.includes('st')) return 'sc-st';
    if (lower.includes('sc')) return 'sc';
    if (lower.includes('st')) return 'st';
    if (lower.includes('minority') || lower.includes('muslim') || lower.includes('christian')) return 'minority';
    if (lower.includes('ews') || lower.includes('economically weaker')) return 'ews';
    if (lower.includes('general')) return 'general';
    if (lower.includes('all')) return 'general';
    return lower
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Extracts a valid HTTP/HTTPS URL from a messy/descriptive apply url field.
 * Returns null if no valid URL is found.
 */export function sanitizeApplyUrl(urlStr: string | null | undefined): string | null {
    if (!urlStr) return null;
    const trimmed = urlStr.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    const match = trimmed.match(/https?:\/\/[^\s\)]+/);
    if (match) return match[0];
    
    // Fallback: If it looks like a domain name (contains . and no spaces), prepend https://
    if (trimmed.includes('.') && !trimmed.includes(' ') && trimmed.length > 3) {
        return `https://${trimmed}`;
    }
    return null;
}

/**
 * Maps messy provider types to one of three clean paths:
 * /government-scholarships, /private-scholarships, /corporate-scholarships
 */
export function getScholarshipTypeRoute(type: string | null | undefined): string {
    if (!type) return '/government-scholarships';
    const lower = type.toLowerCase();
    if (lower.includes('private') || lower.includes('university') || lower.includes('foundation')) {
        return '/private-scholarships';
    }
    if (lower.includes('corporate') || lower.includes('company') || lower.includes('csr')) {
        return '/corporate-scholarships';
    }
    return '/government-scholarships';
}

/**
 * Formats dynamic deadline strings safely, handling edge cases like NA, Rolling, and Open Now.
 */
export function formatDeadlineDate(
    deadline: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
    fallback: string = 'Open Now'
): string {
    if (!deadline) return fallback;
    const trimmed = deadline.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'not specified' || lower === 'na' || lower === '') {
        return 'Check Official Portal';
    }
    if (lower === 'open now' || lower === 'rolling') {
        return trimmed;
    }
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) {
        return trimmed;
    }
    return date.toLocaleDateString('en-IN', options);
}

