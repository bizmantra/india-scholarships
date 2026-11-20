import { NextResponse } from 'next/server';
import worklist from '@/data/study-abroad/facts-worklist.json';

export const dynamic = 'force-dynamic';

/**
 * The Study Abroad facts worklist the freshness script wrote (spec D4).
 * It is a committed file, not a database read: `node scripts/study-abroad/facts-freshness.mjs --target=production`
 * regenerates it, and the numbers here are as of `generated_at`.
 */
export async function GET() {
    return NextResponse.json({ ok: true, ...worklist });
}
