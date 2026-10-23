'use client';

import React, { useEffect, useState } from 'react';
import { AGENTS, agentsOfTeam } from '@/lib/command-center/agents';
import { TEAMS } from '@/lib/command-center/teams';
import InboxQueue from './InboxQueue';
import NeedsYou from './NeedsYou';
import { refreshSummary } from './orchestrator';
import { store, useStore } from './store';

// The Inbox: the short "Needs you" list, or everything waiting as a table (shared with the team pages)
export default function ListView() {
    // "Needs you" is the short list that matters; "Everything" is the full table. A team page opens straight into the table.
    const [mode, setMode] = useState<'needs' | 'all'>(store.get().team ? 'all' : 'needs');
    const summary = useStore(s => s.summary);
    const team = useStore(s => s.team);

    useEffect(() => { if (!store.get().summary) refreshSummary(); }, []);

    const teamCount = (ids: string[]) => ids.reduce((n, id) => n + (summary?.byAgent?.[id] ?? 0), 0);
    const otherCount = summary?.byAgent
        ? Object.entries(summary.byAgent).filter(([id]) => !AGENTS.some(a => a.id === id && a.team)).reduce((n, [, c]) => n + c, 0)
        : 0;
    const pickTeam = (id: string | null) => store.set({ team: id });

    const modeToggle = (
        <div className="flex gap-1 text-xs">
            {([['needs', 'Needs you'], ['all', `Everything${summary ? ` (${summary.total.toLocaleString('en-IN')})` : ''}`]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setMode(id)}
                    className={`rounded-full px-3 py-1 font-bold ${mode === id ? 'bg-blue-600 text-white' : 'border border-cc-border-strong text-cc-muted hover:text-cc-text'}`}>{label}</button>
            ))}
        </div>
    );

    if (mode === 'needs') {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3">
                {modeToggle}
                <NeedsYou onShowAll={() => setMode('all')} />
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            {modeToggle}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cc-faint">Team</span>
                {[
                    { id: null as string | null, label: 'All teams', n: summary?.total },
                    ...TEAMS.map(t => ({ id: t.id as string | null, label: t.label, n: summary?.byAgent ? teamCount(agentsOfTeam(t.id).map(a => a.id)) : undefined })),
                    // Items from agents that belong to no team; only shown when there are some
                    ...(otherCount > 0 ? [{ id: 'other' as string | null, label: 'Other', n: otherCount }] : []),
                ].map(t => (
                    <button key={t.id ?? 'all'} onClick={() => pickTeam(t.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${team === t.id ? 'bg-cc-text text-cc-bg' : 'border border-cc-border-strong text-cc-muted hover:text-cc-text'}`}>
                        {t.label}
                        {t.n !== undefined && <span className="ml-1.5 opacity-70">{t.n.toLocaleString('en-IN')}</span>}
                    </button>
                ))}
            </div>
            <InboxQueue key={team ?? 'all'} team={team} />
        </div>
    );
}
