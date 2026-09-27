import React from 'react';
import HubShell, { breadcrumbJsonLd } from './HubShell';
import { LinkList } from './blocks';
import { TOOLS } from './tools';
import type { SaFact } from '@/lib/study-abroad/data';

// A calculator page: the tool, the numbers it uses (with their sources), and links to the other tools
export default function ToolPage({ slug, facts = [], children }: { slug: string; facts?: SaFact[]; children: React.ReactNode }) {
    const tool = TOOLS.find(t => t.slug === slug)!;
    const crumbs = [{ label: 'Home', href: '/' }, { label: 'Study Abroad', href: '/study-abroad' }, { label: 'Calculators', href: '/study-abroad/tools' }, { label: tool.title }];
    return (
        <HubShell crumbs={crumbs} title={tool.title} intro={tool.summary}
            jsonLd={[breadcrumbJsonLd(crumbs), { '@context': 'https://schema.org', '@type': 'WebApplication', name: tool.title, applicationCategory: 'FinanceApplication', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } }]}>
            <div className="my-6">{children}</div>
            {facts.length > 0 && (
                <div className="my-10 border-t border-gray-100 pt-6 text-xs text-gray-500 leading-relaxed">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Numbers this calculator uses</h3>
                    <ul className="space-y-1">
                        {facts.map(f => (
                            <li key={f.key}>
                                {f.label}: <strong className="text-gray-700">{f.value} {f.unit}</strong>
                                {f.official_source ? <> (<a href={f.official_source} target="_blank" rel="noopener noreferrer" className="text-google-blue hover:underline">source</a>)</> : ' (not yet checked against an official source; please confirm before relying on it)'}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2">Results are estimates. Exchange rates and fees change; your bank and the provider have the final figures.</p>
                </div>
            )}
            <LinkList title="Other calculators" items={TOOLS.filter(t => t.slug !== slug).map(t => ({ title: t.title, href: `/study-abroad/tools/${t.slug}`, meta: t.summary }))} />
        </HubShell>
    );
}
