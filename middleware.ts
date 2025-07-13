// middleware.ts - Fixed NextAuth Middleware for v5
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user

  console.log('🔐 Middleware - Path:', nextUrl.pathname)
  console.log('🔐 Middleware - Is Logged In:', isLoggedIn)
  console.log('🔐 Middleware - User:', req.auth?.user?.email || 'No user')

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login', 
    '/register',
    '/auth/error'
  ]
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth/')
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isPublicFile = nextUrl.pathname.includes('.')

  // Allow public files (images, etc.)
  if (isPublicFile) {
    return NextResponse.next()
  }

  // Allow all API auth routes (signin, signout, etc.)
  if (isApiAuthRoute) {
    console.log('🔐 Middleware - Allowing API auth route')
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute) {
    console.log('🔐 Middleware - Public route')
    // If user is logged in and trying to access login/register, redirect to dashboard
    if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
      console.log('🔐 Middleware - Logged in user accessing auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!isLoggedIn) {
    console.log('🔐 Middleware - Not logged in, redirecting to login')
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  console.log('🔐 Middleware - Allowing access to protected route')
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}