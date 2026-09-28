import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getProgramCombos, getProgramsForCombo, getGuides, MIN_INDEXABLE_UNIVERSITIES } from '@/lib/study-abroad/data';
import { SITE, money, pageTitle } from '@/lib/study-abroad/content';
import HubShell, { breadcrumbJsonLd } from '../../../../_components/HubShell';
import { ProgramTable, LinkList } from '../../../../_components/blocks';

export const revalidate = 86400;
// Only combinations with real program records get a page; anything else is a 404
export const dynamicParams = false;
export async function generateStaticParams() {
    return (await getProgramCombos()).map(({ country, degree, field }) => ({ country, degree, field }));
}

const DEGREES: Record<string, string> = { ms: "Master's (MS / MSc)" };
const label = (field: string) => field.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());

export async function generateMetadata({ params }: { params: Promise<{ country: string; degree: string; field: string }> }): Promise<Metadata> {
    const { country, degree, field } = await params;
    if (!isCountry(country)) return {};
    const combo = (await getProgramCombos()).find(c => c.country === country && c.degree === degree && c.field === field);
    const name = `${degree.toUpperCase()} in ${label(field)} in ${COUNTRIES[country].name}`;
    return {
        title: pageTitle(`${name}: Fees, Requirements & Deadlines Compared`),
        description: `Compare ${combo?.universities || ''} universities for ${name}: tuition, living costs, minimum GPA, IELTS, GRE and deadlines, from official program pages.`,
        alternates: { canonical: `${SITE}/study-abroad/programs/${country}/${degree}/${field}` },
        ...(!combo || combo.universities < MIN_INDEXABLE_UNIVERSITIES ? { robots: { index: false, follow: true } } : {}),
    };
}

export default async function ProgramComparison({ params }: { params: Promise<{ country: string; degree: string; field: string }> }) {
    const { country, degree, field } = await params;
    if (!isCountry(country)) notFound();
    const [programs, loans] = await Promise.all([getProgramsForCombo(country, degree, field), getGuides('loan', country)]);
    if (!programs.length) notFound();
    const c = COUNTRIES[country];
    const title = `${DEGREES[degree] || degree.toUpperCase()} in ${label(field)} in ${c.name}`;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: c.name, href: `/study-abroad/study-in/${country}` }, { label: `${degree.toUpperCase()} ${label(field)}` }];
    const tuitions = programs.map(p => p.tuition_per_year).filter((n): n is number => n != null);
    const range = tuitions.length ? `${money(Math.min(...tuitions), programs[0].tuition_currency)} to ${money(Math.max(...tuitions), programs[0].tuition_currency)} per year` : null;
    const unis = new Set(programs.map(p => p.university_slug)).size;
    return (
        <HubShell crumbs={crumbs} title={title}
            jsonLd={[breadcrumbJsonLd(crumbs), {
                '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: programs.length,
                itemListElement: programs.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: `${p.title}, ${p.university_name}`, url: `${SITE}/study-abroad/program-detail/${p.country}/${p.university_slug}/${p.slug}` })),
            }]}
            intro={<>{programs.length} programs at {unis} universities{range ? `, with tuition from ${range}` : ''}. Every figure comes from the program&apos;s own page; open a program to see its source and when it was last checked.</>}>
            <ProgramTable programs={programs} />
            <LinkList title="Paying for it" items={loans.map(l => ({ title: l.title, href: `/study-abroad/loans/${l.slug}` }))} />
        </HubShell>
    );
}
