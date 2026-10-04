'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink, Loader2 } from 'lucide-react';
import { agentsOfTeam } from '@/lib/command-center/agents';
import { teamById } from '@/lib/command-center/teams';
import { api } from '../../agents/orchestrator';
import type { InboxSummary } from '../../agents/store';

interface EventRow {
    id: number;
    agent: string;
    kind: string;
    summary: string;
    run_url: string | null;
    created_at: string; // UTC, "YYYY-MM-DD HH:MM:SS"
}

const timeAgo = (utc: string) => {
    const then = new Date(utc.replace(' ', 'T') + 'Z').getTime();
    const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
    return `${Math.round(mins / 60 / 24)} d ago`;
};

// One page per team: its agents, what is waiting for the owner, and what happened lately
export default function TeamPage() {
    const { team: teamId } = useParams<{ team: string }>();
    const team = teamById(teamId);
    const agents = team ? agentsOfTeam(team.id) : [];
    const [summary, setSummary] = useState<InboxSummary | null>(null);
    const [events, setEvents] = useState<EventRow[]>([]);
    const [ready, setReady] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!team) return;
        let alive = true;
        const load = async () => {
            try {
                const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 19).replace('T', ' ');
                const [s, a] = await Promise.all([
                    api<InboxSummary>('inbox?view=summary'),
                    api<{ events: EventRow[] }>(`activity?team=${team.id}&since=${encodeURIComponent(since)}&limit=200`),
                ]);
                if (!alive) return;
                setSummary(s);
                setEvents(a.events);
                setError('');
            } catch (e) {
                if (!alive) return;
                const err = e as Error & { status?: number };
                // The inbox tables are created by the first agent run on a database
                if (err.status === 409) setReady(false);
                else setError(err.message);
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30000);
        return () => { alive = false; clearInterval(timer); };
    }, [team]);

    if (!team) {
        return (
            <div className="space-y-2">
                <h1 className="text-xl font-black text-cc-text">Team not found</h1>
                <Link href="/admin/agents" className="text-sm text-blue-600 hover:underline">Back to the Inbox</Link>
            </div>
        );
    }

    const waitingFor = (id: string) => summary?.byAgent?.[id] ?? 0;
    const waiting = agents.reduce((n, a) => n + waitingFor(a.id), 0);
    const lastEvent = (id: string) => events.find(e => e.agent === id);
    const newest = events[0];

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
            <div>
                <h1 className="text-xl font-black text-cc-text">{team.label}</h1>
                <p className="text-sm text-cc-muted">{team.goal}</p>
            </div>

            {!ready && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-cc-warn">
                    The agent inbox is not set up on this database yet. The next agent run creates it.
                </p>
            )}
            {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-cc-bad">{error}</p>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link href={`/admin/agents?view=list&team=${team.id}`} className="rounded-xl border border-cc-border bg-cc-panel p-4 hover:border-cc-border-strong">
                    <div className="text-xs text-cc-muted">Waiting for you</div>
                    <div className="mt-1 text-2xl font-black text-cc-text">{loading ? '…' : waiting.toLocaleString('en-IN')}</div>
                    <div className="mt-1 text-[11px] text-blue-600">Open in Inbox</div>
                </Link>
                <div className="rounded-xl border border-cc-border bg-cc-panel p-4">
                    <div className="text-xs text-cc-muted">Agents</div>
                    <div className="mt-1 text-2xl font-black text-cc-text">{agents.length}</div>
                </div>
                <div className="rounded-xl border border-cc-border bg-cc-panel p-4">
                    <div className="text-xs text-cc-muted">Last activity</div>
                    <div className="mt-1 text-2xl font-black text-cc-text">{loading ? '…' : newest ? timeAgo(newest.created_at) : 'None in 30 days'}</div>
                </div>
            </div>

            <section>
                <h2 className="mb-2 text-sm font-bold text-cc-text">Agents</h2>
                {agents.length === 0 ? (
                    <p className="rounded-xl border border-cc-border bg-cc-panel p-4 text-sm text-cc-muted">{team.emptyNote || 'No agents in this team yet.'}</p>
                ) : (
                    <div className="divide-y divide-cc-border overflow-hidden rounded-xl border border-cc-border bg-cc-panel">
                        {agents.map(a => {
                            const last = lastEvent(a.id);
                            return (
                                <div key={a.id} className="space-y-1 p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-cc-text">{a.label}</span>
                                        {a.gated && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-cc-warn">Needs your approval</span>}
                                        {waitingFor(a.id) > 0 && (
                                            <span className="rounded-full bg-blue-600/15 px-2 py-0.5 text-[10px] font-bold text-blue-600">{waitingFor(a.id).toLocaleString('en-IN')} waiting</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-cc-muted">{a.summary}</p>
                                    <p className="text-[11px] text-cc-faint">
                                        {a.schedule}
                                        {last && <> · last activity {timeAgo(last.created_at)}</>}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {agents.length > 0 && (
                <section>
                    <h2 className="mb-2 text-sm font-bold text-cc-text">Recent activity</h2>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin text-cc-muted" /> : events.length === 0 ? (
                        <p className="text-sm text-cc-muted">Nothing in the last 30 days.</p>
                    ) : (
                        <ul className="divide-y divide-cc-border overflow-hidden rounded-xl border border-cc-border bg-cc-panel text-xs">
                            {events.slice(0, 15).map(e => (
                                <li key={e.id} className="flex items-start justify-between gap-3 p-3">
                                    <span className="min-w-0 text-cc-text-2">{e.summary}</span>
                                    <span className="flex shrink-0 items-center gap-2 text-cc-faint">
                                        {timeAgo(e.created_at)}
                                        {e.run_url && <a href={e.run_url} target="_blank" rel="noreferrer" aria-label="Open the run" className="hover:text-cc-text"><ExternalLink className="h-3.5 w-3.5" /></a>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
}
