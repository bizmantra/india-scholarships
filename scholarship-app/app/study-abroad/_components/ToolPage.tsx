import React from 'react';
import DetailShell, { DetailSection, KeyCard, InfoCard, SideLinks } from './DetailShell';
import { TOOLS } from './tools';
import type { SaFact } from '@/lib/study-abroad/data';

// A calculator page in the detail layout: the tool, then the numbers it uses with their sources
export default function ToolPage({ slug, facts = [], children }: { slug: string; facts?: SaFact[]; children: React.ReactNode }) {
    const tool = TOOLS.find(t => t.slug === slug)!;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: 'Calculators', href: '/study-abroad/tools' }, { label: tool.title }];
    return (
        <DetailShell crumbs={crumbs} eyebrow="Free Calculator · No Sign-up" title={tool.title} subline={tool.summary}
            url={`https://www.indiascholarships.in/study-abroad/tools/${slug}`}
            jump={[{ label: 'Calculator', href: '#calculator' }, ...(facts.length ? [{ label: 'Numbers used', href: '#numbers' }] : [])]}
            jsonLd={[{ '@context': 'https://schema.org', '@type': 'WebApplication', name: tool.title, applicationCategory: 'FinanceApplication', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } }]}
            sidebar={<>
                <KeyCard label="Cost" value="Free" note="No sign-up or phone number" action={{ href: '#calculator', label: 'Start calculating ↓' }} />
                <InfoCard title="Other Calculators" rows={TOOLS.filter(t => t.slug !== slug).map(t => ({ icon: '🧮', label: t.title, value: <a href={`/study-abroad/tools/${t.slug}`} className="text-google-blue font-bold hover:underline">Open →</a> }))} />
                <SideLinks links={[{ href: '/study-abroad', label: 'Study Abroad home' }]} />
            </>}>
            <section id="calculator" className="scroll-mt-32">{children}</section>
            {facts.length > 0 && (
                <DetailSection id="numbers" title="Numbers This Calculator Uses">
                    <ul className="space-y-2 text-sm text-gray-700">
                        {facts.map(f => (
                            <li key={f.key}>
                                {f.label}: <strong>{f.value} {f.unit}</strong>
                                {f.official_source ? <> (<a href={f.official_source} target="_blank" rel="noopener noreferrer" className="text-google-blue hover:underline">source</a>)</> : <span className="text-gray-500"> (not yet checked against an official source; please confirm before relying on it)</span>}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-gray-500 mt-3">Results are estimates. Exchange rates and fees change; your bank and the provider have the final figures.</p>
                </DetailSection>
            )}
        </DetailShell>
    );
}
