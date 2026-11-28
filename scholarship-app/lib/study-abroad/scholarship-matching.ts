export type CountrySlug = 'germany' | 'usa' | 'uk' | 'canada' | 'australia' | 'ireland';

const LAUNCHED_SCHOLARSHIP_COUNTRIES: Record<string, string> = {
    germany: 'Germany',
    usa: 'United States',
    uk: 'United Kingdom',
};

const isLaunchedCountry = (slug: string): boolean => slug in LAUNCHED_SCHOLARSHIP_COUNTRIES;

export interface MatchableScholarship {
    slug: string;
    title: string;
    provider?: string | null;
    country_of_study?: string | null;
    level?: string | null;
    scholarship_scope?: string | null;
}

export interface MatchableUniversity {
    slug: string;
    name: string;
    country: CountrySlug;
}

export interface MatchableProgram {
    id: string;
    slug: string;
    university_slug: string;
    country: CountrySlug;
    degree: string;
    title: string;
    university_name?: string;
}

// Explicit school/sub-unit provider aliases where the provider name does not contain the full university name.
// Never use fuzzy matching; add verified aliases here only.
const UNIVERSITY_PROVIDER_ALIASES: Record<string, string> = {
    'haas school of business uc berkeley': 'uc-berkeley',
    'nyu stern school of business': 'nyu-new-york-university',
    'nyu tandon school of engineering': 'nyu-new-york-university',
    'ross school of business': 'umich-university-of-michigan-ann-arbor',
};

export function normalizeOrgName(value: string | null | undefined): string {
    return String(value || '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function baseUniversityName(name: string): string {
    return name.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

export function scholarshipMatchesCountry(countryOfStudy: string | null | undefined, country: CountrySlug): boolean {
    const raw = (countryOfStudy || '').toLowerCase();
    if (!raw) return false;
    if (country === 'usa') return /\b(usa|u\.s\.a\.|united states)\b/.test(raw);
    if (country === 'germany') return /\bgermany\b/.test(raw);
    const label = LAUNCHED_SCHOLARSHIP_COUNTRIES[country];
    return Boolean(label && raw.includes(label.toLowerCase()));
}

function containsWholePhrase(haystack: string, needle: string): boolean {
    if (!haystack || !needle) return false;
    return (` ${haystack} `).includes(` ${needle} `);
}

export function matchScholarshipToUniversities<U extends MatchableUniversity>(
    scholarship: MatchableScholarship,
    universities: U[],
): U[] {
    const normProvider = normalizeOrgName(scholarship.provider);
    const normTitle = normalizeOrgName(scholarship.title);
    const aliasSlug = UNIVERSITY_PROVIDER_ALIASES[normProvider];

    const matched: U[] = [];
    for (const u of universities) {
        if (!isLaunchedCountry(u.country)) continue;
        if (scholarship.country_of_study && !scholarshipMatchesCountry(scholarship.country_of_study, u.country)) {
            continue;
        }

        const normFull = normalizeOrgName(u.name);
        const normBase = normalizeOrgName(baseUniversityName(u.name));

        const exactProvider = Boolean(normProvider && (normProvider === normFull || normProvider === normBase));
        const aliasMatch = Boolean(aliasSlug && u.slug === aliasSlug);
        const phraseMatch = Boolean(
            normBase.length >= 12 &&
            (containsWholePhrase(normProvider, normBase) || containsWholePhrase(normTitle, normBase))
        );

        if (exactProvider || aliasMatch || phraseMatch) {
            matched.push(u);
        }
    }
    return matched;
}

export function isProgramCompatibleWithLevel(programDegree: string, scholarshipLevel: string | null | undefined): boolean {
    const level = (scholarshipLevel || '').toLowerCase().trim();
    if (!level) return true;

    const deg = programDegree.toLowerCase().trim();
    if (deg === 'ms' || deg === 'master' || deg === 'masters') {
        return /\b(masters?|master's|ms|m\.sc|pg|postgraduate|graduate|all)\b/i.test(level);
    }
    if (deg === 'mba') {
        return /\b(mba|masters?|master's|pg|postgraduate|graduate|all)\b/i.test(level);
    }
    if (deg === 'phd') {
        return /\b(phd|doctoral|doctorate|research|pg|postgraduate|all)\b/i.test(level);
    }
    if (deg === 'ug' || deg === 'undergraduate') {
        return /\b(ug|undergraduate|bachelor|bachelor's|all)\b/i.test(level);
    }
    return true;
}

export function rankScholarshipsForUniversity<S extends MatchableScholarship>(
    university: MatchableUniversity,
    scholarships: S[],
    hiddenSlugs: Set<string> = new Set(),
    limit = 6,
): S[] {
    const own: S[] = [];
    const countryWide: S[] = [];
    const seen = new Set<string>();

    for (const s of scholarships) {
        if (seen.has(s.slug)) continue;
        seen.add(s.slug);
        if (matchScholarshipToUniversities(s, [university]).length > 0) {
            own.push(s);
        } else if (!hiddenSlugs.has(s.slug)) {
            countryWide.push(s);
        }
    }
    return [...own, ...countryWide].slice(0, limit);
}

export function rankScholarshipsForProgram<S extends MatchableScholarship>(
    program: Pick<MatchableProgram, 'university_slug' | 'university_name' | 'country' | 'degree'>,
    scholarships: S[],
    hiddenSlugs: Set<string> = new Set(),
    limit = 6,
): S[] {
    const university: MatchableUniversity = {
        slug: program.university_slug,
        name: program.university_name || '',
        country: program.country,
    };

    const ownMatchingLevel: S[] = [];
    const countryMatchingLevel: S[] = [];
    const ownOtherLevel: S[] = [];
    const countryOtherLevel: S[] = [];
    const seen = new Set<string>();

    for (const s of scholarships) {
        if (seen.has(s.slug)) continue;
        seen.add(s.slug);

        const isOwn = Boolean(university.name && matchScholarshipToUniversities(s, [university]).length > 0);
        if (!isOwn && hiddenSlugs.has(s.slug)) continue;
        const levelOk = isProgramCompatibleWithLevel(program.degree, s.level);

        if (isOwn && levelOk) ownMatchingLevel.push(s);
        else if (!isOwn && levelOk) countryMatchingLevel.push(s);
        else if (isOwn) ownOtherLevel.push(s);
        else countryOtherLevel.push(s);
    }

    return [...ownMatchingLevel, ...countryMatchingLevel, ...ownOtherLevel, ...countryOtherLevel].slice(0, limit);
}
