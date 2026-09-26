'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Inbox, Loader2, MessageSquare } from 'lucide-react';
import { MessageView } from './Cards';
import ListView from './ListView';
import SidePanel from './SidePanel';
import { SUGGESTIONS } from './intents';
import { api, handle, refreshActivity, refreshSummary, resumeRecentRuns } from './orchestrator';
import { post, store, useStore, type Status } from './store';

export default function CommandCenterPage() {
    const messages = useStore(s => s.messages);
    const busy = useStore(s => s.busy);
    const view = useStore(s => s.view);
    const status = useStore(s => s.status);
    const summary = useStore(s => s.summary);
    const [input, setInput] = useState('');
    const bottom = useRef<HTMLDivElement>(null);

    // First load: where we are, what's set up, what's waiting
    useEffect(() => {
        if (store.get().status) return; // the store survives page switches within /admin
        api<Status>('status')
            .then(s => {
                store.set({ status: s });
                if (!s.inboxReady) {
                    post({ type: 'text', tone: 'warn', text: 'The agent inbox is not set up on this database yet. The next Deadline Freshness run creates it (daily at 7 AM IST), or say "run the freshness check".' });
                    return;
                }
                handle("What's waiting on me?").then(() => resumeRecentRuns()).catch(() => undefined);
                refreshActivity();
            })
            .catch(e => post({ type: 'text', tone: 'bad', text: `Could not load the command center: ${e.message}` }));
    }, []);

    // Keep the activity feed and counts fresh while the page is open
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState !== 'visible' || !store.get().status?.inboxReady) return;
            refreshActivity();
            refreshSummary();
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

    const send = (text: string) => {
        if (busy || !text.trim()) return;
        setInput('');
        handle(text);
    };

    return (
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-8rem)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-white">Command Center</h1>
                    <p className="text-xs text-gray-500">Ask what's waiting, approve changes and run agents.</p>
                </div>
                <div className="flex items-center gap-2">
                    {status && (
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${status.environment === 'production'
                            ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                            : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                            {status.environment === 'production' ? 'Live site' : status.environment === 'staging' ? 'Staging' : 'Local copy'}
                        </span>
                    )}
                    <div className="flex rounded-lg border border-gray-800 p-0.5 text-xs font-bold">
                        <button onClick={() => store.set({ view: 'chat' })} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${view === 'chat' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>
                            <MessageSquare className="h-3.5 w-3.5" />Chat
                        </button>
                        <button onClick={() => store.set({ view: 'list' })} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${view === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>
                            <Inbox className="h-3.5 w-3.5" />Inbox
                            {summary && summary.total > 0 && (
                                <span className="rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-300">{summary.total.toLocaleString('en-IN')}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                {view === 'list' ? <ListView /> : (
                    <section className="flex min-h-[70vh] min-w-0 flex-col rounded-2xl border border-gray-800 bg-[#0b0f19] lg:min-h-0">
                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                            {messages.map(m => <MessageView key={m.id} message={m} />)}
                            {busy && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                            <div ref={bottom} />
                        </div>
                        <div className="border-t border-gray-800 p-3">
                            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => send(s)} disabled={busy}
                                        className="shrink-0 rounded-full border border-gray-800 px-3 py-1 text-[11px] text-gray-400 hover:border-gray-600 hover:text-white disabled:opacity-40">
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="What's waiting on me?"
                                    className="min-w-0 flex-1 rounded-xl border border-gray-800 bg-[#0d1324] px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-600 focus:outline-none"
                                />
                                <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
                                    className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-500 disabled:opacity-40">
                                    <ArrowUp className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </section>
                )}
                <aside className="h-[420px] lg:h-auto lg:min-h-0">
                    <SidePanel />
                </aside>
            </div>
        </div>
    );
}
