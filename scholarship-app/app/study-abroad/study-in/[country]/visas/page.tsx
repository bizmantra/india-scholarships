import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getGuides } from '@/lib/study-abroad/data';
import { SITE, pageTitle } from '@/lib/study-abroad/content';
import ListingShell, { ListingSection } from '../../../_components/ListingShell';
import SACard, { CardGrid } from '../../../_components/SACard';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return { title: pageTitle(`Student Visa Guides for ${name} (Indian Students)`), description: `Step-by-step ${name} student visa guides for Indian students: documents, fees, appointments and interview preparation.`, alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/visas` } };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const name = COUNTRIES[country].name;
    const rows = await getGuides('visa', country);
    return (
        <ListingShell crumbs={[{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: 'Visas' }]}
            title={`${name} Student Visa Guides`}
            intro={<>Documents, fees, appointment booking and interview preparation, step by step. No sign-up needed.</>}
            stats={[{ label: 'Guides', value: String(rows.length), note: 'Free to read', tone: 'blue' }]}>
            <ListingSection id="list" title="All Guides">
                <CardGrid>{rows.map(g => <SACard key={g.slug} href={`/study-abroad/visas/${g.slug}`} title={g.title} subtitle={g.summary} cta="Read Guide →" />)}</CardGrid>
            </ListingSection>
        </ListingShell>
    );
}
