import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth/signin',
  '/auth/signup',
  '/api/auth',
  '/_next',
  '/static',
  '/favicon.ico',
];

// Paths that require authentication but don't require business context
const AUTH_ONLY_PATHS = [
  '/dashboard/profile',
  '/api/user',
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Allow public paths
  if (PUBLIC_PATHS.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({ req: request });

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Allow access to auth-only paths without business context
  if (AUTH_ONLY_PATHS.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For all other paths, ensure business context exists
  if (!token.businessId) {
    return NextResponse.redirect(new URL('/dashboard/profile', request.url));
  }

  // Add business context to headers for API routes
  if (url.pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-business-id', token.businessId as string);
    requestHeaders.set('x-user-role', token.role as string);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth (NextAuth.js authentication paths)
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. All files in /public (e.g. /favicon.ico)
     */
    '/((?!api/auth|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
