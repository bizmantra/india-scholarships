import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { runAggregation } from '@/lib/community';

// PUT / POST to update moderation status
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const body = await request.json();
        const { status } = body;

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
        }
        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid or missing moderation status.' }, { status: 400 });
        }

        const client = getClient();
        
        // Update the event
        await client.execute({
            sql: "UPDATE community_events SET moderation_status = ? WHERE id = ?",
            args: [status, eventId]
        });

        // Trigger aggregate recalculation
        await runAggregation();

        return NextResponse.json({ success: true, message: `Event status updated to ${status}.` });
    } catch (error) {
        console.error('Admin Event Moderation Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update event status.', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// DELETE to remove the event
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
        }

        const client = getClient();
        
        // Delete the event
        await client.execute({
            sql: "DELETE FROM community_events WHERE id = ?",
            args: [eventId]
        });

        // Trigger aggregate recalculation
        await runAggregation();

        return NextResponse.json({ success: true, message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Admin Event Moderation Delete Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete event.', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
