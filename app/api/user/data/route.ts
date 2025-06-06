// app/api/user/data/route.ts - Comprehensive User Data API
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        xpTotal: true,
        level: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user progress
    const progress = await prisma.userProgress.findMany({
      where: { userId },
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
      }
    })

    // Get user achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            xpReward: true
          }
        }
      },
      orderBy: {
        earnedAt: 'desc'
      }
    })

    // Calculate statistics
    const completedLessons = progress.filter(p => p.status === 'completed')
    const moduleStats = calculateModuleStats(progress)
    const streakData = calculateStreak(completedLessons)
    const xpData = calculateXPProgress(user.xpTotal, user.level)
    const recentActivity = generateRecentActivity(progress, achievements)

    const userData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xpTotal: user.xpTotal,
        joinedAt: user.createdAt
      },
      progress: {
        totalLessons: progress.length,
        completedLessons: completedLessons.length,
        completionRate: progress.length > 0 ? (completedLessons.length / progress.length) * 100 : 0
      },
      modules: moduleStats,
      xp: xpData,
      streak: streakData,
      achievements: {
        total: achievements.length,
        recent: achievements.slice(0, 5).map(ua => ({
          ...ua.achievement,
          earnedAt: ua.earnedAt
        }))
      },
      recentActivity
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('User data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to calculate module statistics
function calculateModuleStats(progress: any[]) {
  const modules = ['code-kingdom', 'ai-citadel', 'chess-arena']
  
  return modules.map(moduleId => {
    const moduleProgress = progress.filter(p => p.lesson.module === moduleId)
    const completed = moduleProgress.filter(p => p.status === 'completed')
    
    return {
      id: moduleId,
      name: getModuleName(moduleId),
      totalLessons: moduleProgress.length,
      completedLessons: completed.length,
      progress: moduleProgress.length > 0 ? (completed.length / moduleProgress.length) * 100 : 0,
      totalXP: completed.reduce((sum, p) => sum + p.lesson.xpReward, 0),
      nextLesson: moduleProgress.find(p => p.status !== 'completed')?.lesson || null
    }
  })
}

// Helper function to calculate learning streak
function calculateStreak(completedLessons: any[]) {
  if (completedLessons.length === 0) {
    return { current: 0, longest: 0, lastActiveDate: null }
  }

  // Sort by completion date
  const sorted = completedLessons.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )

  const today = new Date()
  const lastActivity = new Date(sorted[0].completedAt)
  
  // Simple streak calculation (days with activity)
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  )

  // For now, return a simple streak based on recent activity
  const currentStreak = daysSinceLastActivity <= 1 ? 7 : 0 // Mock for demo
  
  return {
    current: currentStreak,
    longest: Math.max(currentStreak, 15), // Mock longest streak
    lastActiveDate: lastActivity.toISOString().split('T')[0]
  }
}

// Helper function to calculate XP progress
function calculateXPProgress(totalXP: number, level: number) {
  // Level formula: Level = floor(sqrt(XP / 100)) + 1
  // Reverse: XP for level = (level - 1)^2 * 100
  const currentLevelXP = Math.pow(level - 1, 2) * 100
  const nextLevelXP = Math.pow(level, 2) * 100
  const currentXP = totalXP - currentLevelXP
  const xpToNextLevel = nextLevelXP - currentLevelXP

  return {
    level,
    currentXP,
    xpToNextLevel,
    totalXP,
    percentage: (currentXP / xpToNextLevel) * 100
  }
}

// Helper function to generate recent activity
function generateRecentActivity(progress: any[], achievements: any[]) {
  const activities: any = []

  // Add recent lesson completions
  const recentCompletions = progress
    .filter(p => p.status === 'completed' && p.completedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3)

  recentCompletions.forEach(completion => {
    activities.push({
      type: 'lesson_completed',
      title: `Completed "${completion.lesson.title}"`,
      description: `${getModuleName(completion.lesson.module)} • Lesson ${completion.lesson.orderIndex}`,
      timestamp: completion.completedAt,
      icon: 'CheckCircle'
    })
  })

  // Add recent achievements
  achievements.slice(0, 2).forEach(ua => {
    activities.push({
      type: 'achievement_earned',
      title: `Earned "${ua.achievement.name}"`,
      description: ua.achievement.description,
      timestamp: ua.earnedAt,
      icon: 'Trophy'
    })
  })

  // Sort by timestamp and return latest 5
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
}

// Helper function to get module display names
function getModuleName(moduleId: string): string {
  const names = {
    'code-kingdom': 'Code Kingdom',
    'ai-citadel': 'AI Citadel',
    'chess-arena': 'Chess Arena'
  }
  return names[moduleId as keyof typeof names] || moduleId
}