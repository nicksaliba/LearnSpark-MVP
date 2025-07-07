// app/api/ai/achievements/check/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAuth, successResponse } from '../../utils'

const prisma = new PrismaClient()

// Achievement definitions
const achievements = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first AI lesson',
    icon: '🎯',
    xpReward: 50,
    rarity: 'common' as const,
    condition: (stats: any) => stats.lessonsCompleted >= 1
  },
  {
    id: 'streak-3',
    title: 'On Fire!',
    description: 'Learn for 3 days in a row',
    icon: '🔥',
    xpReward: 100,
    rarity: 'rare' as const,
    condition: (stats: any) => stats.currentStreak >= 3
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Score 100% on any lesson',
    icon: '💯',
    xpReward: 150,
    rarity: 'rare' as const,
    condition: (stats: any) => stats.hasPerfectScore
  },
  {
    id: 'ai-master',
    title: 'AI Master',
    description: 'Complete all lessons in a module',
    icon: '🧠',
    xpReward: 500,
    rarity: 'epic' as const,
    condition: (stats: any) => stats.completedModules >= 1
  }
]

export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    // Get user's current achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true }
    })
    
    const unlockedIds = new Set(userAchievements.map(a => a.achievementId))
    
    // Get user stats
    const progress = await prisma.aIProgress.findMany({
      where: { userId: session.user.id },
      include: { lesson: { include: { module: true } } }
    })
    
    const stats = {
      lessonsCompleted: progress.filter(p => p.status === 'COMPLETED').length,
      currentStreak: calculateStreak(progress),
      hasPerfectScore: progress.some(p => p.score === 100),
      completedModules: calculateCompletedModules(progress)
    }
    
    // Check for new achievements
    const newAchievements = []
    
    for (const achievement of achievements) {
      if (!unlockedIds.has(achievement.id) && achievement.condition(stats)) {
        // Unlock achievement
        await prisma.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: achievement.id,
            unlockedAt: new Date()
          }
        })
        
        // Award XP
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xpTotal: { increment: achievement.xpReward } }
        })
        
        newAchievements.push(achievement)
      }
    }
    
    return successResponse({ newAchievements })
  } catch (error) {
    return handleError(error)
  }
})

function calculateStreak(progress: any[]): number {
  // Implementation of streak calculation
  const completedDates = progress
    .filter(p => p.completedAt)
    .map(p => p.completedAt.toDateString())
    .sort()
    .reverse()
  
  if (completedDates.length === 0) return 0
  
  let streak = 1
  const today = new Date()
  let checkDate = new Date(today)
  checkDate.setDate(checkDate.getDate() - 1)
  
  for (let i = 0; i < completedDates.length - 1; i++) {
    if (completedDates[i] === checkDate.toDateString()) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

function calculateCompletedModules(progress: any[]): number {
  const moduleProgress = new Map()
  
  progress.forEach(p => {
    const moduleId = p.lesson.moduleId
    if (!moduleProgress.has(moduleId)) {
      moduleProgress.set(moduleId, { total: 0, completed: 0 })
    }
    
    const stats = moduleProgress.get(moduleId)
    stats.total++
    if (p.status === 'COMPLETED') {
      stats.completed++
    }
  })
  
  let completedModules = 0
  moduleProgress.forEach(stats => {
    if (stats.completed === stats.total && stats.total > 0) {
      completedModules++
    }
  })
  
  return completedModules
}