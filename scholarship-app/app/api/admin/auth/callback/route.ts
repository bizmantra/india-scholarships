import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/token';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const origin = new URL(request.url).origin;

    if (error) {
        console.error('Google OAuth redirect error:', error);
        return NextResponse.redirect(`${origin}/admin/login?error=Google auth failed`);
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/admin/login?error=No authorization code`);
    }

    const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const jwtSecret = process.env.ADMIN_JWT_SECRET;
    const allowedEmailsStr = process.env.ADMIN_ALLOWED_EMAILS || '';

    if (!clientId || !clientSecret || !jwtSecret) {
        console.error('Missing required environment keys for Google Auth processing.');
        return NextResponse.redirect(`${origin}/admin/login?error=Server configuration error`);
    }

    try {
        const redirectUri = `${origin}/api/admin/auth/callback`;
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri
        );

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        if (tokens.refresh_token) {
            console.log('\n==================================================');
            console.log('🔑 ADSENSE REFRESH TOKEN ACQUIRED:');
            console.log(tokens.refresh_token);
            console.log('==================================================\n');
        }
        oauth2Client.setCredentials(tokens);

        // Fetch user information
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfoRes = await oauth2.userinfo.get();
        const userEmail = userInfoRes.data.email?.toLowerCase().trim();

        if (!userEmail) {
            return NextResponse.redirect(`${origin}/admin/login?error=Could not retrieve email`);
        }

        // Validate whitelisted emails
        const allowedEmails = allowedEmailsStr
            .split(',')
            .map(e => e.toLowerCase().trim())
            .filter(Boolean);

        if (!allowedEmails.includes(userEmail)) {
            console.warn(`Unauthorized login attempt by: ${userEmail}`);
            return NextResponse.redirect(`${origin}/admin/login?error=Access denied: ${userEmail} is not whitelisted.`);
        }

        // Generate secure edge-compatible JWT session token
        const payload = {
            email: userEmail,
            name: userInfoRes.data.name || '',
            picture: userInfoRes.data.picture || ''
        };
        const jwt = await signToken(payload, jwtSecret);

        // Write secure HTTP-Only cookie
        const cookieStore = await cookies();
        const isProd = process.env.NODE_ENV === 'production';
        cookieStore.set('admin_session', jwt, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            domain: isProd ? '.indiascholarships.in' : undefined,
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        // Redirect to Command Center dashboard
        return NextResponse.redirect(`${origin}/admin/dashboard`);

    } catch (err: any) {
        console.error('Error exchanging Google auth code:', err);
        return NextResponse.redirect(`${origin}/admin/login?error=${encodeURIComponent(err.message || 'Authentication error')}`);
    }
}
