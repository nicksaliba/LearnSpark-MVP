// middleware.ts - Fixed NextAuth Middleware
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  console.log('Middleware - Path:', nextUrl.pathname)
  console.log('Middleware - Is Logged In:', isLoggedIn)
  console.log('Middleware - User:', req.auth?.user?.email || 'No user')

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login', 
    '/register',
    '/auth/error'
  ]
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth/')
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

  // Allow all API auth routes (signin, signout, etc.)
  if (isApiAuthRoute) {
    console.log('Middleware - Allowing API auth route')
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute) {
    console.log('Middleware - Public route')
    // If user is logged in and trying to access login/register, redirect to dashboard
    if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
      console.log('Middleware - Logged in user accessing auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!isLoggedIn) {
    console.log('Middleware - Not logged in, redirecting to login')
    const loginUrl = new URL('/login', nextUrl)
    return NextResponse.redirect(loginUrl)
  }

  console.log('Middleware - Allowing access to protected route')
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}