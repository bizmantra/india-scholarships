'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AGENTS, agentsOfTeam } from '@/lib/command-center/agents';
import { facetsFor, reasonLine } from '@/lib/command-center/inbox-view';
import { LABELS as SA_LABELS } from '@/scripts/lib/sa-inbox';
import { EvidenceLine } from './Cards';
import { afterDecision, api, CATEGORY_LABELS, refreshSummary, short } from './orchestrator';
import { store, useStore } from './store';

// Link to the page a proposal is about: the scholarship page, or the Study Abroad page from the payload
function pageHref(r: { kind: string; slug?: string | null; payload_json?: string | null }) {
    if (r.kind === 'sa_field_change') {
        try { return JSON.parse(r.payload_json || '{}').path || null; } catch { return null; }
    }
    return r.slug ? `/scholarships/${r.slug}` : null;
}

interface Row {
    id: number;
    agent: string;
    kind: string;
    scholarship_title: string;
    payload_json?: string | null;
    evidence_json: string | null;
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
const COLUMNS = 6;

// What is waiting for one team (or for everyone when team is null), with Approve and Reject.
// Used by the Inbox ("Everything") and by every team page, so both show the same rows and counts.
// team: a team id, 'other' (agents without a team) or null (all). Remount it (key) when the team changes.
export default function InboxQueue({ team }: { team: string | null }) {
    const [category, setCategory] = useState<string | null>(null); // null = all categories
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [open, setOpen] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const revision = useStore(s => s.revision);
    const summary = useStore(s => s.summary);

    // Opening straight into a team page can happen before the counts were loaded
    useEffect(() => { if (!store.get().summary) refreshSummary(); }, []);

    useEffect(() => {
        setLoading(true);
        const q = category === null ? '' : category === 'risky' ? 'risk=high&' : `category=${category}&`;
        api<{ items: Row[]; total: number }>(`inbox?${q}${team ? `team=${team}&` : ''}limit=${PAGE}&offset=${page * PAGE}`)
            .then(r => { setRows(r.items); setTotal(r.total); setSelected(new Set()); setOpen(null); })
            .catch(e => setMessage(e.message))
            .finally(() => setLoading(false));
    }, [category, page, team, revision]);

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

    // Counts for this team's agents, so the pills always add up to what the table lists
    const withItems = Object.keys(summary?.byAgentCategory ?? {});
    const agentIds = team === null ? withItems
        : team === 'other' ? withItems.filter(id => !AGENTS.some(a => a.id === id && a.team))
        : agentsOfTeam(team).map(a => a.id);
    const facets = summary?.byAgentCategory ? facetsFor(summary.byAgentCategory, summary.byAgentRisky ?? {}, agentIds) : null;

    const pills: { id: string | null; label: string; n?: number }[] = [
        { id: null, label: 'All', n: facets?.total },
        ...Object.keys(CATEGORY_LABELS).map(c => ({ id: c as string | null, label: CATEGORY_LABELS[c], n: facets?.byCategory[c] ?? 0 })),
        { id: 'risky', label: 'Risky', n: facets?.risky ?? 0 },
    ].filter(p => !facets || p.id === null || p.id === category || (p.n ?? 0) > 0);

    const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id));
    const agentLabel = (id: string) => AGENTS.find(a => a.id === id)?.label ?? id;

    return (
        <div className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {pills.map(p => (
                    <button key={p.id ?? 'all'} onClick={() => { setCategory(p.id); setPage(0); setMessage(''); }}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${category === p.id ? 'bg-blue-600 text-white' : 'border border-cc-border-strong text-cc-muted hover:text-cc-text'}`}>
                        {p.label}
                        {p.n !== undefined && <span className="ml-1.5 opacity-70">{p.n.toLocaleString('en-IN')}</span>}
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
                            {rows.flatMap(r => {
                                const href = pageHref(r);
                                const line = (
                                    <tr key={r.id} onClick={() => setOpen(o => (o === r.id ? null : r.id))} className="cursor-pointer align-top hover:bg-cc-raised">
                                        <td className="p-3" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selected.has(r.id)} onChange={() => setSelected(s => { const n = new Set(s); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} aria-label={`Select ${r.scholarship_title}`} />
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-cc-text">
                                                {href ? <a href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="hover:underline">{r.scholarship_title}</a> : r.scholarship_title}
                                            </div>
                                            <div className="mt-0.5 text-[11px] font-normal text-cc-muted">{reasonLine({ ...r, agentLabel: agentLabel(r.agent) })}</div>
                                        </td>
                                        <td className="p-3">{r.kind === 'new_scholarship' ? 'New' : r.kind === 'sa_field_change' ? `Study Abroad: ${(SA_LABELS as Record<string, string>)[r.field || ''] || r.field}` : r.field}</td>
                                        <td className="p-3 text-cc-muted">{short(r.old_value)}</td>
                                        <td className="p-3">{r.kind === 'new_scholarship' ? '—' : short(r.new_value)}</td>
                                        <td className="p-3 text-cc-muted">
                                            {r.risk === 'high' && <span className="mr-2 text-cc-bad">Risky</span>}
                                            {r.days_to_deadline !== null && Math.abs(r.days_to_deadline) <= 60 && <span className="mr-2">{r.days_to_deadline}d</span>}
                                            {r.times_proposed > 1 && <span>{r.times_proposed}×</span>}
                                        </td>
                                    </tr>
                                );
                                if (open !== r.id) return [line];
                                return [line, (
                                    <tr key={`${r.id}-evidence`} className="bg-cc-panel">
                                        <td />
                                        <td colSpan={COLUMNS - 1} className="px-3 pb-3">
                                            <EvidenceLine json={r.evidence_json} field={r.field} />
                                            {href && <a href={href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] text-cc-link hover:underline">Open the page</a>}
                                        </td>
                                    </tr>
                                )];
                            })}
                            {rows.length === 0 && <tr><td colSpan={COLUMNS} className="p-6 text-center text-cc-muted">Nothing pending here.</td></tr>}
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
