import { NextResponse } from 'next/server';
import { addBacklogItem, BacklogInputError, listBacklog, updateBacklogItem } from '@/lib/command-center/backlog';

export const dynamic = 'force-dynamic';

const fail = (error: unknown) => {
    const status = error instanceof BacklogInputError ? 400 : 500;
    return NextResponse.json({ error: (error as Error).message }, { status });
};

// Every item with its due date, note and last-touched time
export async function GET() {
    try {
        return NextResponse.json({ items: await listBacklog() });
    } catch (error) {
        return fail(error);
    }
}

// { id, status?, impact?, due_date?, note?, waiting?, assignee?, link?, category? }
export async function PATCH(request: Request) {
    try {
        const { id, ...change } = await request.json();
        if (!id || typeof id !== 'string') throw new BacklogInputError('An id is needed.');
        await updateBacklogItem(id, change);
        return NextResponse.json({ ok: true });
    } catch (error) {
        return fail(error);
    }
}

// { category, title, description?, impact?, due_date?, status?, assignee?, link? }
export async function POST(request: Request) {
    try {
        const id = await addBacklogItem(await request.json());
        return NextResponse.json({ id });
    } catch (error) {
        return fail(error);
    }
}
