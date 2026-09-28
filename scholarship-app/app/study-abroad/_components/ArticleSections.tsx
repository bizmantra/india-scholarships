// The article body, FAQs and "more on this topic" links inside a DetailShell
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Article } from '@/lib/study-abroad/content';
import { DetailSection } from './DetailShell';

export function ArticleBody({ article }: { article: Article }) {
    if (!article.html) return null;
    return <div id="guide" className="scroll-mt-32 max-w-none" dangerouslySetInnerHTML={{ __html: article.html }} />;
}

export function Faqs({ faqs }: { faqs: { q: string; a: string }[] }) {
    if (!faqs.length) return null;
    return (
        <DetailSection id="faqs" title="Common Questions (FAQs)">
            <div>
                {faqs.map((f, i) => (
                    <details key={i} className="border-b border-gray-100 py-3 group">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-900 list-none flex items-center justify-between font-heading">
                            {f.q}
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-90 transition-transform" />
                        </summary>
                        <p className="text-base text-gray-600 leading-relaxed mt-2">{f.a}</p>
                    </details>
                ))}
            </div>
        </DetailSection>
    );
}

export function MoreLinks({ id = 'more', title, links }: { id?: string; title: string; links: { href: string; title: string; meta?: string | null }[] }) {
    if (!links.length) return null;
    return (
        <DetailSection id={id} title={title}>
            <div>
                {links.map(l => (
                    <Link key={l.href} href={l.href} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors">
                        <div className="min-w-0">
                            <span className="text-sm font-semibold text-gray-900 block">{l.title}</span>
                            {l.meta && <span className="text-xs text-gray-500">{l.meta}</span>}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    </Link>
                ))}
            </div>
        </DetailSection>
    );
}

// Section pills: the article's first few headings plus fixed sections that exist on the page
export function jumpFor(article: Article, extra: { label: string; href: string }[] = []) {
    return [
        ...article.headings.slice(0, 5).map(h => ({ label: h.text.replace(/^[\p{Extended_Pictographic}\s]+/u, '').slice(0, 32), href: `#${h.id}` })),
        ...extra,
        ...(article.faqs.length ? [{ label: 'FAQs', href: '#faqs' }] : []),
    ];
}
