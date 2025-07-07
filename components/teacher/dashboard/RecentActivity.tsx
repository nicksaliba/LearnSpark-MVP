// components/teacher/dashboard/RecentActivity.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity,
  Trophy,
  CheckCircle,
  PlayCircle,
  User,
  Clock,
  Filter,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Award,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRecentActivity } from '@/hooks/useTeacher'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  teacherId: string
  classId?: string
}

type ActivityType = 'submission' | 'achievement' | 'progress' | 'login' | 'help_request' | 'project'

const activityConfig: Record<ActivityType, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}> = {
  submission: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  achievement: {
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  progress: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  login: {
    icon: User,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  help_request: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  project: {
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }
}

export function RecentActivity({ teacherId, classId }: Props) {
  const [filter, setFilter] = useState<'all' | ActivityType>('all')
  const [timeRange, setTimeRange] = useState<number>(7) // days
  
  const { activities, isLoading, isError } = useRecentActivity({
    classId,
    days: timeRange
  })
  
  // Filter activities based on selected filter
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter)
  
  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, typeof activities>)
  
  const handleRefresh = () => {
    // Trigger refresh - the hook will handle the actual refresh
    window.location.reload()
  }
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load activity feed</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent Activity
          </h2>
          
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="submission">Submissions</option>
              <option value="achievement">Achievements</option>
              <option value="progress">Progress</option>
              <option value="help_request">Help Requests</option>
              <option value="project">Projects</option>
            </select>
          </div>
          
          {/* Time Range */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={1}>Today</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Activity Feed */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Activity will appear here as students work on lessons
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => {
              const isToday = date === new Date().toDateString()
              const isYesterday = date === new Date(Date.now() - 86400000).toDateString()
              
              return (
                <div key={date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    {isToday ? 'Today' : isYesterday ? 'Yesterday' : date}
                  </h3>
                  
                  <div className="space-y-3">
                    {dateActivities.map((activity, index) => {
                      const config = activityConfig[activity.type as ActivityType] || activityConfig.progress
                      const Icon = config.icon
                      
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {/* Icon */}
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            config.bgColor
                          )}>
                            <Icon className={cn("w-5 h-5", config.color)} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                  <Link
                                    href={`/teacher/students/${activity.studentId}`}
                                    className="font-medium hover:text-purple-600"
                                  >
                                    {activity.studentName}
                                  </Link>
                                  {' '}
                                  <span className="text-gray-600">
                                    {activity.description}
                                  </span>
                                </p>
                                
                                {/* Additional metadata */}
                                {activity.metadata && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    {activity.type === 'submission' && activity.metadata.score && (
                                      <span>Score: {activity.metadata.score}%</span>
                                    )}
                                    {activity.type === 'achievement' && activity.metadata.achievement && (
                                      <span className="flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        {activity.metadata.achievement}
                                      </span>
                                    )}
                                    {activity.type === 'help_request' && activity.metadata.lesson && (
                                      <span>Lesson: {activity.metadata.lesson}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatDistanceToNow(new Date(activity.timestamp), { 
                                  addSuffix: true 
                                })}
                              </span>
                            </div>
                            
                            {/* Action buttons for certain activity types */}
                            {activity.type === 'help_request' && (
                              <div className="mt-2">
                                <Link
                                  href={`/teacher/messages?student=${activity.studentId}`}
                                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Respond
                                </Link>
                              </div>
                            )}
                            
                            {activity.type === 'submission' && activity.metadata?.assignmentId && (
                              <div className="mt-2">
                                <Link
                                  href={`/teacher/assignments/${activity.metadata.assignmentId}/grade`}
                                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Grade
                                </Link>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      {filteredActivities.length > 0 && (
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filteredActivities.length} activities in the last {timeRange} day{timeRange !== 1 ? 's' : ''}
            </span>
            <Link
              href="/teacher/analytics"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View Full Analytics →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}