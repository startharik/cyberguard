
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session-id')
  const { pathname } = request.nextUrl

  // Define public routes that should be accessible without authentication
  const publicRoutes = ['/', '/about', '/contact', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // If user is logged in and tries to access login/register, redirect to dashboard
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the route is not public and there is no session cookie, redirect to login
  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
