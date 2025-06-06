// app/api/test/route.ts - Simple API Test
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('Simple API test called')
  
  try {
    return NextResponse.json({
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    })
  } catch (error) {
    console.error('Simple API test error:', error)
    return NextResponse.json({ error: 'API test failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('Simple POST test called')
  
  try {
    const body = await request.json()
    console.log('POST body received:', body)
    
    return NextResponse.json({
      message: 'POST is working',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Simple POST test error:', error)
    return NextResponse.json({ error: 'POST test failed' }, { status: 500 })
  }
}