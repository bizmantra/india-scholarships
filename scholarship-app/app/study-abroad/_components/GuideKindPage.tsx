// Visa guide and loan comparison pages: article plus the structured blocks those guides carry
import { notFound } from 'next/navigation';
import { COUNTRIES, getGuide, getGuides, isCountry, parseJson } from '@/lib/study-abroad/data';
import { renderArticle, SITE } from '@/lib/study-abroad/content';
import DetailShell, { DetailSection, KeyCard, InfoCard, SideLinks, sourceRows } from './DetailShell';
import { ArticleBody, Faqs, MoreLinks, jumpFor } from './ArticleSections';
import { ProviderTable, MockInterview, type Provider } from './blocks';
import { faqJsonLd } from './seo';

type Fee = { name: string; amount: number; currency: string };
interface GuideData {
    providers?: Provider[]; exemptions_info?: string; visa_fee?: Fee; sevis_fee?: Fee;
    processing_timeline_weeks?: number; processing_weeks?: number; mandatory_documents?: string[];
    mock_interview?: { question: string; tips?: string; answer_framework?: string }[];
}
const fmt = (f: Fee) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: f.currency, maximumFractionDigits: 0 }).format(f.amount);

export default async function GuideKindPage({ kind, slug }: { kind: 'visa' | 'loan'; slug: string }) {
    const g = await getGuide(kind, slug);
    if (!g || !isCountry(g.country)) notFound();
    const c = COUNTRIES[g.country];
    const d = parseJson<GuideData>(g.data_json, {});
    const weeks = d.processing_timeline_weeks ?? d.processing_weeks;
    const fees = [d.visa_fee, d.sevis_fee].filter(Boolean) as Fee[];
    const structured = [...fees.map(f => ({ label: f.name, value: fmt(f) })), ...(weeks ? [{ label: 'Typical processing time', value: `About ${weeks} weeks` }] : [])];
    const article = renderArticle(g, structured);
    const hub = kind === 'visa' ? 'visas' : 'loans';
    const siblings = (await getGuides(kind, g.country)).filter(s => s.slug !== g.slug);
    const crumbs = [
        { label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' },
        { label: c.name, href: `/study-abroad/study-in/${c.slug}` },
        { label: kind === 'visa' ? 'Visas' : 'Loans & accounts', href: `/study-abroad/study-in/${c.slug}/${hub}` }, { label: g.title },
    ];
    const extraJump = [
        ...(d.mandatory_documents?.length ? [{ label: 'Documents', href: '#documents' }] : []),
        ...(d.providers?.length ? [{ label: 'Compare providers', href: '#providers' }] : []),
        ...(d.mock_interview?.length ? [{ label: 'Interview questions', href: '#interview' }] : []),
    ];
    return (
        <DetailShell crumbs={crumbs} eyebrow={kind === 'visa' ? `Visa Guide · ${c.name}` : `Loans & Accounts · ${c.name}`} title={g.title}
            subline={article.updated ? `Updated ${article.updated}` : null}
            facts={[...structured, ...article.facts]} url={`${SITE}/study-abroad/${hub}/${g.slug}`}
            jump={jumpFor(article, extraJump)} jsonLd={faqJsonLd(article.faqs)}
            sidebar={<>
                {fees[0]
                    ? <KeyCard label={fees[0].name} value={fmt(fees[0])} note={weeks ? `Processing: about ${weeks} weeks` : null} action={{ href: '#documents', label: 'See the document checklist' }} />
                    : <KeyCard label={kind === 'loan' ? 'Compare' : 'Visa'} value={kind === 'loan' ? `${d.providers?.length || 0} providers` : c.name} note="No sign-up needed" action={d.providers?.length ? { href: '#providers', label: 'Compare providers ↓' } : null} />}
                <InfoCard rows={sourceRows(g.official_source, g.checked_at)} />
                <SideLinks links={[{ href: `/study-abroad/study-in/${c.slug}/${hub}`, label: kind === 'visa' ? `All ${c.name} visa guides` : `All loan guides for ${c.name}` }, { href: '/study-abroad/tools', label: 'Free cost calculators' }]} />
            </>}>
            {!article.html && g.summary && (
                <DetailSection title="About This Guide"><p className="text-base text-gray-700 leading-relaxed">{g.summary}</p></DetailSection>
            )}
            <ArticleBody article={article} />
            {d.mandatory_documents?.length ? (
                <DetailSection id="documents" title="Required Documents">
                    <ul className="space-y-2">
                        {d.mandatory_documents.map(doc => <li key={doc} className="flex gap-3 text-base text-gray-700"><span className="text-emerald-600">✓</span>{doc}</li>)}
                    </ul>
                </DetailSection>
            ) : null}
            {d.providers?.length ? (
                <DetailSection id="providers" title="Compare Providers"><ProviderTable providers={d.providers} note={d.exemptions_info} /></DetailSection>
            ) : null}
            {d.mock_interview?.length ? (
                <DetailSection id="interview" title="Practice Interview Questions"><MockInterview items={d.mock_interview} /></DetailSection>
            ) : null}
            <Faqs faqs={article.faqs} />
            <MoreLinks title={kind === 'visa' ? 'More Visa Guides' : 'More Loan Guides'} links={siblings.slice(0, 5).map(s => ({ href: `/study-abroad/${hub}/${s.slug}`, title: s.title }))} />
        </DetailShell>
    );
}
