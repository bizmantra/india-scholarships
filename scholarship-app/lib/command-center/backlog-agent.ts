/**
 * The agent API for the backlog: lets Claude, Antigravity and Codex read their queue, add items and report progress,
 * without a browser session. Route: /api/agents/backlog (outside /api/admin, guarded by a bearer token).
 *
 * Limits, all enforced here (not by the caller):
 *   - off by default: agent_settings backlog-api/enabled must be true (the kill switch)
 *   - one token, AGENT_BACKLOG_TOKEN (env); every call names the agent it acts as
 *   - an agent sees and changes only items assigned to it; it can move Ready to In Progress and In Progress to Review
 *     (Review needs a link), edit the note and link, and add new items to Backlog (at most MAX_CREATES_PER_DAY a day).
 *     It never sets Done, Parked or Backlog, impact, due date, team or assignee.
 *   - every write is recorded in agent_events
 */
import { getClient } from '@/lib/db';
import { rows } from './server';
import { addBacklogItem, listBacklog, updateBacklogItem, BacklogInputError } from './backlog';
import type { BacklogImpact } from './backlog-types';
import { AgentRuleError, MAX_CREATES_PER_DAY, checkAgentUpdate, isAgentName, type AgentName } from './backlog-agent-rules';

export { AgentRuleError, isAgentName, type AgentName };

const SETTINGS_AGENT = 'backlog-api';
const EVENT_AGENT = 'backlog-api';

// Constant-time compare so a wrong token leaks nothing through timing
function same(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export function tokenIsValid(request: Request): boolean {
    const expected = process.env.AGENT_BACKLOG_TOKEN;
    const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
    return Boolean(expected && token && same(token, expected));
}

// False when the setting is missing or the settings table does not exist yet
export async function agentApiEnabled(): Promise<boolean> {
    try {
        const res = await getClient().execute({ sql: 'SELECT value_json FROM agent_settings WHERE agent = ? AND key = ?', args: [SETTINGS_AGENT, 'enabled'] });
        return res.rows.length > 0 && JSON.parse(String(res.rows[0].value_json)) === true;
    } catch {
        return false;
    }
}

async function logEvent(agent: AgentName, kind: string, summary: string, details: object) {
    await getClient().execute({
        sql: 'INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)',
        args: [EVENT_AGENT, kind, `agent:${agent}`, summary, JSON.stringify(details)],
    });
}

// Open items assigned to the agent (its queue), or every open item with all=true. Only what an agent needs to see.
export async function agentList(agent: AgentName, all = false) {
    const items = await listBacklog();
    return items
        .filter(i => ['Backlog', 'Ready', 'In Progress', 'Review'].includes(i.status))
        .filter(i => all || i.assignee === agent)
        .map(i => ({
            id: i.id, team: i.category, title: i.title, description: i.description, impact: i.impact, status: i.status,
            assignee: i.assignee, due_date: i.due_date, note: i.note, link: i.link,
        }));
}

export async function agentCreate(agent: AgentName, input: { team?: string; title?: string; description?: string; impact?: BacklogImpact; link?: string | null }) {
    const used = rows<{ n: number }>(await getClient().execute({
        sql: "SELECT COUNT(*) AS n FROM agent_events WHERE agent = ? AND kind = 'backlog_create' AND actor = ? AND date(created_at) = date('now')",
        args: [EVENT_AGENT, `agent:${agent}`],
    }))[0].n;
    if (Number(used) >= MAX_CREATES_PER_DAY) throw new AgentRuleError(`Daily limit of ${MAX_CREATES_PER_DAY} new items reached for ${agent}.`, 429);
    const id = await addBacklogItem({
        category: input.team || '',
        title: input.title || '',
        description: `${(input.description || '').trim()}\n\n(Added by ${agent}.)`.trim(),
        impact: input.impact,
        link: input.link,
        status: 'Backlog', // the owner decides what becomes Ready
    });
    await logEvent(agent, 'backlog_create', `${agent} added ${id}: ${input.title}`, { id, team: input.team });
    return { id };
}

export async function agentUpdate(agent: AgentName, input: { id?: string; status?: string; note?: string | null; link?: string | null }) {
    if (!input.id) throw new BacklogInputError('An id is needed.');
    const item = (await listBacklog()).find(i => i.id === input.id);
    if (!item) throw new BacklogInputError('Item not found.');
    checkAgentUpdate(item, agent, input);
    // Only these three fields are ever passed on, whatever else the caller sent
    await updateBacklogItem(item.id, {
        ...(input.status && input.status !== item.status ? { status: input.status as 'In Progress' | 'Review' } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.link !== undefined ? { link: input.link } : {}),
    });
    const moved = input.status && input.status !== item.status ? ` and moved it to ${input.status}` : '';
    await logEvent(agent, 'backlog_update', `${agent} updated ${item.id}${moved}`, { id: item.id, status: input.status ?? null });
    return { ok: true };
}
