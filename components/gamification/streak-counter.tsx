
// components/gamification/streak-counter.tsx - Streak Counter Component
'use client'

import { motion } from 'framer-motion'
import { Flame, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string
}

export function StreakCounter({ 
  currentStreak, 
  longestStreak, 
  lastActiveDate = 'Today' 
}: StreakCounterProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-red-500 to-orange-500'
    if (streak >= 14) return 'from-orange-500 to-yellow-500'
    if (streak >= 7) return 'from-yellow-500 to-amber-500'
    return 'from-blue-500 to-indigo-500'
  }

  const getStreakTitle = (streak: number) => {
    if (streak >= 30) return 'Legendary Streak! 🔥'
    if (streak >= 14) return 'Amazing Streak! 🚀'
    if (streak >= 7) return 'Great Streak! ⭐'
    return 'Building Momentum! 💪'
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className={`bg-gradient-to-r ${getStreakColor(currentStreak)} p-3 rounded-xl`}
            animate={{ 
              scale: currentStreak > 0 ? [1, 1.1, 1] : 1,
            }}
            transition={{ 
              duration: 2, 
              repeat: currentStreak > 0 ? Infinity : 0,
              ease: 'easeInOut'
            }}
          >
            <Flame className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentStreak} Day Streak</h3>
            <p className="text-sm text-gray-600">{getStreakTitle(currentStreak)}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-gray-500 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{lastActiveDate}</span>
          </div>
          <p className="text-sm text-gray-600">
            Best: {longestStreak} days
          </p>
        </div>
      </div>

      {/* Streak Visualization */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => {
          const dayIndex = i + 1
          const isActive = dayIndex <= currentStreak
          return (
            <motion.div
              key={i}
              className={`h-8 rounded ${
                isActive 
                  ? `bg-gradient-to-r ${getStreakColor(currentStreak)}` 
                  : 'bg-gray-200'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          )
        })}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>This Week</span>
        <span>{Math.min(currentStreak, 7)}/7 days</span>
      </div>
    </Card>
  )
}
              