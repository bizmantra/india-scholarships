import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { pagePath } from '@/scripts/lib/sa-inbox';

const LOCALES = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];

// Listing pages that show deadlines, amounts or new entries
const LISTING_PATHS = ['/', '/scholarships', '/scholarships/deadlines', '/scholarships/recently-added', '/scholarships/trending'];

/**
 * How Next.js matches revalidatePath (next/dist/server/lib/implicit-tags.js): a cached page carries
 * one tag for its exact URL ("/scholarships/abc") and one per layout of its route pattern
 * ("/scholarships-in/[state]/layout", "/study-abroad/layout"). So:
 *   - an exact URL must be passed WITHOUT a type, and
 *   - a type ('layout') only matches when the path is the route pattern, e.g. '/scholarships-in/[state]'.
 * Passing an exact URL with 'page' or 'layout' matches nothing and silently refreshes nothing.
 */

/**
 * Refresh the pages that show these scholarships, so an approval is live within seconds
 * instead of waiting for the next daily rebuild. Pages regenerate from Turso on their next visit.
 */
export function refreshScholarshipPages(items: { slug: string; state?: string | null }[]) {
    const paths = new Set<string>();
    let hasState = false;
    for (const { slug, state } of items) {
        if (!slug) continue;
        paths.add(`/scholarships/${slug}`);
        LOCALES.forEach(locale => paths.add(`/${locale}/scholarships/${slug}`));
        for (const s of String(state || '').split(',').map(x => x.trim()).filter(Boolean)) {
            if (!/all india/i.test(s)) { paths.add(`/scholarships-in/${slugify(s)}`); hasState = true; }
        }
    }
    if (paths.size === 0) return [];
    LISTING_PATHS.forEach(p => paths.add(p));
    for (const path of paths) revalidatePath(path);
    // State pages and the pages nested under them (/scholarships-in/<state>/<category>)
    if (hasState) revalidatePath('/scholarships-in/[state]', 'layout');
    return [...paths];
}

/**
 * Refresh Study Abroad pages after an approved change. A change can show on the page itself, its
 * country pages, lists, comparison pages and the Study Abroad home, so the whole section is marked
 * stale (pages regenerate one by one on their next visit; about 200 pages, so this is cheap).
 */
export function refreshStudyAbroadPages(items: { table: string; row: any }[]) {
    const pages = new Set<string>();
    for (const { table, row } of items) {
        const path = row ? pagePath(table, row) : null;
        if (path) pages.add(path);
    }
    if (items.length === 0) return [];
    for (const path of pages) revalidatePath(path);
    revalidatePath('/study-abroad', 'layout');
    return [...pages, '/study-abroad (whole section)'];
}
