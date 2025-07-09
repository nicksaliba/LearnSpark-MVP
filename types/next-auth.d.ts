// types/next-auth.d.ts - NextAuth TypeScript Declarations (Updated for v5 beta.25)
import { UserRole, GradeLevel } from "@prisma/client"

declare module "next-auth" {
  interface Session {
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
    } & {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    role: UserRole
    schoolId: string | null
    gradeLevel: GradeLevel | null
    school: {
      id: string
      name: string
      code: string
    } | null
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
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