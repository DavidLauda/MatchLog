import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-local-dev-only'
const key = new TextEncoder().encode(secretKey)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup'

  // Get the token from cookies
  const token = request.cookies.get('matchlog_session')?.value

  let isAuthenticated = false
  if (token) {
    try {
      await jwtVerify(token, key, { algorithms: ['HS256'] })
      isAuthenticated = true
    } catch (err) {
      // Invalid or expired token
      isAuthenticated = false
    }
  }

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublicPath && !isAuthenticated && !path.startsWith('/_next') && !path.startsWith('/api') && !path.includes('.')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
