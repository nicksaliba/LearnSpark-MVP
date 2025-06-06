// app/admin/lessons/debug/page.tsx - Debug Admin Lessons
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DebugAdminLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/lessons')
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Raw response data:', data)
      console.log('Lessons array:', data.lessons)
      
      if (data.lessons && Array.isArray(data.lessons)) {
        console.log('First lesson structure:', data.lessons[0])
        setLessons(data.lessons)
      } else {
        console.error('Lessons data is not an array:', typeof data.lessons)
        setError('Invalid lessons data structure')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Admin Lessons</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debug Admin Lessons</h1>
        <Button onClick={fetchLessons}>Refresh</Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="font-bold text-red-900">Error:</h3>
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-bold mb-2">Raw Data Structure:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          {JSON.stringify({ lessons }, null, 2)}
        </pre>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-2">Lessons Analysis:</h3>
        <p><strong>Count:</strong> {lessons.length}</p>
        <p><strong>Type:</strong> {Array.isArray(lessons) ? 'Array' : typeof lessons}</p>
        
        {lessons.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">First Lesson Properties:</h4>
            <ul className="list-disc list-inside text-sm">
              {Object.keys(lessons[0] || {}).map(key => (
                <li key={key}>
                  <strong>{key}:</strong> {typeof lessons[0][key]} = {
                    typeof lessons[0][key] === 'string' 
                      ? `"${lessons[0][key]}"` 
                      : String(lessons[0][key])
                  }
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-2">URL Tests:</h3>
        {lessons.slice(0, 3).map((lesson, index) => (
          <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
            <p><strong>Lesson {index + 1}:</strong></p>
            <p>ID: {lesson?.id || 'UNDEFINED'}</p>
            <p>Title: {lesson?.title || 'UNDEFINED'}</p>
            <p>Module: {lesson?.module || 'UNDEFINED'}</p>
            <p>Edit URL: /admin/lessons/{lesson?.id || 'UNDEFINED'}/edit</p>
            <p>Preview URL: /learn/{lesson?.module || 'UNDEFINED'}/{lesson?.id || 'UNDEFINED'}</p>
          </div>
        ))}
      </Card>
    </div>
  )
}