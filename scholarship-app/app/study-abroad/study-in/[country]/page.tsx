import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, isCountry, getGuides, getUniversities, getFacts, getScholarshipsForCountry, getProgramCombos, MIN_INDEXABLE_UNIVERSITIES } from '@/lib/study-abroad/data';
import { SITE } from '@/lib/study-abroad/content';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import ListingShell, { ListingSection, type Stat } from '../../_components/ListingShell';
import SACard, { CardGrid } from '../../_components/SACard';
import { STAGES, stageOf } from '../../_components/stages';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

// The numbers a family asks first, read from sa_facts
const KEY_FACTS: Record<string, { key: string; tone: Stat['tone']; note: string }[]> = {
    germany: [{ key: 'germany.blocked_account.annual_eur', tone: 'blue', note: 'Blocked account per year' }, { key: 'germany.aps.fee_inr', tone: 'green', note: 'APS certificate fee' }, { key: 'germany.visa.national_fee_eur', tone: 'emerald', note: 'Student visa fee' }],
    usa: [{ key: 'usa.visa.sevis_i901_fee_usd', tone: 'blue', note: 'SEVIS I-901 fee' }, { key: 'usa.visa.f1_mrv_fee_usd', tone: 'green', note: 'F-1 visa fee' }, { key: 'usa.living.monthly_average_usd', tone: 'emerald', note: 'Average living cost per month' }],
};

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return {
        title: `Study in ${name} for Indian Students 2026: Costs, Universities, Visa & Loans | IndiaScholarships`,
        description: `Plan a Master's in ${name} from India: universities and programs, total costs, scholarships, loans, visa steps and work rules, with official sources.`,
        alternates: { canonical: `${SITE}/study-abroad/study-in/${country}` },
    };
}

export default async function CountryHub({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const [guides, universities, visas, loans, facts, scholarships, combos] = await Promise.all([
        getGuides('guide', country), getUniversities(country), getGuides('visa', country), getGuides('loan', country),
        getFacts(), getScholarshipsForCountry(country, 4), getProgramCombos(),
    ]);
    const programs = combos.filter(p => p.country === country && p.universities >= MIN_INDEXABLE_UNIVERSITIES);
    const stats = KEY_FACTS[country].map(k => facts[k.key] && ({
        label: facts[k.key].label.replace(/ \(.*\)$/, ''), tone: k.tone, note: k.note,
        value: /^[A-Z]{3}$/.test(facts[k.key].unit || '') ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: facts[k.key].unit!, maximumFractionDigits: 0 }).format(Number(facts[k.key].value)) : facts[k.key].value,
    })).filter(Boolean) as Stat[];
    const stagesWithGuides = STAGES.map(s => ({ ...s, items: guides.filter(g => stageOf(g.slug) === s.id) })).filter(s => s.items.length);
    const summary = (text: string | null) => (text && !/^Complete 2026 guide to/.test(text) ? text : null);

    return (
        <ListingShell
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: c.name }]}
            title={`Study in ${c.name} 2026`}
            intro={<>Everything an Indian student needs to plan a Master&apos;s in {c.name}: <a href="#universities" className="font-bold text-google-blue hover:underline">{universities.length} universities</a>, program requirements, costs, scholarships, loans and the visa process, step by step.</>}
            stats={stats}
            jump={[{ label: '🏛️ Universities', href: '#universities' }, ...(programs.length ? [{ label: '🎓 Programs', href: '#programs' }] : []), ...stagesWithGuides.map(s => ({ label: s.title.split(' ')[0], href: `#${s.id}` })), { label: '🏅 Scholarships', href: '#scholarships' }]}>
            <ListingSection id="universities" title={`Universities in ${c.name}`}>
                <CardGrid>
                    <SACard href={`/study-abroad/study-in/${country}/universities`} title={`All ${universities.length} universities`} subtitle="Fees, living costs, GRE rules and the programs we track." cta="Browse Universities →" />
                    <SACard href={`/study-abroad/study-in/${country}/visas`} title={`${visas.length} visa guides`} subtitle="Documents, fees, appointments and interview preparation." cta="Browse Visa Guides →" />
                    <SACard href={`/study-abroad/study-in/${country}/loans`} title={`${loans.length} loan and account guides`} subtitle="Compare providers, fees and interest rates." cta="Compare Loans →" />
                    <SACard href="/study-abroad/tools" title="Free calculators" subtitle="Blocked account, proof of funds, grade conversion and TCS." cta="Open Calculators →" />
                </CardGrid>
            </ListingSection>
            {programs.length > 0 && (
                <ListingSection id="programs" title="Compare Programs">
                    <CardGrid>
                        {programs.map(p => (
                            <SACard key={p.field} href={`/study-abroad/programs/${country}/${p.degree}/${p.field}`}
                                title={`${p.degree.toUpperCase()} ${p.field!.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())}`}
                                figure={`${p.universities} universities`} figureNote="side by side" cta="Compare Programs →" />
                        ))}
                    </CardGrid>
                </ListingSection>
            )}
            {stagesWithGuides.map(s => (
                <ListingSection key={s.id} id={s.id} title={s.title}>
                    <CardGrid>
                        {s.items.map(g => <SACard key={g.slug} href={`/study-abroad/study-in/${country}/${g.slug}`} title={g.title} subtitle={summary(g.summary)} cta="Read Guide →" />)}
                    </CardGrid>
                </ListingSection>
            ))}
            <ListingSection id="scholarships" title={`Scholarships for ${c.name}`}>
                <CardGrid>{scholarships.map(s => <ScholarshipCard key={s.slug} scholarship={s} />)}</CardGrid>
                <Link href={`/study-abroad/study-in/${country}/scholarships`} className="inline-block mt-6 font-bold text-google-blue hover:underline">All scholarships for {c.name} →</Link>
            </ListingSection>
        </ListingShell>
    );
}
