import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/'];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Get token from cookies or check localStorage (on client side)
  // Note: Since we're using localStorage, we'll handle auth check on client side
  // This middleware just redirects to login for dashboard routes

  if (!isPublicPath && pathname.startsWith('/dashboard')) {
    // We can't check localStorage in middleware (server-side)
    // So we'll let the page component handle the auth check
    // and redirect on the client side
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
