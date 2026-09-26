import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { isPreviewOrigin, LIVE_ADMIN_ORIGIN } from '@/lib/token';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    // On a preview (staging) deployment, sign in through the live site, which then hands this preview a pass
    if (isPreviewOrigin(requestUrl.origin)) {
        return NextResponse.redirect(`${LIVE_ADMIN_ORIGIN}/api/admin/auth/google?return_to=${encodeURIComponent(requestUrl.origin)}`);
    }

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

    const response = NextResponse.redirect(authUrl);
    // Remember which preview asked, for the callback (only this project's own preview addresses are accepted)
    const returnTo = requestUrl.searchParams.get('return_to');
    if (isPreviewOrigin(returnTo)) {
        response.cookies.set('admin_return_to', returnTo, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/api/admin/auth',
            maxAge: 10 * 60,
        });
    }
    return response;
}
