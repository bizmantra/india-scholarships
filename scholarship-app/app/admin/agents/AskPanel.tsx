'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, X } from 'lucide-react';
import { MessageView } from './Cards';
import { SUGGESTIONS } from './intents';
import { handle } from './orchestrator';
import { store, useStore } from './store';

// The chat, in a panel that slides in from the right. The messages live in the store, so closing keeps the conversation.
export default function AskPanel() {
    const open = useStore(s => s.askOpen);
    const messages = useStore(s => s.messages);
    const busy = useStore(s => s.busy);
    const [input, setInput] = useState('');
    const bottom = useRef<HTMLDivElement>(null);

    useEffect(() => { if (open) bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [open, messages.length]);

    const send = (text: string) => {
        if (busy || !text.trim()) return;
        setInput('');
        handle(text);
    };

    if (!open) return null;
    return (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-cc-border bg-cc-bg shadow-2xl sm:w-[28rem]" aria-label="Ask">
            <div className="flex items-center justify-between border-b border-cc-border px-4 py-3">
                <h2 className="text-sm font-black text-cc-text">Ask</h2>
                <button onClick={() => store.set({ askOpen: false })} aria-label="Close" className="rounded-lg p-1.5 text-cc-muted hover:bg-cc-raised hover:text-cc-text">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map(m => <MessageView key={m.id} message={m} />)}
                {busy && <Loader2 className="h-4 w-4 animate-spin text-cc-muted" />}
                <div ref={bottom} />
            </div>
            <div className="border-t border-cc-border p-3">
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                    {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => send(s)} disabled={busy}
                            className="shrink-0 rounded-full border border-cc-border px-3 py-1 text-[11px] text-cc-muted hover:border-cc-border-strong hover:text-cc-text disabled:opacity-40">
                            {s}
                        </button>
                    ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="What's waiting on me?"
                        className="min-w-0 flex-1 rounded-xl border border-cc-border bg-cc-panel px-4 py-2.5 text-sm text-cc-text placeholder:text-cc-faint focus:border-blue-600 focus:outline-none"
                    />
                    <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
                        className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-500 disabled:opacity-40">
                        <ArrowUp className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </aside>
    );
}
