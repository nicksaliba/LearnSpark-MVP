// lib/auth.ts - NextAuth v5 Configuration (Updated for beta.25)
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password } = loginSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              username: true,
              passwordHash: true,
              role: true,
              avatarUrl: true,
              schoolId: true,
              gradeLevel: true,
              school: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
          
          if (!isPasswordValid) {
            return null
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
          }).catch(console.error)

          // Return user data that will be stored in the token
          return {
            id: user.id,
            email: user.email,
            name: user.username || user.email.split('@')[0],
            image: user.avatarUrl,
            role: user.role,
            schoolId: user.schoolId,
            gradeLevel: user.gradeLevel,
            school: user.school
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - store user data in token
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
        token.gradeLevel = user.gradeLevel
        token.school = user.school
      }

      // Handle session updates (when user data changes)
      if (trigger === "update" && session && token.sub) {
        try {
          // Refresh user data from database
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              role: true,
              username: true,
              avatarUrl: true,
              schoolId: true,
              gradeLevel: true,
              school: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          })

          if (dbUser) {
            token.role = dbUser.role
            token.name = dbUser.username || token.email?.split('@')[0]
            token.picture = dbUser.avatarUrl
            token.schoolId = dbUser.schoolId
            token.gradeLevel = dbUser.gradeLevel
            token.school = dbUser.school
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }

      return token
    },
    
    async session({ session, token }) {
      // Add custom fields to session from JWT token
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as UserRole
        session.user.schoolId = token.schoolId as string | null
        session.user.gradeLevel = token.gradeLevel as string | null
        session.user.school = token.school as any
      }
      return session
    },

    // Control where users are redirected after sign in
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // If the URL is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Otherwise redirect to base URL
      return baseUrl
    },

    // Handle authorization for pages
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
      
      // Allow access to auth pages when not logged in
      if (isAuthPage) {
        return !isLoggedIn
      }
      
      // Require authentication for all other pages
      return isLoggedIn
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`)
      }
      
      // Log sign in event (optional)
      try {
        if (user.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
          })
        }
      } catch (error) {
        console.error('Error logging sign in:', error)
      }
    },
    
    async signOut({ token }) {
      if (token?.email) {
        console.log(`User signed out: ${token.email}`)
      }
    }
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  // Security
  secret: process.env.NEXTAUTH_SECRET,
  
  // Trust host for deployment
  trustHost: true,
  
  // Experimental features for NextAuth beta
  experimental: {
    enableWebAuthn: false,
  }
})