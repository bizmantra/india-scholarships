import { NextResponse } from 'next/server';
import { AGENTS } from '@/lib/command-center/agents';
import { currentActor, environment, inboxReady, runTarget } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

// What the command center page needs to start: where it runs, who is signed in, what is set up
export async function GET() {
    try {
        return NextResponse.json({
            environment: environment(),
            runTarget: runTarget(),
            actor: await currentActor(),
            inboxReady: await inboxReady(),
            githubConfigured: Boolean(process.env.GITHUB_ACTIONS_TOKEN),
            agents: AGENTS,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
