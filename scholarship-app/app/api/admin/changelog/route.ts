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
        // Ensure table exists on first fetch check
        db.prepare(`
            CREATE TABLE IF NOT EXISTS scholarship_changelog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholarship_id TEXT NOT NULL,
                scholarship_title TEXT NOT NULL,
                action_type TEXT NOT NULL,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Get latest 50 audit entries
        const logs = db.prepare('SELECT * FROM scholarship_changelog ORDER BY id DESC LIMIT 50').all();
        db.close();

        return NextResponse.json({ logs });
    } catch (error: any) {
        console.error('Error fetching scholarship changelogs:', error);
        return NextResponse.json({ error: 'Failed to retrieve activity log.', details: error.message }, { status: 500 });
    }
}
