// components/dashboard/stats-overview.tsx - Dynamic Stats Overview
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Trophy, BookOpen } from 'lucide-react'

interface StatsData {
  lessonsCompleted: number
  totalLessons: number
  currentStreak: number
  totalAchievements: number
  weeklyProgress: number
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/data')
      if (response.ok) {
        const data = await response.json()
        setStats({
          lessonsCompleted: data.progress.completedLessons,
          totalLessons: data.progress.totalLessons,
          currentStreak: data.streak.current,
          totalAchievements: data.achievements.total,
          weeklyProgress: data.progress.completionRate
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Fallback to default values
      setStats({
        lessonsCompleted: 0,
        totalLessons: 0,
        currentStreak: 0,
        totalAchievements: 0,
        weeklyProgress: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statsConfig = [
    {
      title: 'Lessons Completed',
      value: stats.lessonsCompleted.toString(),
      change: `${stats.totalLessons - stats.lessonsCompleted} remaining`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Study Streak',
      value: stats.currentStreak > 0 ? `${stats.currentStreak} days` : 'Start today!',
      change: stats.currentStreak > 0 ? 'Keep it up!' : 'Complete a lesson',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Achievements',
      value: stats.totalAchievements.toString(),
      change: 'Unlocked',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}