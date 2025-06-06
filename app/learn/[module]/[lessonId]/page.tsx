// app/learn/[module]/[lessonId]/page.tsx - Dynamic Lesson Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CodeEditor } from '@/components/learn/code-editor'
import { LessonContent } from '@/components/learn/lesson-content'
import { Navbar } from '@/components/navigation/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft } from 'lucide-react'

interface LessonData {
  id: string
  title: string
  description: string
  module: string
  orderIndex: number
  xpReward: number
  content: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number
    objectives: string[]
    initialCode?: string
    testCases?: Array<{
      expectedOutput: string
      description: string
      input?: string
    }>
    hints?: string[]
    language?: string
    theory?: string
  }
  userProgress?: {
    status: 'not_started' | 'in_progress' | 'completed'
    score: number
    attempts: number
    completedAt?: string
  }
}

export default function LessonPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const moduleId = params?.module as string
  const lessonId = params?.lessonId as string
  
  const [lessonData, setLessonData] = useState<LessonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lessonCompleted, setLessonCompleted] = useState(false)

  // Fetch lesson data
  const fetchLessonData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/lessons/${lessonId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch lesson data')
      }

      const { lesson, userProgress } = await response.json()
      
      const lessonData: LessonData = {
        ...lesson,
        userProgress: userProgress || {
          status: 'not_started',
          score: 0,
          attempts: 0
        }
      }

      setLessonData(lessonData)
      setLessonCompleted(lessonData.userProgress?.status === 'completed')
      
      console.log('✅ Lesson data loaded:', lessonData)

    } catch (err) {
      console.error('❌ Failed to fetch lesson data:', err)
      setError('Failed to load lesson data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    if (!moduleId || !lessonId) {
      router.push('/dashboard')
      return
    }

    fetchLessonData()
  }, [moduleId, lessonId, session, status, router])

  const handleCodeSuccess = async (solution: string) => {
    if (!lessonData) return

    try {
      // Update lesson progress
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lessonData.id,
          status: 'completed',
          score: 100, // Perfect score for successful completion
          codeSubmission: solution
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Progress updated:', result)
        
        setLessonCompleted(true)
        
        // Show any new achievements
        if (result.achievements && result.achievements.length > 0) {
          console.log('🏆 New achievements unlocked:', result.achievements)
        }
      }
    } catch (error) {
      console.error('❌ Failed to update progress:', error)
    }
  }

  const handleXPEarned = (xp: number) => {
    console.log('✨ XP earned:', xp)
    // You could show a toast notification here
  }

  const handleLessonComplete = () => {
    // Navigate back to module or to next lesson
    router.push(`/learn/${moduleId}`)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return null // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Unable to load lesson</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchLessonData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push(`/learn/${moduleId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Module
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!lessonData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/learn/${moduleId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {moduleId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        </div>

        <LessonContent 
          lesson={{
            title: lessonData.title,
            description: lessonData.description,
            difficulty: lessonData.content.difficulty,
            xpReward: lessonData.xpReward,
            estimatedTime: lessonData.content.estimatedTime,
            objectives: lessonData.content.objectives
          }}
          onComplete={lessonCompleted ? handleLessonComplete : undefined}
        >
          {/* Theory Section */}
          {lessonData.content.theory && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Learn</h2>
              <div className="prose max-w-none">
                <div 
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: lessonData.content.theory }}
                />
              </div>
            </Card>
          )}

          {/* Interactive Code Editor - Only show if lesson has coding content */}
          {lessonData.content.initialCode && (
            <CodeEditor
              lessonId={lessonData.id}
              initialCode={lessonData.content.initialCode}
              language={(lessonData.content.language as any) || 'python'}
              testCases={lessonData.content.testCases || []}
              hints={lessonData.content.hints || []}
              onSuccess={handleCodeSuccess}
              onXPEarned={handleXPEarned}
            />
          )}

          {/* Non-coding lessons - Show completion button */}
          {!lessonData.content.initialCode && !lessonCompleted && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-2">Ready to continue?</h3>
                <p className="text-gray-600 mb-4">
                  Mark this lesson as complete to earn {lessonData.xpReward} XP!
                </p>
                <Button 
                  onClick={() => handleCodeSuccess('')}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Complete Lesson
                </Button>
              </div>
            </Card>
          )}

          {/* Progress Info */}
          {lessonData.userProgress && lessonData.userProgress.attempts > 0 && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Your Progress</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium capitalize">{lessonData.userProgress.status.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="text-gray-600">Attempts:</span>
                  <div className="font-medium">{lessonData.userProgress.attempts}</div>
                </div>
                <div>
                  <span className="text-gray-600">Score:</span>
                  <div className="font-medium">{lessonData.userProgress.score}%</div>
                </div>
                {lessonData.userProgress.completedAt && (
                  <div>
                    <span className="text-gray-600">Completed:</span>
                    <div className="font-medium">
                      {new Date(lessonData.userProgress.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </LessonContent>
      </main>
    </div>
  )
}