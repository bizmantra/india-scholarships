import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventName, scholarshipId } = body;

        if (!eventName || !['widget_view', 'cta_click', 'submission_started', 'submission_completed'].includes(eventName)) {
            return NextResponse.json({ error: 'Invalid or missing event name.' }, { status: 400 });
        }
        if (!scholarshipId) {
            return NextResponse.json({ error: 'Scholarship ID is required.' }, { status: 400 });
        }

        // Manage Session Cookie for tracking session-based analytics
        const cookieStore = await cookies();
        let sessionId = cookieStore.get('community_session_id')?.value;
        let newSessionCookie = false;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            newSessionCookie = true;
        }

        const session_hash = createHash('sha256').update(sessionId).digest('hex');

        // Log analytics event
        const client = getClient();
        await client.execute({
            sql: `INSERT INTO community_analytics (event_name, scholarship_id, session_hash) VALUES (?, ?, ?)`,
            args: [eventName, scholarshipId, session_hash]
        });

        const response = NextResponse.json({ success: true });

        if (newSessionCookie) {
            response.cookies.set('community_session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });
        }

        return response;
    } catch (error) {
        console.error('Community Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to record analytics event.' }, { status: 500 });
    }
}
