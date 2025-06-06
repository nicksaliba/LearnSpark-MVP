// app/api/lessons/[lessonId]/route.ts - Complete Individual Lesson API Route
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { lessonSchema } from '@/lib/schemas/lesson'
import { z } from 'zod'

const prisma = new PrismaClient()

// GET /api/lessons/[lessonId] - Get individual lesson (public/student access)
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    console.log('🔍 Individual lesson API called')
    console.log('🔍 Params received:', params)
    console.log('🔍 Lesson ID:', params?.lessonId)
    
    // Validate that we have a lesson ID
    if (!params?.lessonId) {
      console.error('❌ No lesson ID provided in params')
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    const session = await auth()
    console.log('🔍 Session user:', session?.user?.email || 'No session')

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId }
    })

    if (!lesson) {
      console.log('❌ Lesson not found:', params.lessonId)
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
              lessonId: params.lessonId
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

  } catch (error:any) {
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

// PUT /api/lessons/[lessonId] - Update lesson (admin access required)
export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    console.log('📝 Lesson update API called')
    console.log('🔍 Lesson ID:', params?.lessonId)

    // Validate that we have a lesson ID
    if (!params?.lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Check if user is admin
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Simple admin check (you can enhance this)
    const adminEmails = ['admin@learnspark.com', process.env.ADMIN_EMAIL].filter(Boolean)
    const isAdmin = adminEmails.includes(session.user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📝 Updating lesson with data')
    
    const validatedData = lessonSchema.parse(body)
    console.log('✅ Validation passed for update')

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Check if changing order conflicts with another lesson
    if (validatedData.orderIndex !== existingLesson.orderIndex || validatedData.module !== existingLesson.module) {
      const conflictingLesson = await prisma.lesson.findFirst({
        where: {
          module: validatedData.module,
          orderIndex: validatedData.orderIndex,
          id: { not: params.lessonId }
        }
      })

      if (conflictingLesson) {
        console.log('❌ Update order conflict:', conflictingLesson.id)
        return NextResponse.json(
          { error: `A lesson with order ${validatedData.orderIndex} already exists in ${validatedData.module}` },
          { status: 400 }
        )
      }
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: params.lessonId },
      data: validatedData
    })

    console.log('✅ Lesson updated:', updatedLesson.id)

    return NextResponse.json(
      { message: 'Lesson updated successfully', lesson: updatedLesson }
    )

  } catch (error) {
    console.error('Admin lesson update error:', error)

    if (error instanceof z.ZodError) {
      console.log('❌ Update validation errors:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/lessons/[lessonId] - Delete lesson (admin access required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    console.log('🗑️ Lesson delete API called')
    console.log('🔍 Lesson ID:', params?.lessonId)

    // Validate that we have a lesson ID
    if (!params?.lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Check if user is admin
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Simple admin check (you can enhance this)
    const adminEmails = ['admin@learnspark.com', process.env.ADMIN_EMAIL].filter(Boolean)
    const isAdmin = adminEmails.includes(session.user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🗑️ Attempting to delete lesson:', params.lessonId)

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Check if lesson has user progress
    const progressCount = await prisma.userProgress.count({
      where: { lessonId: params.lessonId }
    })

    if (progressCount > 0) {
      console.log('❌ Cannot delete lesson with progress:', progressCount)
      return NextResponse.json(
        { 
          error: `Cannot delete lesson with ${progressCount} user progress records. Consider archiving instead.`,
          progressCount 
        },
        { status: 400 }
      )
    }

    await prisma.lesson.delete({
      where: { id: params.lessonId }
    })

    console.log('✅ Lesson deleted:', params.lessonId)

    return NextResponse.json({ 
      message: 'Lesson deleted successfully',
      deletedLessonId: params.lessonId
    })

  } catch (error) {
    console.error('Lesson deletion error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}