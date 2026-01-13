
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that are accessible without authentication
    const publicPaths = ['/login', '/signup', '/api/auth'];

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // If user is NOT logged in and tries to access a protected path
    if (!token && !isPublicPath) {
        // Redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user IS logged in and tries to access login or signup
    if (token && (pathname === '/login' || pathname === '/signup')) {
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Ensure middleware runs on relevant paths, excluding static files (/_next, images, etc.)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
