import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ scholarshipId: string }> }
) {
    try {
        const { scholarshipId } = await params;

        if (!scholarshipId) {
            return NextResponse.json({ error: 'Scholarship ID or slug is required.' }, { status: 400 });
        }

        const client = getClient();
        
        // Find aggregate matching scholarshipId or its slug
        const res = await client.execute({
            sql: `SELECT * FROM community_signals_aggregates 
                  WHERE scholarship_id = ? 
                  OR scholarship_id = (SELECT id FROM scholarships WHERE slug = ?)`,
            args: [scholarshipId, scholarshipId]
        });

        const aggregate = res.rows[0];

        if (!aggregate) {
            // Return clean empty fallback state
            return NextResponse.json({
                scholarship_id: scholarshipId,
                total_events: 0,
                application_count: 0,
                verification_count: 0,
                selected_count: 0,
                payment_count: 0,
                average_payment: 0,
                last_activity: null,
                common_issues_json: '{}'
            });
        }

        return NextResponse.json(aggregate);
    } catch (error) {
        console.error('Fetch Community Aggregates API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch community aggregates.', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
