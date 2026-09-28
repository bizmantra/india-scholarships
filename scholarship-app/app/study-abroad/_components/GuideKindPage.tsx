// Visa guide and loan comparison pages: article text plus the structured blocks those guides carry
import { notFound } from 'next/navigation';
import { COUNTRIES, getGuide, isCountry, parseJson } from '@/lib/study-abroad/data';
import { toEditorial } from '@/lib/study-abroad/content';
import ArticlePage from './ArticlePage';
import { Sources, ProviderTable, FeeList, MockInterview, type Provider } from './blocks';

interface GuideData {
    providers?: Provider[]; exemptions_info?: string;
    visa_fee?: { name: string; amount: number; currency: string }; sevis_fee?: { name: string; amount: number; currency: string };
    processing_timeline_weeks?: number; processing_weeks?: number; mandatory_documents?: string[];
    mock_interview?: { question: string; tips?: string; answer_framework?: string }[];
}

export default async function GuideKindPage({ kind, slug }: { kind: 'visa' | 'loan'; slug: string }) {
    const g = await getGuide(kind, slug);
    if (!g || !isCountry(g.country)) notFound();
    const c = COUNTRIES[g.country];
    const d = parseJson<GuideData>(g.data_json, {});
    const weeks = d.processing_timeline_weeks ?? d.processing_weeks;
    const content = toEditorial(g, {
        tag: kind === 'visa' ? `Visa · ${c.name}` : `Loans & accounts · ${c.name}`,
        extraFacts: weeks ? [{ label: 'Typical processing time', value: `About ${weeks} weeks` }] : [],
    });
    if (d.mandatory_documents?.length) content.checklist = d.mandatory_documents.map(label => ({ label }));
    // Pages with no article text still need an introduction
    if (!content.body && g.summary) content.body = `<p class="text-slate-700 text-base leading-relaxed mb-4">${g.summary.replace(/</g, '&lt;')}</p>`;
    const hub = kind === 'visa' ? 'visas' : 'loans';
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' },
        { label: c.name, href: `/study-abroad/study-in/${c.slug}` },
        { label: kind === 'visa' ? 'Visas' : 'Loans & accounts', href: `/study-abroad/study-in/${c.slug}/${hub}` }, { label: g.title },
    ];
    const fees = [d.visa_fee, d.sevis_fee].filter(Boolean) as { name: string; amount: number; currency: string }[];
    return (
        <ArticlePage content={content} crumbs={crumbs}>
            <FeeList fees={fees} />
            <ProviderTable providers={d.providers || []} note={d.exemptions_info} />
            <MockInterview items={d.mock_interview || []} />
            <Sources source={g.official_source} checkedAt={g.checked_at} />
        </ArticlePage>
    );
}
