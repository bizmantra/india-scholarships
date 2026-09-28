import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, getUniversities, getGuides, getFacts, getProgramCombos, getScholarshipsForCountry, MIN_INDEXABLE_UNIVERSITIES } from '@/lib/study-abroad/data';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import ListingShell, { ListingSection } from './_components/ListingShell';
import SACard, { CardGrid } from './_components/SACard';
import { TOOLS } from './_components/tools';

export const revalidate = 86400;
export const metadata: Metadata = {
    title: pageTitle('Study Abroad for Indian Students: Germany & USA Costs, Universities, Visas'),
    description: 'Plan a Master\'s in Germany or the USA without agency fees or sign-ups: university costs, program comparisons, scholarships, loans, visa guides and free calculators.',
    alternates: { canonical: `${SITE}/study-abroad` },
};

const fmt = (value: string | undefined, currency: string) =>
    value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value)) : null;

export default async function StudyAbroadHome() {
    const [facts, combos, deUnis, usUnis, deVisas, usVisas, deLoans, usLoans, deSch, usSch] = await Promise.all([
        getFacts(), getProgramCombos(), getUniversities('germany'), getUniversities('usa'),
        getGuides('visa', 'germany'), getGuides('visa', 'usa'), getGuides('loan', 'germany'), getGuides('loan', 'usa'),
        getScholarshipsForCountry('germany', 2), getScholarshipsForCountry('usa', 2),
    ]);
    const programs = combos.filter(p => p.universities >= MIN_INDEXABLE_UNIVERSITIES);
    return (
        <ListingShell
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad' }]}
            title="Study Abroad for Indian Students 2026"
            intro={<>Costs in rupees, program requirements, scholarships, loans and visa steps for a Master&apos;s in <a href="#countries" className="font-bold text-google-blue hover:underline">Germany or the USA</a>. Every page is free to read, and we never ask for your phone number.</>}
            stats={[
                { label: 'Universities', value: String(deUnis.length + usUnis.length), note: 'With fees and admission details', tone: 'blue' },
                { label: 'Programs Compared', value: String(combos.reduce((n, c) => n + c.universities, 0)), note: 'Real per-program requirements', tone: 'green' },
                { label: 'Free Calculators', value: String(TOOLS.length), note: 'No sign-up needed', tone: 'emerald' },
            ]}
            jump={[{ label: '🌍 Countries', href: '#countries' }, { label: '🎓 Programs', href: '#programs' }, { label: '🧮 Calculators', href: '#calculators' }, { label: '💰 Loans', href: '#loans' }, { label: '🛂 Visas', href: '#visas' }, { label: '🏅 Scholarships', href: '#scholarships' }]}>
            <ListingSection id="countries" title="Choose Your Destination">
                <CardGrid>
                    <SACard href="/study-abroad/study-in/germany" title="Study in Germany" subtitle="Most public universities charge no tuition, only a semester fee."
                        figure={fmt(facts['germany.blocked_account.annual_eur']?.value, 'EUR')} figureNote="blocked account per year"
                        detail={`${deUnis.length} universities · ${deVisas.length} visa guides`} cta="Explore Germany →" />
                    <SACard href="/study-abroad/study-in/usa" title="Study in the USA" subtitle="STEM graduates can work for up to 3 years on OPT."
                        figure={fmt(facts['usa.visa.sevis_i901_fee_usd']?.value, 'USD')} figureNote={`SEVIS fee + ${fmt(facts['usa.visa.f1_mrv_fee_usd']?.value, 'USD')} visa fee`}
                        detail={`${usUnis.length} universities · ${usVisas.length} visa guides`} cta="Explore USA →" />
                </CardGrid>
            </ListingSection>
            <ListingSection id="programs" title="Compare Programs">
                <CardGrid>
                    {programs.map(p => (
                        <SACard key={`${p.country}-${p.field}`} href={`/study-abroad/programs/${p.country}/${p.degree}/${p.field}`}
                            title={`${p.degree.toUpperCase()} ${p.field!.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())} in ${COUNTRIES[p.country].name}`}
                            figure={`${p.universities} universities`} figureNote="tuition, GPA, IELTS, GRE, deadlines" cta="Compare Programs →" />
                    ))}
                </CardGrid>
            </ListingSection>
            <ListingSection id="calculators" title="Free Calculators">
                <CardGrid>{TOOLS.map(t => <SACard key={t.slug} href={`/study-abroad/tools/${t.slug}`} title={t.title} subtitle={t.summary} cta="Open Calculator →" />)}</CardGrid>
            </ListingSection>
            <ListingSection id="loans" title="Loans and Blocked Accounts">
                <CardGrid>{[...deLoans, ...usLoans].map(g => <SACard key={g.slug} href={`/study-abroad/loans/${g.slug}`} title={g.title} subtitle={g.summary} detail={COUNTRIES[g.country].name} />)}</CardGrid>
            </ListingSection>
            <ListingSection id="visas" title="Student Visa Guides">
                <CardGrid>{[...deVisas, ...usVisas].slice(0, 6).map(g => <SACard key={g.slug} href={`/study-abroad/visas/${g.slug}`} title={g.title} subtitle={g.summary} detail={COUNTRIES[g.country].name} />)}</CardGrid>
            </ListingSection>
            <ListingSection id="scholarships" title="Scholarships for Studying Abroad">
                <CardGrid>{[...deSch, ...usSch].map(s => <ScholarshipCard key={s.slug} scholarship={s} />)}</CardGrid>
                <Link href="/scholarships/international" className="inline-block mt-6 font-bold text-google-blue hover:underline">All international scholarships →</Link>
            </ListingSection>
        </ListingShell>
    );
}
