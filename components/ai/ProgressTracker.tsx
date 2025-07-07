// components/ai/ProgressTracker.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Trophy, 
  Zap, 
  Calendar,
  Target 
} from 'lucide-react'
import { useAIAnalytics } from '@/hooks/useAI'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
}

export function ProgressTracker({ userId }: Props) {
  const { analytics, isLoading } = useAIAnalytics('personal')
  
  if (isLoading || !analytics) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    )
  }
  
  const stats = [
    {
      label: 'Current Streak',
      value: analytics.streaks.current,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      suffix: 'days'
    },
    {
      label: 'Lessons Completed',
      value: analytics.overview.lessonsCompleted,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Average Score',
      value: Math.round(analytics.overview.averageScore),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: '%'
    },
    {
      label: 'Total XP',
      value: analytics.overview.totalXP.toLocaleString(),
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-600" />
        Your Progress
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className={cn(
                "p-3 rounded-lg",
                stat.bgColor
              )}>
                <Icon className={cn("w-4 h-4 mb-1", stat.color)} />
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {analytics.streaks.current >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg"
        >
          <p className="text-sm font-medium text-orange-800">
            🔥 You're on fire! Keep your {analytics.streaks.current}-day streak going!
          </p>
        </motion.div>
      )}
    </div>
  )
}