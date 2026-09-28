import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, getUniversities, getUniversity, getProgramsForUniversity, getGuides, isCountry } from '@/lib/study-abroad/data';
import { toEditorial, describe, money, yesNo, SITE } from '@/lib/study-abroad/content';
import ArticlePage from '../../_components/ArticlePage';
import { ProgramTable, Sources, LinkList, BlockHeading } from '../../_components/blocks';

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
    const country = COUNTRIES[u.country];
    const [programs, visas] = await Promise.all([getProgramsForUniversity(u.slug), getGuides('visa', u.country)]);

    // Structured fields first; the article's own infobox rows follow
    const facts = [
        u.city && { label: 'Location', value: u.city },
        money(u.tuition_per_year, u.tuition_currency) && { label: 'Tuition per year', value: money(u.tuition_per_year, u.tuition_currency)! },
        money(u.living_cost_per_year, u.living_currency) && { label: 'Living costs per year', value: money(u.living_cost_per_year, u.living_currency)! },
        u.gre_required && { label: 'GRE', value: yesNo(u.gre_required)! },
        u.stem_opt && { label: 'STEM OPT (3-year work permit)', value: yesNo(u.stem_opt, 'Eligible', 'Not eligible')! },
        u.ranking && { label: 'Ranking', value: u.ranking },
    ].filter(Boolean) as { label: string; value: string }[];

    const content = toEditorial(u, { tag: `University · ${country.name}`, extraFacts: facts });
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' },
        { label: country.name, href: `/study-abroad/study-in/${country.slug}` },
        { label: 'Universities', href: `/study-abroad/study-in/${country.slug}/universities` }, { label: u.name },
    ];
    return (
        <ArticlePage content={content} crumbs={crumbs} extraJsonLd={[{ '@context': 'https://schema.org', '@type': 'CollegeOrUniversity', name: u.name, address: u.city || undefined, url: u.official_source || undefined }]}>
            {programs.length > 0 && (
                <div className="my-10">
                    <BlockHeading>Programs we track at {u.name}</BlockHeading>
                    <ProgramTable programs={programs} showUniversity={false} />
                </div>
            )}
            <LinkList title={`Visa guides for ${country.name}`} items={visas.slice(0, 5).map(v => ({ title: v.title, href: `/study-abroad/visas/${v.slug}` }))} />
            <Sources source={u.official_source} checkedAt={u.checked_at} />
        </ArticlePage>
    );
}
