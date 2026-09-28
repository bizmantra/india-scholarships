import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, getUniversities, getUniversity, getProgramsForUniversity, getGuides, isCountry } from '@/lib/study-abroad/data';
import { renderArticle, describe, money, yesNo, SITE } from '@/lib/study-abroad/content';
import DetailShell, { DetailSection, KeyCard, InfoCard, SideLinks, sourceRows } from '../../_components/DetailShell';
import { ArticleBody, Faqs, MoreLinks, jumpFor } from '../../_components/ArticleSections';
import { ProgramTable } from '../../_components/blocks';
import { faqJsonLd } from '../../_components/seo';

export const revalidate = 86400;

export async function generateStaticParams() {
    return (await getUniversities()).map(u => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const u = await getUniversity(slug);
    if (!u) return {};
    return {
        title: `${u.seo_title || `${u.name}: Fees, Admission & Costs for Indian Students`} | IndiaScholarships`,
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
            subline={[u.city, article.updated && `Updated ${article.updated}`].filter(Boolean).join(' · ')}
            facts={facts} url={`${SITE}/study-abroad/universities/${u.slug}`}
            jump={jumpFor(article, programs.length ? [{ label: 'Programs', href: '#programs' }] : [])}
            jsonLd={[{ '@context': 'https://schema.org', '@type': 'CollegeOrUniversity', name: u.name, address: u.city || undefined, url: officialUrl }, ...faqJsonLd(article.faqs)]}
            sidebar={<>
                <KeyCard label="Tuition per year" value={tuition || 'See fact box'} note={u.country === 'germany' ? 'Public universities charge a semester fee only' : null}
                    action={officialUrl ? { href: officialUrl, label: 'Visit Official Website ↗', external: true } : null} />
                <InfoCard rows={[{ icon: '🏛️', label: 'University', value: u.name }, ...(u.city ? [{ icon: '📍', label: 'Location', value: u.city }] : []), ...sourceRows(u.official_source, u.checked_at)]} />
                <SideLinks links={[
                    { href: `/study-abroad/study-in/${c.slug}/universities`, label: `All universities in ${c.name}` },
                    { href: '/study-abroad/tools', label: 'Free cost calculators' },
                ]} />
            </>}>
            <ArticleBody article={article} />
            {programs.length > 0 && (
                <DetailSection id="programs" title={`Programs at ${u.name}`}>
                    <ProgramTable programs={programs} showUniversity={false} />
                </DetailSection>
            )}
            <Faqs faqs={article.faqs} />
            <MoreLinks title={`Visa guides for ${c.name}`} links={visas.slice(0, 5).map(v => ({ href: `/study-abroad/visas/${v.slug}`, title: v.title }))} />
        </DetailShell>
    );
}
