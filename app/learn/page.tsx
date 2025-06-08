// app/learn/page.tsx - Main Learning Hub Page
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Brain, 
  Crown, 
  BookOpen, 
  Trophy, 
  Users, 
  Clock,
  Award,
  ChevronRight,
  Target,
  Sparkles,
  TrendingUp,
  Play,
  CheckCircle,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface ModuleProgress {
  moduleId: string
  totalLessons: number
  completedLessons: number
  progress: number
  totalXP: number
  nextLesson?: {
    id: string
    title: string
    orderIndex: number
  }
}

interface UserStats {
  totalXP: number
  level: number
  completedLessons: number
  currentStreak: number
  achievements: number
}

const modules = [
  {
    id: 'code-kingdom',
    title: 'Code Kingdom',
    description: 'Master programming fundamentals with Python, JavaScript, and more',
    longDescription: 'Embark on your coding journey! Learn the fundamentals of programming through interactive lessons covering variables, functions, loops, and data structures.',
    icon: Code,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    difficulty: 'Beginner Friendly',
    estimatedTime: '4-6 weeks',
    skills: ['Python Basics', 'JavaScript Fundamentals', 'Problem Solving', 'Debugging'],
    highlights: ['Interactive Coding', 'Real-time Feedback', 'Project-based Learning']
  },
  {
    id: 'ai-citadel',
    title: 'AI Citadel',
    description: 'Explore machine learning, neural networks, and AI ethics',
    longDescription: 'Dive into the fascinating world of Artificial Intelligence! Understand machine learning concepts, explore neural networks, and learn about ethical AI development.',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100',
    difficulty: 'Intermediate',
    estimatedTime: '6-8 weeks',
    skills: ['Machine Learning', 'Neural Networks', 'AI Ethics', 'Data Analysis'],
    highlights: ['Hands-on ML Projects', 'Ethics Focus', 'Industry Applications']
  },
  {
    id: 'chess-arena',
    title: 'Chess Arena',
    description: 'Develop strategic thinking through chess mastery',
    longDescription: 'Enhance your strategic thinking and problem-solving skills through the royal game of chess. Learn tactics, strategy, and develop analytical thinking.',
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'from-yellow-50 to-yellow-100',
    difficulty: 'All Levels',
    estimatedTime: '3-5 weeks',
    skills: ['Strategic Thinking', 'Pattern Recognition', 'Decision Making', 'Analysis'],
    highlights: ['Interactive Board', 'Puzzle Solving', 'Tournament Play']
  }
]

export default function LearnPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    fetchLearningData()
  }, [session, status, router])

  const fetchLearningData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user progress and stats
      const [progressResponse, statsResponse] = await Promise.all([
        fetch('/api/user/progress'),
        fetch('/api/user/data')
      ])

      if (progressResponse.ok && statsResponse.ok) {
        const progressData = await progressResponse.json()
        const statsData = await statsResponse.json()
        
        // Process module progress
        const moduleProgressData = modules.map(module => {
          const moduleProgress = progressData.progress.filter((p: any) => 
            p.lesson.module === module.id
          )
          
          const completed = moduleProgress.filter((p: any) => 
            p.status === 'completed'
          ).length
          
          const total = moduleProgress.length
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0
          
          const totalXP = moduleProgress
            .filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => sum + p.lesson.xpReward, 0)
          
          const nextLesson = moduleProgress
            .filter((p: any) => p.status !== 'completed')
            .sort((a: any, b: any) => a.lesson.orderIndex - b.lesson.orderIndex)[0]
          
          return {
            moduleId: module.id,
            totalLessons: total,
            completedLessons: completed,
            progress,
            totalXP,
            nextLesson: nextLesson ? {
              id: nextLesson.lesson.id,
              title: nextLesson.lesson.title,
              orderIndex: nextLesson.lesson.orderIndex
            } : undefined
          }
        })
        
        setModuleProgress(moduleProgressData)
        setUserStats({
          totalXP: statsData.user.xpTotal,
          level: statsData.user.level,
          completedLessons: statsData.progress.completedLessons,
          currentStreak: statsData.streak.current,
          achievements: statsData.achievements.total
        })
      }
    } catch (error) {
      console.error('Failed to fetch learning data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
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

  const getModuleProgress = (moduleId: string) => {
    return moduleProgress.find(mp => mp.moduleId === moduleId) || {
      moduleId,
      totalLessons: 0,
      completedLessons: 0,
      progress: 0,
      totalXP: 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Learning <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Adventure</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose your path and embark on an interactive journey of discovery. 
            Master new skills through gamified learning experiences.
          </p>
          
          {/* Quick Stats */}
          {userStats && (
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.totalXP.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Level {userStats.level}</div>
                  <div className="text-sm text-gray-600">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.completedLessons}</div>
                  <div className="text-sm text-gray-600">Lessons Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Learning Modules */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Path</h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {modules.map((module) => {
              const progress = getModuleProgress(module.id)
              const Icon = module.icon
              
              return (
                <Card 
                  key={module.id}
                  className={`overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group ${
                    selectedModule === module.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                >
                  {/* Module Header */}
                  <div className={`bg-gradient-to-r ${module.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="h-8 w-8" />
                        <Badge className="bg-white/20 text-white border-white/30">
                          {module.difficulty}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">{module.title}</h3>
                      <p className="text-white/90 text-sm mb-4">{module.description}</p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
                          <span>{progress.progress}% complete</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">⚡ {progress.totalXP} XP earned</span>
                        <span className="text-sm">🕒 {module.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{module.longDescription}</p>
                    
                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">What you'll learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {module.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Highlights */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Highlights:</h4>
                      <ul className="space-y-1">
                        {module.highlights.map((highlight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button asChild className="w-full group-hover:scale-105 transition-transform">
                        <Link href={`/learn/${module.id}`} className="flex items-center justify-center gap-2">
                          {progress.completedLessons > 0 ? (
                            <>
                              <Play className="h-4 w-4" />
                              Continue Learning
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-4 w-4" />
                              Start Journey
                            </>
                          )}
                        </Link>
                      </Button>
                      
                      {progress.nextLesson && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Next up:</p>
                          <Button variant="outline" asChild className="w-full text-xs">
                            <Link href={`/learn/${module.id}/${progress.nextLesson.id}`}>
                              Lesson {progress.nextLesson.orderIndex}: {progress.nextLesson.title}
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Learning Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Learn with LearnSpark?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Interactive Coding</h3>
              <p className="text-sm text-gray-600">Write and test code directly in your browser with real-time feedback</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-3 rounded-full inline-flex mb-4">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Gamified Learning</h3>
              <p className="text-sm text-gray-600">Earn XP, unlock achievements, and track your progress</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full inline-flex mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Personalized Path</h3>
              <p className="text-sm text-gray-600">Adaptive learning that adjusts to your pace and skill level</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 p-3 rounded-full inline-flex mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Community Support</h3>
              <p className="text-sm text-gray-600">Learn alongside others and get help when you need it</p>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Continue Learning */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Continue Your Journey
            </h3>
            
            {moduleProgress.filter(mp => mp.nextLesson).length > 0 ? (
              <div className="space-y-3">
                {moduleProgress
                  .filter(mp => mp.nextLesson)
                  .slice(0, 3)
                  .map((mp) => {
                    const module = modules.find(m => m.id === mp.moduleId)!
                    const Icon = module.icon
                    
                    return (
                      <div key={mp.moduleId} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`bg-gradient-to-r ${module.color} p-2 rounded-lg`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{module.title}</p>
                          <p className="text-sm text-gray-600">
                            Lesson {mp.nextLesson!.orderIndex}: {mp.nextLesson!.title}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/learn/${mp.moduleId}/${mp.nextLesson!.id}`}>
                            Continue
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Great job! You're caught up on all your lessons.</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for new content!</p>
              </div>
            )}
          </Card>

          {/* Learning Goals */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Goals
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Weekly Challenge</h4>
                <p className="text-sm text-blue-800 mb-3">Complete 5 lessons this week</p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">3/5 lessons completed</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Monthly Goal</h4>
                <p className="text-sm text-purple-800 mb-3">Earn 1000 XP this month</p>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-purple-700 mt-1">750/1000 XP earned</p>
              </div>
              
              <Button variant="outline" className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                View All Achievements
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}