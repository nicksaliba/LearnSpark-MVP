
// app/api/admin/users/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import { withAuth, handleError, successResponse } from '@/app/api/ai/utils'
import { z } from 'zod'

const prisma = new PrismaClient()

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  school: z.string().optional()
})

export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const params = querySchema.parse(Object.fromEntries(searchParams))
    
    const where: any = {}
    
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { username: { contains: params.search, mode: 'insensitive' } }
      ]
    }
    
    if (params.role) {
      where.role = params.role
    }
    
    if (params.status) {
      where.isActive = params.status === 'active'
    }
    
    if (params.school) {
      where.schoolId = params.school
    }
    
    // School admins can only see users from their school
    if (session.user.role === UserRole.ADMIN && session.user.schoolId) {
      where.schoolId = session.user.schoolId
    }
    
    const skip = (params.page - 1) * params.limit
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          school: {
            include: {
              district: true
            }
          },
          _count: {
            select: {
              aiProgress: true,
              aiProjects: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
    
    return successResponse({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        school: user.school,
        isActive: user.verified,
        lastActive: user.updatedAt,
        stats: {
          lessonsCompleted: user._count.aiProgress,
          projectsCreated: user._count.aiProjects
        }
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit)
      }
    })
  } catch (error) {
    return handleError(error)
  }
}, [UserRole.ADMIN, UserRole.SUPER_ADMIN])