// components/gamification/xp-bar.tsx - XP Bar Component
'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface XPBarProps {
  currentXP: number
  xpToNextLevel: number
  level: number
  totalXP: number
}

// React 19 automatically optimizes this component
export function XPBar({ currentXP, xpToNextLevel, level, totalXP }: XPBarProps) {
  const percentage = (currentXP / xpToNextLevel) * 100
  const levelTitle = getLevelTitle(level)

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Level {level}</h3>
            <p className="text-sm text-gray-600">{levelTitle}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+150 XP today</span>
          </div>
          <p className="text-sm text-gray-600">
            {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
          
          {/* Progress Bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>

        {/* XP Labels */}
        <div className="flex justify-between mt-2">
          <span className="text-xs font-medium text-gray-700">
            {Math.round(percentage)}% to next level
          </span>
          <span className="text-xs text-gray-500">
            {xpToNextLevel - currentXP} XP remaining
          </span>
        </div>
      </div>

      {/* Total XP */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total XP: <span className="font-bold text-purple-600">{totalXP.toLocaleString()}</span>
        </p>
      </div>
    </Card>
  )
}

function getLevelTitle(level: number): string {
  if (level <= 5) return 'Novice Explorer'
  if (level <= 10) return 'Code Apprentice'
  if (level <= 20) return 'Digital Warrior'
  if (level <= 35) return 'Tech Wizard'
  if (level <= 50) return 'Master Coder'
  return 'Legendary Programmer'
}