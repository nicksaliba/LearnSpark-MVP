// types/next-auth.d.ts - NextAuth TypeScript Declarations (Updated for v5 beta.25)
import { UserRole, GradeLevel } from "@prisma/client"


// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      schoolId: string | null
      gradeLevel: GradeLevel | null
      school: {
        id: string
        name: string
        code: string
      } | null
    } & DefaultSession["user"]
  }

  interface User {
    id?: string | undefined
    email?: string | null | undefined
    name?: string | null
    image?: string | null
    role: UserRole
    schoolId?: string | null | undefined
    gradeLevel?: GradeLevel | null | undefined
    school?: {
      id: string
      name: string
      code: string
    } | null | undefined
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: UserRole
    schoolId?: string | null
    gradeLevel?: GradeLevel | null
    school?: {
      id: string
      name: string
      code: string
    } | null
  }
}