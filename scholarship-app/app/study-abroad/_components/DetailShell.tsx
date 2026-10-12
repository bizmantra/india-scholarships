// Detail page layout for /study-abroad, matching the main site's scholarship detail page
// (app/scholarships/[slug]/page.tsx): breadcrumb bar, sticky section pills, two columns with a
// sticky sidebar, eyebrow + title + subline, wiki fact box, share buttons, underlined section headings.
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ShareButtons from '@/app/components/ShareButtons';
import { breadcrumbJsonLd, type Crumb } from './seo';

export interface Fact { label: string; value: string }

export default function DetailShell({ crumbs, eyebrow, title, subline, facts = [], jump = [], url, sidebar, jsonLd = [], children }: {
    crumbs: Crumb[]; eyebrow: string; title: string; subline?: string | null; facts?: Fact[];
    jump?: { label: string; href: string }[]; url: string; sidebar: React.ReactNode; jsonLd?: object[]; children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd(crumbs), ...jsonLd]) }} />
            <Header />
            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                    {crumbs.map((c, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                            {c.href ? <Link href={c.href} className="hover:text-google-blue transition-colors">{c.label}</Link> : <span className="text-gray-900 font-medium truncate">{c.label}</span>}
                        </React.Fragment>
                    ))}
                </nav>
            </div>

            {jump.length > 0 && (
                <nav className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--color-border-gray)] overflow-x-auto scrollbar-none py-2.5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2">
                        {jump.map(j => (
                            <a key={j.href} href={j.href} className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-gray)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] border border-[var(--color-border-gray)] transition-all whitespace-nowrap shadow-xs">
                                {j.label}
                            </a>
                        ))}
                    </div>
                </nav>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                    <div className="space-y-10 min-w-0">
                        <div>
                            <div className="mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)] text-xs font-bold border border-[var(--color-border-gray)] uppercase tracking-wider">{eyebrow}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] font-heading mb-2 tracking-tight leading-tight">{title}</h1>
                            {subline && <p className="text-sm font-medium text-[var(--color-ink-soft)] mb-8">{subline}</p>}
                            {facts.length > 0 && (
                                <div className="wiki-infobox bg-slate-50 border border-slate-300 rounded-md p-4 mb-6 text-slate-900 shadow-sm">
                                    <table className="wiki-table text-sm mb-2">
                                        <tbody>
                                            {facts.map(f => (
                                                <tr key={f.label}><td>{f.label}</td><td className="font-semibold text-slate-900">{f.value}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div><ShareButtons title={title} url={url} label="Share this page" /></div>
                        {children}
                    </div>
                    <aside className="lg:sticky lg:top-24 h-fit space-y-6">{sidebar}</aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export function DetailSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-gray-100 font-heading">{title}</h2>
            {children}
        </section>
    );
}

// Sidebar: the page's key figure and its main action (like the scholarship page's deadline + apply card)
export function KeyCard({ label, value, note, action }: { label: string; value: string; note?: string | null; action?: { href: string; label: string; external?: boolean } | null }) {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-center space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-700 mb-0.5">{label}</div>
                <div className="text-xl font-black text-blue-900 font-heading">{value}</div>
                {note && <div className="text-[10px] text-blue-700 mt-1 italic leading-normal">{note}</div>}
            </div>
            {action ? (
                <a href={action.href} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-xl py-3.5 shadow-md shadow-blue-100 transition-colors">
                    {action.label}
                </a>
            ) : (
                <span className="w-full inline-flex items-center justify-center bg-gray-100 text-gray-400 text-sm font-bold rounded-xl py-3.5 border border-dashed">Official Link Not Available</span>
            )}
        </div>
    );
}

// Sidebar: official source, last checked, and other facts
export function InfoCard({ title = 'Official Information', rows }: { title?: string; rows: { icon: string; label: string; value: React.ReactNode }[] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="font-bold text-sm text-slate-800 font-heading border-b border-gray-100 pb-2">{title}</h3>
            <div className="space-y-3">
                {rows.map(r => (
                    <div key={r.label} className="flex items-start gap-3">
                        <span className="text-sm shrink-0">{r.icon}</span>
                        <div className="text-xs">
                            <strong className="text-slate-700 block mb-0.5">{r.label}</strong>
                            <span className="text-slate-500 font-medium leading-normal">{r.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SideLinks({ links }: { links: { href: string; label: string }[] }) {
    return (
        <div className="flex flex-col gap-2">
            {links.map(l => (
                <Link key={l.href} href={l.href} className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand hover:border-brand text-xs font-bold rounded-xl text-center transition-all">{l.label}</Link>
            ))}
        </div>
    );
}

// Official source + last checked, as InfoCard rows
export function sourceRows(source: string | null, checkedAt: string | null) {
    const url = (source || '').split(/[,\s]+/).find(u => /^https?:\/\//.test(u));
    const checked = checkedAt ? new Date(checkedAt.replace(' ', 'T')) : null;
    return [
        { icon: '🌐', label: 'Official Website', value: url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-google-blue font-bold hover:underline">Visit Website ↗</a> : 'Not recorded yet; check the official website before applying' },
        { icon: '🗓️', label: 'Last Checked', value: checked && !Number.isNaN(checked.getTime()) ? checked.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not yet checked against an official source' },
    ];
}
