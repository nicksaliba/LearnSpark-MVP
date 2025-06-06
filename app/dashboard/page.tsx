// app/dashboard/page.tsx - Dynamic Dashboard with Real Data
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navigation/navbar'
import { WelcomeHeader } from '@/components/dashboard/welcome-header'
import { XPBar } from '@/components/gamification/xp-bar'
import { StreakCounter } from '@/components/gamification/streak-counter'
import { LevelIndicator } from '@/components/gamification/level-indicator'
import { AchievementToast } from '@/components/gamification/achivement-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Brain, 
  Crown, 
  CheckCircle, 
  Clock, 
  Award, 
  BookOpen,
  Trophy,
  Target,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface UserData {
  user: {
    id: string
    username: string
    email: string
    level: number
    xpTotal: number
    joinedAt: string
  }
  progress: {
    totalLessons: number
    completedLessons: number
    completionRate: number
  }
  modules: Array<{
    id: string
    name: string
    totalLessons: number
    completedLessons: number
    progress: number
    totalXP: number
    nextLesson: any
  }>
  xp: {
    level: number
    currentXP: number
    xpToNextLevel: number
    totalXP: number
    percentage: number
  }
  streak: {
    current: number
    longest: number
    lastActiveDate: string
  }
  achievements: {
    total: number
    recent: Array<{
      id: string
      name: string
      description: string
      icon: string
      earnedAt: string
    }>
  }
  recentActivity: Array<{
    type: string
    title: string
    description: string
    timestamp: string
    icon: string
  }>
}

interface Achievement {
  id: string
  name: string
  description: string
  xp: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)

  // Fetch user data
  const fetchUserData = async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/user/data')
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      
      const data = await response.json()
      setUserData(data)
      
      console.log('✅ User data loaded:', data)
    } catch (err) {
      console.error('❌ Failed to fetch user data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('🏠 Dashboard - Session status:', status)
    
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      console.log('🏠 Dashboard - No session, redirecting to login')
      router.push('/login')
      return
    }
    
    fetchUserData()
  }, [session, status, router])

  // Show welcome achievement for new logins
  useEffect(() => {
    if (userData && !showAchievement) {
      const timer = setTimeout(() => {
        const welcomeAchievement = {
          id: 'welcome-back',
          name: 'Welcome Back!',
          description: 'Ready to continue your learning journey',
          xp: 25
        }
        setCurrentAchievement(welcomeAchievement)
        setShowAchievement(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [userData, showAchievement])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return null // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Unable to load dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      
      {/* Achievement Toast */}
      {showAchievement && currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onClose={() => setShowAchievement(false)}
        />
      )}
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userData.user.username}! 🎮
              </h1>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>
            <LevelIndicator level={userData.xp.level} />
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <XPBar
              level={userData.xp.level}
              currentXP={userData.xp.currentXP}
              xpToNextLevel={userData.xp.xpToNextLevel}
              totalXP={userData.xp.totalXP}
            />
          </div>
          <div>
            <StreakCounter
              currentStreak={userData.streak.current}
              longestStreak={userData.streak.longest}
              lastActiveDate={userData.streak.lastActiveDate}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <Badge variant="secondary">
                  +{userData.achievements.total} achievements
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userData.progress.completedLessons}
              </div>
              <p className="text-sm text-gray-600">Lessons Completed</p>
              <div className="mt-2 text-xs text-gray-500">
                {Math.round(userData.progress.completionRate)}% completion rate
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant="secondary">
                  Level {userData.xp.level}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userData.xp.totalXP.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total XP Earned</p>
              <div className="mt-2 text-xs text-gray-500">
                {userData.xp.xpToNextLevel - userData.xp.currentXP} XP to next level
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <Badge variant="secondary">
                  {userData.modules.length} modules
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userData.progress.totalLessons}
              </div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <div className="mt-2 text-xs text-gray-500">
                Across all learning modules
              </div>
            </Card>
          </div>
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {userData.modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Recent Achievements</h3>
            </div>
            {userData.achievements.recent.length > 0 ? (
              <div className="space-y-3">
                {userData.achievements.recent.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Complete lessons to earn your first achievement!</p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            {userData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-gray-100 p-1.5 rounded-lg">
                      {activity.icon === 'CheckCircle' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.icon === 'Trophy' && <Trophy className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Start learning to see your activity here!</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

// Module Card Component
function ModuleCard({ module }: { module: any }) {
  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'code-kingdom': return Code
      case 'ai-citadel': return Brain
      case 'chess-arena': return Crown
      default: return BookOpen
    }
  }

  const getModuleColor = (moduleId: string) => {
    switch (moduleId) {
      case 'code-kingdom': return 'from-blue-500 to-blue-600'
      case 'ai-citadel': return 'from-purple-500 to-purple-600'
      case 'chess-arena': return 'from-yellow-500 to-yellow-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const Icon = getModuleIcon(module.id)
  const colorClass = getModuleColor(module.id)

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className={`bg-gradient-to-r ${colorClass} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <Icon className="h-8 w-8" />
          <div className="text-right">
            <div className="text-sm opacity-90">Progress</div>
            <div className="text-xl font-bold">{Math.round(module.progress)}%</div>
          </div>
        </div>
        <h3 className="text-xl font-bold mt-4 mb-2">{module.name}</h3>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{module.completedLessons}/{module.totalLessons} lessons</span>
            <span>{Math.round(module.progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${module.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Award className="h-4 w-4" />
          <span>{module.totalXP} XP earned</span>
        </div>

        <Button asChild className="w-full group-hover:scale-105 transition-transform">
          <Link href={`/learn/${module.id}`} className="flex items-center justify-center gap-2">
            {module.nextLesson ? 'Continue Learning' : 'Review Lessons'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}