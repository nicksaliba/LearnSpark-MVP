// app/api/admin/check/route.ts - Admin Access Check
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const adminStatus = await isAdmin()
    
    return NextResponse.json({
      isAdmin: adminStatus
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Admin check failed' },
      { status: 500 }
    )
  }
}