// app/api/ai/lessons/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient, UserRole, GradeLevel } from '@prisma/client'
import { z } from 'zod'
import { withAuth, handleError, successResponse } from '../utils'

const prisma = new PrismaClient()

// Validation schemas
const querySchema = z.object({
  gradeLevel: z.nativeEnum(GradeLevel).optional(),
  moduleId: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
})

const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  moduleId: z.string(),
  gradeLevel: z.nativeEnum(GradeLevel),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  orderIndex: z.number().int().positive(),
  xpReward: z.number().int().positive(),
  estimatedTime: z.number().int().positive(),
  content: z.object({
    objectives: z.array(z.string()).min(1),
    theory: z.string(),
    activities: z.array(z.any()).optional(),
  }),
  resources: z.any().optional(),
})

// GET /api/ai/lessons
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const params = querySchema.parse(Object.fromEntries(searchParams))
    
    // Build where clause based on user role and params
    const where: any = {}
    
    if (params.gradeLevel) {
      where.gradeLevel = params.gradeLevel
    }
    
    if (params.moduleId) {
      where.moduleId = params.moduleId
    }
    
    // Students can only see published lessons
    if (session.user.role === UserRole.STUDENT) {
      where.isPublished = true
    }
    
    // Pagination
    const skip = (params.page - 1) * params.limit
    const take = params.limit
    
    const [lessons, total] = await Promise.all([
      prisma.aILesson.findMany({
        where,
        skip,
        take,
        include: {
          module: true,
          progress: {
            where: { userId: session.user.id },
            select: {
              status: true,
              score: true,
              completedAt: true,
            }
          }
        },
        orderBy: [
          { module: { orderIndex: 'asc' } },
          { orderIndex: 'asc' }
        ]
      }),
      prisma.aILesson.count({ where })
    ])
    
    return successResponse({
      lessons,
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
})

// POST /api/ai/lessons (Teachers and Admins only)
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const body = await req.json()
    const data = createLessonSchema.parse(body)
    
    const lesson = await prisma.aILesson.create({
      data: {
        ...data,
        isPublished: false, // Start as draft
      },
      include: {
        module: true
      }
    })
    
    return successResponse(lesson, 201)
  } catch (error) {
    return handleError(error)
  }
}, [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN])