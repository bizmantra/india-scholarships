import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getGuides } from '@/lib/study-abroad/data';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import HubShell, { breadcrumbJsonLd } from '../../../_components/HubShell';
import { LinkList } from '../../../_components/blocks';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return {
        title: pageTitle(`Education Loans & Blocked Accounts for ${name}`),
        description: `Compare education loans and blocked accounts for studying in ${name}: fees, interest rates, collateral and tax benefits.`,
        alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/loans` },
    };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const name = c.name;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: `Loans & accounts` }];
    const rows = await getGuides("loan", country);
    return (
        <HubShell crumbs={crumbs} title={`Loans and blocked accounts for ${name}`} jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro="Side-by-side comparisons of fees, interest rates and collateral rules. We don't ask for your phone number.">
            <LinkList items={rows.map(g => ({ title: g.title, href: `/study-abroad/loans/${g.slug}`, meta: g.summary }))} />
        </HubShell>
    );
}
