// Scholarships a Study Abroad country page lists first, by main-site slug, and duplicate entries it leaves out.
// The main-site scholarship pages are not changed: this only decides what the country page links to.
// Kept free of DB imports so it can be unit tested.
export interface ScholarshipPicks { show: string[]; hide: string[] }

export const SCHOLARSHIP_PICKS: Record<string, ScholarshipPicks> = {
    uk: {
        // One entry per scholarship. Listed even when the current round has closed, so readers see what to watch for.
        show: [
            'chevening-uk-government-scholarship-2027',
            'commonwealth-masters-scholarship',
            'rhodes-scholarship-india',
            'glasgow-international-leadership-scholarships',
        ],
        // Duplicates of the entries above. They stay on the main site.
        hide: [
            'chevening-scholarships',
            'chevening-scholarship-india-uk-govt-partnered',
            'commonwealth-masters-scholarships',
            'rhodes-scholarship',
        ],
    },
};

// Picked scholarships first, in the order of `show`, then the rest, without picked or hidden entries or repeats.
export function mergePicks<T extends { slug: string }>(featured: T[], rest: T[], picks: ScholarshipPicks, limit: number): T[] {
    const order = new Map(picks.show.map((slug, i) => [slug, i]));
    const first = featured.filter(r => order.has(r.slug)).sort((a, b) => order.get(a.slug)! - order.get(b.slug)!);
    const skip = new Set([...picks.show, ...picks.hide]);
    const seen = new Set<string>();
    const others = rest.filter(r => {
        if (skip.has(r.slug) || seen.has(r.slug)) return false;
        seen.add(r.slug);
        return true;
    });
    return [...first, ...others].slice(0, limit);
}
