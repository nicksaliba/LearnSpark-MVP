// components/ai/gamification/AchievementPopup.tsx
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Props {
  achievement: Achievement | null
  onClose: () => void
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600'
}

export function AchievementPopup({ achievement, onClose }: Props) {
  useEffect(() => {
    if (achievement) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      // Auto-close after 5 seconds
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])
  
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className={cn(
            "relative bg-white rounded-xl shadow-2xl p-6 pr-12 max-w-sm",
            "ring-2 ring-offset-2",
            achievement.rarity === 'legendary' ? 'ring-yellow-400' :
            achievement.rarity === 'epic' ? 'ring-purple-400' :
            achievement.rarity === 'rare' ? 'ring-blue-400' :
            'ring-gray-400'
          )}>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-br text-white text-2xl",
                rarityColors[achievement.rarity]
              )}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">
                    +{achievement.xpReward} XP
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}