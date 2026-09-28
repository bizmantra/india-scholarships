import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getGuides } from '@/lib/study-abroad/data';
import { SITE } from '@/lib/study-abroad/content';
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
        title: `${name} Student Visa Guides for Indian Students | IndiaScholarships`,
        description: `Step-by-step ${name} student visa guides for Indian students: documents, fees, appointments and interview preparation.`,
        alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/visas` },
    };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const name = c.name;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: `Visas` }];
    const rows = await getGuides("visa", country);
    return (
        <HubShell crumbs={crumbs} title={`${name} student visa guides`} jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro="Documents, fees, appointment booking and interview preparation, step by step.">
            <LinkList items={rows.map(g => ({ title: g.title, href: `/study-abroad/visas/${g.slug}`, meta: g.summary }))} />
        </HubShell>
    );
}
