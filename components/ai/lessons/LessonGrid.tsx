// components/ai/lessons/LessonGrid.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Clock, 
  Trophy, 
  Play, 
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AILessonWithProgress } from '@/types/ai-platform'

interface Props {
  lessons: AILessonWithProgress[]
  moduleSlug: string
  showProgress?: boolean
}

export function LessonGrid({ lessons, moduleSlug, showProgress = true }: Props) {
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null)
  
  const getLessonStatus = (lesson: AILessonWithProgress) => {
    const progress = lesson.progress?.[0]
    if (!progress) return 'not-started'
    return progress.status.toLowerCase()
  }
  
  const isLessonLocked = (lesson: AILessonWithProgress, index: number) => {
    // First lesson is always unlocked
    if (index === 0) return false
    
    // Check if previous lesson is completed
    const prevLesson = lessons[index - 1]
    const prevStatus = getLessonStatus(prevLesson)
    return prevStatus !== 'completed'
  }
  
  const difficultyColors = {
    BEGINNER: 'from-green-400 to-emerald-500',
    INTERMEDIATE: 'from-blue-400 to-indigo-500',
    ADVANCED: 'from-purple-400 to-pink-500'
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson, index) => {
        const status = getLessonStatus(lesson)
        const isLocked = isLessonLocked(lesson, index)
        const progress = lesson.progress?.[0]
        
        return (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={!isLocked ? { y: -5 } : {}}
            onHoverStart={() => setHoveredLesson(lesson.id)}
            onHoverEnd={() => setHoveredLesson(null)}
          >
            <Link
              href={isLocked ? '#' : `/ai-modules/${moduleSlug}/lesson/${lesson.id}`}
              className={cn(
                "block h-full",
                isLocked && "cursor-not-allowed"
              )}
            >
              <div className={cn(
                "relative h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300",
                !isLocked && "hover:shadow-xl",
                status === 'completed' && "ring-2 ring-green-500 ring-offset-2"
              )}>
                {/* Difficulty Banner */}
                <div className={cn(
                  "absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white rounded-bl-lg bg-gradient-to-r",
                  difficultyColors[lesson.difficulty]
                )}>
                  {lesson.difficulty}
                </div>
                
                <div className="p-6">
                  {/* Lesson Number & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                        status === 'completed' ? 'bg-green-500' : 
                        status === 'in-progress' ? 'bg-blue-500' : 
                        'bg-gray-300'
                      )}>
                        {status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {isLocked && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    {progress?.score && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        {progress.score}%
                      </div>
                    )}
                  </div>
                  
                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {lesson.estimatedTime} min
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <Sparkles className="w-4 h-4" />
                      +{lesson.xpReward} XP
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <motion.button
                    className={cn(
                      "mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                      isLocked ? 
                        "bg-gray-100 text-gray-400 cursor-not-allowed" :
                      status === 'completed' ?
                        "bg-green-100 text-green-700 hover:bg-green-200" :
                      status === 'in-progress' ?
                        "bg-blue-500 text-white hover:bg-blue-600" :
                        "bg-purple-500 text-white hover:bg-purple-600"
                    )}
                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Locked
                      </>
                    ) : status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Review
                      </>
                    ) : status === 'in-progress' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start
                      </>
                    )}
                  </motion.button>
                </div>
                
                {/* Hover Effect */}
                {hoveredLesson === lesson.id && !isLocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}