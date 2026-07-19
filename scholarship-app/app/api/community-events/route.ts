import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// Format Date for SQLite comparison (UTC YYYY-MM-DD HH:MM:SS)
function getSQLiteUTC24hAgo() {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            scholarshipId,
            eventType,
            date,
            stage,
            amount,
            issues = [],
            otherText = '',
            turnstileToken
        } = body;

        // 1. Core Validations
        if (!scholarshipId) {
            return NextResponse.json({ error: 'Scholarship ID is required.' }, { status: 400 });
        }
        if (!eventType || !['application_submitted', 'application_stage_changed', 'payment_received'].includes(eventType)) {
            return NextResponse.json({ error: 'Invalid or missing event type.' }, { status: 400 });
        }
        if (!turnstileToken) {
            return NextResponse.json({ error: 'Turnstile verification token is required.' }, { status: 400 });
        }

        // 2. Cloudflare Turnstile Verification
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

        const turnstileRes = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: turnstileSecret,
                response: turnstileToken,
                remoteip: ip
            })
        });

        const turnstileResult = await turnstileRes.json();
        if (!turnstileResult.success) {
            return NextResponse.json({ error: 'Turnstile verification failed. Please try again.' }, { status: 400 });
        }

        // 3. Date Validation (cannot be future, cannot be > 1 year old)
        if (!date) {
            return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
        }
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const compareInput = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

        if (compareInput > today) {
            return NextResponse.json({ error: 'Date cannot be in the future.' }, { status: 400 });
        }

        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (compareInput < oneYearAgo) {
            return NextResponse.json({ error: 'Date cannot be more than one year old.' }, { status: 400 });
        }

        // 4. Amount Validation (positive integer, warn only handled on client side)
        let amountVal = 0;
        if (eventType === 'payment_received') {
            if (amount === undefined || amount === null) {
                return NextResponse.json({ error: 'Amount is required for payment received.' }, { status: 400 });
            }
            amountVal = Number(amount);
            if (!Number.isInteger(amountVal) || amountVal <= 0) {
                return NextResponse.json({ error: 'Amount must be a positive integer.' }, { status: 400 });
            }
        }

        // 5. Stage Validation
        if (eventType === 'application_stage_changed') {
            if (!stage || !['Institute Verification', 'District Verification', 'State Verification', 'Selected'].includes(stage)) {
                return NextResponse.json({ error: 'Invalid or missing verification stage.' }, { status: 400 });
            }
        }

        // 6. Manage Session Cookie for Rate Limiting
        const cookieStore = await cookies();
        let sessionId = cookieStore.get('community_session_id')?.value;
        let newSessionCookie = false;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            newSessionCookie = true;
        }

        // Compute session hash
        const session_hash = createHash('sha256').update(sessionId).digest('hex');

        // Check 24-hour rate limit in database
        const client = getClient();
        const last24h = getSQLiteUTC24hAgo();
        const rateLimitRes = await client.execute({
            sql: 'SELECT COUNT(*) as count FROM community_events WHERE scholarship_id = ? AND session_hash = ? AND created_at > ?',
            args: [scholarshipId, session_hash, last24h]
        });

        if (Number(rateLimitRes.rows[0].count) > 0) {
            return NextResponse.json(
                { error: "You've already shared an update for this scholarship today.\n\nYou can submit another update tomorrow if your application status changes." },
                { status: 429 }
            );
        }

        // 7. Determine Moderation Status
        // If there is custom text in otherText, status is pending; otherwise auto-approve.
        const cleanOtherText = otherText ? otherText.trim().substring(0, 150) : '';
        const moderation_status = cleanOtherText.length > 0 ? 'pending' : 'approved';

        // 8. Prepare Metadata JSON
        const metadata: Record<string, any> = {
            issues,
            otherText: cleanOtherText
        };
        if (eventType === 'application_submitted') {
            metadata.submission_date = date;
        } else if (eventType === 'application_stage_changed') {
            metadata.stage = stage;
            metadata.date = date;
        } else if (eventType === 'payment_received') {
            metadata.payment_date = date;
            metadata.amount = amountVal;
        }

        // 9. Store event in DB
        await client.execute({
            sql: `INSERT INTO community_events 
                  (scholarship_id, event_type, metadata_json, session_hash, moderation_status) 
                  VALUES (?, ?, ?, ?, ?)`,
            args: [
                scholarshipId,
                eventType,
                JSON.stringify(metadata),
                session_hash,
                moderation_status
            ]
        });

        // 10. Prepare Response (and set cookie if new session)
        const response = NextResponse.json({
            success: true,
            moderation_status,
            message: moderation_status === 'approved' 
                ? 'Thank you. Your update helps other students understand application timelines.' 
                : 'Thank you. Your update is received and will be display once moderated.'
        });

        if (newSessionCookie) {
            response.cookies.set('community_session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/' // Session cookie: omitted maxAge/expires
            });
        }

        return response;
    } catch (error) {
        console.error('Community Events API Error:', error);
        return NextResponse.json(
            { error: 'Failed to record application update.', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
