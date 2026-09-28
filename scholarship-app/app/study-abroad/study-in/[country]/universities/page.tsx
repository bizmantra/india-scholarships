import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getUniversities } from '@/lib/study-abroad/data';
import { SITE, money } from '@/lib/study-abroad/content';
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
        title: `Universities in ${name} for Indian Students: Fees & Admission | IndiaScholarships`,
        description: `Universities in ${name} for Indian students, with tuition, living costs, GRE rules and the programs we track.`,
        alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/universities` },
    };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const name = c.name;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: `Universities` }];
    const rows = await getUniversities(country);
    return (
        <HubShell crumbs={crumbs} title={`Universities in ${name}`} jsonLd={[breadcrumbJsonLd(crumbs)]}
            intro={`${rows.length} universities with fees, costs and admission details for Indian applicants.`}>
            <LinkList items={rows.map(u => ({
                title: u.name, href: `/study-abroad/universities/${u.slug}`,
                meta: [u.city, u.summary && !/^Complete 2026 guide to/.test(u.summary) ? u.summary : null].filter(Boolean).join(" · ") || null,
                right: money(u.tuition_per_year, u.tuition_currency),
            }))} />
        </HubShell>
    );
}
