'use client';

import { useSyncExternalStore } from 'react';

// ---------- Message types shown in the chat ----------
export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

export interface GateOption {
    label: string;
    tone: 'primary' | 'danger' | 'neutral';
    run: () => void | Promise<void>;
}

export type Message =
    | { id: string; type: 'user'; text: string }
    | { id: string; type: 'text'; text: string; tone?: Tone }
    | { id: string; type: 'plan'; title: string; steps: string[] }
    | { id: string; type: 'gate'; title: string; body?: string; bullets?: string[]; options: GateOption[]; resolved?: string }
    | { id: string; type: 'summary'; title: string; lines: { label: string; value: string; tone?: Tone; action?: string }[] }
    | { id: string; type: 'proposals'; title: string; query: { category?: string; risk?: string }; pageSize: number }
    | { id: string; type: 'run'; agent: string; label: string; requestId: string; target: string; resumed?: boolean };

export interface LogEntry {
    time: string;
    agent: string;
    system: string;
    kind: 'tool' | 'info' | 'ok' | 'warn' | 'error';
    text: string;
}

export interface InboxSummary {
    total: number;
    groups: Record<string, number>;
    risky: number;
    riskyAmounts: number;
    approvedUnpublished: number;
}

export interface Status {
    environment: 'production' | 'staging' | 'local';
    runTarget: 'production' | 'staging';
    actor: string;
    inboxReady: boolean;
    githubConfigured: boolean;
    agents: { id: string; label: string; workflow?: string; acceptsState?: boolean; schedule: string; summary: string; humanToday: string; gated: boolean }[];
}

interface State {
    messages: Message[];
    log: LogEntry[];
    summary: InboxSummary | null;
    status: Status | null;
    busy: boolean;
    view: 'chat' | 'list';
    // Bumped after any decision so open cards and lists reload
    revision: number;
}

// ---------- A tiny external store ----------
let state: State = { messages: [], log: [], summary: null, status: null, busy: false, view: 'chat', revision: 0 };
const listeners = new Set<() => void>();

export const store = {
    get: () => state,
    set(patch: Partial<State> | ((s: State) => Partial<State>)) {
        state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
        listeners.forEach(l => l());
    },
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
};

export function useStore<T>(select: (s: State) => T): T {
    return useSyncExternalStore(store.subscribe, () => select(state), () => select(state));
}

let counter = 0;
export const newId = () => `m${Date.now().toString(36)}${counter++}`;

// Message is a union, so spread per variant through this helper
type NewMessage = Message extends infer M ? (M extends Message ? Omit<M, 'id'> : never) : never;
export function post(message: NewMessage) {
    const withId = { ...message, id: newId() } as Message;
    store.set(s => ({ messages: [...s.messages, withId] }));
    return withId.id;
}

export function updateMessage(id: string, patch: Record<string, unknown>) {
    store.set(s => ({ messages: s.messages.map(m => (m.id === id ? ({ ...m, ...patch } as Message) : m)) }));
}

export function log(entry: Omit<LogEntry, 'time'>) {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    store.set(s => ({ log: [{ ...entry, time }, ...s.log].slice(0, 200) }));
}
