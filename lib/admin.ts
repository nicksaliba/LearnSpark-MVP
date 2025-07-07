// lib/admin.ts - Enhanced Admin Authentication Utils
import { auth } from '@/lib/auth'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserWithRole() {
  try {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        role: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            name: true,
            districtId: true
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

export async function isAdmin() {
  const user = await getUserWithRole()
  return user ? [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role) : false
}

export async function isTeacher() {
  const user = await getUserWithRole()
  return user ? [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role) : false
}

export async function isSuperAdmin() {
  const user = await getUserWithRole()
  return user?.role === UserRole.SUPER_ADMIN
}

export async function getSchoolContext() {
  const user = await getUserWithRole()
  if (!user?.schoolId) return null
  
  return {
    schoolId: user.schoolId,
    school: user.school,
    canManageSchool: [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role),
    canManageDistrict: user.role === UserRole.SUPER_ADMIN && user.school?.districtId
  }
}