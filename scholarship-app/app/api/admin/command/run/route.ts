import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { agentById } from '@/lib/command-center/agents';
import { dispatchWorkflow, findRun, GithubNotConfigured } from '@/lib/command-center/github';
import { currentActor, inboxReady, runTarget } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

// Start an agent: { agent, state? } → { requestId, workflow, target }
export async function POST(request: Request) {
    try {
        const { agent: agentId, state } = await request.json();
        const agent = agentById(String(agentId));
        if (!agent?.workflow) return NextResponse.json({ error: `${agentId} cannot be started from the command center` }, { status: 400 });
        const focus = state ? String(state).trim() : '';
        if (focus && (!agent.acceptsState || !/^[A-Za-z .&-]{2,40}$/.test(focus))) {
            return NextResponse.json({ error: `"${focus}" is not a state this agent can focus on` }, { status: 400 });
        }

        const target = runTarget();
        const requestId = `cc-${Date.now().toString(36)}`;
        const inputs: Record<string, string> = { target, request_id: requestId };
        if (focus) inputs.state = focus;
        await dispatchWorkflow(agent.workflow, inputs);

        if (await inboxReady()) {
            await getClient().execute({
                sql: 'INSERT INTO agent_events (agent, kind, actor, summary, details_json) VALUES (?, ?, ?, ?, ?)',
                args: [agent.id, 'run_started', await currentActor(), `Started ${agent.label}${focus ? ` for ${focus}` : ''} (${target})`, JSON.stringify({ requestId, target, state: focus || undefined })],
            });
        }
        return NextResponse.json({ requestId, workflow: agent.workflow, target });
    } catch (error: any) {
        const status = error instanceof GithubNotConfigured ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}

// Live progress: ?agent=&requestId=
export async function GET(request: Request) {
    try {
        const q = new URL(request.url).searchParams;
        const agent = agentById(String(q.get('agent')));
        const requestId = String(q.get('requestId') || '');
        if (!agent?.workflow || !/^cc-[a-z0-9]+$/.test(requestId)) return NextResponse.json({ error: 'agent and requestId are required' }, { status: 400 });
        return NextResponse.json(await findRun(agent.workflow, requestId));
    } catch (error: any) {
        const status = error instanceof GithubNotConfigured ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
