// app/api/auth/register-db-test/route.ts - Database Connection Test
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  console.log('=== DATABASE CONNECTION TEST ===')
  
  let prisma: PrismaClient | null = null
  
  try {
    const body = await request.json()
    const { username, email, password } = body
    
    console.log('Step 1: Creating Prisma client...')
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
    
    console.log('Step 2: Testing database connection...')
    await prisma.$connect()
    console.log('Database connected successfully!')
    
    console.log('Step 3: Testing simple query...')
    const userCount = await prisma.user.count()
    console.log('Current user count:', userCount)
    
    console.log('Step 4: Testing user lookup...')
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return NextResponse.json({
        error: 'User already exists',
        existingUser: { id: existingUser.id, email: existingUser.email, username: existingUser.username }
      }, { status: 400 })
    }
    
    console.log('Step 5: Testing password hashing...')
    const passwordHash = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully')
    
    console.log('Step 6: Testing user creation...')
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })
    
    console.log('User created successfully:', newUser)
    
    return NextResponse.json({
      message: 'Database test successful - user created!',
      user: newUser
    }, { status: 201 })
    
  } catch (error:any) {
    console.error('=== DATABASE TEST FAILED ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    
    // Specific error handling
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'User with this email or username already exists',
        code: error.code
      }, { status: 400 })
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({
        error: 'Database connection refused - is your database running?',
        code: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json({
      error: 'Database test failed',
      details: {
        type: error.constructor.name,
        message: error.message,
        code: error.code || 'UNKNOWN'
      }
    }, { status: 500 })
    
  } finally {
    if (prisma) {
      console.log('Disconnecting from database...')
      await prisma.$disconnect()
    }
  }
}