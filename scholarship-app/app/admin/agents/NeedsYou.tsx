'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import type { NeedsItem } from '@/lib/command-center/inbox';
import { afterDecision, api, short } from './orchestrator';
import { useStore } from './store';

interface Needs { closing: NeedsItem[]; weak: NeedsItem[]; newFinds: NeedsItem[]; shown: number; total: number; rest: number }

const VERDICT: Record<string, { label: string; className: string }> = {
    verified: { label: 'Official page', className: 'border-emerald-500/30 bg-emerald-500/10 text-cc-good' },
    agreed: { label: 'Two answers agree', className: 'border-emerald-500/30 bg-emerald-500/10 text-cc-good' },
    confirmed: { label: 'Confirmed', className: 'border-emerald-500/30 bg-emerald-500/10 text-cc-good' },
    secondary: { label: 'Platform page only', className: 'border-amber-500/30 bg-amber-500/10 text-cc-warn' },
    uncertain: { label: 'Uncertain', className: 'border-rose-500/30 bg-rose-500/10 text-cc-bad' },
};

const host = (url?: string) => { try { return new URL(String(url)).host.replace(/^www\./, ''); } catch { return null; } };

function Card({ item, onDecide, busy }: { item: NeedsItem; onDecide: (id: number, action: 'approve' | 'reject') => void; busy: boolean }) {
    const e = item.evidence;
    const verdict = e?.verdict ? VERDICT[e.verdict] : undefined;
    const sourceUrl = e?.source || item.source_citation || '';
    const when = item.proposed_days === null || item.proposed_days === undefined ? null
        : item.proposed_days < 0 ? `${-item.proposed_days} d ago` : item.proposed_days === 0 ? 'today' : `in ${item.proposed_days} d`;
    return (
        <div className="rounded-xl border border-cc-border bg-cc-panel p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-sm font-bold text-cc-text">
                        {item.slug ? <a href={`/scholarships/${item.slug}`} target="_blank" rel="noreferrer" className="hover:underline">{item.scholarship_title}</a> : item.scholarship_title}
                    </div>
                    <div className="mt-0.5 text-xs text-cc-text-2">
                        {item.kind === 'new_scholarship'
                            ? 'New scholarship found by the scout'
                            : <>Deadline: <span className="text-cc-muted">{item.old_value ? short(item.old_value) : 'not set'}</span> → <span className="font-bold text-cc-text">{short(item.new_value)}</span>{when && <span className="ml-2 text-cc-muted">({when})</span>}</>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button disabled={busy} onClick={() => onDecide(Number(item.id), 'approve')} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">Approve</button>
                    <button disabled={busy} onClick={() => onDecide(Number(item.id), 'reject')} className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-cc-bad disabled:opacity-40">Reject</button>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                {verdict && <span className={`rounded-full border px-2 py-0.5 font-bold ${verdict.className}`}>{verdict.label}</span>}
                {typeof e?.score === 'number' && <span className="rounded-full border border-cc-border px-2 py-0.5 text-cc-muted">Evidence {e.score}/100</span>}
                {!e && <span className="rounded-full border border-cc-border px-2 py-0.5 text-cc-muted">No evidence recorded</span>}
                {e?.reason && <span className="text-cc-muted">{e.reason}</span>}
                {sourceUrl && host(sourceUrl) && (
                    <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cc-link hover:underline">{host(sourceUrl)} <ExternalLink className="h-3 w-3" /></a>
                )}
                {item.times_proposed > 1 && <span className="text-cc-muted">proposed {item.times_proposed}×</span>}
            </div>
            {e?.quote && <p className="mt-1.5 line-clamp-3 border-l-2 border-cc-border pl-2 text-xs italic text-cc-text-2">&ldquo;{e.quote}&rdquo;</p>}
        </div>
    );
}

function Section({ title, hint, items, onDecide, busy }: { title: string; hint: string; items: NeedsItem[]; onDecide: (id: number, action: 'approve' | 'reject') => void; busy: boolean }) {
    if (items.length === 0) return null;
    return (
        <section>
            <h2 className="text-sm font-bold text-cc-text">{title} <span className="text-cc-faint">({items.length})</span></h2>
            <p className="mb-2 text-xs text-cc-muted">{hint}</p>
            <div className="space-y-2">{items.map(i => <Card key={i.id} item={i} onDecide={onDecide} busy={busy} />)}</div>
        </section>
    );
}

// The few inbox items that need a person now, with the evidence beside the buttons. The rest stays in "Everything".
export default function NeedsYou({ onShowAll }: { onShowAll: () => void }) {
    const [data, setData] = useState<Needs | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const revision = useStore(s => s.revision);

    useEffect(() => {
        api<Needs>('inbox?view=needs').then(setData).catch(e => setError(e.message));
    }, [revision]);

    const decide = useCallback(async (id: number, action: 'approve' | 'reject') => {
        setBusy(true);
        try {
            const r = await api<{ done: number[]; skipped: { reason: string }[] }>('decide', { method: 'POST', body: JSON.stringify({ ids: [id], action }) });
            setMessage(r.done.length ? `${action === 'approve' ? 'Approved' : 'Rejected'}.` : `Skipped: ${r.skipped[0]?.reason || 'not applied'}`);
            afterDecision();
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }, []);

    if (error) return <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-cc-bad">{error}</p>;
    if (!data) return <div className="p-4"><Loader2 className="h-4 w-4 animate-spin text-cc-muted" /></div>;

    const count = data.closing.length + data.weak.length + data.newFinds.length;
    return (
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
            <p className="text-sm text-cc-text-2">
                {count === 0 ? 'Nothing needs you right now.' : <><b className="text-cc-text">{count}</b> item{count === 1 ? '' : 's'} need a look, soonest first.</>}{' '}
                <button onClick={onShowAll} className="font-bold text-blue-600 hover:underline">{data.rest.toLocaleString('en-IN')} more are in Everything</button>
                <span className="text-cc-muted"> (small wording, helpline and amount items that are not urgent).</span>
            </p>
            {message && <p className="text-xs text-cc-muted">{message}</p>}
            <Section title="Closing soon" hint="A proposed deadline within the next 3 weeks. Check the source, then approve." items={data.closing} onDecide={decide} busy={busy} />
            <Section title="Weak evidence: check the source first" hint="Deadline changes the agent was not sure about, busiest pages first. Approve only if the quote and source agree." items={data.weak} onDecide={decide} busy={busy} />
            <Section title="New scholarships found" hint="Found by the scout, waiting for a yes or no." items={data.newFinds} onDecide={decide} busy={busy} />
        </div>
    );
}
