// app/api/lessons/debug/[lessonId]/route.ts - Debug Lesson API Route
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  console.log('🔍 Debug lesson API called')
  console.log('🔍 Full URL:', request.url)
  console.log('🔍 Params object:', params)
  console.log('🔍 Lesson ID from params:', params?.lessonId)
  console.log('🔍 Type of lesson ID:', typeof params?.lessonId)
  
  return NextResponse.json({
    url: request.url,
    params: params,
    lessonId: params?.lessonId,
    lessonIdType: typeof params?.lessonId,
    paramsKeys: Object.keys(params || {}),
    message: 'Debug info for lesson route'
  })
}