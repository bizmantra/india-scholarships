import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

// Reads the live database (Turso in production), not the copy bundled at build time
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = getClient();
        // Latest 50 audit entries
        const res = await client.execute('SELECT * FROM scholarship_changelog ORDER BY id DESC LIMIT 50');
        return NextResponse.json({ logs: res.rows });
    } catch (error: any) {
        console.error('Error fetching scholarship changelogs:', error);
        return NextResponse.json({ error: 'Failed to retrieve activity log.', details: error.message }, { status: 500 });
    }
}
