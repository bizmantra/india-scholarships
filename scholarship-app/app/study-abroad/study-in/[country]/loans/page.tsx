import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getGuides } from '@/lib/study-abroad/data';
import { SITE } from '@/lib/study-abroad/content';
import ListingShell, { ListingSection } from '../../../_components/ListingShell';
import SACard, { CardGrid } from '../../../_components/SACard';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return { title: `Education Loans & Blocked Accounts for ${name} | IndiaScholarships`, description: `Compare education loans and blocked accounts for studying in ${name}: fees, interest rates, collateral and tax benefits.`, alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/loans` } };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const name = COUNTRIES[country].name;
    const rows = await getGuides('loan', country);
    return (
        <ListingShell crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: 'Loans & accounts' }]}
            title={`Loans and Blocked Accounts for ${name}`}
            intro={<>Side-by-side comparisons of fees, interest rates and collateral rules. We never ask for your phone number.</>}
            stats={[{ label: 'Guides', value: String(rows.length), note: 'Free to read', tone: 'blue' }]}>
            <ListingSection id="list" title="All Guides">
                <CardGrid>{rows.map(g => <SACard key={g.slug} href={`/study-abroad/loans/${g.slug}`} title={g.title} subtitle={g.summary} cta="Read Guide →" />)}</CardGrid>
            </ListingSection>
        </ListingShell>
    );
}
