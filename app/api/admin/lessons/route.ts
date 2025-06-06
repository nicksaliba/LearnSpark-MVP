
// app/api/admin/lessons/route.ts - Admin Lessons CRUD API (Fixed)
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin'
import { lessonSchema } from '@/lib/schemas/lesson'
import { z } from 'zod'

const prisma = new PrismaClient()

// GET /api/admin/lessons - Get all lessons for admin
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin lessons API called')
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    console.log('🔍 Module filter:', module || 'all modules')

    const whereClause = module ? { module } : {}

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            progress: true
          }
        }
      },
      orderBy: [
        { module: 'asc' },
        { orderIndex: 'asc' }
      ]
    })

    console.log('✅ Found lessons:', lessons.length)
    return NextResponse.json({ lessons })

  } catch (error:any) {
    console.error('Admin lessons fetch error:', error)
    
    if (error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/admin/lessons - Create new lesson
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Admin create lesson API called')
    await requireAdmin()

    const body = await request.json()
    console.log('📝 Creating lesson with data:', { ...body, content: 'Content object received' })
    
    const validatedData = lessonSchema.parse(body)
    console.log('✅ Validation passed')

    // Generate unique ID
    const lessonId = `${validatedData.module}-${validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`

    console.log('🆔 Generated lesson ID:', lessonId)

    // Check if lesson with same order exists in module
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        module: validatedData.module,
        orderIndex: validatedData.orderIndex
      }
    })

    if (existingLesson) {
      console.log('❌ Order conflict:', existingLesson.id)
      return NextResponse.json(
        { error: `A lesson with order ${validatedData.orderIndex} already exists in ${validatedData.module}` },
        { status: 400 }
      )
    }

    // Check if lesson ID already exists
    const existingId = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    let finalLessonId = lessonId
    if (existingId) {
      // Add timestamp to make it unique
      finalLessonId = `${lessonId}-${Date.now()}`
      console.log('🔄 ID conflict, using:', finalLessonId)
    }

    const lesson = await prisma.lesson.create({
      data: {
        id: finalLessonId,
        ...validatedData
      }
    })

    console.log('✅ Lesson created:', lesson.id)

    return NextResponse.json(
      { message: 'Lesson created successfully', lesson },
      { status: 201 }
    )

  } catch (error:any) {
    console.error('Admin lesson creation error:', error)

    if (error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (error instanceof z.ZodError) {
      console.log('❌ Validation errors:', error.errors)
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

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A lesson with this ID already exists' },
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