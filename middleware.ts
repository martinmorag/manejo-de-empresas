import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the secret used for signing tokens, should match the one used in NextAuth configuration
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
    // Get the token from the request
    const token = await getToken({ req, secret });

    // Check if the user is authenticated or not
    if (!token && req.nextUrl.pathname.startsWith('/panel')) {
        // Redirect to the sign-in page if the user is not authenticated and trying to access '/panel' routes
        return NextResponse.redirect(new URL('/ingreso', req.url));
    }

    // Allow the request to proceed if authenticated or the request is not for '/panel' routes
    return NextResponse.next();
}

// Define which paths this middleware should be applied to
export const config = {
    matcher: ['/panel/:path*', '/'], // Apply middleware to paths starting with '/panel'
};