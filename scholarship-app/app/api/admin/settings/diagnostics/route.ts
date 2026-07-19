import { NextResponse } from 'next/server';
import { verifyGoogleConnections } from '@/lib/google-auth';

export async function GET() {

    try {
        const diagnostics = await verifyGoogleConnections();
        return NextResponse.json({ diagnostics });
    } catch (error: any) {
        console.error('Error running API connection diagnostics:', error);
        return NextResponse.json({
            error: 'Failed to run diagnostics.',
            details: error.message
        }, { status: 500 });
    }
}
