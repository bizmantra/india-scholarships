import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export async function GET() {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const dbPath = path.join(process.cwd(), 'data', 'scholarships.db');
    if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: 'Database file not found.' }, { status: 500 });
    }

    const db = new Database(dbPath);

    try {
        const scholarships = db.prepare('SELECT * FROM scholarships ORDER BY title').all();
        db.close();

        return NextResponse.json({ scholarships });
    } catch (error: any) {
        console.error('Error fetching scholarships inside content API:', error);
        return NextResponse.json({ error: 'Database query failed.', details: error.message }, { status: 500 });
    }
}
