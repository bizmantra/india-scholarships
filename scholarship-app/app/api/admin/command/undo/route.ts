import { NextResponse } from 'next/server';
import { undo } from '@/lib/command-center/inbox';
import { currentActor } from '@/lib/command-center/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        if (!Number.isInteger(Number(id))) return NextResponse.json({ error: 'id is required' }, { status: 400 });
        const result = await undo(Number(id), await currentActor());
        return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
