// Outbound links to Rozgaro.in, the publisher's government-job tracker.
//
// Rozgaro already links to this site from its recruitment pages; this is the return
// direction, so Rozgaro gets referral visits from readers who are already planning their
// next step, and its new domain gets genuine inbound links from pages about the same
// readers. One contextual box per page — never a sitewide footer link.
//
// Every target was checked against https://www.rozgaro.in/sitemap.xml and requested live
// (HTTP 200) on 2026-11-01. Rozgaro has no /jobs-for/graduate page yet, so graduate-level
// readers are sent to the closest sector hub (its SSC or UPSC hub); change the map here —
// not the templates — when a graduate page or a dedicated exam page goes live.
import { getCanonicalSlugForLevel } from '@/lib/utils';

export const ROZGARO_SITE = 'https://www.rozgaro.in';

const TAG = 'utm_source=indiascholarships&utm_medium=referral';

type LevelTarget = {
    /** path on rozgaro.in, without a trailing slash */
    path: string;
    heading: string;
    body: string;
    cta: string;
};

// Keyed by the canonical scholarship level slug the site already uses for its own
// "For {level}" links (CANONICAL_LEVELS in lib/utils.ts). School levels are absent:
// those readers are not job-hunting yet, so jobsLevelSlug() returns null for them.
const LEVEL_TARGETS: Record<string, LevelTarget> = {
    'class-11-12': {
        path: '/jobs-for/12th-pass',
        heading: 'Finishing class 12? Government jobs are the other option.',
        body: 'Rozgaro — our sister site — tracks 12th-pass government job notifications, admit cards and results from the official notice, so each stage is confirmed once instead of arriving as a forwarded message.',
        cta: 'See 12th-pass government jobs on Rozgaro',
    },
    'iti-courses': {
        path: '/jobs-for/iti',
        heading: 'Government technician and apprentice posts are the other option after ITI.',
        body: 'Rozgaro — our sister site — tracks ITI government job notifications, admit cards and results from the official notice, including the trade each post accepts.',
        cta: 'See ITI government jobs on Rozgaro',
    },
    'diploma-polytechnic': {
        path: '/jobs-for/diploma',
        heading: 'Junior engineer and technician posts are the other option after a diploma.',
        body: 'Rozgaro — our sister site — tracks diploma government job notifications, admit cards and results from the official notice, including the branch each post accepts.',
        cta: 'See diploma government jobs on Rozgaro',
    },
    'graduation-ug': {
        path: '/ssc',
        heading: 'After graduation, government exams are the other big option.',
        body: 'Rozgaro — our sister site — tracks SSC CGL and the other SSC government exams, from the notification to the admit card and the result.',
        cta: 'See graduate-level government exams on Rozgaro',
    },
    'post-graduation-pg': {
        path: '/upsc',
        heading: 'After post-graduation, government exams are still open to you.',
        body: 'Rozgaro — our sister site — tracks UPSC Civil Services and the other UPSC exams a degree qualifies you for, from the notification to the result.',
        cta: 'See UPSC and other graduate-level exams on Rozgaro',
    },
    'phd-research': {
        path: '/upsc',
        heading: 'Government exams are still open to you after a research degree.',
        body: 'Rozgaro — our sister site — tracks UPSC Civil Services and the other UPSC exams a degree qualifies you for, from the notification to the result.',
        cta: 'See UPSC and other graduate-level exams on Rozgaro',
    },
};

// A qualification above school. Used to tell a real level apart from free text, so a page
// never gets a "jobs" box just because its level field was left messy.
const ABOVE_SCHOOL = /\b(ug|undergrad\w*|graduat\w*|bachelor\w*|degree|pg|postgrad\w*|post-grad\w*|master\w*|mba|phd|ph\.d|doctor\w*|research|iti|itc|diploma|polytechnic)\b/i;
// Post-matric and class 11-12: school-level, but the reader is heading for 12th-pass jobs.
const AT_LEAST_12 = /\b(class\s*1[12]|higher secondary|intermediate|post-matric)\b|11\s*[-&,]\s*12/i;

/**
 * The canonical level slug for the jobs box, or null when the level has no matching jobs
 * page (school levels below class 12, or a level field with no recognisable qualification).
 */
function jobsLevelSlug(level: unknown): string | null {
    const text = Array.isArray(level) ? level.join(', ') : level;
    if (typeof text !== 'string' || !text.trim()) return null;
    const lower = text.toLowerCase();
    if (ABOVE_SCHOOL.test(lower)) {
        // getCanonicalSlugForLevel() defaults to graduation-ug for anything it cannot
        // place, so the two known exceptions are pinned before it runs.
        if (/\bmba\b/.test(lower)) return 'post-graduation-pg';
        if (/post-matric/.test(lower) && !/\b(ug|undergrad\w*|degree)\b/.test(lower)) {
            return 'class-11-12';
        }
        return getCanonicalSlugForLevel(text);
    }
    if (AT_LEAST_12.test(lower)) return 'class-11-12';
    return null;
}

export type JobsLink = {
    /** full UTM-tagged URL */
    href: string;
    heading: string;
    body: string;
    cta: string;
};

/**
 * The contextual "government jobs" box for a scholarship level, or null when the level
 * has no matching Rozgaro page. `campaign` is the placement, so the two page types can be
 * compared in analytics.
 */
export function jobsLinkForLevel(
    level: unknown,
    campaign: 'level-hub' | 'scholarship-page'
): JobsLink | null {
    const slug = jobsLevelSlug(level);
    if (!slug) return null;
    const target = LEVEL_TARGETS[slug];
    if (!target) return null;
    return {
        href: `${ROZGARO_SITE}${target.path}?${TAG}&utm_campaign=${campaign}`,
        heading: target.heading,
        body: target.body,
        cta: target.cta,
    };
}
