// components/admin/dashboard/PlatformOverview.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp,
  Users,
  School,
  BookOpen,
  BarChart3
} from 'lucide-react'
import { useAdminAnalytics } from '@/hooks/useAdmin'
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'

export function PlatformOverview() {
  const { analytics, isLoading } = useAdminAnalytics({ range: '30d' })
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }
  
  const stats = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      growth: analytics?.userGrowth || 0,
      icon: Users
    },
    {
      label: 'Active Schools',
      value: analytics?.activeSchools || 0,
      growth: analytics?.schoolGrowth || 0,
      icon: School
    },
    {
      label: 'Lessons Created',
      value: analytics?.totalLessons || 0,
      growth: analytics?.lessonGrowth || 0,
      icon: BookOpen
    },
    {
      label: 'Completion Rate',
      value: `${analytics?.completionRate || 0}%`,
      growth: analytics?.completionGrowth || 0,
      icon: BarChart3
    }
  ]
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Platform Overview
        </h2>
      </div>
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className={cn(
                    "text-xs font-medium",
                    stat.growth > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.growth > 0 ? '+' : ''}{stat.growth}%
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-gray-900">
                  {typeof stat.value === 'number' ? 
                    stat.value.toLocaleString() : 
                    stat.value
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Growth Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Platform Growth (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics?.growthData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}