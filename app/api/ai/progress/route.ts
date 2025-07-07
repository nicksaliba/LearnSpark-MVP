// app/api/ai/progress/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient, LessonStatus } from '@prisma/client'
import { z } from 'zod'
import { withAuth, handleError, successResponse } from '../utils'

const prisma = new PrismaClient()

const updateProgressSchema = z.object({
  lessonId: z.string(),
  status: z.nativeEnum(LessonStatus),
  score: z.number().int().min(0).max(100).optional(),
  timeSpent: z.number().int().nonnegative().optional(),
})

// GET /api/ai/progress
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const progress = await prisma.aIProgress.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: {
          include: {
            module: true
          }
        }
      },
      orderBy: { lastAccessAt: 'desc' }
    })
    
    // Calculate statistics
    const stats = {
      totalLessons: progress.length,
      completedLessons: progress.filter(p => p.status === LessonStatus.COMPLETED).length,
      inProgressLessons: progress.filter(p => p.status === LessonStatus.IN_PROGRESS).length,
      totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      averageScore: progress.filter(p => p.score > 0).reduce((sum, p, _, arr) => 
        sum + p.score / arr.length, 0
      ),
    }
    
    return successResponse({ progress, stats })
  } catch (error) {
    return handleError(error)
  }
})

// POST /api/ai/progress
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const body = await req.json()
    const data = updateProgressSchema.parse(body)
    
    // Upsert progress record
    const progress = await prisma.aIProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: data.lessonId
        }
      },
      update: {
        status: data.status,
        score: data.score ?? undefined,
        timeSpent: data.timeSpent ? { increment: data.timeSpent } : undefined,
        attempts: { increment: 1 },
        completedAt: data.status === LessonStatus.COMPLETED ? new Date() : undefined,
        lastAccessAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: data.lessonId,
        status: data.status,
        score: data.score ?? 0,
        timeSpent: data.timeSpent ?? 0,
        attempts: 1,
        completedAt: data.status === LessonStatus.COMPLETED ? new Date() : undefined,
      },
      include: {
        lesson: true
      }
    })
    
    // Award XP if lesson completed for the first time
    if (data.status === LessonStatus.COMPLETED && progress.attempts === 1) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: progress.lesson.xpReward },
        }
      })
    }
    
    return successResponse(progress)
  } catch (error) {
    return handleError(error)
  }
})