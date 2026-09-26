import { NextResponse } from 'next/server';
import { inboxSummary, listProposals } from '@/lib/command-center/inbox';
import { inboxReady } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

// ?view=summary → counts per group; otherwise a list (?category=&risk=&status=&limit=&offset=)
export async function GET(request: Request) {
    try {
        if (!(await inboxReady())) return NextResponse.json({ error: 'inbox_not_ready' }, { status: 409 });
        const q = new URL(request.url).searchParams;
        if (q.get('view') === 'summary') return NextResponse.json(await inboxSummary());
        return NextResponse.json(await listProposals({
            category: q.get('category') || undefined,
            risk: q.get('risk') || undefined,
            status: q.get('status') || undefined,
            limit: Number(q.get('limit')) || 50,
            offset: Number(q.get('offset')) || 0,
        }));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
