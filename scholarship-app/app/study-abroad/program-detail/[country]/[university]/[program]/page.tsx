import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getPrograms, getProgram, getProgramsForCombo, getComparisonLinks, getScholarshipsForCountry, rankSimilarPrograms } from '@/lib/study-abroad/data';
import { SITE, money, pageTitle } from '@/lib/study-abroad/content';
import DetailShell, { DetailSection, KeyCard, InfoCard, SideLinks, sourceRows } from '../../../../_components/DetailShell';
import { MoreLinks } from '../../../../_components/ArticleSections';
import { deadlinesText } from '../../../../_components/blocks';
import { bylineText, costLinks, NOT_PUBLISHED, publicValue, ScholarshipLinks } from '../../../../_components/LinkBlocks';

export const revalidate = 86400;
export const dynamicParams = false;
export async function generateStaticParams() {
    return (await getPrograms()).map(p => ({ country: p.country, university: p.university_slug, program: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; university: string; program: string }> }): Promise<Metadata> {
    const { country, university, program } = await params;
    const p = await getProgram(university, program);
    if (!p || p.country !== country) return {};
    const base = `${p.title} at ${p.university_name}`;
    return {
        title: pageTitle(base.length <= 42 ? `${base}: Fees & Deadlines` : base),
        description: `Tuition, living costs, minimum GPA, IELTS, GRE and deadlines for ${p.title} at ${p.university_name}, with the official source.`,
        alternates: { canonical: `${SITE}/study-abroad/program-detail/${country}/${university}/${program}` },
    };
}

export default async function ProgramDetail({ params }: { params: Promise<{ country: string; university: string; program: string }> }) {
    const { country, university, program } = await params;
    const p = await getProgram(university, program);
    if (!p || p.country !== country || !isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const [allPeers, comparisons, scholarships] = await Promise.all([
        p.field ? getProgramsForCombo(country, p.degree, p.field) : Promise.resolve([]),
        getComparisonLinks(country, [p]),
        getScholarshipsForCountry(country, 3),
    ]);
    const peers = rankSimilarPrograms(p, allPeers);
    const tuition = money(p.tuition_per_year, p.tuition_currency);
    // Research notes stored in a field are shown as "Not published by the university", never as written
    const facts = [
        ['University', p.university_name], ['Location', p.location], ['Tuition per year', tuition],
        ['Living costs per year (estimate)', money(p.living_cost_per_year, p.living_currency)],
        ['Minimum GPA', publicValue(p.gpa_min)], ['IELTS (minimum)', publicValue(p.ielts_min != null ? String(p.ielts_min) : null)], ['GRE', publicValue(p.gre)],
    ].filter(([, v]) => v).map(([label, value]) => ({ label: label as string, value: value as string }));
    const deadlines = deadlinesText(p.application_deadlines);
    const officialUrl = (p.official_source || '').split(/[,\s]+/).find(x => /^https?:\/\//.test(x));
    const url = `${SITE}/study-abroad/program-detail/${country}/${university}/${program}`;
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: c.name, href: `/study-abroad/study-in/${country}` },
        { label: p.university_name!, href: `/study-abroad/universities/${p.university_slug}` }, { label: p.title },
    ];
    // schema.org Course: tells search engines this page is about one course at one university
    const courseLd = {
        '@context': 'https://schema.org', '@type': 'Course', name: `${p.title} at ${p.university_name}`, url,
        description: `${p.title} at ${p.university_name}${p.location ? ` in ${p.location}` : ''}: tuition, entry requirements and deadlines for Indian students.`,
        provider: { '@type': 'CollegeOrUniversity', name: p.university_name, ...(officialUrl ? { sameAs: officialUrl } : {}) },
        ...(p.tuition_per_year != null ? { offers: { '@type': 'Offer', category: 'Tuition per year', price: p.tuition_per_year, priceCurrency: p.tuition_currency || c.currency } } : {}),
    };
    return (
        <DetailShell crumbs={crumbs} eyebrow={`${p.degree.toUpperCase()} Program · ${c.name}`} title={`${p.title}`}
            subline={[p.university_name, p.location, bylineText(p.checked_at)].filter(Boolean).join(' · ')} facts={facts}
            url={url} jsonLd={[courseLd]}
            jump={[{ label: 'Deadlines', href: '#deadlines' }, ...(peers.length ? [{ label: 'Similar programs', href: '#similar' }] : []), ...(scholarships.length ? [{ label: 'Scholarships', href: '#scholarships' }] : [])]}
            sidebar={<>
                <KeyCard label="Tuition per year" value={tuition || NOT_PUBLISHED} note={deadlines ? `Deadlines: ${deadlines}` : null}
                    action={officialUrl ? { href: officialUrl, label: 'Official source ↗', external: true } : null} />
                <InfoCard rows={sourceRows(p.official_source, p.checked_at)} />
                <SideLinks links={[
                    { href: `/study-abroad/universities/${p.university_slug}`, label: `About ${p.university_name}` },
                    ...comparisons.map(x => ({ href: x.href, label: `Compare ${x.title}` })),
                    ...costLinks(country),
                ]} />
            </>}>
            <DetailSection id="deadlines" title="Application Deadlines">
                <p className="text-base text-gray-700 leading-relaxed">{deadlines || `${NOT_PUBLISHED}. Check the official program page.`}</p>
            </DetailSection>
            <MoreLinks id="similar" title={`Similar Programs in ${c.name}`} links={peers.map(x => ({
                href: `/study-abroad/program-detail/${x.country}/${x.university_slug}/${x.slug}`, title: `${x.title}, ${x.university_name}`, meta: money(x.tuition_per_year, x.tuition_currency),
            }))} />
            <ScholarshipLinks country={country} scholarships={scholarships} />
        </DetailShell>
    );
}
