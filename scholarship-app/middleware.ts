import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/token';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Guard all admin routes, except the login gate page
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const sessionCookie = request.cookies.get('admin_session')?.value;
        const jwtSecret = process.env.ADMIN_JWT_SECRET;

        if (!sessionCookie || !jwtSecret) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }

        const decoded = await verifyToken(sessionCookie, jwtSecret);
        if (!decoded) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            url.searchParams.set('error', 'Session invalid or expired. Please sign in again.');
            
            const response = NextResponse.redirect(url);
            response.cookies.set('admin_session', '', {
                path: '/',
                maxAge: 0
            });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
