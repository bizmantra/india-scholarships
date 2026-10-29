'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Plus } from 'lucide-react';
import {
    BACKLOG_ASSIGNEES, BACKLOG_IMPACTS, buildSections, categoryLabel, daysUntil, isOpen, plainDescription, staleDays, TEAMS, TEAM_IDS,
    type BacklogAssignee, type BacklogChange, type BacklogImpact, type BacklogItem,
} from '@/lib/command-center/backlog-types';
import { api } from '../agents/orchestrator';

const IMPACT_STYLE: Record<BacklogImpact, string> = {
    Critical: 'bg-rose-500/10 border-rose-500/30 text-cc-bad',
    High: 'bg-amber-500/10 border-amber-500/30 text-cc-warn',
    Medium: 'bg-blue-500/10 border-blue-500/25 text-cc-link',
    Low: 'bg-cc-raised border-cc-border text-cc-muted',
};

const Pill = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>
);

function dueLabel(due: string | null) {
    const left = daysUntil(due);
    if (left === null) return null;
    if (left < 0) return { text: `Overdue ${-left} d`, className: 'bg-rose-500/10 border-rose-500/30 text-cc-bad' };
    if (left === 0) return { text: 'Due today', className: 'bg-rose-500/10 border-rose-500/30 text-cc-bad' };
    return { text: `Due in ${left} d`, className: left <= 7 ? 'bg-amber-500/10 border-amber-500/30 text-cc-warn' : 'bg-cc-raised border-cc-border text-cc-muted' };
}

type OnChange = (id: string, change: BacklogChange) => Promise<void>;

// `open` lives in the page, so a card stays open when saving moves it to another section
function Card({ item, onChange, open, onToggle }: { item: BacklogItem; onChange: OnChange; open: boolean; onToggle: () => void }) {
    const [note, setNote] = useState(item.note || '');
    const [busy, setBusy] = useState(false);
    useEffect(() => setNote(item.note || ''), [item.note]);
    const [link, setLink] = useState(item.link || '');
    useEffect(() => setLink(item.link || ''), [item.link]);

    const due = dueLabel(item.due_date);
    const stale = staleDays(item);
    const why = plainDescription(item.description);
    const act = async (change: BacklogChange) => { setBusy(true); try { await onChange(item.id, change); } finally { setBusy(false); } };
    const button = 'rounded-lg border border-cc-border bg-cc-raised px-3 py-1.5 text-xs font-bold text-cc-text-2 hover:border-cc-border-strong disabled:opacity-50';

    return (
        <div className="rounded-xl border border-cc-border bg-cc-panel">
            <button onClick={onToggle} className="flex w-full items-start gap-2 p-3 text-left">
                {open ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-cc-faint" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cc-faint" />}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-cc-faint">{item.id}</span>
                        <Pill className={IMPACT_STYLE[item.impact]}>{item.impact}</Pill>
                        {item.status === 'In Progress' && <Pill className="bg-emerald-500/10 border-emerald-500/25 text-cc-good">In progress</Pill>}
                        {item.status === 'Ready' && <Pill className="bg-blue-500/10 border-blue-500/25 text-cc-link">Ready</Pill>}
                        {item.status === 'Review' && <Pill className="bg-amber-500/10 border-amber-500/30 text-cc-warn">In review</Pill>}
                        {item.assignee && <Pill className="bg-cc-raised border-cc-border text-cc-text-2">{item.assignee}</Pill>}
                        {item.waiting && <Pill className="bg-amber-500/10 border-amber-500/30 text-cc-warn">Waiting on you</Pill>}
                        {due && <Pill className={due.className}>{due.text}</Pill>}
                        {stale !== null && <Pill className="bg-cc-raised border-cc-border text-cc-muted">Not touched for {stale} d</Pill>}
                    </div>
                    <div className="mt-1 text-sm font-bold text-cc-text">{item.title}</div>
                    {!open && why && <div className="mt-0.5 line-clamp-2 text-xs text-cc-muted">{why}</div>}
                    {item.note && <div className="mt-1 text-xs text-cc-text-2"><span className="font-bold">Where we left off:</span> {item.note}</div>}
                    {item.link && <div className="mt-1 truncate text-xs text-cc-link">{item.link}</div>}
                </div>
            </button>
            {open && (
                <div className="space-y-3 border-t border-cc-border p-3">
                    {why && <p className="whitespace-pre-line text-xs text-cc-text-2">{why}</p>}
                    <div className="flex gap-2">
                        <input
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Where we left off (one line)"
                            maxLength={500}
                            className="min-w-0 flex-1 rounded-lg border border-cc-border bg-cc-bg px-3 py-1.5 text-xs text-cc-text"
                        />
                        <button disabled={busy || note === (item.note || '')} onClick={() => act({ note })} className={button}>Save note</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(item.status === 'Backlog' || item.status === 'Parked') && <button disabled={busy} onClick={() => act({ status: 'Ready' })} className={button}>Make ready</button>}
                        {item.status !== 'In Progress' && item.status !== 'Review' && <button disabled={busy} onClick={() => act({ status: 'In Progress' })} className={button}>Start</button>}
                        {item.status === 'Review' && <button disabled={busy} onClick={() => act({ status: 'In Progress' })} className={button}>Send back</button>}
                        {(item.status === 'In Progress' || item.status === 'Ready') && <button disabled={busy} onClick={() => act({ status: 'Review' })} className={button}>Move to review</button>}
                        {item.status !== 'Backlog' && item.status !== 'Done' && <button disabled={busy} onClick={() => act({ status: 'Backlog' })} className={button}>Back to later</button>}
                        {item.status !== 'Done' && <button disabled={busy} onClick={() => act({ status: 'Done', waiting: false })} className={button}>{item.status === 'Review' ? 'Approve and mark done' : 'Mark done'}</button>}
                        {item.status !== 'Parked' && <button disabled={busy} onClick={() => act({ status: 'Parked', waiting: false })} className={button}>Park</button>}
                        {item.status === 'Parked' && <button disabled={busy} onClick={() => act({ status: 'Backlog' })} className={button}>Bring back</button>}
                        {isOpen(item.status) && item.status !== 'Review' && (
                            <button disabled={busy} onClick={() => act({ waiting: !item.waiting })} className={button}>
                                {item.waiting ? 'Not waiting on me' : 'Waiting on me'}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-cc-muted">
                        <label className="flex items-center gap-1.5">Due
                            <input
                                type="date"
                                defaultValue={item.due_date || ''}
                                onChange={e => act({ due_date: e.target.value || null })}
                                className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1 text-xs text-cc-text"
                            />
                        </label>
                        <label className="flex items-center gap-1.5">Importance
                            <select
                                value={item.impact}
                                onChange={e => act({ impact: e.target.value as BacklogImpact })}
                                className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1 text-xs text-cc-text"
                            >
                                {BACKLOG_IMPACTS.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </label>
                        <label className="flex items-center gap-1.5">Assigned to
                            <select
                                value={item.assignee || ''}
                                onChange={e => act({ assignee: (e.target.value || null) as BacklogAssignee | null })}
                                className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1 text-xs text-cc-text"
                            >
                                <option value="">Nobody</option>
                                {BACKLOG_ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                            </select>
                        </label>
                        <label className="flex items-center gap-1.5">Team
                            <select
                                value={item.category}
                                onChange={e => act({ category: e.target.value })}
                                className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1 text-xs text-cc-text"
                            >
                                {!TEAM_IDS.includes(item.category) && <option value={item.category}>{categoryLabel(item.category)}</option>}
                                {TEAMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            placeholder="Link: pull request address or plan file (plans/...)"
                            maxLength={300}
                            className="min-w-0 flex-1 rounded-lg border border-cc-border bg-cc-bg px-3 py-1.5 text-xs text-cc-text"
                        />
                        <button disabled={busy || link === (item.link || '')} onClick={() => act({ link })} className={button}>Save link</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, hint, items, onChange, collapsed, openId, onToggle }: {
    title: string; hint?: string; items: BacklogItem[]; onChange: OnChange; collapsed?: boolean; openId: string | null; onToggle: (id: string) => void;
}) {
    const [shown, setShown] = useState(!collapsed);
    if (items.length === 0) return null;
    return (
        <section>
            <button onClick={() => setShown(s => !s)} className="mb-2 flex items-baseline gap-2 text-left">
                <h2 className="text-sm font-bold text-cc-text">{title} <span className="text-cc-faint">({items.length})</span></h2>
                {hint && <span className="text-xs text-cc-muted">{hint}</span>}
            </button>
            {shown && <div className="space-y-2">{items.map(i => <Card key={i.id} item={i} onChange={onChange} open={openId === i.id} onToggle={() => onToggle(i.id)} />)}</div>}
        </section>
    );
}

// What to pick up next, for every team (a tab appears for any team or older category that has open items)
export default function BacklogPage() {
    const [items, setItems] = useState<BacklogItem[]>([]);
    const [tab, setTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const toggle = (id: string) => setOpenId(cur => (cur === id ? null : id));
    const [draft, setDraft] = useState({ title: '', description: '', impact: 'Medium' as BacklogImpact, due_date: '', category: 'dev' });

    const load = useCallback(async () => {
        try {
            setItems((await api<{ items: BacklogItem[] }>('backlog')).items);
            setError('');
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const change = useCallback(async (id: string, patch: BacklogChange) => {
        try {
            await api('backlog', { method: 'PATCH', body: JSON.stringify({ id, ...patch }) });
            setError('');
        } catch (e) {
            setError((e as Error).message);
        }
        await load();
    }, [load]);

    const tabs = useMemo(() => {
        const ids = [...new Set(items.map(i => i.category))]
            .filter(c => items.some(i => i.category === c && i.status !== 'Done'));
        // Teams in their fixed order, then any older category (content, study-abroad, ...) by name
        const rank = (c: string) => { const i = TEAM_IDS.indexOf(c); return i === -1 ? TEAM_IDS.length : i; };
        return ids.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    }, [items]);

    const visible = tab === 'all' ? items : items.filter(i => i.category === tab);
    const sections = useMemo(() => buildSections(visible), [visible]);
    const openCount = (c: string) => items.filter(i => (c === 'all' || i.category === c) && isOpen(i.status)).length;

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api('backlog', { method: 'POST', body: JSON.stringify({ ...draft, category: tab === 'all' ? draft.category : tab, due_date: draft.due_date || null }) });
            setDraft(d => ({ ...d, title: '', description: '', due_date: '' }));
            setAdding(false);
            setError('');
            await load();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-cc-text">Backlog</h1>
                    <p className="text-sm text-cc-muted">What to pick up next. Start at the top. Anything due within a week comes first, then Critical, High, Medium and Low, with work already started ahead of work not started.</p>
                </div>
                <button onClick={() => setAdding(a => !a)} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                    <Plus className="h-4 w-4" /> Add
                </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {['all', ...tabs].map(c => (
                    <button
                        key={c}
                        onClick={() => setTab(c)}
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${tab === c ? 'border-blue-600 bg-blue-600 text-white' : 'border-cc-border bg-cc-panel text-cc-text-2 hover:border-cc-border-strong'}`}
                    >
                        {c === 'all' ? 'All' : categoryLabel(c)} <span className="opacity-70">{openCount(c)}</span>
                    </button>
                ))}
            </div>

            {adding && (
                <form onSubmit={add} className="space-y-2 rounded-xl border border-cc-border bg-cc-panel p-3">
                    <input required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="What needs doing?" className="w-full rounded-lg border border-cc-border bg-cc-bg px-3 py-2 text-sm text-cc-text" />
                    <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Why it matters (optional)" rows={2} className="w-full rounded-lg border border-cc-border bg-cc-bg px-3 py-2 text-xs text-cc-text" />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-cc-muted">
                        {tab === 'all' && (
                            <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1.5 text-xs text-cc-text">
                                {TEAMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        )}
                        <select value={draft.impact} onChange={e => setDraft({ ...draft, impact: e.target.value as BacklogImpact })} className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1.5 text-xs text-cc-text">
                            {BACKLOG_IMPACTS.map(i => <option key={i}>{i}</option>)}
                        </select>
                        <label className="flex items-center gap-1.5">Due
                            <input type="date" value={draft.due_date} onChange={e => setDraft({ ...draft, due_date: e.target.value })} className="rounded-lg border border-cc-border bg-cc-bg px-2 py-1 text-xs text-cc-text" />
                        </label>
                        <button type="submit" className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">Add to backlog</button>
                    </div>
                </form>
            )}

            {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-cc-bad">{error}</p>}

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-cc-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading the backlog…</div>
            ) : (
                <>
                    <Section title="Waiting on you" hint="Needs a decision or an action from you" items={sections.waiting} onChange={change} openId={openId} onToggle={toggle} />
                    <Section title="Do next" hint="The top five" items={sections.doNext} onChange={change} openId={openId} onToggle={toggle} />
                    <Section title="In progress" items={sections.inProgress} onChange={change} openId={openId} onToggle={toggle} />
                    <Section title="Later" items={sections.later} onChange={change} collapsed openId={openId} onToggle={toggle} />
                    <Section title="Parked" hint="On hold on purpose" items={sections.parked} onChange={change} collapsed openId={openId} onToggle={toggle} />
                    <p className="text-xs text-cc-faint">{sections.doneCount.toLocaleString('en-IN')} items done and hidden.</p>
                </>
            )}
        </div>
    );
}
