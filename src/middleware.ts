
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session-id')
  const { pathname } = request.nextUrl

  // Routes that should only be accessible to logged-out users
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // All routes are protected by default, except for these public ones
  const publicRoutes = ['/', '/about', '/contact'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If the user has a session cookie...
  if (sessionCookie) {
    // and they are trying to access an auth route (login/register),
    // redirect them to the dashboard.
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If the user does NOT have a session cookie...
  else {
    // and they are trying to access a protected route (i.e., not public and not an auth route),
    // redirect them to the login page.
    if (!isPublicRoute && !isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Otherwise, allow the request to proceed.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all routes except for
  // static files and other internal Next.js assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
