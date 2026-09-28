import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, isCountry, getGuides, getUniversities, getFacts, getScholarshipsForCountry, getProgramCombos, MIN_INDEXABLE_UNIVERSITIES } from '@/lib/study-abroad/data';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import HubShell, { breadcrumbJsonLd } from '../../_components/HubShell';
import { LinkList, BlockHeading } from '../../_components/blocks';
import { STAGES, stageOf } from '../../_components/stages';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

// The two or three numbers a family asks first, read from sa_facts
const KEY_FACTS: Record<string, string[]> = {
    germany: ['germany.blocked_account.annual_eur', 'germany.aps.fee_inr', 'germany.visa.national_fee_eur'],
    usa: ['usa.visa.f1_mrv_fee_usd', 'usa.visa.sevis_i901_fee_usd', 'usa.living.monthly_average_usd'],
};

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return {
        title: pageTitle(`Study in ${name} for Indian Students: Costs, Universities, Visa & Loans`),
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
        getFacts(), getScholarshipsForCountry(country, 6), getProgramCombos(),
    ]);
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: c.name }];
    const keyFacts = KEY_FACTS[country].map(k => facts[k]).filter(Boolean);
    const programs = combos.filter(p => p.country === country && p.universities >= MIN_INDEXABLE_UNIVERSITIES);
    const fmt = (v: string, unit: string | null) => unit && /^[A-Z]{3}$/.test(unit)
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: unit, maximumFractionDigits: 0 }).format(Number(v)) : `${v} ${unit || ''}`;

    return (
        <HubShell crumbs={crumbs} title={`Study in ${c.name}`} jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro={<>Everything an Indian student needs to plan a Master&apos;s in {c.name}: where to apply, what it costs, how to fund it and how the visa works. No sign-up needed.</>}>
            {keyFacts.length > 0 && (
                <div className="wiki-infobox mb-8">
                    <table className="w-full text-sm">
                        <tbody>
                            {keyFacts.map(f => (
                                <tr key={f.key} className="border-b border-gray-100 last:border-0">
                                    <th className="text-left font-medium text-gray-500 py-2 pr-4">{f.label}</th>
                                    <td className="py-2 font-semibold text-gray-900">{fmt(f.value, f.unit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-x-8">
                <LinkList title="Explore" items={[
                    { title: `Universities in ${c.name}`, href: `/study-abroad/study-in/${country}/universities`, right: String(universities.length) },
                    { title: 'Scholarships', href: `/study-abroad/study-in/${country}/scholarships` },
                    { title: 'Visa guides', href: `/study-abroad/study-in/${country}/visas`, right: String(visas.length) },
                    { title: 'Loans and blocked accounts', href: `/study-abroad/study-in/${country}/loans`, right: String(loans.length) },
                    { title: 'Free calculators', href: '/study-abroad/tools' },
                ]} />
                <LinkList title="Compare programs" items={programs.map(p => ({
                    title: `${p.degree.toUpperCase()} ${p.field!.replace(/-/g, ' ')} in ${c.name}`,
                    href: `/study-abroad/programs/${country}/${p.degree}/${p.field}`, right: `${p.universities} universities`,
                }))} />
            </div>

            {STAGES.map(stage => {
                const items = guides.filter(g => stageOf(g.slug) === stage.id);
                return items.length > 0 && (
                    <LinkList key={stage.id} title={stage.title}
                        items={items.map(g => ({ title: g.title, href: `/study-abroad/study-in/${country}/${g.slug}`, meta: g.summary && !/^Complete 2026 guide to/.test(g.summary) ? g.summary : null }))} />
                );
            })}

            {scholarships.length > 0 && (
                <div className="my-8">
                    <BlockHeading>Scholarships for {c.name}</BlockHeading>
                    <LinkList items={scholarships.map(s => ({ title: s.title, href: `/scholarships/${s.slug}`, meta: s.provider }))} />
                    <Link href={`/study-abroad/study-in/${country}/scholarships`} className="text-sm font-semibold text-google-blue hover:underline">All scholarships for {c.name} →</Link>
                </div>
            )}
        </HubShell>
    );
}
