// Shared blocks for /study-abroad pages, styled like the main site's EditorialTemplate lists.
import React from 'react';
import Link from 'next/link';
import type { SaProgram } from '@/lib/study-abroad/data';
import { money } from '@/lib/study-abroad/content';

export function BlockHeading({ children }: { children: React.ReactNode }) {
    return <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{children}</h3>;
}

// Where the facts come from, and when they were last checked
export function Sources({ source, checkedAt }: { source: string | null; checkedAt: string | null }) {
    const urls = (source || '').split(/[,\s]+/).filter(u => /^https?:\/\//.test(u));
    const checked = checkedAt ? new Date(checkedAt.replace(' ', 'T')) : null;
    return (
        <div className="my-10 border-t border-gray-100 pt-6 text-xs text-gray-500 leading-relaxed">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Sources</h3>
            {urls.length > 0 ? (
                <ul className="space-y-1">
                    {urls.map(u => (
                        <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="text-google-blue hover:underline break-all">{u}</a></li>
                    ))}
                </ul>
            ) : (
                <p>No official source is recorded for this page yet. Check fees, deadlines and requirements on the university or embassy website before you apply.</p>
            )}
            {checked && !Number.isNaN(checked.getTime()) && (
                <p className="mt-2">Last checked against the source: {checked.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            )}
        </div>
    );
}

export function LinkList({ title, items }: { title?: string; items: { title: string; href: string; meta?: string | null; right?: string | null }[] }) {
    if (!items.length) return null;
    return (
        <div className="my-8">
            {title && <BlockHeading>{title}</BlockHeading>}
            <div className="border-t border-gray-100">
                {items.map(i => (
                    <Link key={i.href} href={i.href} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline">
                        <div className="min-w-0">
                            <span className="text-sm font-semibold text-gray-900 block">{i.title}</span>
                            {i.meta && <span className="text-xs text-gray-500 line-clamp-2">{i.meta}</span>}
                        </div>
                        {i.right && <span className="text-xs font-bold text-gray-700 shrink-0">{i.right}</span>}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export interface Provider {
    name: string; processing_fee?: string; min_interest_rate?: string; collateral_required?: boolean;
    max_amount?: number; cta_url?: string;
}

// Loan / blocked-account comparison. Links go through /study-abroad/out/<id> and are disclosed.
export function ProviderTable({ providers, note }: { providers: Provider[]; note?: string | null }) {
    if (!providers.length) return null;
    return (
        <div className="my-10">
            <BlockHeading>Provider comparison</BlockHeading>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs text-gray-500">
                        <tr>
                            <th className="px-3 py-2 font-semibold">Provider</th>
                            <th className="px-3 py-2 font-semibold">Fees</th>
                            <th className="px-3 py-2 font-semibold">Interest / monthly cost</th>
                            <th className="px-3 py-2 font-semibold">Collateral</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(p => (
                            <tr key={p.name} className="border-t border-gray-100">
                                <td className="px-3 py-2 font-semibold text-gray-900">{p.name}</td>
                                <td className="px-3 py-2 text-gray-700">{p.processing_fee || '—'}</td>
                                <td className="px-3 py-2 text-gray-700">{p.min_interest_rate || '—'}</td>
                                <td className="px-3 py-2 text-gray-700">{p.collateral_required === undefined ? '—' : p.collateral_required ? 'Required' : 'Not required'}</td>
                                <td className="px-3 py-2 text-right">
                                    {p.cta_url && (
                                        <a href={`/study-abroad${p.cta_url}`} rel="sponsored nofollow noopener" target="_blank" className="text-xs font-semibold text-google-blue hover:underline whitespace-nowrap">
                                            Visit site
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {note && <p className="text-xs text-gray-600 mt-3">{note}</p>}
            <p className="text-[11px] text-gray-500 mt-2">
                Fees and rates change often; confirm them on the provider&apos;s website. Some &ldquo;Visit site&rdquo; links may be affiliate links:
                we may earn a commission if you sign up, at no cost to you. It does not change the order or what we show.
            </p>
        </div>
    );
}

export function FeeList({ fees }: { fees: { name: string; amount: number; currency: string }[] }) {
    if (!fees.length) return null;
    return (
        <div className="my-8">
            <BlockHeading>Fees</BlockHeading>
            <div className="border-t border-gray-100">
                {fees.map(f => (
                    <div key={f.name} className="flex justify-between gap-4 py-3 border-b border-gray-100 text-sm">
                        <span className="text-gray-900 font-semibold">{f.name}</span>
                        <span className="text-gray-700 font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: f.currency, maximumFractionDigits: 0 }).format(f.amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MockInterview({ items }: { items: { question: string; tips?: string; answer_framework?: string }[] }) {
    if (!items.length) return null;
    return (
        <div className="my-10">
            <BlockHeading>Practice interview questions</BlockHeading>
            <div className="space-y-2">
                {items.map(q => (
                    <details key={q.question} className="border-b border-gray-100 py-3">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-900">{q.question}</summary>
                        {q.tips && <p className="text-sm text-gray-600 leading-relaxed mt-2"><strong>Tip:</strong> {q.tips}</p>}
                        {q.answer_framework && <p className="text-sm text-gray-600 leading-relaxed mt-2"><strong>How to answer:</strong> {q.answer_framework}</p>}
                    </details>
                ))}
            </div>
        </div>
    );
}

const deadlinesText = (json: string | null) => {
    if (!json) return null;
    try {
        return Object.entries(JSON.parse(json) as Record<string, string>).map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`).join(' · ');
    } catch { return null; }
};

// Program comparison: one row per program, real per-program values only
export function ProgramTable({ programs, showUniversity = true }: { programs: SaProgram[]; showUniversity?: boolean }) {
    if (!programs.length) return null;
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-md my-6">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                        <th className="px-3 py-2 font-semibold">{showUniversity ? 'University / program' : 'Program'}</th>
                        <th className="px-3 py-2 font-semibold">Tuition per year</th>
                        <th className="px-3 py-2 font-semibold">Living per year</th>
                        <th className="px-3 py-2 font-semibold">Minimum GPA</th>
                        <th className="px-3 py-2 font-semibold">IELTS</th>
                        <th className="px-3 py-2 font-semibold">GRE</th>
                    </tr>
                </thead>
                <tbody>
                    {programs.map(p => (
                        <tr key={p.id} className="border-t border-gray-100 align-top">
                            <td className="px-3 py-2">
                                <Link href={`/study-abroad/program-detail/${p.country}/${p.university_slug}/${p.slug}`} className="font-semibold text-gray-900 hover:underline">
                                    {showUniversity ? p.university_name : p.title}
                                </Link>
                                {showUniversity && <span className="block text-xs text-gray-500">{p.title}</span>}
                                {deadlinesText(p.application_deadlines) && <span className="block text-[11px] text-gray-500 mt-0.5">{deadlinesText(p.application_deadlines)}</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{money(p.tuition_per_year, p.tuition_currency) || '—'}</td>
                            <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{money(p.living_cost_per_year, p.living_currency) || '—'}</td>
                            <td className="px-3 py-2 text-gray-700">{p.gpa_min || '—'}</td>
                            <td className="px-3 py-2 text-gray-700">{p.ielts_min ?? '—'}</td>
                            <td className="px-3 py-2 text-gray-700">{p.gre || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { deadlinesText };
