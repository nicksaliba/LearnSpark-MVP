// components/gamification/level-indicator.tsx - Level Indicator Component
'use client'

import { motion } from 'framer-motion'
import { Crown, Star, Zap } from 'lucide-react'

interface LevelIndicatorProps {
  level: number
  animated?: boolean
}

export function LevelIndicator({ level, animated = true }: LevelIndicatorProps) {
  const getLevelIcon = (level: number) => {
    if (level <= 10) return Star
    if (level <= 25) return Zap
    return Crown
  }

  const getLevelColor = (level: number) => {
    if (level <= 10) return 'from-blue-400 to-blue-600'
    if (level <= 25) return 'from-purple-400 to-purple-600'
    return 'from-yellow-400 to-yellow-600'
  }

  const Icon = getLevelIcon(level)
  const colorClass = getLevelColor(level)

  return (
    <motion.div
      className={`inline-flex items-center gap-2 bg-gradient-to-r ${colorClass} text-white px-4 py-2 rounded-full shadow-lg`}
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Icon className="h-5 w-5" />
      <span className="font-bold">Level {level}</span>
    </motion.div>
  )
}
