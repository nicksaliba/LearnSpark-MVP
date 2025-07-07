// app/api/ai/analytics/route.ts
import { NextRequest } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import { withAuth, handleError, successResponse } from '../utils'

const prisma = new PrismaClient()

// GET /api/ai/analytics
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'personal'
    
    let analytics: any = {}
    
    switch (scope) {
      case 'personal':
        analytics = await getPersonalAnalytics(session.user.id)
        break
        
      case 'class':
        if (![UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        analytics = await getClassAnalytics(session.user.id)
        break
        
      case 'school':
        if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        analytics = await getSchoolAnalytics(session.user.schoolId!)
        break
        
      default:
        return NextResponse.json({ error: 'Invalid scope' }, { status: 400 })
    }
    
    return successResponse(analytics)
  } catch (error) {
    return handleError(error)
  }
}, [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN])

async function getPersonalAnalytics(userId: string) {
  const [progress, projects, user] = await Promise.all([
    prisma.aIProgress.findMany({
      where: { userId },
      include: { lesson: { include: { module: true } } }
    }),
    prisma.aIProject.findMany({
      where: { userId },
      select: { status: true, score: true, projectType: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, createdAt: true }
    })
  ])
  
  // Calculate learning streaks
  const sortedProgress = progress
    .filter(p => p.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
  
  let currentStreak = 0
  let longestStreak = 0
  let lastDate: Date | null = null
  
  for (const p of sortedProgress) {
    if (!lastDate) {
      currentStreak = 1
      lastDate = p.completedAt!
    } else {
      const daysDiff = Math.floor(
        (lastDate.getTime() - p.completedAt!.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysDiff === 1) {
        currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
      lastDate = p.completedAt!
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak)
  
  return {
    overview: {
      totalXP: user?.xp || 0,
      currentLevel: user?.level || 1,
      joinedDate: user?.createdAt,
      lessonsCompleted: progress.filter(p => p.status === 'COMPLETED').length,
      projectsCreated: projects.length,
      averageScore: progress.filter(p => p.score > 0).reduce((sum, p, _, arr) => 
        sum + p.score / arr.length, 0
      ) || 0,
    },
    streaks: {
      current: currentStreak,
      longest: longestStreak,
    },
    moduleProgress: progress.reduce((acc, p) => {
      const moduleName = p.lesson.module.name
      if (!acc[moduleName]) {
        acc[moduleName] = { completed: 0, total: 0, avgScore: 0 }
      }
      acc[moduleName].total++
      if (p.status === 'COMPLETED') {
        acc[moduleName].completed++
        acc[moduleName].avgScore = 
          (acc[moduleName].avgScore + p.score) / acc[moduleName].completed
      }
      return acc
    }, {} as Record<string, any>),
    recentActivity: progress.slice(0, 10).map(p => ({
      lessonTitle: p.lesson.title,
      status: p.status,
      score: p.score,
      date: p.lastAccessAt,
    })),
  }
}

async function getClassAnalytics(teacherId: string) {
  // Implementation for class analytics
  // This would aggregate data for all students in the teacher's classes
  return {
    message: 'Class analytics implementation pending'
  }
}

async function getSchoolAnalytics(schoolId: string) {
  const [students, progress, projects] = await Promise.all([
    prisma.user.count({
      where: { schoolId, role: UserRole.STUDENT }
    }),
    prisma.aIProgress.findMany({
      where: {
        user: { schoolId }
      },
      include: {
        lesson: { include: { module: true } }
      }
    }),
    prisma.aIProject.count({
      where: {
        user: { schoolId }
      }
    })
  ])
  
  return {
    overview: {
      totalStudents: students,
      totalLessonsCompleted: progress.filter(p => p.status === 'COMPLETED').length,
      totalProjectsCreated: projects,
      averageCompletionRate: progress.length > 0 
        ? (progress.filter(p => p.status === 'COMPLETED').length / progress.length) * 100
        : 0,
    },
    moduleEngagement: progress.reduce((acc, p) => {
      const moduleName = p.lesson.module.name
      if (!acc[moduleName]) {
        acc[moduleName] = { students: new Set(), completions: 0 }
      }
      acc[moduleName].students.add(p.userId)
      if (p.status === 'COMPLETED') {
        acc[moduleName].completions++
      }
      return acc
    }, {} as Record<string, any>),
    gradeLevelDistribution: await prisma.user.groupBy({
      by: ['gradeLevel'],
      where: { schoolId, role: UserRole.STUDENT },
      _count: true,
    }),
  }
}