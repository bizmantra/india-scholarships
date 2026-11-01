// Listing page layout for /study-abroad, matching the main site's listing pages
// (app/scholarships-in/[state]/page.tsx): breadcrumb, jump chips, title + intro, stat cards, sections.
import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { breadcrumbJsonLd, type Crumb } from './seo';

export interface Stat { label: string; value: string; note: string; tone: 'blue' | 'green' | 'emerald' }
// Full class names so Tailwind generates them
const STAT_COLS: Record<number, string> = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };
const TONES = {
    blue: ['bg-blue-50/50 border-blue-100', 'text-google-blue', 'text-blue-900', 'text-blue-600'],
    green: ['bg-green-50/50 border-green-100', 'text-green-700', 'text-green-900', 'text-green-600'],
    emerald: ['bg-emerald-50/50 border-emerald-100', 'text-emerald-700', 'text-emerald-900', 'text-emerald-600'],
};

export default function ListingShell({ crumbs, title, intro, stats = [], jump = [], jsonLd = [], children }: {
    crumbs: Crumb[]; title: string; intro: React.ReactNode; stats?: Stat[]; jump?: { label: string; href: string }[];
    jsonLd?: object[]; children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd(crumbs), ...jsonLd]) }} />
            <Header />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
                    {crumbs.map((c, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <span>/</span>}
                            {c.href ? <Link href={c.href} className="hover:text-google-blue">{c.label}</Link> : <span className="text-gray-900 font-medium">{c.label}</span>}
                        </React.Fragment>
                    ))}
                </nav>

                {jump.length > 0 && (
                    <div id="overview" className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2 border-b border-gray-200/80 shadow-xs mb-6 scroll-mt-20">
                        {jump.map((j, i) => (
                            <a key={j.href} href={j.href} className={`flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                                {j.label}
                            </a>
                        ))}
                    </div>
                )}

                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{title}</h1>
                    <div className="text-xl text-gray-600 max-w-3xl leading-relaxed">{intro}</div>
                </div>

                {stats.length > 0 && (
                    <div className={`grid grid-cols-1 ${STAT_COLS[stats.length] || 'sm:grid-cols-3'} gap-6 mb-16`}>
                        {stats.map(s => {
                            const [box, label, value, note] = TONES[s.tone];
                            return (
                                <div key={s.label} className={`p-6 rounded-3xl border ${box}`}>
                                    <h3 className={`${label} font-bold mb-1`}>{s.label}</h3>
                                    <p className={`text-3xl font-extrabold ${value}`}>{s.value}</p>
                                    <p className={`text-xs ${note} mt-2`}>{s.note}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {children}
            </main>
            <Footer />
        </div>
    );
}

export function ListingSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">{title}</h2>
            {children}
        </section>
    );
}
