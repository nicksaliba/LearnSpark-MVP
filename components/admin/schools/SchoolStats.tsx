// components/admin/schools/SchoolStats.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  School,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react'
import { useAdminStats } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

export function SchoolStats() {
  const { stats, isLoading } = useAdminStats()
  
  const schoolStats = [
    {
      label: 'Total Schools',
      value: stats?.totalSchools || 0,
      change: stats?.schoolGrowth || 0,
      icon: School,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Schools',
      value: stats?.activeSchools || 0,
      percentage: stats?.totalSchools ? 
        Math.round((stats.activeSchools / stats.totalSchools) * 100) : 0,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      change: stats?.teacherGrowth || 0,
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      change: stats?.studentGrowth || 0,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Avg School Size',
      value: stats?.avgSchoolSize || 0,
      suffix: 'students',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      label: 'Achievements/School',
      value: stats?.avgAchievementsPerSchool || 0,
      change: stats?.achievementGrowth || 0,
      icon: Award,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {schoolStats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                stat.bgColor
              )}>
                <Icon className={cn(
                  "w-5 h-5 bg-gradient-to-br bg-clip-text text-transparent",
                  stat.color
                )} />
              </div>
              
              {stat.change !== undefined && (
                <span className={cn(
                  "text-xs font-medium",
                  stat.change > 0 ? 'text-green-600' : 
                  stat.change < 0 ? 'text-red-600' : 
                  'text-gray-500'
                )}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </span>
              )}
              
              {stat.percentage !== undefined && (
                <span className="text-xs font-medium text-gray-500">
                  {stat.percentage}%
                </span>
              )}
            </div>
            
            <div className="text-2xl font-bold text-gray-900">
              {stat.value.toLocaleString()}
              {stat.suffix && (
                <span className="text-sm font-normal text-gray-600 ml-1">
                  {stat.suffix}
                </span>
              )}
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