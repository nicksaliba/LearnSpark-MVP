// app/api/ai/projects/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client'
import { z } from 'zod'
import { withAuth, handleError, successResponse } from '../utils'

const prisma = new PrismaClient()

const createProjectSchema = z.object({
  lessonId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  projectType: z.string(),
  projectData: z.any(),
})

// GET /api/ai/projects
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const lessonId = searchParams.get('lessonId')
    const status = searchParams.get('status') as ProjectStatus | null
    const isPublic = searchParams.get('public') === 'true'
    
    const where: any = {}
    
    // Students can only see their own projects unless public
    if (session.user.role === UserRole.STUDENT) {
      if (isPublic) {
        where.isPublic = true
      } else {
        where.userId = session.user.id
      }
    } else if (userId) {
      where.userId = userId
    }
    
    if (lessonId) where.lessonId = lessonId
    if (status) where.status = status
    
    const projects = await prisma.aIProject.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                name: true,
                slug: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    return successResponse({ projects })
  } catch (error) {
    return handleError(error)
  }
})

// POST /api/ai/projects
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const body = await req.json()
    const data = createProjectSchema.parse(body)
    
    // Verify lesson exists and user has access
    const lesson = await prisma.aILesson.findUnique({
      where: { id: data.lessonId }
    })
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }
    
    const project = await prisma.aIProject.create({
      data: {
        ...data,
        userId: session.user.id,
        status: ProjectStatus.DRAFT,
      },
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          }
        }
      }
    })
    
    return successResponse(project, 201)
  } catch (error) {
    return handleError(error)
  }
})