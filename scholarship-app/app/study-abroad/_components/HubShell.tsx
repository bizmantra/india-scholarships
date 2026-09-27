// Page shell for Study Abroad listing pages (hubs, home, tools): the main site's header,
// breadcrumb bar and footer around plain content, matching EditorialTemplate's top.
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export interface Crumb { label: string; href?: string }

export default function HubShell({ crumbs, title, intro, children, jsonLd }: {
    crumbs: Crumb[]; title: string; intro?: React.ReactNode; children: React.ReactNode; jsonLd?: object[];
}) {
    return (
        <div className="min-h-screen bg-white">
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
            <Header />
            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                    {crumbs.map((c, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                            {c.href ? <Link href={c.href} className="hover:text-google-blue transition-colors">{c.label}</Link>
                                : <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{c.label}</span>}
                        </React.Fragment>
                    ))}
                </nav>
            </div>
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] font-heading leading-tight mb-4 tracking-tight">{title}</h1>
                {intro && <div className="text-base text-gray-600 leading-relaxed mb-8 max-w-3xl">{intro}</div>}
                {children}
            </main>
            <Footer />
        </div>
    );
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem', position: i + 1, name: c.label,
            ...(c.href ? { item: `https://www.indiascholarships.in${c.href}` } : {}),
        })),
    };
}
