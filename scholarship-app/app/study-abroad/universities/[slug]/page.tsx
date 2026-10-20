import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, getUniversities, getUniversity, getProgramsForUniversity, getGuides, isCountry, getComparisonLinks, getSimilarUniversities } from '@/lib/study-abroad/data';
import { renderArticle, describe, money, yesNo, SITE, pageTitle } from '@/lib/study-abroad/content';
import DetailShell, { DetailSection, KeyCard, InfoCard, SideLinks, sourceRows } from '../../_components/DetailShell';
import { ArticleBody, Faqs, MoreLinks, jumpFor } from '../../_components/ArticleSections';
import { ProgramTable } from '../../_components/blocks';
import { faqJsonLd } from '../../_components/seo';
import { bylineText, costLinks, EDITORIAL_TEAM } from '../../_components/LinkBlocks';

export const revalidate = 86400;

export async function generateStaticParams() {
    return (await getUniversities()).map(u => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const u = await getUniversity(slug);
    if (!u) return {};
    return {
        title: pageTitle(`${u.seo_title || `${u.name}: Fees, Admission & Costs for Indian Students`}`),
        description: describe(u, `Fees, admission requirements and living costs at ${u.name} for Indian students.`),
        alternates: { canonical: `${SITE}/study-abroad/universities/${u.slug}` },
    };
}

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const u = await getUniversity(slug);
    if (!u || !isCountry(u.country)) notFound();
    const c = COUNTRIES[u.country];
    const [programs, visas] = await Promise.all([getProgramsForUniversity(u.slug), getGuides('visa', u.country)]);
    const fields = [...new Set(programs.map(p => p.field).filter((f): f is string => !!f))];
    const [comparisons, similar] = await Promise.all([getComparisonLinks(u.country, programs), getSimilarUniversities(u, fields)]);
    const tuition = money(u.tuition_per_year, u.tuition_currency);
    const structured = [
        u.city && { label: 'Location', value: u.city },
        tuition && { label: 'Tuition per year', value: tuition },
        money(u.living_cost_per_year, u.living_currency) && { label: 'Living costs per year', value: money(u.living_cost_per_year, u.living_currency)! },
        u.gre_required && { label: 'GRE', value: yesNo(u.gre_required)! },
        u.stem_opt && { label: 'STEM OPT (3-year work permit)', value: yesNo(u.stem_opt, 'Eligible', 'Not eligible')! },
        u.ranking && { label: 'Ranking', value: u.ranking },
    ].filter(Boolean) as { label: string; value: string }[];
    const article = renderArticle(u, structured);
    const facts = [...structured, ...article.facts];
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' },
        { label: c.name, href: `/study-abroad/study-in/${c.slug}` },
        { label: 'Universities', href: `/study-abroad/study-in/${c.slug}/universities` }, { label: u.name },
    ];
    const officialUrl = (u.official_source || '').split(/[,\s]+/).find(x => /^https?:\/\//.test(x));
    return (
        <DetailShell crumbs={crumbs} eyebrow={`University · ${c.name}`} title={u.name}
            subline={[u.city, bylineText(u.checked_at)].filter(Boolean).join(' · ')}
            facts={facts} url={`${SITE}/study-abroad/universities/${u.slug}`}
            jump={jumpFor(article, [...(programs.length ? [{ label: 'Programs', href: '#programs' }] : []), ...(similar.length ? [{ label: 'Similar universities', href: '#similar' }] : [])])}
            jsonLd={[
                { '@context': 'https://schema.org', '@type': 'CollegeOrUniversity', name: u.name, address: u.city || undefined, url: officialUrl },
                { '@context': 'https://schema.org', '@type': 'WebPage', url: `${SITE}/study-abroad/universities/${u.slug}`, author: { '@type': 'Organization', name: EDITORIAL_TEAM, url: SITE }, ...(u.checked_at ? { lastReviewed: u.checked_at } : {}) },
                ...faqJsonLd(article.faqs),
            ]}
            sidebar={<>
                <KeyCard label="Tuition per year" value={tuition || 'See the costs section'} note={tuition ? 'For Indian (international) students' : null}
                    action={officialUrl ? { href: officialUrl, label: 'Visit Official Website ↗', external: true } : null} />
                <InfoCard rows={[{ icon: '🏛️', label: 'University', value: u.name }, ...(u.city ? [{ icon: '📍', label: 'Location', value: u.city }] : []), ...sourceRows(u.official_source, u.checked_at)]} />
                <SideLinks links={[
                    ...costLinks(u.country),
                    ...comparisons.map(x => ({ href: x.href, label: `Compare ${x.title}` })),
                    { href: `/study-abroad/study-in/${c.slug}/universities`, label: `All universities in ${c.name}` },
                ]} />
            </>}>
            <ArticleBody article={article} />
            {programs.length > 0 && (
                <DetailSection id="programs" title={`Programs at ${u.name}`}>
                    <ProgramTable programs={programs} showUniversity={false} />
                </DetailSection>
            )}
            <MoreLinks id="compare" title="Compare with other universities" links={comparisons.map(x => ({ href: x.href, title: x.title, meta: `${x.universities} universities compared` }))} />
            <MoreLinks id="similar" title={`Similar universities in ${c.name}`} links={similar.map(x => ({
                href: `/study-abroad/universities/${x.slug}`, title: x.name,
                meta: [x.city, money(x.tuition_per_year, x.tuition_currency) && `Tuition ${money(x.tuition_per_year, x.tuition_currency)} a year`].filter(Boolean).join(' · ') || null,
            }))} />
            <MoreLinks id="scholarships" title={`Explore funding for study in ${c.name}`} links={[{
                href: `/study-abroad/study-in/${c.slug}/scholarships`, title: `Scholarships for ${c.name}`,
                meta: 'Check each scholarship’s university, degree and course eligibility',
            }]} />
            <Faqs faqs={article.faqs} />
            <MoreLinks title={`Visa guides for ${c.name}`} links={visas.slice(0, 5).map(v => ({ href: `/study-abroad/visas/${v.slug}`, title: v.title }))} />
        </DetailShell>
    );
}
