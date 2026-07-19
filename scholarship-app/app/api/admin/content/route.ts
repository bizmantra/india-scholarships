import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function GET() {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
