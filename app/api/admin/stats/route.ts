// app/api/admin/stats/route.ts - Admin Statistics API
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Check admin access
    await requireAdmin()

    // Get basic counts
    const [
      totalUsers,
      totalLessons,
      totalAchievements,
      totalProgress,
      recentUsers,
      recentProgress,
      recentAchievements
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.achievement.count(),
      prisma.userProgress.count({
        where: { status: 'completed' }
      }),
      // Active users in last 30 days
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Recent lesson completions
      prisma.userProgress.findMany({
        where: {
          status: 'completed',
          completedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: { id: true, username: true }
          },
          lesson: {
            select: { title: true, module: true }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: 20
      }),
      // Recent achievements
      prisma.userAchievement.findMany({
        where: {
          earnedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: { id: true, username: true }
          },
          achievement: {
            select: { name: true, description: true }
          }
        },
        orderBy: { earnedAt: 'desc' },
        take: 10
      })
    ])

    // Build recent activity feed
    const recentActivity:any = []

    // Add lesson completions
    recentProgress.forEach(progress => {
      recentActivity.push({
        type: 'lesson_completed',
        description: `Completed "${progress.lesson.title}" in ${progress.lesson.module}`,
        timestamp: progress.completedAt?.toISOString() || new Date().toISOString(),
        userId: progress.user.id,
        userName: progress.user.username
      })
    })

    // Add achievements
    recentAchievements.forEach(achievement => {
      recentActivity.push({
        type: 'achievement_earned',
        description: `Earned "${achievement.achievement.name}" achievement`,
        timestamp: achievement.earnedAt.toISOString(),
        userId: achievement.user.id,
        userName: achievement.user.username
      })
    })

    // Sort by timestamp
    recentActivity.sort((a:any, b:any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    const stats = {
      totalUsers,
      totalLessons,
      totalAchievements,
      activeUsers: recentUsers,
      lessonsCompleted: totalProgress,
      recentActivity: recentActivity.slice(0, 15)
    }

    return NextResponse.json(stats)

  } catch (error:any) {
    console.error('Admin stats error:', error)
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}