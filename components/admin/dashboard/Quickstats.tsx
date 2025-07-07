// components/admin/dashboard/QuickStats.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  School, 
  BookOpen, 
  TrendingUp,
  Activity,
  Award
} from 'lucide-react'
import { useAdminStats } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

export function QuickStats() {
  const { stats, isLoading } = useAdminStats()
  
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Active Schools',
      value: stats?.activeSchools || 0,
      change: '+5%',
      trend: 'up',
      icon: School,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Lessons Completed',
      value: stats?.lessonsCompleted || 0,
      change: '+23%',
      trend: 'up',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Avg Engagement',
      value: `${stats?.avgEngagement || 0}%`,
      change: '+8%',
      trend: 'up',
      icon: Activity,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Weekly Active',
      value: stats?.weeklyActiveUsers || 0,
      change: '-3%',
      trend: 'down',
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600'
    },
    {
      label: 'Achievements',
      value: stats?.totalAchievements || 0,
      change: '+15%',
      trend: 'up',
      icon: Award,
      color: 'from-indigo-500 to-indigo-600'
    }
  ]
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-lg bg-gradient-to-br text-white flex items-center justify-center",
                stat.color
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-medium",
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {stat.change}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-900">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {stat.label}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}