// components/teacher/dashboard/TeachingInsights.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Star,
  Target,
  Zap
} from 'lucide-react'
import { useTeacherStats } from '@/hooks/useTeacher'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  teacherId: string
}

export function TeachingInsights({ teacherId }: Props) {
  const { stats, isLoading } = useTeacherStats()
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  const insights = [
    {
      type: 'success' as const,
      icon: Star,
      title: 'High Engagement',
      description: `${stats?.averageClassProgress || 0}% average progress across all classes`,
      action: 'View top performers',
      href: '/teacher/analytics?filter=top-performers'
    },
    {
      type: 'warning' as const,
      icon: AlertTriangle,
      title: 'Attention Needed',
      description: `${stats?.pendingSubmissions || 0} submissions waiting for review`,
      action: 'Grade now',
      href: '/teacher/assignments/grade'
    },
    {
      type: 'info' as const,
      icon: Target,
      title: 'Upcoming Deadlines',
      description: `${stats?.upcomingDeadlines?.length || 0} assignments due this week`,
      action: 'View calendar',
      href: '/teacher/assignments?filter=upcoming'
    },
    {
      type: 'tip' as const,
      icon: Lightbulb,
      title: 'Teaching Tip',
      description: 'Students learn best with hands-on AI projects',
      action: 'Browse projects',
      href: '/teacher/resources?type=projects'
    }
  ]
  
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      action: 'text-green-600 hover:text-green-700'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      action: 'text-orange-600 hover:text-orange-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      action: 'text-blue-600 hover:text-blue-700'
    },
    tip: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      action: 'text-purple-600 hover:text-purple-700'
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Teaching Insights
        </h2>
      </div>
      
      <div className="p-6 space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          const styles = typeStyles[insight.type]
          
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-lg border",
                styles.bg,
                styles.border
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("w-5 h-5 mt-0.5", styles.icon)} />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {insight.description}
                  </p>
                  <Link
                    href={insight.href}
                    className={cn(
                      "text-sm font-medium inline-flex items-center gap-1",
                      styles.action
                    )}
                  >
                    {insight.action} →
                  </Link>
                </div>
              </div>
            </motion.div>
          )
        })}
        
        {/* Achievement highlights */}
        {stats?.recentAchievements && stats.recentAchievements > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Great Progress!</h3>
                <p className="text-sm opacity-90">
                  Your students earned {stats.recentAchievements} achievements this week
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}