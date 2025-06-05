
// components/dashboard/recent-activity.tsx - Recent Activity Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, BookOpen, Trophy, Code } from 'lucide-react'

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'lesson_completed',
      title: 'Completed "Python Variables"',
      description: 'Code Kingdom • Lesson 5',
      timestamp: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'achievement_earned',
      title: 'Earned "Streak Master"',
      description: '7-day learning streak achievement',
      timestamp: '1 day ago',
      icon: Trophy,
      color: 'text-yellow-600',
    },
    {
      id: 3,
      type: 'lesson_started',
      title: 'Started "Functions & Scope"',
      description: 'Code Kingdom • Lesson 6',
      timestamp: '2 days ago',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      id: 4,
      type: 'code_submitted',
      title: 'Submitted coding exercise',
      description: 'Perfect score on "Loop Challenges"',
      timestamp: '3 days ago',
      icon: Code,
      color: 'text-purple-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg bg-gray-100`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                <p className="text-xs text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
