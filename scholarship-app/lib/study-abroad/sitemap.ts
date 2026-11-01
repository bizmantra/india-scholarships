// URLs for /sitemap/study-abroad.xml: published Study Abroad pages only (drafts, empty countries and
// program comparisons with too few universities are left out). URLs that redirect are left out too.
import type { MetadataRoute } from 'next';
import { LAUNCHED_COUNTRIES, getUniversities, getGuides, getPrograms, getProgramCombos, MIN_INDEXABLE_UNIVERSITIES } from './data';
import { REDIRECTS } from './content';
import { TOOLS } from '@/app/study-abroad/_components/tools';

export async function studyAbroadSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
    const [universities, guides, visas, loans, programs, combos] = await Promise.all([
        getUniversities(), getGuides('guide'), getGuides('visa'), getGuides('loan'), getPrograms(), getProgramCombos(),
    ]);
    const date = (v: string | null) => (v ? new Date(v.replace(' ', 'T')) : undefined);
    const entry = (path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] =>
        ({ url: `${baseUrl}/study-abroad${path}`, priority, changeFrequency: 'weekly', ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}) });
    const all = [
        entry('', 0.9),
        ...LAUNCHED_COUNTRIES.flatMap(c => [
            entry(`/study-in/${c}`, 0.9),
            ...['universities', 'visas', 'loans', 'scholarships'].map(h => entry(`/study-in/${c}/${h}`, 0.8)),
        ]),
        entry('/tools', 0.8),
        ...TOOLS.map(t => entry(`/tools/${t.slug}`, 0.8)),
        ...combos.filter(c => c.universities >= MIN_INDEXABLE_UNIVERSITIES).map(c => entry(`/programs/${c.country}/${c.degree}/${c.field}`, 0.8)),
        ...programs.map(p => entry(`/program-detail/${p.country}/${p.university_slug}/${p.slug}`, 0.6, date(p.checked_at))),
        ...universities.map(u => entry(`/universities/${u.slug}`, 0.7, date(u.updated_at))),
        ...guides.map(g => entry(`/study-in/${g.country}/${g.slug}`, 0.7, date(g.updated_at))),
        ...visas.map(g => entry(`/visas/${g.slug}`, 0.7, date(g.updated_at))),
        ...loans.map(g => entry(`/loans/${g.slug}`, 0.7, date(g.updated_at))),
    ];
    return all.filter(e => !REDIRECTS.has(e.url.slice(baseUrl.length)));
}
