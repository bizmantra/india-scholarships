import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken, verifyToken, isPreviewOrigin } from '@/lib/token';

/**
 * Last step of sign-in on a preview (staging) deployment: the live site sent a short pass after the owner
 * signed in with Google there. It must be signed with the shared ADMIN_JWT_SECRET, be under a minute old
 * and be issued for this exact preview address. Then this preview starts its own 7-day session.
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const fail = (error: string) => NextResponse.redirect(`${url.origin}/admin/login?error=${encodeURIComponent(error)}`);

    const jwtSecret = process.env.ADMIN_JWT_SECRET;
    if (!jwtSecret) return fail('ADMIN_JWT_SECRET is not set for Preview deployments in Vercel.');
    if (!isPreviewOrigin(url.origin)) return fail('This sign-in step only runs on preview deployments.');

    const pass = await verifyToken(url.searchParams.get('token') || '', jwtSecret);
    if (!pass || pass.purpose !== 'preview-handoff' || pass.origin !== url.origin || !pass.email) {
        return fail('Sign-in pass is invalid or expired. Please sign in again. (If this repeats, ADMIN_JWT_SECRET for Preview must match Production.)');
    }

    const session = await signToken({ email: pass.email, name: pass.name || '', picture: pass.picture || '' }, jwtSecret);
    (await cookies()).set('admin_session', session, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
    });
    return NextResponse.redirect(`${url.origin}/admin/command`);
}
