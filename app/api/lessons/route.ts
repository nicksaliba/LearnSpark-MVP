// app/api/lessons/route.ts - Enhanced Lessons API
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    const session = await auth()

    // Build query
    const whereClause = module ? { module } : {}

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy: [
        { module: 'asc' },
        { orderIndex: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        module: true,
        orderIndex: true,
        xpReward: true,
        content: true,
        createdAt: true
      }
    })

    // If user is authenticated, include their progress
    let lessonsWithProgress = lessons
    if (session?.user?.id) {
      const userProgress = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          lessonId: { in: lessons.map(l => l.id) }
        }
      })

      lessonsWithProgress = lessons.map(lesson => ({
        ...lesson,
        userProgress: userProgress.find(p => p.lessonId === lesson.id) || null
      }))
    }

    return NextResponse.json({ 
      lessons: lessonsWithProgress,
      count: lessons.length 
    })

  } catch (error) {
    console.error('Lessons fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}