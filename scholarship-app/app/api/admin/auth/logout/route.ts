import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sessionCookieDomain } from '@/lib/token';

export async function GET(request: Request) {
    const origin = new URL(request.url).origin;

    // Browsers and Next.js pre-load links; only a real click may sign the user out
    const headers = request.headers;
    if (headers.get('next-router-prefetch') || headers.get('purpose') === 'prefetch' || headers.get('sec-purpose')?.includes('prefetch')) {
        return new NextResponse(null, { status: 204 });
    }
    
    try {
        const cookieStore = await cookies();
        // Remove session cookie
        const isProd = process.env.NODE_ENV === 'production';
        cookieStore.set('admin_session', '', {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            domain: sessionCookieDomain(new URL(request.url).hostname),
            maxAge: 0 // Expire instantly
        });
    } catch (e) {
        console.error('Error clearing session cookie during logout:', e);
    }

    return NextResponse.redirect(`${origin}/admin/login`);
}
