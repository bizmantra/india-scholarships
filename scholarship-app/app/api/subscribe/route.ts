import { NextRequest, NextResponse } from 'next/server';
import { appendSheetRow } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, slug } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        if (!slug) {
            return NextResponse.json({ error: 'Scholarship slug is required' }, { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Append to "Subscribers" sheet tab
        const timestamp = new Date().toISOString();
        await appendSheetRow([email, slug, timestamp], 'Subscribers');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscription API error:', error);
        return NextResponse.json(
            { error: 'Failed to record subscription', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
