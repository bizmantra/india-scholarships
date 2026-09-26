import { NextResponse } from 'next/server';
import { decide, pendingIds } from '@/lib/command-center/inbox';
import { currentActor } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';
// Bulk decisions on hundreds of items take a few seconds against Turso
export const maxDuration = 60;

/**
 * The single approval endpoint used by chat cards, the list view and bulk commands.
 * Body: { action: 'approve' | 'reject', ids?: number[], group?: { category, risk? }, force?, note? }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!['approve', 'reject'].includes(body.action)) {
            return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
        }
        let ids: number[] = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
        if (!ids.length && body.group?.category) ids = await pendingIds(String(body.group.category), body.group.risk ? String(body.group.risk) : undefined);
        if (!ids.length) return NextResponse.json({ error: 'Nothing to decide' }, { status: 400 });
        if (ids.length > 1000) return NextResponse.json({ error: 'At most 1000 items at a time' }, { status: 400 });

        const result = await decide(ids, body.action, await currentActor(), { force: Boolean(body.force), note: body.note });
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
