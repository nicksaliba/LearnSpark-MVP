// types/roles.ts - Role Type Helpers
import { UserRole } from '@prisma/client'

// Subset types for specific role groups
export type StudentOrTeacherRole = Extract<UserRole, 'STUDENT' | 'TEACHER'>
export type AdminRole = Extract<UserRole, 'ADMIN' | 'SUPER_ADMIN'>
export type TeacherOrAdminRole = Extract<UserRole, 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'>

// Type guards
export function isStudentOrTeacher(role: UserRole): role is StudentOrTeacherRole {
  return role === 'STUDENT' || role === 'TEACHER'
}

export function isAdminRoleType(role: UserRole): role is AdminRole {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

// Helper to safely cast or validate roles
export function asStudentOrTeacher(role: UserRole): StudentOrTeacherRole | null {
  if (isStudentOrTeacher(role)) {
    return role
  }
  return null
}

// For functions that need to accept any role but handle specific subsets
export function handleRoleSpecific<T>(
  role: UserRole,
  handlers: {
    student?: () => T
    teacher?: () => T
    admin?: () => T
    superAdmin?: () => T
    default?: () => T
  }
): T | undefined {
  switch (role) {
    case UserRole.STUDENT:
      return handlers.student?.() || handlers.default?.()
    case UserRole.TEACHER:
      return handlers.teacher?.() || handlers.default?.()
    case UserRole.ADMIN:
      return handlers.admin?.() || handlers.default?.()
    case UserRole.SUPER_ADMIN:
      return handlers.superAdmin?.() || handlers.default?.()
    default:
      return handlers.default?.()
  }
}