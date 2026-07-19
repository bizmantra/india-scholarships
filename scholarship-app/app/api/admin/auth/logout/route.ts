import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const origin = new URL(request.url).origin;
    
    try {
        const cookieStore = await cookies();
        // Remove session cookie
        const isProd = process.env.NODE_ENV === 'production';
        cookieStore.set('admin_session', '', {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            domain: isProd ? '.indiascholarships.in' : undefined,
            maxAge: 0 // Expire instantly
        });
    } catch (e) {
        console.error('Error clearing session cookie during logout:', e);
    }

    return NextResponse.redirect(`${origin}/admin/login`);
}
