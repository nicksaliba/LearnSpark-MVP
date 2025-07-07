// components/ai/gamification/LevelProgress.tsx
'use client'

import { motion } from 'framer-motion'
import { Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  currentLevel: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
}

export function LevelProgress({ 
  currentLevel, 
  currentXP, 
  nextLevelXP,
  totalXP 
}: Props) {
  const progress = (currentXP / nextLevelXP) * 100
  const levelColors = [
    'from-green-400 to-emerald-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red-500',
    'from-yellow-400 to-orange-500'
  ]
  
  const currentColor = levelColors[(currentLevel - 1) % levelColors.length]
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br",
            currentColor
          )}>
            {currentLevel}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Level {currentLevel}</h3>
            <p className="text-sm text-gray-600">AI Explorer</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-purple-600">
            <Zap className="w-5 h-5" />
            <span className="font-bold">{totalXP.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress to Level {currentLevel + 1}</span>
          <span className="font-medium text-gray-900">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
        
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full bg-gradient-to-r", currentColor)}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Level milestones */}
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full bg-gray-300"
              style={{ left: `${milestone}%` }}
            />
          ))}
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          {nextLevelXP - currentXP} XP to next level
        </p>
      </div>
      
      {/* Next rewards preview */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-900">Next Reward:</span>
          <span className="text-purple-700">Advanced AI Tools Unlock</span>
        </div>
      </div>
    </div>
  )
}