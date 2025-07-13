// lib/auth.ts - Fixed NextAuth v5 Configuration with Proper Types
import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { UserRole, GradeLevel } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { JWT } from "next-auth/jwt"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Auth attempt with:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
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
            console.log('❌ User not found:', email);
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return null
          }

          console.log('✅ Auth successful for:', email);

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() }
          }).catch(console.error)

          // Return user data for JWT token
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
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🔐 JWT callback - trigger:', trigger, 'user:', !!user);
      
      // Initial sign in - store user data in token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.role = user.role
        token.schoolId = user.schoolId
        token.gradeLevel = user.gradeLevel
        token.school = user.school
      }

      // Handle session updates
      if (trigger === "update" && session && token.sub) {
        try {
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
    
    async session({ session, token }: { session: any; token: JWT }) {
      console.log('🔐 Session callback - token.sub:', token.sub);
      
      // Add custom fields to session from JWT token
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as UserRole
        session.user.schoolId = token.schoolId as string | null
        session.user.gradeLevel = token.gradeLevel as GradeLevel | null
        session.user.school = token.school as any
      }
      
      return session
    },

    // Control where users are redirected after sign in
    async redirect({ url, baseUrl }) {
      console.log('🔐 Redirect callback - url:', url, 'baseUrl:', baseUrl);
      
      // Always allow callback URLs
      if (url.includes('/api/auth/callback')) {
        return url
      }
      
      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // If the URL is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`
    }
  },
  events: {
    async signIn({ user, isNewUser }) {
      console.log('🔐 Sign in event - user:', user.email, 'isNew:', isNewUser);
    },
    
     async signOut(message) {
      console.log('🔐 Sign out event');
      if ('token' in message && message.token) {
        console.log('🔐 Sign out - user:', message.token.email);
      }
    }
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  // Security
  secret: process.env.NEXTAUTH_SECRET,
  
  // Trust host for deployment
  trustHost: true,
})