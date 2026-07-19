import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const origin = new URL(request.url).origin;
    
    try {
        const cookieStore = await cookies();
        // Remove session cookie
        cookieStore.set('admin_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0 // Expire instantly
        });
    } catch (e) {
        console.error('Error clearing session cookie during logout:', e);
    }

    return NextResponse.redirect(`${origin}/admin/login`);
}
