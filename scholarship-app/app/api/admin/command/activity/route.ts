import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { recentRuns } from '@/lib/command-center/github';
import { inboxReady, rows } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

// The activity feed: agent events (newest first) plus, with ?runs=1, recent GitHub runs
export async function GET(request: Request) {
    try {
        const q = new URL(request.url).searchParams;
        const since = q.get('since') || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 19).replace('T', ' ');
        const events = (await inboxReady())
            ? rows(await getClient().execute({
                sql: 'SELECT * FROM agent_events WHERE created_at >= ? ORDER BY id DESC LIMIT ?',
                args: [since, Math.min(Number(q.get('limit')) || 100, 500)],
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
