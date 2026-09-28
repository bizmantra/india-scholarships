import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES, isCountry, getPrograms, getProgram } from '@/lib/study-abroad/data';
import { SITE, money, pageTitle } from '@/lib/study-abroad/content';
import HubShell, { breadcrumbJsonLd } from '../../../../_components/HubShell';
import { Sources, LinkList, deadlinesText } from '../../../../_components/blocks';

export const revalidate = 86400;
export const dynamicParams = false;
export async function generateStaticParams() {
    return (await getPrograms()).map(p => ({ country: p.country, university: p.university_slug, program: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; university: string; program: string }> }): Promise<Metadata> {
    const { country, university, program } = await params;
    const p = await getProgram(university, program);
    if (!p || p.country !== country) return {};
    return {
        title: pageTitle(`${p.title} at ${p.university_name}: Fees, Requirements & Deadlines`),
        description: `Tuition, living costs, minimum GPA, IELTS, GRE and deadlines for ${p.title} at ${p.university_name}, with the official source.`,
        alternates: { canonical: `${SITE}/study-abroad/program-detail/${country}/${university}/${program}` },
    };
}

export default async function ProgramDetail({ params }: { params: Promise<{ country: string; university: string; program: string }> }) {
    const { country, university, program } = await params;
    const p = await getProgram(university, program);
    if (!p || p.country !== country || !isCountry(country)) notFound();
    const c = COUNTRIES[country];
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: c.name, href: `/study-abroad/study-in/${country}` },
        { label: p.university_name!, href: `/study-abroad/universities/${p.university_slug}` }, { label: p.title },
    ];
    const rows = [
        ['University', p.university_name], ['Location', p.location],
        ['Tuition per year', money(p.tuition_per_year, p.tuition_currency)],
        ['Living costs per year (estimate)', money(p.living_cost_per_year, p.living_currency)],
        ['Minimum GPA', p.gpa_min], ['IELTS (minimum)', p.ielts_min != null ? String(p.ielts_min) : null],
        ['GRE', p.gre], ['Deadlines', deadlinesText(p.application_deadlines)],
    ].filter(([, v]) => v) as [string, string][];
    return (
        <HubShell crumbs={crumbs} title={`${p.title} at ${p.university_name}`} jsonLd={[breadcrumbJsonLd(crumbs)]}>
            <div className="wiki-infobox mb-8">
                <table className="w-full text-sm"><tbody>
                    {rows.map(([k, v]) => (
                        <tr key={k} className="border-b border-gray-100 last:border-0">
                            <th className="text-left font-medium text-gray-500 py-2 pr-4 align-top">{k}</th>
                            <td className="py-2 font-semibold text-gray-900">{v}</td>
                        </tr>
                    ))}
                </tbody></table>
            </div>
            <LinkList items={[
                { title: `More about ${p.university_name}`, href: `/study-abroad/universities/${p.university_slug}` },
                ...(p.field ? [{ title: `Compare all ${p.degree.toUpperCase()} ${p.field.replace(/-/g, ' ')} programs in ${c.name}`, href: `/study-abroad/programs/${country}/${p.degree}/${p.field}` }] : []),
            ]} />
            <Sources source={p.official_source} checkedAt={p.checked_at} />
        </HubShell>
    );
}
