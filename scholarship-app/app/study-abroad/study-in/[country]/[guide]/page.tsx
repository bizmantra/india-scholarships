import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, getGuide, getGuides, isCountry } from '@/lib/study-abroad/data';
import { toEditorial, describe, SITE, pageTitle } from '@/lib/study-abroad/content';
import ArticlePage from '../../../_components/ArticlePage';
import { Sources } from '../../../_components/blocks';

export const revalidate = 86400;

export async function generateStaticParams() {
    return (await getGuides('guide')).filter(g => isCountry(g.country)).map(g => ({ country: g.country, guide: g.slug }));
}

async function load(country: string, slug: string) {
    const g = await getGuide('guide', slug);
    return g && g.country === country && isCountry(country) ? g : null;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; guide: string }> }): Promise<Metadata> {
    const { country, guide } = await params;
    const g = await load(country, guide);
    if (!g) return {};
    return {
        title: pageTitle(`${g.seo_title || g.title}`),
        description: describe(g, g.title),
        alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/${g.slug}` },
    };
}

export default async function GuidePage({ params }: { params: Promise<{ country: string; guide: string }> }) {
    const { country, guide } = await params;
    const g = await load(country, guide);
    if (!g || !isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const siblings = (await getGuides('guide', country)).filter(s => s.slug !== g.slug);
    const content = toEditorial(g, { tag: `Study in ${c.name}` });
    // Guides are related by shared words in the slug (e.g. "blocked-account", "visa")
    const words = new Set(g.slug.split('-').filter(w => w.length > 3 && w !== country));
    content.relatedGuides = siblings
        .map(s => ({ s, score: s.slug.split('-').filter(w => words.has(w)).length }))
        .filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5)
        .map(({ s }) => ({ title: s.title, href: `/study-abroad/study-in/${country}/${s.slug}` }));
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' },
        { label: c.name, href: `/study-abroad/study-in/${country}` }, { label: g.title },
    ];
    return (
        <ArticlePage content={content} crumbs={crumbs}>
            <Sources source={g.official_source} checkedAt={g.checked_at} />
        </ArticlePage>
    );
}
