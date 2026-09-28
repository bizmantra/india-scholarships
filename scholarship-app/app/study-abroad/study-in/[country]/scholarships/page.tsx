import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getScholarshipsForCountry } from '@/lib/study-abroad/data';
import { SITE } from "@/lib/study-abroad/content";
import ScholarshipCard from "@/app/components/ScholarshipCard";
import ListingShell, { ListingSection } from '../../../_components/ListingShell';
import { CardGrid } from '../../../_components/SACard';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return { title: `Scholarships to Study in ${name} for Indian Students 2026 | IndiaScholarships`, description: `Scholarships for Indian students to study in ${name}, with amounts, eligibility and deadlines.`, alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/scholarships` } };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const name = COUNTRIES[country].name;
    const rows = await getScholarshipsForCountry(country);
    const today = new Date().toISOString().slice(0, 10);
    const open = rows.filter(s => !s.deadline || s.deadline >= today).length;
    return (
        <ListingShell crumbs={[{ label: "Home", href: "/" }, { label: "Study Abroad", href: "/study-abroad" }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: "Scholarships" }]}
            title={`Scholarships to Study in ${name} 2026`}
            intro={<>We track <a href="#list" className="font-bold text-google-blue hover:underline">{rows.length} scholarships</a> open to Indian students heading to {name}, with amounts, eligibility, documents and deadlines.</>}
            stats={[{ label: "Total Available", value: String(rows.length), note: "Verified schemes", tone: "blue" }, { label: "Open Now", value: String(open), note: "Deadline not passed", tone: "emerald" }]}>
            <ListingSection id="list" title={`Scholarships for ${name}`}>
                <CardGrid>{rows.map(s => <ScholarshipCard key={s.slug} scholarship={s} />)}</CardGrid>
            </ListingSection>
        </ListingShell>
    );
}
