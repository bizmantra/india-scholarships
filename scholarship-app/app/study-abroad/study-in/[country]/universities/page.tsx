import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getUniversities, getPrograms } from '@/lib/study-abroad/data';
import { SITE, universityCard, pageTitle } from '@/lib/study-abroad/content';
import ListingShell, { ListingSection } from '../../../_components/ListingShell';
import SACard, { CardGrid } from '../../../_components/SACard';

export const revalidate = 86400;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COUNTRIES).map(country => ({ country })); }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    if (!isCountry(country)) return {};
    const name = COUNTRIES[country].name;
    return { title: pageTitle(`Universities in ${name} for Indian Students 2026: Fees & Admission`), description: `Universities in ${name} for Indian students, with tuition, living costs, GRE rules and the programs we track.`, alternates: { canonical: `${SITE}/study-abroad/study-in/${country}/universities` } };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    if (!isCountry(country)) notFound();
    const name = COUNTRIES[country].name;
    const [rows, programs] = await Promise.all([getUniversities(country), getPrograms(country)]);
    return (
        <ListingShell crumbs={[{ label: "Home", href: "/" }, { label: "Study Abroad", href: "/study-abroad" }, { label: name, href: `/study-abroad/study-in/${country}` }, { label: "Universities" }]}
            title={`Universities in ${name} 2026`}
            intro={<>Fees, living costs and admission details for <a href="#list" className="font-bold text-google-blue hover:underline">{rows.length} universities</a> popular with Indian students.</>}
            stats={[{ label: "Universities", value: String(rows.length), note: "With a full profile", tone: "blue" }, { label: "Programs Tracked", value: String(programs.length), note: "With real requirements", tone: "green" }]}>
            <ListingSection id="list" title={`All Universities in ${name}`}>
                <CardGrid>
                    {rows.map(u => {
                        const card = universityCard(u);
                        return <SACard key={u.slug} href={`/study-abroad/universities/${u.slug}`} title={u.name} subtitle={card.location}
                            figure={card.tuition} figureNote={card.tuition ? "tuition" : null}
                            detail={card.living ? `Living costs: ${card.living}` : null} />;
                    })}
                </CardGrid>
            </ListingSection>
        </ListingShell>
    );
}
