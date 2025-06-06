// app/api/lessons/[lessonId]/route.ts - Individual Lesson API Route
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth()
    
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // If user is authenticated, also get their progress for this lesson
    let userProgress = null
    if (session?.user?.id) {
      userProgress = await prisma.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: params.lessonId
          }
        }
      })
    }

    return NextResponse.json({ 
      lesson,
      userProgress
    })
  } catch (error) {
    console.error('Lesson fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}