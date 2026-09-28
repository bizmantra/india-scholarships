import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getProgramCombos, getProgramsForCombo, getGuides, MIN_INDEXABLE_UNIVERSITIES } from '@/lib/study-abroad/data';
import { SITE, money } from '@/lib/study-abroad/content';
import ListingShell, { ListingSection } from '../../../../_components/ListingShell';
import SACard, { CardGrid } from '../../../../_components/SACard';
import { ProgramTable } from '../../../../_components/blocks';

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
        title: `${name}: Fees, Requirements & Deadlines Compared | IndiaScholarships`,
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
    const tuitions = programs.map(p => p.tuition_per_year).filter((n): n is number => n != null);
    const unis = new Set(programs.map(p => p.university_slug)).size;
    const noTuition = tuitions.filter(t => t === 0).length;
    return (
        <ListingShell
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: c.name, href: `/study-abroad/study-in/${country}` }, { label: `${degree.toUpperCase()} ${label(field)}` }]}
            title={`${title} 2026`}
            intro={<>Compare <a href="#list" className="font-bold text-google-blue hover:underline">{programs.length} programs at {unis} universities</a>. Every figure comes from the program&apos;s own page; open a program to see its source and when it was last checked.</>}
            stats={[
                { label: 'Programs', value: String(programs.length), note: `At ${unis} universities`, tone: 'blue' },
                { label: 'Lowest Tuition', value: tuitions.length ? money(Math.min(...tuitions), programs[0].tuition_currency)! : '—', note: 'Per year', tone: 'green' },
                noTuition ? { label: 'No Tuition Fee', value: String(noTuition), note: 'Semester fee only', tone: 'emerald' as const }
                    : { label: 'Highest Tuition', value: tuitions.length ? money(Math.max(...tuitions), programs[0].tuition_currency)! : '—', note: 'Per year', tone: 'emerald' as const },
            ]}
            jump={[{ label: '🎓 Programs', href: '#list' }, { label: '📋 Comparison Table', href: '#comparison' }, { label: '💰 Paying for It', href: '#loans' }]}
            jsonLd={[{
                '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: programs.length,
                itemListElement: programs.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: `${p.title}, ${p.university_name}`, url: `${SITE}/study-abroad/program-detail/${p.country}/${p.university_slug}/${p.slug}` })),
            }]}>
            <ListingSection id="list" title={`${degree.toUpperCase()} ${label(field)} Programs`}>
                <CardGrid>
                    {programs.map(p => (
                        <SACard key={p.id} href={`/study-abroad/program-detail/${p.country}/${p.university_slug}/${p.slug}`}
                            title={p.university_name!} subtitle={p.title}
                            figure={money(p.tuition_per_year, p.tuition_currency)} figureNote={p.tuition_per_year ? 'tuition per year' : null}
                            detail={[p.gpa_min && `GPA: ${p.gpa_min}`, p.ielts_min != null && `IELTS ${p.ielts_min}`, p.gre && `GRE: ${p.gre}`].filter(Boolean).join(' · ') || null} />
                    ))}
                </CardGrid>
            </ListingSection>
            <ListingSection id="comparison" title="Comparison Table">
                <ProgramTable programs={programs} />
            </ListingSection>
            <ListingSection id="loans" title="Paying for It">
                <CardGrid>{loans.map(l => <SACard key={l.slug} href={`/study-abroad/loans/${l.slug}`} title={l.title} subtitle={l.summary} cta="Compare →" />)}</CardGrid>
            </ListingSection>
        </ListingShell>
    );
}
