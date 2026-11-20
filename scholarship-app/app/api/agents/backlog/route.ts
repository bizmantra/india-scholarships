import { NextResponse } from 'next/server';
import { BacklogInputError } from '@/lib/command-center/backlog';
import { AgentRuleError, agentApiEnabled, agentCreate, agentList, agentUpdate, isAgentName, tokenIsValid } from '@/lib/command-center/backlog-agent';

export const dynamic = 'force-dynamic';

/**
 * The backlog for agents (Claude, Antigravity, Codex). Sits outside /api/admin because agents have no browser session;
 * guarded by the bearer token AGENT_BACKLOG_TOKEN and the backlog-api/enabled switch (see lib/command-center/backlog-agent.ts).
 *
 *   GET   ?agent=Claude[&all=1]                                   the agent's open items (all=1: every open item)
 *   POST  { agent, team, title, description?, impact?, link? }   add an item to Backlog
 *   PATCH { agent, id, status?, note?, link? }                    Ready to In Progress, In Progress to Review, note, link
 */
async function guard(request: Request): Promise<NextResponse | null> {
    if (!tokenIsValid(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await agentApiEnabled())) {
        return NextResponse.json({ error: 'The agent backlog API is switched off (agent_settings backlog-api/enabled)' }, { status: 423 });
    }
    return null;
}

const fail = (error: unknown) => {
    const status = error instanceof AgentRuleError ? error.status : error instanceof BacklogInputError ? 400 : 500;
    return NextResponse.json({ error: (error as Error).message }, { status });
};

const badAgent = () => NextResponse.json({ error: 'agent must be Claude, Antigravity or Codex' }, { status: 400 });

export async function GET(request: Request) {
    const blocked = await guard(request);
    if (blocked) return blocked;
    try {
        const params = new URL(request.url).searchParams;
        const agent = params.get('agent');
        if (!isAgentName(agent)) return badAgent();
        return NextResponse.json({ items: await agentList(agent, params.get('all') === '1') });
    } catch (error) {
        return fail(error);
    }
}

export async function POST(request: Request) {
    const blocked = await guard(request);
    if (blocked) return blocked;
    try {
        const { agent, ...input } = await request.json().catch(() => ({}));
        if (!isAgentName(agent)) return badAgent();
        return NextResponse.json(await agentCreate(agent, input));
    } catch (error) {
        return fail(error);
    }
}

export async function PATCH(request: Request) {
    const blocked = await guard(request);
    if (blocked) return blocked;
    try {
        const { agent, ...input } = await request.json().catch(() => ({}));
        if (!isAgentName(agent)) return badAgent();
        return NextResponse.json(await agentUpdate(agent, input));
    } catch (error) {
        return fail(error);
    }
}
