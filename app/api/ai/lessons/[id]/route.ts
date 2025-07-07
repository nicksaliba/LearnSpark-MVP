// app/api/ai/lessons/[id]/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import { withAuth, handleError, successResponse } from '../../utils'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  content: z.any().optional(),
  resources: z.any().optional(),
  isPublished: z.boolean().optional(),
  xpReward: z.number().int().positive().optional(),
})

// GET /api/ai/lessons/[id]
export const GET = withAuth(async (
  req: NextRequest,
  session,
  { params }: { params: { id: string } }
) => {
  try {
    const lesson = await prisma.aILesson.findUnique({
      where: { id: params.id },
      include: {
        module: true,
        progress: {
          where: { userId: session.user.id },
          select: {
            status: true,
            score: true,
            timeSpent: true,
            attempts: true,
            completedAt: true,
            lastAccessAt: true,
          }
        }
      }
    })
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }
    
    // Check access permissions
    if (session.user.role === UserRole.STUDENT && !lesson.isPublished) {
      return NextResponse.json(
        { error: 'Lesson not available' },
        { status: 403 }
      )
    }
    
    // Update last access time
    if (lesson.progress.length > 0) {
      await prisma.aIProgress.update({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: params.id
          }
        },
        data: { lastAccessAt: new Date() }
      })
    }
    
    return successResponse(lesson)
  } catch (error) {
    return handleError(error)
  }
})

// PUT /api/ai/lessons/[id] (Teachers and Admins only)
export const PUT = withAuth(async (
  req: NextRequest,
  session,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await req.json()
    const data = updateLessonSchema.parse(body)
    
    const lesson = await prisma.aILesson.update({
      where: { id: params.id },
      data,
      include: {
        module: true
      }
    })
    
    return successResponse(lesson)
  } catch (error) {
    return handleError(error)
  }
}, [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN])

// DELETE /api/ai/lessons/[id] (Admins only)
export const DELETE = withAuth(async (
  req: NextRequest,
  session,
  { params }: { params: { id: string } }
) => {
  try {
    // Check if lesson has any student progress
    const progressCount = await prisma.aIProgress.count({
      where: { lessonId: params.id }
    })
    
    if (progressCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete lesson with student progress' },
        { status: 400 }
      )
    }
    
    await prisma.aILesson.delete({
      where: { id: params.id }
    })
    
    return successResponse({ message: 'Lesson deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
}, [UserRole.ADMIN, UserRole.SUPER_ADMIN])