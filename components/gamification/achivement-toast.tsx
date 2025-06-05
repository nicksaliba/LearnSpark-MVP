// components/gamification/achievement-toast.tsx - Achievement Toast Component
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Achievement {
  id: string
  name: string
  description: string
  xp: number
  icon?: React.ComponentType<{ className?: string }>
}

interface AchievementToastProps {
  achievement: Achievement
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export function AchievementToast({ 
  achievement, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const Icon = achievement.icon || Trophy

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border-l-4 border-yellow-500 p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Icon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">Achievement Unlocked!</h4>
              <p className="font-medium text-gray-800">{achievement.name}</p>
              <p className="text-sm text-gray-600">{achievement.description}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  +{achievement.xp} XP
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}