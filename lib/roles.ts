// lib/roles.ts - Role constants and utilities
import { UserRole } from "@prisma/client"

// Properly typed role arrays
export const ADMIN_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const
export const TEACHER_ROLES: UserRole[] = [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN] as const
export const STUDENT_ROLES: UserRole[] = [UserRole.STUDENT] as const
export const ALL_ROLES: UserRole[] = [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN] as const

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.STUDENT]: 0,
  [UserRole.TEACHER]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3
} as const

// Role checking utilities
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

export function isTeacherRole(role: UserRole): boolean {
  return TEACHER_ROLES.includes(role)
}

export function isStudentRole(role: UserRole): boolean {
  return role === UserRole.STUDENT
}

export function isSuperAdminRole(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN
}

// Check if one role has higher permissions than another
export function hasHigherRole(currentRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[targetRole]
}

// Check if role can manage another role
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  // Super admins can manage everyone
  if (managerRole === UserRole.SUPER_ADMIN) return true
  
  // Admins can manage teachers and students
  if (managerRole === UserRole.ADMIN) {
    return [UserRole.TEACHER, UserRole.STUDENT].includes(targetRole)
  }
  
  // Teachers can manage students
  if (managerRole === UserRole.TEACHER) {
    return targetRole === UserRole.STUDENT
  }
  
  return false
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'Student'
    case UserRole.TEACHER:
      return 'Teacher'
    case UserRole.ADMIN:
      return 'School Admin'
    case UserRole.SUPER_ADMIN:
      return 'Super Admin'
    default:
      return 'Unknown'
  }
}

// Get role color for UI
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'bg-blue-100 text-blue-800'
    case UserRole.TEACHER:
      return 'bg-green-100 text-green-800'
    case UserRole.ADMIN:
      return 'bg-purple-100 text-purple-800'
    case UserRole.SUPER_ADMIN:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get role description
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'Can access learning modules and create projects'
    case UserRole.TEACHER:
      return 'Can manage students, create assignments, and access teaching tools'
    case UserRole.ADMIN:
      return 'Can manage school users, content, and settings'
    case UserRole.SUPER_ADMIN:
      return 'Full platform access including district management'
    default:
      return ''
  }
}

// Validate role transition
export function canChangeRoleTo(currentRole: UserRole, newRole: UserRole, changerRole: UserRole): boolean {
  // Can't change your own role to a higher level
  if (hasHigherRole(newRole, changerRole)) return false
  
  // Must be able to manage both the current and new roles
  return canManageRole(changerRole, currentRole) && canManageRole(changerRole, newRole)
}

// Get available roles for a user to assign
export function getAssignableRoles(assignerRole: UserRole): UserRole[] {
  switch (assignerRole) {
    case UserRole.SUPER_ADMIN:
      return ALL_ROLES
    case UserRole.ADMIN:
      return [UserRole.STUDENT, UserRole.TEACHER]
    case UserRole.TEACHER:
      return [UserRole.STUDENT]
    default:
      return []
  }
}