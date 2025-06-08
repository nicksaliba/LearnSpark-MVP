// app/api/lessons/[lessonId]/route.ts - Fixed with awaited params
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    console.log('🔍 Individual lesson API called')
    
    // Await params before accessing properties
    const { lessonId } = await params
    
    console.log('🔍 Lesson ID:', lessonId)
    
    // Validate that we have a lesson ID
    if (!lessonId) {
      console.error('❌ No lesson ID provided in params')
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    const session = await auth()
    console.log('🔍 Session user:', session?.user?.email || 'No session')

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      console.log('❌ Lesson not found:', lessonId)
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    console.log('✅ Lesson found:', lesson.title)

    // If user is authenticated, also get their progress for this lesson
    let userProgress = null
    if (session?.user?.id) {
      console.log('🔍 Fetching user progress for:', session.user.id)
      
      try {
        userProgress = await prisma.userProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: lessonId
            }
          }
        })
        
        console.log('📊 User progress:', userProgress?.status || 'No progress')
      } catch (progressError) {
        console.log('⚠️ Progress fetch failed:', progressError instanceof Error ? progressError.message : 'Unknown error')
        // Continue without progress - not critical
      }
    }

    return NextResponse.json({ 
      lesson,
      userProgress
    })

  } catch (error: any) {
    console.error('💥 Lesson fetch error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}