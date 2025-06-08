// app/learn/[module]/page.tsx - Fixed Module Overview Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navigation/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle,
  Lock,
  Play,
  Code,
  Brain,
  Crown
} from 'lucide-react'
import Link from 'next/link'

interface Lesson {
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
  }
  userProgress?: {
    status: 'not_started' | 'in_progress' | 'completed'
    score: number
  }
}

const moduleInfo = {
  'code-kingdom': {
    title: 'Code Kingdom',
    description: 'Master programming fundamentals with Python, JavaScript, and more',
    icon: Code,
    color: 'from-blue-500 to-blue-600'
  },
  'ai-citadel': {
    title: 'AI Citadel',
    description: 'Explore machine learning, neural networks, and AI ethics',
    icon: Brain,
    color: 'from-purple-500 to-purple-600'
  },
  'chess-arena': {
    title: 'Chess Arena',
    description: 'Develop strategic thinking through chess mastery',
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600'
  }
}

export default function ModulePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const moduleId = params?.module as string
  
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('📚 Module page - Module ID:', moduleId)
    console.log('📚 Module page - Session status:', status)
    
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    if (!moduleId || !moduleInfo[moduleId as keyof typeof moduleInfo]) {
      router.push('/dashboard')
      return
    }

    fetchModuleLessons()
  }, [moduleId, session, status, router])

  const fetchModuleLessons = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Fetching lessons for module:', moduleId)
      
      const response = await fetch(`/api/lessons?module=${moduleId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch lessons')
      }

      const data = await response.json()
      console.log('✅ Module lessons data:', data)
      
      // Sort lessons by order index
      const sortedLessons = data.lessons.sort((a: Lesson, b: Lesson) => a.orderIndex - b.orderIndex)
      setLessons(sortedLessons)
      
    } catch (err) {
      console.error('❌ Failed to fetch module lessons:', err)
      setError('Failed to load lessons')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return null // Will redirect
  }

  if (!moduleId || !moduleInfo[moduleId as keyof typeof moduleInfo]) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Module Not Found</h2>
            <p className="text-gray-600 mb-6">The requested learning module could not be found.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const module = moduleInfo[moduleId as keyof typeof moduleInfo]
  const Icon = module.icon

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Unable to load lessons</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchModuleLessons}>Try Again</Button>
          </Card>
        </div>
      </div>
    )
  }

  const completedLessons = lessons.filter(lesson => lesson.userProgress?.status === 'completed').length
  const totalLessons = lessons.length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Module Header */}
        <Card className="mb-8 overflow-hidden">
          <div className={`bg-gradient-to-r ${module.color} p-8 text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{module.title}</h1>
                <p className="text-white/90 text-lg">{module.description}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress: {completedLessons}/{totalLessons} lessons</span>
                <span>{progressPercentage}% complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>
          
          {lessons.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons available</h3>
              <p className="text-gray-600">
                Lessons for this module are coming soon. Check back later!
              </p>
            </Card>
          ) : (
            lessons.map((lesson, index) => {
              const isCompleted = lesson.userProgress?.status === 'completed'
              const isInProgress = lesson.userProgress?.status === 'in_progress'
              const isLocked = index > 0 && !lessons[index - 1]?.userProgress
              
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={isCompleted}
                  isInProgress={isInProgress}
                  isLocked={isLocked}
                  moduleId={moduleId}
                />
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

function LessonCard({ 
  lesson, 
  isCompleted, 
  isInProgress, 
  isLocked, 
  moduleId 
}: {
  lesson: Lesson
  isCompleted: boolean
  isInProgress: boolean
  isLocked: boolean
  moduleId: string
}) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (isLocked) return <Lock className="h-5 w-5 text-gray-400" />
    return <Play className="h-5 w-5 text-blue-600" />
  }

  const getStatusText = () => {
    if (isCompleted) return 'Completed'
    if (isInProgress) return 'In Progress'
    if (isLocked) return 'Locked'
    return 'Start Lesson'
  }

  return (
    <Card className={`p-6 transition-all duration-200 ${
      isLocked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-gray-500">
              {lesson.orderIndex}.
            </span>
            <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
            <Badge className={difficultyColors[lesson.content.difficulty]}>
              {lesson.content.difficulty}
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.content.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{lesson.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lesson.content.objectives.length} objectives</span>
            </div>
          </div>

          {/* Progress indicator */}
          {isCompleted && lesson.userProgress?.score && (
            <div className="mb-4">
              <div className="text-sm text-green-600 font-medium">
                Score: {lesson.userProgress.score}%
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {getStatusIcon()}
            <span className={
              isCompleted ? 'text-green-600' :
              isLocked ? 'text-gray-400' :
              'text-blue-600'
            }>
              {getStatusText()}
            </span>
          </div>
          
          {!isLocked && (
            <Button asChild className="min-w-[120px]">
              <Link href={`/learn/${moduleId}/${lesson.id}`}>
                {isCompleted ? 'Review' : 'Start Lesson'}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}