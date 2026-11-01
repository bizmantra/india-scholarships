// What an agent (Claude, Antigravity, Codex) may do to the backlog through the agent API. Pure rules, no database,
// so they can be tested; backlog-agent.ts applies them.

export const AGENT_NAMES = ['Claude', 'Antigravity', 'Codex'] as const;
export type AgentName = (typeof AGENT_NAMES)[number];
export const isAgentName = (v: unknown): v is AgentName => AGENT_NAMES.includes(v as AgentName);

export const MAX_CREATES_PER_DAY = 20;

// An agent never sets Done, Parked or Backlog, never re-prioritises, and never touches another agent's items
const ALLOWED_MOVES: Record<string, string> = { Ready: 'In Progress', 'In Progress': 'Review' };

// Carries the HTTP status the route answers with
export class AgentRuleError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

interface ItemView { id: string; assignee: string | null; status: string; link: string | null }
interface AgentChange { status?: string; note?: string | null; link?: string | null }

export function checkAgentUpdate(item: ItemView, agent: AgentName, change: AgentChange): void {
    if (item.assignee !== agent) throw new AgentRuleError(`${item.id} is not assigned to ${agent}.`, 403);
    if (!['Ready', 'In Progress', 'Review'].includes(item.status)) {
        throw new AgentRuleError(`${item.id} is ${item.status}; agents only work on Ready, In Progress or Review items.`, 403);
    }
    if (change.status !== undefined && change.status !== item.status) {
        if (ALLOWED_MOVES[item.status] !== change.status) {
            const allowed = ALLOWED_MOVES[item.status];
            throw new AgentRuleError(
                allowed
                    ? `An agent can move ${item.status} to ${allowed} only, not to ${change.status}. The owner decides the rest.`
                    : `An agent cannot move an item out of ${item.status}. The owner decides.`,
                403,
            );
        }
        if (change.status === 'Review' && !(change.link?.trim() || item.link)) {
            throw new AgentRuleError('Add a link (pull request address or plan file) before moving an item to Review.', 400);
        }
    }
}
