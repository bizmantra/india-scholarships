// URLs for /sitemap/study-abroad.xml: published Study Abroad pages only (drafts, empty countries and
// program comparisons with too few universities are left out). URLs that redirect are left out too.
import type { MetadataRoute } from 'next';
import { LAUNCHED_COUNTRIES, isCountry, getUniversities, getGuides, getPrograms, getProgramCombos, MIN_INDEXABLE_UNIVERSITIES } from './data';
import { REDIRECTS } from './content';
import { latestDate, parseDbDate } from '@/lib/sitemap-dates';
import { LAUNCHED_TOOLS } from '@/app/study-abroad/_components/tools';

export async function studyAbroadSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
    const [allUniversities, allGuides, allVisas, allLoans, allPrograms, allCombos] = await Promise.all([
        getUniversities(), getGuides('guide'), getGuides('visa'), getGuides('loan'), getPrograms(), getProgramCombos(),
    ]);
    // Pages of a country that is not launched yet 404, so they stay out of the sitemap even when their rows are published
    const live = <T extends { country: string }>(rows: T[]) => rows.filter(r => isCountry(r.country));
    const [universities, guides, visas, loans, programs, combos] = [live(allUniversities), live(allGuides), live(allVisas), live(allLoans), live(allPrograms), live(allCombos)];
    // Database timestamps carry no zone; read them as UTC so the dates do not depend on the server's timezone
    const date = (v: string | null) => parseDbDate(v);
    const entry = (path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] =>
        ({ url: `${baseUrl}/study-abroad${path}`, priority, changeFrequency: 'weekly', ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}) });
    // Hub pages have no date of their own: they change when any page listed on them changes, so use the newest page they list
    const changed = (rows: { updated_at?: string | null; checked_at?: string | null }[]) => latestDate(rows.flatMap(r => [r.updated_at, r.checked_at]));
    const inCountry = <T extends { country: string }>(rows: T[], c: string) => rows.filter(r => r.country === c);
    const all = [
        entry('', 0.9, changed([...universities, ...guides, ...visas, ...loans, ...programs])),
        ...LAUNCHED_COUNTRIES.flatMap(c => {
            const [u, g, v, l, p] = [inCountry(universities, c), inCountry(guides, c), inCountry(visas, c), inCountry(loans, c), inCountry(programs, c)];
            return [
                entry(`/study-in/${c}`, 0.9, changed([...u, ...g, ...v, ...l, ...p])),
                entry(`/study-in/${c}/universities`, 0.8, changed(u)),
                entry(`/study-in/${c}/visas`, 0.8, changed(v)),
                entry(`/study-in/${c}/loans`, 0.8, changed(l)),
                // The scholarships hub lists rows from the main scholarships table, which this section has no date for
                entry(`/study-in/${c}/scholarships`, 0.8),
            ];
        }),
        entry('/tools', 0.8),
        ...LAUNCHED_TOOLS.map(t => entry(`/tools/${t.slug}`, 0.8)),
        ...combos.filter(c => c.universities >= MIN_INDEXABLE_UNIVERSITIES).map(c =>
            entry(`/programs/${c.country}/${c.degree}/${c.field}`, 0.8, changed(programs.filter(p => p.country === c.country && p.degree === c.degree && p.field === c.field)))),
        ...programs.map(p => entry(`/program-detail/${p.country}/${p.university_slug}/${p.slug}`, 0.6, date(p.checked_at))),
        ...universities.map(u => entry(`/universities/${u.slug}`, 0.7, date(u.updated_at))),
        ...guides.map(g => entry(`/study-in/${g.country}/${g.slug}`, 0.7, date(g.updated_at))),
        ...visas.map(g => entry(`/visas/${g.slug}`, 0.7, date(g.updated_at))),
        ...loans.map(g => entry(`/loans/${g.slug}`, 0.7, date(g.updated_at))),
    ];
    return all.filter(e => !REDIRECTS.has(e.url.slice(baseUrl.length)));
}
