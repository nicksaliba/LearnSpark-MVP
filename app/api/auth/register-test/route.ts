// app/api/auth/register-test/route.ts - Minimal Registration Test
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== REGISTRATION TEST API CALLED ===')
  
  try {
    // Step 1: Test basic request handling
    console.log('Step 1: Testing basic request handling...')
    console.log('Request method:', request.method)
    console.log('Request URL:', request.url)
    
    // Step 2: Test body parsing
    console.log('Step 2: Testing body parsing...')
    let body
    try {
      body = await request.json()
      console.log('Body parsed successfully:', { ...body, password: '[REDACTED]' })
    } catch (parseError) {
      console.error('Body parsing failed:', parseError)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    
    // Step 3: Test basic validation
    console.log('Step 3: Testing basic validation...')
    const { username, email, password } = body
    
    if (!username || !email || !password) {
      console.log('Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { username: !!username, email: !!email, password: !!password }
      }, { status: 400 })
    }
    
    // Step 4: Test environment variables
    console.log('Step 4: Testing environment variables...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Step 5: Test bcrypt import
    console.log('Step 5: Testing bcrypt import...')
    try {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 12)
      console.log('Bcrypt working, password hashed successfully')
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError)
      return NextResponse.json({ error: 'Password hashing failed' }, { status: 500 })
    }
    
    // Step 6: Test Prisma import (without connecting)
    console.log('Step 6: Testing Prisma import...')
    try {
      const { PrismaClient } = require('@prisma/client')
      console.log('Prisma imported successfully')
      
      // Don't connect yet, just test import
      const prisma = new PrismaClient()
      console.log('Prisma client created successfully')
    } catch (prismaError) {
      console.error('Prisma error:', prismaError)
      return NextResponse.json({ error: 'Prisma initialization failed' }, { status: 500 })
    }
    
    console.log('=== ALL TESTS PASSED ===')
    return NextResponse.json({
      message: 'Registration test successful - all components working',
      data: {
        username,
        email,
        passwordLength: password.length
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('=== REGISTRATION TEST FAILED ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({
      error: 'Registration test failed',
      details: {
        type: error.constructor.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  }
}