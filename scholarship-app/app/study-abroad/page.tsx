import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, getUniversities, getGuides, getFacts, getProgramCombos, getScholarshipsForCountry, MIN_INDEXABLE_UNIVERSITIES } from '@/lib/study-abroad/data';
import { SITE } from '@/lib/study-abroad/content';
import HubShell, { breadcrumbJsonLd } from './_components/HubShell';
import { LinkList, BlockHeading } from './_components/blocks';
import { TOOLS } from './_components/tools';

export const revalidate = 86400;
export const metadata: Metadata = {
    title: 'Study Abroad for Indian Students: Germany & USA Costs, Universities, Visas | IndiaScholarships',
    description: 'Plan a Master\'s in Germany or the USA without agency fees or sign-ups: university costs, program comparisons, scholarships, loans, visa guides and free calculators.',
    alternates: { canonical: `${SITE}/study-abroad` },
};

const fmt = (value: string | undefined, currency: string) =>
    value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value)) : null;

export default async function StudyAbroadHome() {
    const [facts, combos, deUnis, usUnis, deVisas, usVisas, deLoans, usLoans, deSch, usSch] = await Promise.all([
        getFacts(), getProgramCombos(), getUniversities('germany'), getUniversities('usa'),
        getGuides('visa', 'germany'), getGuides('visa', 'usa'), getGuides('loan', 'germany'), getGuides('loan', 'usa'),
        getScholarshipsForCountry('germany', 4), getScholarshipsForCountry('usa', 4),
    ]);
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad' }];
    const countries = [
        { c: COUNTRIES.germany, unis: deUnis.length, lines: [
            fmt(facts['germany.blocked_account.annual_eur']?.value, 'EUR') && `Blocked account: ${fmt(facts['germany.blocked_account.annual_eur']?.value, 'EUR')} per year`,
            'Most public universities charge no tuition, only a semester fee',
        ] },
        { c: COUNTRIES.usa, unis: usUnis.length, lines: [
            fmt(facts['usa.visa.sevis_i901_fee_usd']?.value, 'USD') && `SEVIS fee ${fmt(facts['usa.visa.sevis_i901_fee_usd']?.value, 'USD')} + visa fee ${fmt(facts['usa.visa.f1_mrv_fee_usd']?.value, 'USD')}`,
            'STEM graduates can work for up to 3 years on OPT',
        ] },
    ];
    const programs = combos.filter(p => p.universities >= MIN_INDEXABLE_UNIVERSITIES);

    return (
        <HubShell crumbs={crumbs} title="Study abroad without agency fees or sign-ups"
            jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro="Costs in rupees, program requirements, scholarships, loans and visa steps for Indian students planning a Master's in Germany or the USA. Every page is free to read, and we never ask for your phone number.">
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {countries.map(({ c, unis, lines }) => (
                    <Link key={c.slug} href={`/study-abroad/study-in/${c.slug}`} className="block border border-gray-200 rounded-md p-5 hover:border-gray-400 transition-colors">
                        <span className="text-lg font-bold text-gray-900 font-heading">Study in {c.name} →</span>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            {lines.filter(Boolean).map(l => <li key={l as string}>{l}</li>)}
                            <li>{unis} universities with fees and admission details</li>
                        </ul>
                    </Link>
                ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8">
                <LinkList title="Free calculators" items={TOOLS.map(t => ({ title: t.title, href: `/study-abroad/tools/${t.slug}` }))} />
                <LinkList title="Compare programs" items={programs.map(p => ({
                    title: `${p.degree.toUpperCase()} ${p.field!.replace(/-/g, ' ')} in ${COUNTRIES[p.country].name}`,
                    href: `/study-abroad/programs/${p.country}/${p.degree}/${p.field}`, right: `${p.universities} universities`,
                }))} />
                <LinkList title="Loans and blocked accounts" items={[...deLoans, ...usLoans].map(g => ({ title: g.title, href: `/study-abroad/loans/${g.slug}` }))} />
                <LinkList title="Visa guides" items={[...deVisas, ...usVisas].slice(0, 8).map(g => ({ title: g.title, href: `/study-abroad/visas/${g.slug}` }))} />
            </div>

            <div className="my-8">
                <BlockHeading>Scholarships for studying abroad</BlockHeading>
                <LinkList items={[...deSch, ...usSch].map(s => ({ title: s.title, href: `/scholarships/${s.slug}`, meta: s.provider }))} />
                <Link href="/scholarships/international" className="text-sm font-semibold text-google-blue hover:underline">All international scholarships →</Link>
            </div>
        </HubShell>
    );
}
