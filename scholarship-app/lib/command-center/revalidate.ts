import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

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
