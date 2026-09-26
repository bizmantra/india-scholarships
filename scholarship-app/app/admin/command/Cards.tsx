'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Circle, ExternalLink, Loader2, RotateCcw, X, XCircle } from 'lucide-react';
import { afterDecision, api, CATEGORY_LABELS, handle, refreshActivity, refreshSummary, short } from './orchestrator';
import { log, post, useStore, type Message, type Tone } from './store';

const toneText: Record<Tone, string> = {
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    bad: 'text-rose-400',
    neutral: 'text-gray-300',
};

export const Card = ({ children, accent }: { children: React.ReactNode; accent?: 'warn' | 'bad' | 'good' }) => (
    <div className={`rounded-2xl border bg-[#0d1324] p-4 text-sm ${accent === 'warn' ? 'border-amber-500/40' : accent === 'bad' ? 'border-rose-500/40' : accent === 'good' ? 'border-emerald-500/30' : 'border-gray-800'}`}>
        {children}
    </div>
);

const Button = ({ children, onClick, tone = 'neutral', disabled }: { children: React.ReactNode; onClick: () => void; tone?: 'primary' | 'danger' | 'neutral'; disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${tone === 'primary'
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : tone === 'danger'
                ? 'border border-rose-800/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40'
                : 'border border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500'}`}
    >
        {children}
    </button>
);

export function MessageView({ message }: { message: Message }) {
    switch (message.type) {
        case 'user':
            return <div className="ml-auto max-w-[85%] rounded-2xl bg-blue-600/20 px-4 py-2 text-sm text-blue-100">{message.text}</div>;
        case 'text':
            return <div className={`max-w-[95%] whitespace-pre-line text-sm leading-relaxed ${toneText[message.tone || 'neutral']}`}>{message.text}</div>;
        case 'plan':
            return (
                <Card>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Plan · {message.title}</p>
                    <ol className="list-decimal space-y-1 pl-5 text-gray-300">
                        {message.steps.map(s => <li key={s}>{s}</li>)}
                    </ol>
                </Card>
            );
        case 'gate':
            return <GateCard message={message} />;
        case 'summary':
            return (
                <Card>
                    <p className="mb-2 font-bold text-white">{message.title}</p>
                    <div className="divide-y divide-gray-800/70">
                        {message.lines.map((line, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 py-1.5">
                                {line.action
                                    ? <button onClick={() => handle(line.action!)} className="text-left text-blue-300 hover:text-blue-200 hover:underline">{line.label}</button>
                                    : <span className="whitespace-pre text-gray-300">{line.label}</span>}
                                <span className={`shrink-0 font-bold ${toneText[line.tone || 'neutral']}`}>{line.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            );
        case 'proposals':
            return <ProposalsCard message={message} />;
        case 'run':
            return <RunCard message={message} />;
    }
}

function GateCard({ message }: { message: Extract<Message, { type: 'gate' }> }) {
    const [working, setWorking] = useState(false);
    return (
        <Card accent="warn">
            <p className="mb-1 flex items-center gap-2 font-bold text-white"><AlertTriangle className="h-4 w-4 text-amber-400" />{message.title}</p>
            {message.body && <p className="mb-2 text-gray-400">{message.body}</p>}
            {message.bullets && message.bullets.length > 0 && (
                <ul className="mb-3 list-disc space-y-0.5 pl-5 text-xs text-gray-400">
                    {message.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    <li className="list-none text-gray-500">…</li>
                </ul>
            )}
            {message.resolved
                ? <p className="text-xs font-bold text-gray-400">{message.resolved}</p>
                : (
                    <div className="flex flex-wrap gap-2">
                        {message.options.map(o => (
                            <Button key={o.label} tone={o.tone} disabled={working} onClick={async () => {
                                setWorking(true);
                                try { await o.run(); } catch (e: any) { post({ type: 'text', tone: 'bad', text: `That didn't work: ${e.message}` }); }
                                setWorking(false);
                            }}>{o.label}</Button>
                        ))}
                    </div>
                )}
        </Card>
    );
}

// ---------- Proposal cards: one per scholarship, most urgent first ----------

interface Item {
    id: number;
    kind: string;
    agent: string;
    scholarship_id: string;
    scholarship_title: string;
    slug: string | null;
    field: string | null;
    old_value: string | null;
    new_value: string | null;
    payload_json: string | null;
    evidence_json: string | null;
    category: string;
    risk: string;
    source_citation: string | null;
    times_proposed: number;
    first_proposed_at: string;
    clicks: number | null;
    days_to_deadline: number | null;
}

type Decision = { state: 'approved' | 'rejected' | 'skipped' | 'undone' | 'error'; note?: string };

function groupByScholarship(items: Item[]) {
    const groups: { key: string; items: Item[] }[] = [];
    for (const item of items) {
        const key = item.kind === 'new_scholarship' ? `new-${item.id}` : item.scholarship_id;
        const group = groups.find(g => g.key === key);
        if (group) group.items.push(item); else groups.push({ key, items: [item] });
    }
    return groups;
}

const FIELD_LABELS: Record<string, string> = {
    deadline: 'Deadline',
    deadline_description: 'Deadline text',
    amount_annual: 'Annual amount',
    amount_min: 'Minimum amount',
    official_source: 'Official source',
    apply_url: 'Apply link',
    helpline: 'Helpline',
};

const formatValue = (field: string | null, v: string | null) => {
    if (v === null || v === '') return '(empty)';
    if (field?.startsWith('amount_') && /^\d+$/.test(v)) return `₹${Number(v).toLocaleString('en-IN')}`;
    return v;
};

function ProposalsCard({ message }: { message: Extract<Message, { type: 'proposals' }> }) {
    const [items, setItems] = useState<Item[]>([]);
    const [total, setTotal] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [shown, setShown] = useState(message.pageSize);
    const [decisions, setDecisions] = useState<Record<number, Decision>>({});
    const [error, setError] = useState('');

    useEffect(() => {
        const q = new URLSearchParams({ limit: '200' });
        if (message.query.category) q.set('category', message.query.category);
        if (message.query.risk) q.set('risk', message.query.risk);
        api<{ items: Item[]; total: number }>(`inbox?${q}`)
            .then(r => { setItems(r.items); setTotal(r.total); })
            .catch(e => setError(e.message))
            .finally(() => setLoaded(true));
    }, [message.query.category, message.query.risk]);

    const groups = groupByScholarship(items);
    const visible = groups.slice(0, shown);

    const decide = async (ids: number[], action: 'approve' | 'reject', force = false) => {
        try {
            const r = await api<{ done: number[]; skipped: { id: number; reason: string }[] }>('decide', { method: 'POST', body: JSON.stringify({ ids, action, force }) });
            const next: Record<number, Decision> = {};
            r.done.forEach(id => { next[id] = { state: action === 'approve' ? 'approved' : 'rejected' }; });
            r.skipped.forEach(s => { next[s.id] = { state: 'error', note: s.reason }; });
            setDecisions(d => ({ ...d, ...next }));
            log({ agent: 'command-center', system: 'Turso', kind: 'ok', text: `${action === 'approve' ? 'Approved' : 'Rejected'} ${r.done.length} item(s)` });
            afterDecision();
        } catch (e: any) {
            const next: Record<number, Decision> = {};
            ids.forEach(id => { next[id] = { state: 'error', note: e.message }; });
            setDecisions(d => ({ ...d, ...next }));
        }
    };

    const undo = async (id: number) => {
        try {
            const r = await api<{ ok: boolean; message: string }>('undo', { method: 'POST', body: JSON.stringify({ id }) });
            setDecisions(d => ({ ...d, [id]: { state: 'undone', note: r.message } }));
            afterDecision();
        } catch (e: any) {
            setDecisions(d => ({ ...d, [id]: { ...d[id], note: e.message } }));
        }
    };

    if (!loaded) return <Card><Loader2 className="h-4 w-4 animate-spin text-gray-500" /></Card>;
    if (error) return <Card accent="bad"><p className="text-rose-300">{error}</p></Card>;
    if (groups.length === 0) return <Card><p className="text-gray-400">Nothing pending in {message.title.toLowerCase()}.</p></Card>;

    return (
        <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {message.title} · {total.toLocaleString('en-IN')} item(s){total > items.length ? `, showing the ${items.length} most urgent` : ''}
            </p>
            {visible.map(group => {
                const first = group.items[0];
                const pendingIds = group.items.filter(i => !decisions[i.id] || decisions[i.id].state === 'error').map(i => i.id);
                const isNew = first.kind === 'new_scholarship';
                const record = isNew ? JSON.parse(first.payload_json || '{}') : null;
                const evidence = JSON.parse(first.evidence_json || '{}');
                const high = group.items.some(i => i.risk === 'high');
                return (
                    <Card key={group.key} accent={high ? 'bad' : first.category === 'date_change' ? 'warn' : undefined}>
                        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                            <span className="font-bold uppercase tracking-wider">{CATEGORY_LABELS[first.category] || first.category}</span>
                            {high && <span className="rounded bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300">Risky</span>}
                            {first.days_to_deadline !== null && first.days_to_deadline !== undefined && Math.abs(first.days_to_deadline) <= 60 && (
                                <span>{first.days_to_deadline >= 0 ? `Closes in ${first.days_to_deadline} day(s)` : `Closed ${-first.days_to_deadline} day(s) ago`}</span>
                            )}
                            {Number(first.clicks) > 0 && <span>{Number(first.clicks).toLocaleString('en-IN')} clicks</span>}
                            {first.times_proposed > 1 && <span>Proposed {first.times_proposed}×</span>}
                        </div>
                        <p className="mb-2 font-bold text-white">
                            {first.slug
                                ? <a href={`/scholarships/${first.slug}`} target="_blank" rel="noreferrer" className="hover:underline">{first.scholarship_title}</a>
                                : first.scholarship_title}
                        </p>

                        {isNew ? (
                            <div className="space-y-1 text-xs text-gray-300">
                                <p>{record.provider || '—'} · {record.state || 'All India'} · {record.level || '—'}</p>
                                <p>Amount: {record.amount_description || (record.amount_annual ? `₹${Number(record.amount_annual).toLocaleString('en-IN')}` : '—')}</p>
                                <p>Deadline: {record.deadline || record.deadline_description || '—'}</p>
                                <p>AI confidence: <span className={evidence.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{evidence.confidence || '—'}</span>
                                    {evidence.gaps?.length ? <span className="text-gray-500"> · missing: {evidence.gaps.join(', ')}</span> : null}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {group.items.map(i => (
                                    <div key={i.id} className="text-xs">
                                        <p className="text-gray-500">{FIELD_LABELS[i.field || ''] || i.field}</p>
                                        <p className="break-words">
                                            <span className="text-gray-500 line-through">{formatValue(i.field, i.old_value)}</span>
                                            <span className="mx-1.5 text-gray-600">→</span>
                                            <span className="text-gray-100">{formatValue(i.field, i.new_value)}</span>
                                        </p>
                                        <DecisionLine decision={decisions[i.id]} onUndo={() => undo(i.id)} onForce={() => decide([i.id], 'approve', true)} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {first.source_citation && /^https?:/.test(first.source_citation) && (
                            <a href={first.source_citation} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300 hover:underline">
                                Source <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        {isNew && <DecisionLine decision={decisions[first.id]} onUndo={() => undo(first.id)} />}

                        {pendingIds.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button tone="primary" onClick={() => decide(pendingIds, 'approve')}>{pendingIds.length > 1 ? `Approve ${pendingIds.length}` : 'Approve'}</Button>
                                <Button tone="danger" onClick={() => decide(pendingIds, 'reject')}>Reject</Button>
                            </div>
                        )}
                    </Card>
                );
            })}
            {groups.length > shown && (
                <Button onClick={() => setShown(s => s + message.pageSize)}>Show {Math.min(message.pageSize, groups.length - shown)} more</Button>
            )}
            {isNewScholarshipList(message) && Object.values(decisions).some(d => d.state === 'approved') && (
                <Button tone="primary" onClick={() => handle('Run the scout publisher')}>Publish approved scholarships now</Button>
            )}
        </div>
    );
}

const isNewScholarshipList = (m: Extract<Message, { type: 'proposals' }>) => m.query.category === 'new_scholarship';

function DecisionLine({ decision, onUndo, onForce }: { decision?: Decision; onUndo: () => void; onForce?: () => void }) {
    if (!decision) return null;
    if (decision.state === 'approved') {
        return <p className="mt-1 flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />Approved
            <button onClick={onUndo} className="inline-flex items-center gap-1 text-gray-400 hover:text-white"><RotateCcw className="h-3 w-3" />Undo</button></p>;
    }
    if (decision.state === 'rejected') return <p className="mt-1 flex items-center gap-1.5 text-gray-400"><XCircle className="h-3.5 w-3.5" />Rejected. It won't be proposed again.</p>;
    if (decision.state === 'undone') return <p className="mt-1 text-gray-400">{decision.note}</p>;
    return (
        <p className="mt-1 text-amber-300">
            {decision.note}
            {onForce && /changed to/.test(decision.note || '') && <button onClick={onForce} className="ml-2 underline">Apply anyway</button>}
        </p>
    );
}

// ---------- Live run card: asks GitHub for the run's steps every few seconds ----------

interface RunStatus {
    found: boolean;
    url?: string;
    status?: string;
    conclusion?: string | null;
    steps: { name: string; status: string; conclusion: string | null; seconds: number | null }[];
}

function RunCard({ message }: { message: Extract<Message, { type: 'run' }> }) {
    const [run, setRun] = useState<RunStatus>({ found: false, steps: [] });
    const [error, setError] = useState('');
    const env = useStore(s => s.status?.environment);

    useEffect(() => {
        let stopped = false;
        let timer: ReturnType<typeof setTimeout>;
        let attempts = 0;
        const tick = async () => {
            attempts++;
            try {
                const r = await api<RunStatus>(`run?agent=${message.agent}&requestId=${message.requestId}`);
                if (stopped) return;
                setRun(r);
                if (r.status === 'completed') {
                    // A run re-attached after a reload that had already finished: just show its steps
                    if (message.resumed && attempts === 1) return;
                    refreshActivity();
                    refreshSummary();
                    post({
                        type: 'text',
                        tone: r.conclusion === 'success' ? 'good' : 'bad',
                        text: r.conclusion === 'success'
                            ? `${message.label} finished. Anything it found that needs you is in your inbox. Ask "what's waiting on me?".`
                            : `${message.label} ended with "${r.conclusion}". Open the run on GitHub to see which step failed.`,
                    });
                    return;
                }
            } catch (e: any) {
                setError(e.message);
            }
            // Fast while starting, then every 10 seconds; give up after ~2 hours
            if (!stopped && attempts < 800) timer = setTimeout(tick, attempts < 12 ? 5000 : 10000);
        };
        tick();
        return () => { stopped = true; clearTimeout(timer); };
    }, [message.agent, message.requestId, message.label, message.resumed]);

    const done = run.status === 'completed';
    return (
        <Card accent={done ? (run.conclusion === 'success' ? 'good' : 'bad') : undefined}>
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-bold text-white">{message.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${message.target === 'staging' ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-500/15 text-blue-300'}`}>{message.target}</span>
            </div>
            {!run.found && !error && <p className="flex items-center gap-2 text-gray-400"><Loader2 className="h-4 w-4 animate-spin" />Waiting for GitHub to start the run…</p>}
            {error && <p className="text-rose-300">{error}</p>}
            {run.steps.length > 0 && (
                <ul className="space-y-1">
                    {run.steps.map(step => (
                        <li key={step.name} className="flex items-center justify-between gap-2 text-xs">
                            <span className="flex items-center gap-2 text-gray-300">
                                {step.status === 'completed'
                                    ? step.conclusion === 'success' ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        : step.conclusion === 'skipped' ? <Circle className="h-3.5 w-3.5 text-gray-600" />
                                        : <X className="h-3.5 w-3.5 text-rose-400" />
                                    : step.status === 'in_progress' ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                                    : <Circle className="h-3.5 w-3.5 text-gray-600" />}
                                <span className={step.conclusion === 'skipped' ? 'text-gray-600' : ''}>{step.name}</span>
                            </span>
                            {step.seconds !== null && step.conclusion !== 'skipped' && <span className="text-gray-600">{formatSeconds(step.seconds)}</span>}
                        </li>
                    ))}
                </ul>
            )}
            {run.url && <a href={run.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300 hover:underline">Open on GitHub <ExternalLink className="h-3 w-3" /></a>}
            {env === 'local' && <p className="mt-2 text-[11px] text-gray-600">Started from a local session: runs use the staging database.</p>}
        </Card>
    );
}

const formatSeconds = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

export { short };
