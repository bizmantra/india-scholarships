import { NextResponse } from 'next/server';
import { verifyGoogleConnections } from '@/lib/google-auth';

export async function GET() {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
