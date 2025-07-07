// lib/auth-guards.ts - Role-based access control
import { auth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth()
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized')
  }
  
  return session
}

export async function requireTeacher() {
  return requireRole([UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function requireSuperAdmin() {
  return requireRole([UserRole.SUPER_ADMIN])
}

// Check if user has access to specific grade level content
export async function canAccessGradeLevel(targetGradeLevel: string) {
  const session = await requireAuth()
  
  // Teachers and admins can access all grade levels
  if ([UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)) {
    return true
  }
  
  // Students can only access their grade level
  return session.user.gradeLevel === targetGradeLevel
}

// Check if user belongs to a specific school
export async function requireSchoolMembership(schoolId: string) {
  const session = await requireAuth()
  
  if (session.user.role === UserRole.SUPER_ADMIN) {
    return session
  }
  
  if (session.user.schoolId !== schoolId) {
    redirect('/unauthorized')
  }
  
  return session
}