
// components/learn/lesson-content.tsx - Lesson Content Wrapper
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Target, Award, ArrowRight } from 'lucide-react'

interface LessonContentProps {
  lesson: {
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    xpReward: number
    estimatedTime: number
    objectives: string[]
  }
  children: React.ReactNode
  onComplete?: () => void
}

export function LessonContent({ lesson, children, onComplete }: LessonContentProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{lesson.estimatedTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{lesson.xpReward} XP</span>
              </div>
            </div>
          </div>
          
          <Badge className={difficultyColors[lesson.difficulty]}>
            {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
          </Badge>
        </div>

        {/* Learning Objectives */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Objectives
          </h3>
          <ul className="space-y-1">
            {lesson.objectives.map((objective, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Lesson Content */}
      {children}

      {/* Completion Button */}
      {onComplete && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">Ready to move on?</h3>
            <p className="text-gray-600 mb-4">
              Complete this lesson to earn {lesson.xpReward} XP and unlock the next challenge!
            </p>
            <Button onClick={onComplete} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Complete Lesson
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
