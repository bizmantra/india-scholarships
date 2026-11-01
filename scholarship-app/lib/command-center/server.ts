import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/token';
import { getClient } from '@/lib/db';

export type Environment = 'production' | 'staging' | 'local';

// Preview deployments use the staging database (see docs/DATABASE_OPERATIONS.md), so runs started there target staging
export function environment(): Environment {
    if (process.env.VERCEL_ENV === 'production') return 'production';
    if (process.env.VERCEL_ENV === 'preview') return 'staging';
    return 'local';
}

// Which database agent runs started from here should write to
export function runTarget(): 'production' | 'staging' {
    return environment() === 'production' ? 'production' : 'staging';
}

// The signed-in owner, recorded on every decision (middleware has already checked the session)
export async function currentActor(): Promise<string> {
    const token = (await cookies()).get('admin_session')?.value;
    const secret = process.env.ADMIN_JWT_SECRET;
    const payload = token && secret ? await verifyToken(token, secret) : null;
    return payload?.email || 'admin';
}

// The agent tables are created by the first agent run after the inbox was introduced.
// The command center never creates them itself: an agent's first push would otherwise clash with rows written here.
export async function inboxReady(): Promise<boolean> {
    const res = await getClient().execute(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name IN ('agent_proposals', 'agent_events', 'agent_settings')"
    );
    return Number(res.rows[0].n) === 3;
}

export const rows = <T = any>(res: { rows: any[] }) => res.rows.map(r => ({ ...r })) as T[];
