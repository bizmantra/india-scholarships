import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, getGuide, getGuides, isCountry } from '@/lib/study-abroad/data';
import { renderArticle, describe, SITE, pageTitle } from '@/lib/study-abroad/content';
import DetailShell, { KeyCard, InfoCard, SideLinks, sourceRows } from '../../../_components/DetailShell';
import { ArticleBody, Faqs, MoreLinks, jumpFor } from '../../../_components/ArticleSections';
import { faqJsonLd } from '../../../_components/seo';

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
    const article = renderArticle(g);
    const siblings = (await getGuides('guide', country)).filter(s => s.slug !== g.slug);
    // Related guides share words in the slug (e.g. "blocked-account", "visa")
    const words = new Set(g.slug.split('-').filter(w => w.length > 3 && w !== country));
    const related = siblings
        .map(s => ({ s, score: s.slug.split('-').filter(w => words.has(w)).length }))
        .filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5)
        .map(({ s }) => ({ href: `/study-abroad/study-in/${country}/${s.slug}`, title: s.title }));
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' },
        { label: c.name, href: `/study-abroad/study-in/${country}` }, { label: g.title },
    ];
    return (
        <DetailShell crumbs={crumbs} eyebrow={`Study in ${c.name} · Guide`} title={g.title}
            subline={[article.updated && `Updated ${article.updated}`, article.readTime].filter(Boolean).join(' · ')}
            facts={article.facts} url={`${SITE}/study-abroad/study-in/${country}/${g.slug}`}
            jump={jumpFor(article)} jsonLd={faqJsonLd(article.faqs)}
            sidebar={<>
                <KeyCard label="Destination" value={c.name} note="Free guide · no sign-up" action={{ href: `/study-abroad/study-in/${country}`, label: `All ${c.name} guides →` }} />
                <InfoCard rows={sourceRows(g.official_source, g.checked_at)} />
                <SideLinks links={[{ href: `/study-abroad/study-in/${country}/universities`, label: `Universities in ${c.name}` }, { href: '/study-abroad/tools', label: 'Free cost calculators' }]} />
            </>}>
            <ArticleBody article={article} />
            <Faqs faqs={article.faqs} />
            <MoreLinks title="More on This Topic" links={related} />
        </DetailShell>
    );
}
