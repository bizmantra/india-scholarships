'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { afterDecision, api, CATEGORY_LABELS, short } from './orchestrator';
import { useStore } from './store';

interface Row {
    id: number;
    kind: string;
    scholarship_title: string;
    slug: string | null;
    field: string | null;
    old_value: string | null;
    new_value: string | null;
    category: string;
    risk: string;
    times_proposed: number;
    days_to_deadline: number | null;
}

const PAGE = 50;

// The same inbox as the chat, as a plain table. Uses the same decide endpoint.
export default function ListView() {
    const [category, setCategory] = useState('date_change');
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const revision = useStore(s => s.revision);
    const summary = useStore(s => s.summary);

    useEffect(() => {
        setLoading(true);
        const q = category === 'risky' ? 'risk=high' : `category=${category}`;
        api<{ items: Row[]; total: number }>(`inbox?${q}&limit=${PAGE}&offset=${page * PAGE}`)
            .then(r => { setRows(r.items); setTotal(r.total); setSelected(new Set()); })
            .catch(e => setMessage(e.message))
            .finally(() => setLoading(false));
    }, [category, page, revision]);

    const decide = async (action: 'approve' | 'reject') => {
        const ids = [...selected];
        if (!ids.length) return;
        if (ids.length > 10 && !window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} ${ids.length} items?`)) return;
        try {
            const r = await api<{ done: number[]; skipped: { reason: string }[] }>('decide', { method: 'POST', body: JSON.stringify({ ids, action }) });
            setMessage(`${action === 'approve' ? 'Approved' : 'Rejected'} ${r.done.length}${r.skipped.length ? `, skipped ${r.skipped.length}: ${r.skipped[0].reason}` : ''}`);
            afterDecision();
        } catch (e: any) {
            setMessage(e.message);
        }
    };

    const tabs = [...Object.keys(CATEGORY_LABELS), 'risky'];
    const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id));

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                    <button key={t} onClick={() => { setCategory(t); setPage(0); setMessage(''); }}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${category === t ? 'bg-blue-600 text-white' : 'border border-cc-border-strong text-cc-muted hover:text-cc-text'}`}>
                        {t === 'risky' ? 'Risky' : CATEGORY_LABELS[t]}
                        {summary && <span className="ml-1.5 opacity-70">{t === 'risky' ? summary.risky : summary.groups[t] ?? 0}</span>}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <button onClick={() => decide('approve')} disabled={!selected.size} className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white disabled:opacity-40">Approve selected ({selected.size})</button>
                <button onClick={() => decide('reject')} disabled={!selected.size} className="rounded-lg border border-rose-500/40 px-3 py-1.5 font-bold text-cc-bad disabled:opacity-40">Reject selected</button>
                {message && <span className="text-cc-muted">{message}</span>}
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-cc-border">
                {loading ? <div className="p-6"><Loader2 className="h-4 w-4 animate-spin text-cc-muted" /></div> : (
                    <table className="w-full min-w-[640px] text-left text-xs">
                        <thead className="sticky top-0 bg-cc-panel text-cc-muted">
                            <tr>
                                <th className="p-3"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map(r => r.id)))} aria-label="Select all" /></th>
                                <th className="p-3">Scholarship</th>
                                <th className="p-3">Field</th>
                                <th className="p-3">Now</th>
                                <th className="p-3">Proposed</th>
                                <th className="p-3">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cc-border text-cc-text-2">
                            {rows.map(r => (
                                <tr key={r.id} className="hover:bg-cc-raised">
                                    <td className="p-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => setSelected(s => { const n = new Set(s); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} aria-label={`Select ${r.scholarship_title}`} /></td>
                                    <td className="p-3 font-bold text-cc-text">{r.slug ? <a href={`/scholarships/${r.slug}`} target="_blank" rel="noreferrer" className="hover:underline">{r.scholarship_title}</a> : r.scholarship_title}</td>
                                    <td className="p-3">{r.kind === 'new_scholarship' ? 'New' : r.field}</td>
                                    <td className="p-3 text-cc-muted">{short(r.old_value)}</td>
                                    <td className="p-3">{r.kind === 'new_scholarship' ? '—' : short(r.new_value)}</td>
                                    <td className="p-3 text-cc-muted">
                                        {r.risk === 'high' && <span className="mr-2 text-cc-bad">Risky</span>}
                                        {r.days_to_deadline !== null && Math.abs(r.days_to_deadline) <= 60 && <span className="mr-2">{r.days_to_deadline}d</span>}
                                        {r.times_proposed > 1 && <span>{r.times_proposed}×</span>}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-cc-muted">Nothing pending here.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="flex items-center justify-between text-xs text-cc-muted">
                <span>{total.toLocaleString('en-IN')} item(s)</span>
                <span className="flex gap-2">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="disabled:opacity-30">Previous</button>
                    <button disabled={(page + 1) * PAGE >= total} onClick={() => setPage(p => p + 1)} className="disabled:opacity-30">Next</button>
                </span>
            </div>
        </div>
    );
}
