// app/api/user/progress/route.ts - User Progress API
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const progressUpdateSchema = z.object({
  lessonId: z.string(),
  status: z.enum(['in_progress', 'completed']),
  score: z.number().min(0).max(100).optional(),
  codeSubmission: z.string().optional(),
})

// GET /api/user/progress - Get user's learning progress
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: true,
            xpReward: true,
            orderIndex: true
          }
        }
      },
      orderBy: {
        lesson: {
          orderIndex: 'asc'
        }
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/progress - Update user progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, status, score, codeSubmission } = progressUpdateSchema.parse(body)

    // Check if progress record exists
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      }
    })

    let xpEarned = 0
    let newLevel = 0

    // Get lesson details for XP calculation
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Calculate XP earned (only for first completion)
    if (status === 'completed' && (!existingProgress || existingProgress.status !== 'completed')) {
      xpEarned = lesson.xpReward
      
      // Apply score multiplier if provided
      if (score !== undefined) {
        xpEarned = Math.round(xpEarned * (score / 100))
      }

      // Update user's total XP and level
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (user) {
        const newTotalXP = user.xpTotal + xpEarned
        newLevel = calculateLevel(newTotalXP)

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xpTotal: newTotalXP,
            level: newLevel
          }
        })
      }
    }

    // Upsert progress record
    const updatedProgress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      },
      update: {
        status,
        score: score || 0,
        attempts: existingProgress ? existingProgress.attempts + 1 : 1,
        codeSubmissions: codeSubmission ? {
          [new Date().toISOString()]: codeSubmission
        } : undefined,
        completedAt: status === 'completed' ? new Date() : undefined
      },
      create: {
        userId: session.user.id,
        lessonId,
        status,
        score: score || 0,
        attempts: 1,
        codeSubmissions: codeSubmission ? {
          [new Date().toISOString()]: codeSubmission
        } : undefined,
        completedAt: status === 'completed' ? new Date() : undefined
      }
    })

    // Check for achievements
    const newAchievements = await checkAndAwardAchievements(session.user.id)

    return NextResponse.json({
      progress: updatedProgress,
      xpEarned,
      newLevel,
      achievements: newAchievements
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate level from XP
function calculateLevel(xp: number): number {
  // Level formula: Level = floor(sqrt(XP / 100)) + 1
  // This means: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

// Helper function to check and award achievements
async function checkAndAwardAchievements(userId: string) {
  const newAchievements = []

  try {
    // Get user's current progress
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: { lesson: true }
    })

    const completedLessons = userProgress.filter(p => p.status === 'completed')
    
    // Get all achievements
    const achievements = await prisma.achievement.findMany()
    
    // Get user's existing achievements
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId }
    })
    const existingIds = existingAchievements.map(a => a.achievementId)

    for (const achievement of achievements) {
      // Skip if already earned
      if (existingIds.includes(achievement.id)) continue

      let shouldAward = false

      // Check achievement criteria
      const criteria = achievement.criteria as any

      switch (criteria.type) {
        case 'lesson_completed':
          shouldAward = completedLessons.length >= criteria.count
          break
        
        case 'function_written':
          // Check if any completed lesson involved functions
          const functionLessons = completedLessons.filter(p => 
            p.lesson.title.toLowerCase().includes('function')
          )
          shouldAward = functionLessons.length >= criteria.count
          break
        
        case 'ai_lesson_completed':
          const aiLessons = completedLessons.filter(p => 
            p.lesson.module === 'ai-citadel'
          )
          shouldAward = aiLessons.length >= criteria.count
          break
        
        // Add more criteria types as needed
      }

      if (shouldAward) {
        // Award achievement
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })

        // Add XP reward
        await prisma.user.update({
          where: { id: userId },
          data: {
            xpTotal: {
              increment: achievement.xpReward
            }
          }
        })

        newAchievements.push(achievement)
      }
    }
  } catch (error) {
    console.error('Achievement check error:', error)
  }

  return newAchievements
}