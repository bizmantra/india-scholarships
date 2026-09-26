'use client';

import React, { useState } from 'react';
import { handle, CATEGORY_LABELS } from './orchestrator';
import { useStore } from './store';

const kindColor = { ok: 'text-emerald-400', warn: 'text-amber-400', error: 'text-rose-400', tool: 'text-blue-300', info: 'text-gray-400' } as const;

export default function SidePanel() {
    const [tab, setTab] = useState<'activity' | 'summary'>('activity');
    const logEntries = useStore(s => s.log);
    const summary = useStore(s => s.summary);
    const status = useStore(s => s.status);

    return (
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-800 bg-[#0d1324]">
            <div className="flex border-b border-gray-800 text-xs font-bold">
                {(['activity', 'summary'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 px-4 py-3 uppercase tracking-wider ${tab === t ? 'border-b-2 border-blue-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        {t}
                    </button>
                ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {tab === 'activity' ? (
                    logEntries.length === 0
                        ? <p className="text-xs text-gray-500">Agent runs, approvals and rejections appear here.</p>
                        : (
                            <ul className="space-y-2.5">
                                {logEntries.map((e, i) => (
                                    <li key={i} className="border-b border-gray-800/60 pb-2 text-xs">
                                        <p className="mb-0.5 text-[10px] uppercase tracking-wider text-gray-600">{e.time} · {e.agent} · {e.system}</p>
                                        <p className={kindColor[e.kind]}>{e.text}</p>
                                    </li>
                                ))}
                            </ul>
                        )
                ) : (
                    <div className="space-y-4 text-xs">
                        <div>
                            <p className="mb-1 font-bold uppercase tracking-wider text-gray-500">Waiting on you</p>
                            <p className="text-3xl font-black text-white">{summary ? summary.total.toLocaleString('en-IN') : '—'}</p>
                        </div>
                        {summary && (
                            <div className="divide-y divide-gray-800/70">
                                {Object.entries(summary.groups).map(([category, n]) => (
                                    <div key={category} className="flex justify-between py-1.5">
                                        <span className="text-gray-400">{CATEGORY_LABELS[category] || category}</span>
                                        <span className="font-bold text-gray-200">{n.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-1.5">
                                    <span className="text-rose-300">Risky</span>
                                    <span className="font-bold text-rose-300">{summary.risky}</span>
                                </div>
                            </div>
                        )}
                        <button onClick={() => handle("What's waiting on me?")} className="w-full rounded-lg border border-gray-700 px-3 py-2 font-bold text-gray-200 hover:border-gray-500">
                            Review in chat
                        </button>
                        {status && (
                            <div className="space-y-1 border-t border-gray-800 pt-3 text-gray-500">
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
