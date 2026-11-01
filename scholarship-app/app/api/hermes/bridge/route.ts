import { NextResponse } from 'next/server';
import {
    bridgeBlockedReason, bridgeEnabled, decideFromHermes, inboxReady, pendingForHermes, propose, proposeSa, roleForRequest,
} from '@/lib/command-center/hermes-bridge';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Hermes bridge (staging only for now). Sits outside /api/admin because Hermes has no browser session; it is
 * guarded by bearer tokens instead (see lib/command-center/hermes-bridge.ts).
 *
 * Body: { action: 'status' | 'propose' | 'propose_sa' | 'list' | 'approve' | 'reject', ... }
 *   propose  needs the propose token (or the decide token): { profile, scholarship_id, field, new_value, source, quote?, seen_on?, confidence? }
 *   propose_sa  same shape for Study Abroad pages: { profile, table, key, field, new_value, source, quote?, seen_on?, confidence? },
 *            or { profile, table, key, create: true, fields: {...}, source, quote? } for a new draft page
 *   list     pending Hermes proposals, with whether each can be approved from Hermes (incl. kind, table, key)
 *   approve / reject  need the decide token: { ids: number[], note? }
 */
export async function POST(request: Request) {
    const role = roleForRequest(request);
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const blocked = bridgeBlockedReason();
    if (blocked) return NextResponse.json({ error: blocked }, { status: 403 });

    try {
        const body = await request.json().catch(() => ({}));
        if (!(await inboxReady())) return NextResponse.json({ error: 'Agent inbox tables are not set up in this database' }, { status: 409 });
        if (!(await bridgeEnabled())) {
            return NextResponse.json({ error: 'The Hermes bridge is switched off (agent_settings hermes-bridge/enabled)' }, { status: 423 });
        }

        switch (body.action) {
            case 'status':
                return NextResponse.json({ ok: true, role, environment: process.env.VERCEL_ENV || 'local' });
            case 'propose':
                return NextResponse.json(await propose(body));
            case 'propose_sa':
                return NextResponse.json(await proposeSa(body));
            case 'list':
                return NextResponse.json({ items: await pendingForHermes() });
            case 'approve':
            case 'reject': {
                if (role !== 'decide') return NextResponse.json({ error: 'This token cannot decide' }, { status: 403 });
                const ids: number[] = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
                if (!ids.length || ids.length > 25) return NextResponse.json({ error: 'Send between 1 and 25 ids' }, { status: 400 });
                return NextResponse.json(await decideFromHermes(ids, body.action, body.note));
            }
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
