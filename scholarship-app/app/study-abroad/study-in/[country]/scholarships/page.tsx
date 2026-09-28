import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getScholarshipsForCountry } from '@/lib/study-abroad/data';
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
        title: `Scholarships to Study in ${name} for Indian Students | IndiaScholarships`,
        description: `Scholarships for Indian students to study in ${name}, with amounts, eligibility and deadlines.`,
        alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/scholarships` },
    };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const name = c.name;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: `Scholarships` }];
    const rows = await getScholarshipsForCountry(country);
    return (
        <HubShell crumbs={crumbs} title={`Scholarships to study in ${name}`} jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro={`${rows.length} scholarships open to Indian students heading to ${name}. Each page lists the amount, eligibility, documents and deadline.`}>
            <LinkList items={rows.map(s => ({ title: s.title, href: `/scholarships/${s.slug}`, meta: [s.provider, s.level].filter(Boolean).join(" · ") || null }))} />
        </HubShell>
    );
}
