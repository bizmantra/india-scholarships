import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { runAggregation } from '@/lib/community';

export async function GET(request: NextRequest) {
    try {
        const client = getClient();

        // 1. Fetch moderation items (joined with scholarship titles)
        const eventsRes = await client.execute(`
            SELECT e.*, s.title as scholarship_title, s.slug as scholarship_slug 
            FROM community_events e
            LEFT JOIN scholarships s ON e.scholarship_id = s.id
            ORDER BY e.created_at DESC
        `);
        const events = eventsRes.rows.map((row: any) => ({
            ...row,
            metadata: JSON.parse(row.metadata_json || '{}')
        }));

        // 2. Calculate Hidden Dashboard Metrics
        // A. Total updates count
        const totalUpdatesRes = await client.execute("SELECT COUNT(*) as cnt FROM community_events");
        const totalUpdates = Number(totalUpdatesRes.rows[0].cnt);

        // B. Updates in the last 7 days
        // Get date 7 days ago in UTC YYYY-MM-DD HH:MM:SS format
        const d7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const d7Str = `${d7.getUTCFullYear()}-${String(d7.getUTCMonth() + 1).padStart(2, '0')}-${String(d7.getUTCDate()).padStart(2, '0')} ${String(d7.getUTCHours()).padStart(2, '0')}:${String(d7.getUTCMinutes()).padStart(2, '0')}:${String(d7.getUTCSeconds()).padStart(2, '0')}`;
        const updatesLast7DaysRes = await client.execute({
            sql: "SELECT COUNT(*) as cnt FROM community_events WHERE created_at >= ?",
            args: [d7Str]
        });
        const updatesLast7Days = Number(updatesLast7DaysRes.rows[0].cnt);

        // C. Scholarships with at least one update
        const distinctScholarshipsRes = await client.execute("SELECT COUNT(DISTINCT scholarship_id) as cnt FROM community_events");
        const distinctScholarships = Number(distinctScholarshipsRes.rows[0].cnt);

        // D. Submission completion rate
        const startedRes = await client.execute("SELECT COUNT(*) as cnt FROM community_analytics WHERE event_name = 'submission_started'");
        const completedRes = await client.execute("SELECT COUNT(*) as cnt FROM community_analytics WHERE event_name = 'submission_completed'");
        
        const started = Number(startedRes.rows[0].cnt);
        const completed = Number(completedRes.rows[0].cnt);
        const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;

        return NextResponse.json({
            events,
            metrics: {
                totalUpdates,
                updatesLast7Days,
                distinctScholarships,
                completionRate,
                analyticsFunnel: { started, completed }
            }
        });
    } catch (error) {
        console.error('Admin Moderation API GET Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch moderation data.', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST endpoint to trigger manual aggregation calculations
export async function POST(request: NextRequest) {
    try {
        await runAggregation();
        return NextResponse.json({ success: true, message: 'Aggregation completed successfully.' });
    } catch (error) {
        console.error('Admin Moderation API POST Trigger Error:', error);
        return NextResponse.json(
            { error: 'Failed to run aggregation.', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
