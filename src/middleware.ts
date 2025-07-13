import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session-id')
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/dashboard', '/quiz', '/chatbot', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isAuthPage) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (isProtectedRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
