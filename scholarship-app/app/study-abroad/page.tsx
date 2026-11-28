import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, LAUNCHED_COUNTRIES, isCountry, degreeLabel, getUniversities, getGuides, getFacts, getProgramCombos, getScholarshipsForCountry, MIN_INDEXABLE_UNIVERSITIES, type CountrySlug } from '@/lib/study-abroad/data';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import ListingShell, { ListingSection } from './_components/ListingShell';
import SACard, { CardGrid } from './_components/SACard';
import { LAUNCHED_TOOLS } from './_components/tools';

export const revalidate = 86400;

// Country names for the title and intro come from the launched list, so a new country appears here without an edit
const names = LAUNCHED_COUNTRIES.map(c => COUNTRIES[c].name);
const inTitle = names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}` : names[0];
const the = (name: string) => (name === 'USA' || name === 'UK' ? `the ${name}` : name);
const inText = LAUNCHED_COUNTRIES.length > 1
    ? `${names.slice(0, -1).map(the).join(', ')} or ${the(names[names.length - 1])}`
    : the(names[0]);

export const metadata: Metadata = {
    title: pageTitle(`Study Abroad for Indian Students: ${inTitle} Costs, Universities, Visas`),
    description: `Plan a Master's in ${inText} without agency fees or sign-ups: university costs, program comparisons, scholarships, loans, visa guides and free calculators.`,
    alternates: { canonical: `${SITE}/study-abroad` },
};

const fmt = (value: string | undefined, currency: string) =>
    value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value)) : null;

export default async function StudyAbroadHome() {
    const [facts, combos, unis, visas, loans, scholarships] = await Promise.all([
        getFacts(), getProgramCombos(),
        Promise.all(LAUNCHED_COUNTRIES.map(c => getUniversities(c))),
        Promise.all(LAUNCHED_COUNTRIES.map(c => getGuides('visa', c))),
        Promise.all(LAUNCHED_COUNTRIES.map(c => getGuides('loan', c))),
        Promise.all(LAUNCHED_COUNTRIES.map(c => getScholarshipsForCountry(c, 2))),
    ]);
    const at = <T,>(lists: T[][], c: CountrySlug) => lists[LAUNCHED_COUNTRIES.indexOf(c)];
    const launchedCombos = combos.filter(c => isCountry(c.country));
    const programs = launchedCombos.filter(p => p.universities >= MIN_INDEXABLE_UNIVERSITIES);
    const allLoans = loans.flat();
    const allVisas = visas.map(v => v.slice(0, 3)).flat();
    const allScholarships = scholarships.flat();
    // Card text per country. Germany and the USA keep their own lines; any other launched country gets a plain card built from its facts.
    const card = (c: CountrySlug) => {
        const detail = `${at(unis, c).length} universities · ${at(visas, c).length} visa guides`;
        if (c === 'germany') return { title: 'Study in Germany', subtitle: 'Tuition varies by university and programme; check fees before you plan your budget.', figure: fmt(facts['germany.blocked_account.annual_eur']?.value, 'EUR'), figureNote: 'blocked account per year', detail, cta: 'Explore Germany →' };
        if (c === 'usa') return { title: 'Study in the USA', subtitle: 'STEM graduates can work for up to 3 years on OPT.', figure: fmt(facts['usa.visa.sevis_i901_fee_usd']?.value, 'USD'), figureNote: `SEVIS fee + ${fmt(facts['usa.visa.f1_mrv_fee_usd']?.value, 'USD')} visa fee`, detail, cta: 'Explore USA →' };
        const visaFee = Object.values(facts).find(f => f.country === c && /^[a-z]+\.visa\.application_fee_/.test(f.key));
        return {
            title: `Study in ${the(COUNTRIES[c].name)}`,
            subtitle: 'Universities, courses, visa money and total costs for a Master\'s, in the local currency and rupees, with official sources.',
            figure: visaFee ? fmt(visaFee.value, COUNTRIES[c].currency) : null, figureNote: visaFee ? 'student visa fee' : null,
            detail, cta: `Explore ${COUNTRIES[c].name} →`,
        };
    };
    return (
        <ListingShell
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad' }]}
            title="Study Abroad for Indian Students 2026"
            intro={<>Costs in rupees, program requirements, scholarships, loans and visa steps for a Master&apos;s in <a href="#countries" className="font-bold text-google-blue hover:underline">{inText}</a>. Every page is free to read, and we never ask for your phone number.</>}
            stats={[
                { label: 'Universities', value: String(unis.reduce((n, list) => n + list.length, 0)), note: 'With fees and admission details', tone: 'blue' },
                { label: 'Programs Compared', value: String(launchedCombos.reduce((n, c) => n + c.universities, 0)), note: 'Real per-program requirements', tone: 'green' },
                { label: 'Free Calculators', value: String(LAUNCHED_TOOLS.length), note: 'No sign-up needed', tone: 'emerald' },
            ]}
            jump={[{ label: '🌍 Countries', href: '#countries' }, { label: '🎓 Programs', href: '#programs' }, { label: '🧮 Calculators', href: '#calculators' }, { label: '💰 Loans', href: '#loans' }, { label: '🛂 Visas', href: '#visas' }, { label: '🏅 Scholarships', href: '#scholarships' }]}>
            <ListingSection id="countries" title="Choose Your Destination">
                <CardGrid>
                    {LAUNCHED_COUNTRIES.map(c => <SACard key={c} href={`/study-abroad/study-in/${c}`} {...card(c)} />)}
                </CardGrid>
            </ListingSection>
            <ListingSection id="programs" title="Compare Programs">
                <CardGrid>
                    {programs.map(p => (
                        <SACard key={`${p.country}-${p.field}`} href={`/study-abroad/programs/${p.country}/${p.degree}/${p.field}`}
                            title={`${degreeLabel(p.degree)} ${p.field!.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())} in ${COUNTRIES[p.country].name}`}
                            figure={`${p.universities} universities`} figureNote="tuition, GPA, IELTS, GRE, deadlines" cta="Compare Programs →" />
                    ))}
                </CardGrid>
            </ListingSection>
            <ListingSection id="calculators" title="Free Calculators">
                <CardGrid>{LAUNCHED_TOOLS.map(t => <SACard key={t.slug} href={`/study-abroad/tools/${t.slug}`} title={t.title} subtitle={t.summary} cta="Open Calculator →" />)}</CardGrid>
            </ListingSection>
            <ListingSection id="loans" title="Loans and Blocked Accounts">
                <CardGrid>{allLoans.map(g => <SACard key={g.slug} href={`/study-abroad/loans/${g.slug}`} title={g.title} subtitle={g.summary} detail={COUNTRIES[g.country].name} />)}</CardGrid>
            </ListingSection>
            <ListingSection id="visas" title="Student Visa Guides">
                <CardGrid>{allVisas.map(g => <SACard key={g.slug} href={`/study-abroad/visas/${g.slug}`} title={g.title} subtitle={g.summary} detail={COUNTRIES[g.country].name} />)}</CardGrid>
            </ListingSection>
            <ListingSection id="scholarships" title="Scholarships for Studying Abroad">
                <CardGrid>{allScholarships.map(s => <ScholarshipCard key={s.slug} scholarship={s} />)}</CardGrid>
                <Link href="/scholarships/international" className="inline-block mt-6 font-bold text-google-blue hover:underline">All international scholarships →</Link>
            </ListingSection>
        </ListingShell>
    );
}
