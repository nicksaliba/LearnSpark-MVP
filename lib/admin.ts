// lib/admin.ts - Enhanced Admin Authentication Utils
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { cache } from 'react'
import { ADMIN_ROLES, TEACHER_ROLES, isAdminRole, isTeacherRole, isSuperAdminRole } from '@/lib/roles'

// Cache the user lookup to avoid multiple database calls in the same request
export const getUserWithRole = cache(async () => {
  try {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        username: true,
        role: true,
        schoolId: true,
        avatarUrl: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            districtId: true,
            district: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
})

export const isAdmin = cache(async () => {
  const user = await getUserWithRole()
  return user ? isAdminRole(user.role) : false
})

export const isTeacher = cache(async () => {
  const user = await getUserWithRole()
  return user ? isTeacherRole(user.role) : false
})

export const isSuperAdmin = cache(async () => {
  const user = await getUserWithRole()
  return user ? isSuperAdminRole(user.role) : false
})

export const isStudent = cache(async () => {
  const user = await getUserWithRole()
  return user?.role === UserRole.STUDENT
})

export const getSchoolContext = cache(async () => {
  const user = await getUserWithRole()
  if (!user?.schoolId) return null
  
  return {
    schoolId: user.schoolId,
    school: user.school,
    canManageSchool: isAdminRole(user.role),
    canManageDistrict: isSuperAdminRole(user.role) && user.school?.districtId,
    districtId: user.school?.districtId || null,
    district: user.school?.district || null
  }
})

// Get user permissions for specific resources
export const getUserPermissions = cache(async () => {
  const user = await getUserWithRole()
  if (!user) return null

  const basePermissions = {
    // Basic permissions
    canViewDashboard: true,
    canViewProfile: true,
    
    // User management
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllUsers: false,
    
    // Content management
    canCreateLessons: false,
    canEditLessons: false,
    canDeleteLessons: false,
    canManageAchievements: false,
    
    // School/District management
    canManageSchool: false,
    canManageDistrict: false,
    canViewSchoolAnalytics: false,
    canViewDistrictAnalytics: false,
    
    // System administration
    canManageSystem: false,
    canViewSystemHealth: false,
    canManageSecurity: false,
    
    // Teaching tools
    canCreateAssignments: false,
    canGradeAssignments: false,
    canUseAIAssistant: false,
    canAccessTeacherResources: false
  }

  switch (user.role) {
    case UserRole.STUDENT:
      return {
        ...basePermissions,
        canViewDashboard: true,
        canViewProfile: true
      }

    case UserRole.TEACHER:
      return {
        ...basePermissions,
        canCreateAssignments: true,
        canGradeAssignments: true,
        canUseAIAssistant: true,
        canAccessTeacherResources: true,
        canViewSchoolAnalytics: false, // Only basic analytics
        canEditUsers: false, // Can only edit their own students
        canCreateUsers: true // Can create student accounts
      }

    case UserRole.ADMIN:
      return {
        ...basePermissions,
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canViewAllUsers: true,
        canCreateLessons: true,
        canEditLessons: true,
        canDeleteLessons: true,
        canManageAchievements: true,
        canManageSchool: true,
        canViewSchoolAnalytics: true,
        canCreateAssignments: true,
        canGradeAssignments: true,
        canUseAIAssistant: true,
        canAccessTeacherResources: true
      }

    case UserRole.SUPER_ADMIN:
      return {
        ...basePermissions,
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canViewAllUsers: true,
        canCreateLessons: true,
        canEditLessons: true,
        canDeleteLessons: true,
        canManageAchievements: true,
        canManageSchool: true,
        canManageDistrict: true,
        canViewSchoolAnalytics: true,
        canViewDistrictAnalytics: true,
        canManageSystem: true,
        canViewSystemHealth: true,
        canManageSecurity: true,
        canCreateAssignments: true,
        canGradeAssignments: true,
        canUseAIAssistant: true,
        canAccessTeacherResources: true
      }

    default:
      return basePermissions
  }
})

// Check if user can access a specific school
export async function canAccessSchool(schoolId: string): Promise<boolean> {
  const user = await getUserWithRole()
  if (!user) return false

  // Super admins can access all schools
  if (isSuperAdminRole(user.role)) return true

  // Users can only access their own school
  return user.schoolId === schoolId
}

// Check if user can access a specific district
export async function canAccessDistrict(districtId: string): Promise<boolean> {
  const user = await getUserWithRole()
  if (!user) return false

  // Only super admins can access district data
  if (!isSuperAdminRole(user.role)) return false

  // Check if user's school belongs to this district
  return user.school?.districtId === districtId
}

// Get accessible schools for the current user
export const getAccessibleSchools = cache(async () => {
  const user = await getUserWithRole()
  if (!user) return []

  try {
    if (isSuperAdminRole(user.role)) {
      // Super admins can access all schools
      return await prisma.school.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          districtId: true,
          district: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else if (user.schoolId) {
      // Other users can only access their own school
      const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: {
          id: true,
          name: true,
          code: true,
          districtId: true,
          district: {
            select: {
              name: true
            }
          }
        }
      })
      return school ? [school] : []
    }

    return []
  } catch (error) {
    console.error('Error fetching accessible schools:', error)
    return []
  }
})

// Get user's dashboard redirect URL based on role
export function getDashboardUrl(role: UserRole): string {
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

// Format user display name
export function formatUserName(user: { username?: string | null; email: string }): string {
  return user.username || user.email.split('@')[0]
}

// Check if user needs to complete onboarding
export async function needsOnboarding(): Promise<boolean> {
  const user = await getUserWithRole()
  if (!user) return false

  // Add your onboarding completion logic here
  // For example, check if user has completed profile setup
  return false
}

// Get user's current context for navigation
export const getUserContext = cache(async () => {
  const user = await getUserWithRole()
  if (!user) return null

  const permissions = await getUserPermissions()
  const schoolContext = await getSchoolContext()

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      displayName: formatUserName(user)
    },
    permissions,
    school: schoolContext,
    dashboardUrl: getDashboardUrl(user.role),
    needsOnboarding: await needsOnboarding()
  }
})

// Role hierarchy check
export function isHigherRole(currentRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.STUDENT]: 0,
    [UserRole.TEACHER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3
  }

  return roleHierarchy[currentRole] > roleHierarchy[targetRole]
}

// Export types for better TypeScript support
export type UserWithRole = NonNullable<Awaited<ReturnType<typeof getUserWithRole>>>
export type UserPermissions = NonNullable<Awaited<ReturnType<typeof getUserPermissions>>>
export type SchoolContext = NonNullable<Awaited<ReturnType<typeof getSchoolContext>>>
export type UserContext = NonNullable<Awaited<ReturnType<typeof getUserContext>>>