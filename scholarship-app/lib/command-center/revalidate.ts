import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { pagePath } from '@/scripts/lib/sa-inbox';

const LOCALES = ['hi', 'bn', 'ta', 'te', 'or', 'kn'];

// Listing pages that show deadlines, amounts or new entries
const LISTING_PATHS = ['/', '/scholarships', '/scholarships/deadlines', '/scholarships/recently-added', '/scholarships/trending'];

/**
 * Refresh the pages that show these scholarships, so an approval is live within seconds
 * instead of waiting for the next daily rebuild. Pages regenerate from Turso on their next visit.
 */
export function refreshScholarshipPages(items: { slug: string; state?: string | null }[]) {
    const paths = new Set<string>();
    for (const { slug, state } of items) {
        if (!slug) continue;
        paths.add(`/scholarships/${slug}`);
        LOCALES.forEach(locale => paths.add(`/${locale}/scholarships/${slug}`));
        for (const s of String(state || '').split(',').map(x => x.trim()).filter(Boolean)) {
            if (!/all india/i.test(s)) paths.add(`/scholarships-in/${slugify(s)}`);
        }
    }
    if (paths.size === 0) return [];
    LISTING_PATHS.forEach(p => paths.add(p));
    for (const path of paths) {
        // 'layout' also covers nested pages such as /scholarships-in/<state>/<category>
        revalidatePath(path, path.startsWith('/scholarships-in/') ? 'layout' : 'page');
    }
    return [...paths];
}

/**
 * Refresh Study Abroad pages after an approved change: the page itself plus the pages that list it
 * (country page, country lists, comparison pages, the Study Abroad home). A changed fact (sa_facts)
 * can appear anywhere in the section, so it refreshes the whole section.
 */
export function refreshStudyAbroadPages(items: { table: string; row: any }[]) {
    const pages = new Set<string>();
    const layouts = new Set<string>();
    for (const { table, row } of items) {
        if (!row) continue;
        if (table === 'sa_facts') { layouts.add('/study-abroad'); continue; }
        const path = pagePath(table, row);
        if (path) pages.add(path);
        const country = row.country;
        if (country) layouts.add(`/study-abroad/study-in/${country}`);
        if (table === 'sa_programs') {
            layouts.add(`/study-abroad/programs/${row.country}`);
            pages.add(`/study-abroad/universities/${row.university_slug}`);
        }
        if (table === 'sa_universities') layouts.add(`/study-abroad/programs/${row.country}`);
        pages.add('/study-abroad');
    }
    for (const path of pages) revalidatePath(path, 'page');
    // 'layout' covers every page below the path (country lists, guides, comparison pages)
    for (const path of layouts) revalidatePath(path, 'layout');
    return [...pages, ...layouts];
}
