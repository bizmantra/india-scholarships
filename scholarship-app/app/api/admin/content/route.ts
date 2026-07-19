import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function GET() {

    try {
        const client = getClient();
        const res = await client.execute('SELECT * FROM scholarships ORDER BY title');
        const scholarships = res.rows;

        return NextResponse.json({ scholarships });
    } catch (error: any) {
        console.error('Error fetching scholarships inside content API:', error);
        return NextResponse.json({ error: 'Database query failed.', details: error.message }, { status: 500 });
    }
}
