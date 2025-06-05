
// components/dashboard/achievement-showcase.tsx - Achievements Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Zap, Target, Award, Crown } from 'lucide-react'

export function AchievementShowcase() {
  const recentAchievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Completed your first lesson',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800',
      earnedAt: '2 days ago',
      xp: 50,
    },
    {
      id: 2,
      name: 'Code Warrior',
      description: 'Wrote your first function',
      icon: Zap,
      color: 'bg-blue-100 text-blue-800',
      earnedAt: '1 week ago',
      xp: 100,
    },
    {
      id: 3,
      name: 'Streak Master',
      description: '7-day learning streak',
      icon: Target,
      color: 'bg-orange-100 text-orange-800',
      earnedAt: 'Today',
      xp: 200,
    },
  ]

  const nextAchievements = [
    {
      name: 'Function Master',
      description: 'Complete 10 function exercises',
      progress: 70,
      icon: Award,
    },
    {
      name: 'AI Explorer',
      description: 'Complete first AI lesson',
      progress: 0,
      icon: Crown,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recent Achievements */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recently Earned</h4>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${achievement.color}`}>
                  <achievement.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{achievement.name}</p>
                  <p className="text-xs text-gray-600 truncate">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      +{achievement.xp} XP
                    </Badge>
                    <span className="text-xs text-gray-500">{achievement.earnedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Achievements */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Coming Up</h4>
          <div className="space-y-3">
            {nextAchievements.map((achievement, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <achievement.icon className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 text-sm">{achievement.name}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{achievement.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
