'use client';

import React, { useState } from 'react';
import { handle, CATEGORY_LABELS } from './orchestrator';
import { useStore } from './store';

const kindColor = { ok: 'text-cc-good', warn: 'text-cc-warn', error: 'text-cc-bad', tool: 'text-cc-link', info: 'text-cc-muted' } as const;

export default function SidePanel() {
    const [tab, setTab] = useState<'activity' | 'summary'>('activity');
    const logEntries = useStore(s => s.log);
    const summary = useStore(s => s.summary);
    const status = useStore(s => s.status);

    return (
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-cc-border bg-cc-panel">
            <div className="flex border-b border-cc-border text-xs font-bold">
                {(['activity', 'summary'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 px-4 py-3 uppercase tracking-wider ${tab === t ? 'border-b-2 border-blue-500 text-cc-text' : 'text-cc-muted hover:text-cc-text'}`}>
                        {t}
                    </button>
                ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {tab === 'activity' ? (
                    logEntries.length === 0
                        ? <p className="text-xs text-cc-muted">Agent runs, approvals and rejections appear here.</p>
                        : (
                            <ul className="space-y-2.5">
                                {logEntries.map((e, i) => (
                                    <li key={i} className="border-b border-cc-border pb-2 text-xs">
                                        <p className="mb-0.5 text-[10px] uppercase tracking-wider text-cc-faint">{e.time} · {e.agent} · {e.system}</p>
                                        <p className={kindColor[e.kind]}>{e.text}</p>
                                    </li>
                                ))}
                            </ul>
                        )
                ) : (
                    <div className="space-y-4 text-xs">
                        <div>
                            <p className="mb-1 font-bold uppercase tracking-wider text-cc-muted">Waiting on you</p>
                            <p className="text-3xl font-black text-cc-text">{summary ? summary.total.toLocaleString('en-IN') : '—'}</p>
                        </div>
                        {summary && (
                            <div className="divide-y divide-cc-border">
                                {Object.entries(summary.groups).map(([category, n]) => (
                                    <div key={category} className="flex justify-between py-1.5">
                                        <span className="text-cc-muted">{CATEGORY_LABELS[category] || category}</span>
                                        <span className="font-bold text-cc-text">{n.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-1.5">
                                    <span className="text-cc-bad">Risky</span>
                                    <span className="font-bold text-cc-bad">{summary.risky}</span>
                                </div>
                            </div>
                        )}
                        <button onClick={() => handle("What's waiting on me?")} className="w-full rounded-lg border border-cc-border-strong px-3 py-2 font-bold text-cc-text hover:border-cc-border-strong">
                            Review in chat
                        </button>
                        {status && (
                            <div className="space-y-1 border-t border-cc-border pt-3 text-cc-muted">
                                <p>Signed in as {status.actor}</p>
                                <p>Database: {status.environment === 'production' ? 'production' : 'staging / local copy'}</p>
                                <p>Agent runs go to: {status.runTarget}</p>
                                <p>Starting agents: {status.githubConfigured ? 'ready' : 'GitHub token missing'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
