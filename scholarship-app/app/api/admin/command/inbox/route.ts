import { NextResponse } from 'next/server';
import { AGENTS, agentsOfTeam } from '@/lib/command-center/agents';
import { inboxSummary, listProposals } from '@/lib/command-center/inbox';
import { inboxReady } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

// ?view=summary → counts per group; otherwise a list (?category=&risk=&status=&team=&limit=&offset=)
export async function GET(request: Request) {
    try {
        if (!(await inboxReady())) return NextResponse.json({ error: 'inbox_not_ready' }, { status: 409 });
        const q = new URL(request.url).searchParams;
        if (q.get('view') === 'summary') return NextResponse.json(await inboxSummary());
        return NextResponse.json(await listProposals({
            category: q.get('category') || undefined,
            risk: q.get('risk') || undefined,
            status: q.get('status') || undefined,
            // ?team=other = agents that belong to no team
            agents: q.get('team') && q.get('team') !== 'other' ? agentsOfTeam(q.get('team')!).map(a => a.id) : undefined,
            notAgents: q.get('team') === 'other' ? AGENTS.filter(a => a.team).map(a => a.id) : undefined,
            limit: Number(q.get('limit')) || 50,
            offset: Number(q.get('offset')) || 0,
        }));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
