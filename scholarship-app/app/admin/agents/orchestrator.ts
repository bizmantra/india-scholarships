'use client';

/**
 * The orchestrator: takes a command, explains what it will do (plan), asks before anything large
 * (gate), does the work through the command center API and ends with a summary.
 */
import { parseIntent, SUGGESTIONS } from './intents';
import { log, post, store, updateMessage, type InboxSummary } from './store';

export const CATEGORY_LABELS: Record<string, string> = {
    date_change: 'Deadline changes',
    new_scholarship: 'New scholarships',
    amount_change: 'Amount changes',
    link_change: 'Link changes',
    contact_change: 'Helpline updates',
    wording: 'Wording updates',
};

// Asking before bulk actions above this size
const GATE_THRESHOLD = 10;

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api/admin/command/${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
        cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status, data });
    return data as T;
}

export async function refreshSummary() {
    try {
        const summary = await api<InboxSummary>('inbox?view=summary');
        store.set({ summary });
        return summary;
    } catch {
        return null;
    }
}

export async function refreshActivity() {
    try {
        const { events } = await api<{ events: any[] }>('activity?limit=60');
        store.set({
            log: events.map(e => ({
                time: new Date(`${String(e.created_at).replace(' ', 'T')}Z`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                agent: e.agent,
                system: e.actor?.startsWith('agent:') ? 'GitHub Actions' : 'Command center',
                kind: /warning|failed/.test(e.kind) ? 'warn' : /error/.test(e.kind) ? 'error' : /approval|finished|published/.test(e.kind) ? 'ok' : 'info',
                text: e.summary,
            })),
        });
    } catch { /* the panel keeps what it has */ }
}

export function afterDecision() {
    store.set(s => ({ revision: s.revision + 1 }));
    refreshSummary();
    refreshActivity();
}

function notReady() {
    post({
        type: 'text',
        tone: 'warn',
        text: 'The agent inbox is not set up on this database yet. It is created by the next Deadline Freshness run (daily at 7 AM IST). ' +
            'You can start one now with "run the freshness check".',
    });
}

export async function handle(input: string) {
    const text = input.trim();
    if (!text) return;
    post({ type: 'user', text });
    store.set({ busy: true });
    try {
        await route(text);
    } catch (error: any) {
        if (error.status === 409 && error.data?.error === 'inbox_not_ready') notReady();
        else post({ type: 'text', tone: 'bad', text: `That didn't work: ${error.message}` });
        log({ agent: 'command-center', system: 'Command center', kind: 'error', text: error.message });
    } finally {
        store.set({ busy: false });
    }
}

async function route(text: string) {
    const intent = parseIntent(text);
    const status = store.get().status;
    if (status && !status.inboxReady && ['waiting', 'show', 'bulk', 'publish'].includes(intent.type)) return notReady();

    switch (intent.type) {
        case 'waiting': return whatsWaiting();
        case 'show': return post({ type: 'proposals', title: intent.title, query: { category: intent.category, risk: intent.risk }, pageSize: 5 });
        case 'bulk': return bulkDecision(intent.action, intent.category, intent.risk, intent.label);
        case 'run': return startRun(intent.agent, intent.state);
        case 'publish': return startRun('scout-publisher');
        case 'today': return whatHappenedToday();
        case 'agents': return describeAgents();
        case 'help':
        case 'unknown':
            return post({
                type: 'summary',
                title: intent.type === 'unknown' ? "I didn't catch that. Here's what I can do:" : 'What I can do',
                lines: SUGGESTIONS.map(s => ({ label: s, value: '', action: s })),
            });
    }
}

async function whatsWaiting() {
    const summary = await refreshSummary();
    if (!summary) throw new Error('Could not read the inbox');
    if (summary.total === 0) {
        post({ type: 'text', tone: 'good', text: 'Nothing is waiting on you. Agents will add items as they find them.' });
        return;
    }
    const g = summary.groups;
    post({
        type: 'summary',
        title: `${summary.total.toLocaleString('en-IN')} item(s) waiting on you`,
        lines: [
            { label: CATEGORY_LABELS.date_change, value: String(g.date_change), tone: g.date_change ? 'warn' : 'neutral', action: 'Show deadline changes' },
            { label: CATEGORY_LABELS.new_scholarship, value: String(g.new_scholarship), tone: g.new_scholarship ? 'warn' : 'neutral', action: 'Show new scholarships' },
            { label: 'Risky (past deadlines, amounts moving over 50%)', value: String(summary.risky), tone: summary.risky ? 'bad' : 'neutral', action: 'Show risky changes' },
            { label: CATEGORY_LABELS.amount_change, value: String(g.amount_change), action: 'Show amount changes' },
            { label: CATEGORY_LABELS.link_change, value: String(g.link_change), action: 'Show link changes' },
            { label: CATEGORY_LABELS.contact_change, value: String(g.contact_change), action: 'Show helpline updates' },
            { label: 'Wording only (same fact, new words)', value: String(g.wording), action: 'Approve all wording updates' },
            ...(summary.approvedUnpublished ? [{ label: 'Approved, waiting to be published', value: String(summary.approvedUnpublished), tone: 'good' as const, action: 'Run the scout publisher' }] : []),
        ],
    });
}

async function bulkDecision(action: 'approve' | 'reject', category: string, risk: string | undefined, label: string) {
    const sample = await api<{ items: any[]; total: number }>(`inbox?category=${category}${risk ? `&risk=${risk}` : ''}&limit=5`);
    if (sample.total === 0) {
        post({ type: 'text', text: `There are no pending ${label}.` });
        return;
    }
    const run = async (messageId: string) => {
        updateMessage(messageId, { resolved: `${action === 'approve' ? 'Approving' : 'Rejecting'} ${sample.total}…` });
        const result = await api<{ done: number[]; skipped: any[]; refreshed: string[] }>('decide', {
            method: 'POST',
            body: JSON.stringify({ action, group: { category, risk } }),
        });
        updateMessage(messageId, { resolved: `${action === 'approve' ? 'Approved' : 'Rejected'} ${result.done.length}` });
        post({
            type: 'summary',
            title: `${action === 'approve' ? 'Approved' : 'Rejected'} ${label}`,
            lines: [
                { label: action === 'approve' ? 'Applied to the site' : 'Rejected (will not be proposed again)', value: String(result.done.length), tone: 'good' },
                { label: 'Skipped (changed since, or wrong format)', value: String(result.skipped.length), tone: result.skipped.length ? 'warn' : 'neutral' },
                ...(action === 'approve' ? [{ label: 'Pages refreshed', value: String(result.refreshed.length) }] : []),
            ],
        });
        log({ agent: 'command-center', system: 'Turso', kind: 'ok', text: `${action === 'approve' ? 'Approved' : 'Rejected'} ${result.done.length} ${label}` });
        afterDecision();
    };

    const describe = (p: any) => p.kind === 'new_scholarship'
        ? p.scholarship_title
        : `${p.scholarship_title}: ${short(p.old_value)} → ${short(p.new_value)}`;
    if (sample.total <= GATE_THRESHOLD && action === 'reject') {
        const id = post({ type: 'text', text: `Rejecting ${sample.total} ${label}…` });
        await run(id);
        return;
    }
    const id = post({
        type: 'gate',
        title: `${action === 'approve' ? 'Approve' : 'Reject'} all ${sample.total.toLocaleString('en-IN')} ${label}?`,
        body: action === 'approve'
            ? 'Each change is written to the live site and logged, so any single one can be undone. A change is skipped if the page was edited after the agent looked.'
            : 'Rejected values are remembered, so agents will not propose them again.',
        bullets: sample.items.map(describe),
        options: [
            { label: `${action === 'approve' ? 'Approve' : 'Reject'} all ${sample.total}`, tone: action === 'approve' ? 'primary' : 'danger', run: () => run(id) },
            { label: 'Review one by one', tone: 'neutral', run: () => { updateMessage(id, { resolved: 'Reviewing one by one' }); post({ type: 'proposals', title: label, query: { category, risk }, pageSize: 5 }); } },
            { label: 'Cancel', tone: 'neutral', run: () => updateMessage(id, { resolved: 'Cancelled' }) },
        ],
    });
}

export const short = (v: any) => {
    const text = v === null || v === undefined || v === '' ? '(empty)' : String(v);
    return text.length > 48 ? `${text.slice(0, 45)}…` : text;
};

async function startRun(agentId: string, state?: string) {
    const status = store.get().status;
    const agent = status?.agents.find(a => a.id === agentId);
    const label = agent?.label || agentId;
    if (status && !status.githubConfigured) {
        post({ type: 'text', tone: 'warn', text: 'GITHUB_ACTIONS_TOKEN is not set in Vercel for this environment, so I cannot start agents from here yet.' });
        return;
    }
    if (state && !agent?.acceptsState) {
        post({ type: 'text', tone: 'warn', text: `${label} cannot focus on one state. Say "run the ${label.toLowerCase()}" without a state.` });
        return;
    }
    post({
        type: 'plan',
        title: `${label}${state ? ` for ${state}` : ''}`,
        steps: [
            `Start the "${label}" workflow on GitHub Actions against the ${status?.runTarget || 'production'} database`,
            agent?.summary || 'Run the agent',
            agent?.gated ? 'Anything that changes facts on the site comes back to your inbox for approval' : 'Save its results and refresh the site',
        ],
    });
    const { requestId, target } = await api<{ requestId: string; target: string }>('run', {
        method: 'POST',
        body: JSON.stringify({ agent: agentId, state }),
    });
    log({ agent: agentId, system: 'GitHub Actions', kind: 'tool', text: `Started ${label}${state ? ` for ${state}` : ''} (${target})` });
    post({ type: 'run', agent: agentId, label: `${label}${state ? ` · ${state}` : ''}`, requestId, target });
}

// Runs started in the last few hours (from any device) get their live card back after a reload
export async function resumeRecentRuns() {
    const since = new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
    const { events } = await api<{ events: any[] }>(`activity?since=${encodeURIComponent(since)}&limit=200`);
    const agents = store.get().status?.agents || [];
    events.filter(e => e.kind === 'run_started').reverse().forEach(e => {
        const details = JSON.parse(e.details_json || '{}');
        if (!details.requestId) return;
        const label = agents.find(a => a.id === e.agent)?.label || e.agent;
        post({ type: 'run', agent: e.agent, label: `${label}${details.state ? ` · ${details.state}` : ''}`, requestId: details.requestId, target: details.target, resumed: true });
    });
}

async function whatHappenedToday() {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const since = midnight.toISOString().slice(0, 19).replace('T', ' ');
    const { events, runs } = await api<{ events: any[]; runs: any[] }>(`activity?since=${encodeURIComponent(since)}&runs=1&limit=300`);
    // Agent runs only: scheduled or started by hand (not the checks that run on every push)
    const todayRuns = runs.filter(r => r.startedAt && new Date(r.startedAt) >= midnight && ['schedule', 'workflow_dispatch'].includes(r.event));
    const count = (kind: string) => events.filter(e => e.kind === kind).length;
    const finished = events.filter(e => /run_finished|run_warning/.test(e.kind));
    post({
        type: 'summary',
        title: 'Today so far',
        lines: [
            { label: 'Agent runs on GitHub', value: String(todayRuns.length), tone: todayRuns.some(r => r.conclusion === 'failure') ? 'warn' : 'neutral' },
            ...todayRuns.slice(0, 6).map(r => ({
                label: `  ${r.title}`,
                value: r.status === 'completed' ? (r.conclusion === 'success' ? 'done' : String(r.conclusion)) : String(r.status).replace('_', ' '),
                tone: (r.conclusion === 'success' ? 'good' : r.status === 'completed' ? 'bad' : 'neutral') as 'good' | 'bad' | 'neutral',
            })),
            ...finished.slice(0, 6).map(e => ({ label: `  ${e.summary}`, value: '' })),
            { label: 'Your approvals', value: String(count('approval')), tone: 'good' },
            { label: 'Your rejections', value: String(count('rejection')) },
            { label: 'Undos', value: String(count('undo')) },
        ],
    });
}

function describeAgents() {
    const agents = store.get().status?.agents || [];
    post({
        type: 'summary',
        title: 'Your agents: who does what',
        lines: agents.map(a => ({ label: `${a.label} (${a.schedule})`, value: a.gated ? 'asks you first' : 'fully automatic' })),
    });
    post({
        type: 'text',
        text: agents.map(a => `${a.label}: ${a.summary} Without the agent: ${a.humanToday}`).join('\n\n'),
    });
}
