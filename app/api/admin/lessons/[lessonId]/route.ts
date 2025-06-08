// app/api/admin/lessons/[lessonId]/route.ts - Fixed with awaited params
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { lessonSchema } from '@/lib/schemas/lesson'
import { z } from 'zod'

const prisma = new PrismaClient()

// GET /api/admin/lessons/[lessonId] - Get individual lesson for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    console.log('🔍 Admin lesson API called')
    
    // Await params before accessing properties
    const { lessonId } = await params
    
    console.log('🔍 Admin - Lesson ID:', lessonId)
    
    // Validate that we have a lesson ID
    if (!lessonId) {
      console.error('❌ No lesson ID provided in params')
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
    const adminEmails = ['nick.saliba@gmail.com', process.env.ADMIN_EMAIL].filter(Boolean)
    const isAdmin = adminEmails.includes(session.user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      console.log('❌ Admin - Lesson not found:', lessonId)
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    console.log('✅ Admin - Lesson found:', lesson.title)

    return NextResponse.json({ lesson })

  } catch (error: any) {
    console.error('💥 Admin lesson fetch error:', error)
    
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

// PUT /api/admin/lessons/[lessonId] - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    console.log('📝 Admin lesson update API called')
    
    // Await params before accessing properties
    const { lessonId } = await params
    
    console.log('🔍 Admin update - Lesson ID:', lessonId)

    // Validate that we have a lesson ID
    if (!lessonId) {
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
    const adminEmails = ['nick.saliba@gmail.com', process.env.ADMIN_EMAIL].filter(Boolean)
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
      where: { id: lessonId }
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
          id: { not: lessonId }
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
      where: { id: lessonId },
      data: validatedData
    })

    console.log('✅ Lesson updated:', updatedLesson.id)

    return NextResponse.json(
      { message: 'Lesson updated successfully', lesson: updatedLesson }
    )

  } catch (error: any) {
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

// DELETE /api/admin/lessons/[lessonId] - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    console.log('🗑️ Admin lesson delete API called')
    
    // Await params before accessing properties
    const { lessonId } = await params
    
    console.log('🔍 Admin delete - Lesson ID:', lessonId)

    // Validate that we have a lesson ID
    if (!lessonId) {
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
    const adminEmails = ['nick.saliba@gmail.com', process.env.ADMIN_EMAIL].filter(Boolean)
    const isAdmin = adminEmails.includes(session.user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🗑️ Attempting to delete lesson:', lessonId)

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Check if lesson has user progress
    const progressCount = await prisma.userProgress.count({
      where: { lessonId: lessonId }
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
      where: { id: lessonId }
    })

    console.log('✅ Lesson deleted:', lessonId)

    return NextResponse.json({ 
      message: 'Lesson deleted successfully',
      deletedLessonId: lessonId
    })

  } catch (error: any) {
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