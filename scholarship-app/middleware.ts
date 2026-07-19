import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/token';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Bypass authentication endpoints so users can log in
    if (pathname.startsWith('/api/admin/auth')) {
        return NextResponse.next();
    }

    // 2. Redirect logged-in users away from the login page
    if (pathname === '/admin/login') {
        const sessionCookie = request.cookies.get('admin_session')?.value;
        const jwtSecret = process.env.ADMIN_JWT_SECRET;
        if (sessionCookie && jwtSecret) {
            const decoded = await verifyToken(sessionCookie, jwtSecret);
            if (decoded) {
                const url = request.nextUrl.clone();
                url.pathname = '/admin/dashboard';
                return NextResponse.redirect(url);
            }
        }
    }

    // 3. Guard all other admin views and API endpoints
    if ((pathname.startsWith('/admin') && pathname !== '/admin/login') || pathname.startsWith('/api/admin')) {
        const sessionCookie = request.cookies.get('admin_session')?.value;
        const jwtSecret = process.env.ADMIN_JWT_SECRET;

        if (!sessionCookie || !jwtSecret) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized: Session missing.' }, { status: 401 });
            }
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }

        const decoded = await verifyToken(sessionCookie, jwtSecret);
        if (!decoded) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized: Session expired.' }, { status: 401 });
            }
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            url.searchParams.set('error', 'Session invalid or expired. Please sign in again.');
            
            const response = NextResponse.redirect(url);
            const isProd = process.env.NODE_ENV === 'production';
            response.cookies.set('admin_session', '', {
                path: '/',
                domain: isProd ? '.indiascholarships.in' : undefined,
                maxAge: 0
            });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
