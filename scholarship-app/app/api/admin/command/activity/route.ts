import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { agentsOfTeam } from '@/lib/command-center/agents';
import { recentRuns } from '@/lib/command-center/github';
import { inboxReady, rows } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

// The activity feed: agent events (newest first; ?kind= filters, e.g. briefing; ?team= limits it to one team's agents) plus, with ?runs=1, recent GitHub runs
export async function GET(request: Request) {
    try {
        const q = new URL(request.url).searchParams;
        const since = q.get('since') || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 19).replace('T', ' ');
        const teamAgents = q.get('team') ? agentsOfTeam(q.get('team')!).map(a => a.id) : null;
        const events = (await inboxReady() && (!teamAgents || teamAgents.length))
            ? rows(await getClient().execute({
                sql: `SELECT * FROM agent_events WHERE created_at >= ? ${q.get('kind') ? 'AND kind = ?' : ''} ${teamAgents ? `AND agent IN (${teamAgents.map(() => '?').join(',')})` : ''} ORDER BY id DESC LIMIT ?`,
                args: [since, ...(q.get('kind') ? [String(q.get('kind'))] : []), ...(teamAgents || []), Math.min(Number(q.get('limit')) || 100, 500)],
            }))
            : [];
        let runs: any[] = [];
        if (q.get('runs') && process.env.GITHUB_ACTIONS_TOKEN) {
            try { runs = await recentRuns(30); } catch { runs = []; }
        }
        return NextResponse.json({ events, runs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
