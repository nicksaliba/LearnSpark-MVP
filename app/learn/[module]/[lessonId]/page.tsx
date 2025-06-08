// app/learn/[module]/[lessonId]/page.tsx - Complete Interactive Lesson Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CodeEditor } from '@/components/learn/code-editor'
import { LessonContent } from '@/components/learn/lesson-content'
import { Navbar } from '@/components/navigation/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle, 
  Trophy,
  Clock,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react'

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
    theory?: string
    initialCode?: string
    testCases?: Array<{
      expectedOutput: string
      description: string
      input?: string
    }>
    hints?: string[]
    language?: string
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
  const [showCelebration, setShowCelebration] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)

  // Fetch lesson data
  const fetchLessonData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`🔍 Fetching lesson: ${lessonId}`)
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
      console.log('💾 Updating progress for coding lesson')
      
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lessonData.id,
          status: 'completed',
          score: 100,
          codeSubmission: solution
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Progress updated:', result)
        
        setLessonCompleted(true)
        setEarnedXP(result.xpEarned || lessonData.xpReward)
        setShowCelebration(true)
        
        // Hide celebration after 3 seconds
        setTimeout(() => setShowCelebration(false), 3000)
        
        // Show any new achievements
        if (result.achievements && result.achievements.length > 0) {
          console.log('🏆 New achievements unlocked:', result.achievements)
        }
      }
    } catch (error) {
      console.error('❌ Failed to update progress:', error)
    }
  }

  const handleTheoryComplete = async () => {
    if (!lessonData) return

    try {
      console.log('💾 Updating progress for theory lesson')
      
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lessonData.id,
          status: 'completed',
          score: 100
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Progress updated:', result)
        
        setLessonCompleted(true)
        setEarnedXP(result.xpEarned || lessonData.xpReward)
        setShowCelebration(true)
        
        // Hide celebration after 3 seconds
        setTimeout(() => setShowCelebration(false), 3000)
      }
    } catch (error) {
      console.error('❌ Failed to update progress:', error)
    }
  }

  const handleContinueToNext = () => {
    // Navigate back to module or to next lesson
    router.push(`/learn/${moduleId}`)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
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

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  const moduleNames = {
    'code-kingdom': 'Code Kingdom',
    'ai-citadel': 'AI Citadel',
    'chess-arena': 'Chess Arena'
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 animate-bounce-in">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Lesson Complete!</h2>
            <p className="text-gray-600 mb-4">Excellent work! You've mastered this lesson.</p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                +{earnedXP} XP Earned
              </Badge>
            </div>
          </Card>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/learn/${moduleId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {moduleNames[moduleId as keyof typeof moduleNames] || moduleId}
          </Button>
        </div>

        {/* Lesson Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-gray-500">
                  Lesson {lessonData.orderIndex}
                </span>
                <Badge className={difficultyColors[lessonData.content.difficulty]}>
                  {lessonData.content.difficulty}
                </Badge>
                {lessonCompleted && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lessonData.title}</h1>
              <p className="text-gray-600 mb-4">{lessonData.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{lessonData.content.estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{lessonData.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{lessonData.content.objectives.length} objectives</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              What you'll learn
            </h3>
            <ul className="grid md:grid-cols-2 gap-2">
              {lessonData.content.objectives.map((objective, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Theory Section */}
        {lessonData.content.theory && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learn
            </h2>
            <div className="prose max-w-none">
              <div 
                className="text-gray-700 lesson-content"
                dangerouslySetInnerHTML={{ __html: lessonData.content.theory }}
              />
            </div>
          </Card>
        )}

        {/* Interactive Code Editor */}
        {lessonData.content.initialCode && !lessonCompleted && (
          <CodeEditor
            lessonId={lessonData.id}
            initialCode={lessonData.content.initialCode}
            language={(lessonData.content.language as any) || 'python'}
            testCases={lessonData.content.testCases || []}
            hints={lessonData.content.hints || []}
            onSuccess={handleCodeSuccess}
            onXPEarned={setEarnedXP}
          />
        )}

        {/* Completed Code Display */}
        {lessonData.content.initialCode && lessonCompleted && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Lesson Completed!
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-600 mb-2">
                Great job! You've successfully completed this coding challenge.
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  ✓ All tests passed
                </span>
                <span className="text-blue-600 font-medium">
                  Score: {lessonData.userProgress?.score || 100}%
                </span>
                <span className="text-purple-600 font-medium">
                  +{lessonData.xpReward} XP earned
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Theory-only completion button */}
        {!lessonData.content.initialCode && !lessonCompleted && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-2">Ready to continue?</h3>
              <p className="text-gray-600 mb-4">
                Mark this lesson as complete to earn {lessonData.xpReward} XP!
              </p>
              <Button 
                onClick={handleTheoryComplete}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Lesson
              </Button>
            </div>
          </Card>
        )}

        {/* Completion Actions */}
        {lessonCompleted && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-2">🎉 Lesson Complete!</h3>
              <p className="text-gray-600 mb-4">
                You've successfully mastered this lesson. Ready for the next challenge?
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleContinueToNext}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Continue Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  size="lg"
                >
                  Review Lesson
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Summary */}
        {lessonData.userProgress && lessonData.userProgress.attempts > 0 && (
          <Card className="p-4 bg-gray-50 mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Your Progress</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="font-medium capitalize">
                  {lessonData.userProgress.status.replace('_', ' ')}
                </div>
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
      </main>

      <style jsx global>{`
        .lesson-content h3 {
          color: #1f2937;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .lesson-content h4 {
          color: #374151;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .lesson-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .lesson-content ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .lesson-content li {
          margin-bottom: 0.5rem;
        }
        
        .lesson-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Consolas', 'Monaco', monospace;
        }
        
        .lesson-content pre {
          background-color: #1f2937;
          color: #10b981;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  )
}