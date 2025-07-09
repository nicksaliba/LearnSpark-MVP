// lib/auth-guards.ts - Updated Role-based access control
import { auth } from '@/lib/auth'
import { UserRole, GradeLevel } from '@prisma/client'
import { redirect } from 'next/navigation'
import { ADMIN_ROLES, TEACHER_ROLES, isAdminRole, isTeacherRole, isSuperAdminRole } from '@/lib/roles'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth()
  
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized')
  }
  
  return session
}

export async function requireTeacher() {
  return requireRole(TEACHER_ROLES)
}

export async function requireAdmin() {
  return requireRole(ADMIN_ROLES)
}

export async function requireSuperAdmin() {
  return requireRole([UserRole.SUPER_ADMIN])
}

// Check if user has access to specific grade level content
export async function canAccessGradeLevel(targetGradeLevel: GradeLevel) {
  const session = await requireAuth()
  
  // Teachers and admins can access all grade levels
  if (isTeacherRole(session.user.role)) {
    return true
  }
  
  // Students can only access their grade level
  return session.user.gradeLevel === targetGradeLevel
}

// Check if user belongs to a specific school
export async function requireSchoolMembership(schoolId: string) {
  const session = await requireAuth()
  
  // Super admins can access all schools
  if (isSuperAdminRole(session.user.role)) {
    return session
  }
  
  // Check if user belongs to the school
  if (session.user.schoolId !== schoolId) {
    redirect('/unauthorized')
  }
  
  return session
}

// Check if user can manage a specific school
export async function canManageSchool(schoolId?: string) {
  const session = await requireAuth()
  
  // Super admins can manage all schools
  if (isSuperAdminRole(session.user.role)) {
    return true
  }
  
  // School admins can only manage their own school
  if (isAdminRole(session.user.role) && session.user.schoolId) {
    return !schoolId || session.user.schoolId === schoolId
  }
  
  return false
}

// Check if user can access admin features
export async function requireAdminAccess() {
  const session = await requireAuth()
  
  if (!isAdminRole(session.user.role)) {
    redirect('/dashboard')
  }
  
  return session
}

// Check if user can access teacher features
export async function requireTeacherAccess() {
  const session = await requireAuth()
  
  if (!isTeacherRole(session.user.role)) {
    redirect('/dashboard')
  }
  
  return session
}

// Get user's default dashboard route based on role
export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return '/ai-modules'
    case UserRole.TEACHER:
      return '/teacher'
    case UserRole.ADMIN:
      return '/admin'
    case UserRole.SUPER_ADMIN:
      return '/admin'
    default:
      return '/dashboard'
  }
}

// Redirect user to appropriate dashboard
export async function redirectToDashboard() {
  const session = await auth()
  
  if (!session?.user?.role) {
    redirect('/login')
  }
  
  const route = getDefaultRoute(session.user.role)
  redirect(route)
}

// Check if user is authenticated (for API routes)
export async function getAuthenticatedUser() {
  const session = await auth()
  return session?.user || null
}

// Validate user permissions for API routes
export async function validateApiAccess(requiredRoles: UserRole[]) {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }
  
  if (!requiredRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  
  return { user, error: null, status: 200 }
}

// School-specific API access validation
export async function validateSchoolAccess(schoolId: string) {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }
  
  // Super admins can access all schools
  if (user.role === UserRole.SUPER_ADMIN) {
    return { user, error: null, status: 200 }
  }
  
  // Other users can only access their own school
  if (user.schoolId !== schoolId) {
    return { error: 'Forbidden - School access denied', status: 403 }
  }
  
  return { user, error: null, status: 200 }
}