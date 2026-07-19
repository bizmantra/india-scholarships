import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Missing Google OAuth client credentials in environment variables.');
        return NextResponse.json(
            { error: 'OAuth credentials not configured on server.' },
            { status: 500 }
        );
    }

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/admin/auth/callback`;

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/adsense.readonly'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });

    return NextResponse.redirect(authUrl);
}
