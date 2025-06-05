
// components/dashboard/module-cards.tsx - Learning Modules Component
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code, Brain, Crown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function ModuleCards() {
  const modules = [
    {
      id: 'code-kingdom',
      title: 'Code Kingdom',
      description: 'Master Python, JavaScript and more',
      icon: Code,
      progress: 65,
      totalLessons: 25,
      completedLessons: 16,
      color: 'from-blue-500 to-blue-600',
      nextLesson: 'Functions & Scope',
    },
    {
      id: 'ai-citadel',
      title: 'AI Citadel',
      description: 'Explore machine learning and AI ethics',
      icon: Brain,
      progress: 30,
      totalLessons: 20,
      completedLessons: 6,
      color: 'from-purple-500 to-purple-600',
      nextLesson: 'Neural Networks Basics',
    },
    {
      id: 'chess-arena',
      title: 'Chess Arena',
      description: 'Develop strategic thinking skills',
      icon: Crown,
      progress: 45,
      totalLessons: 15,
      completedLessons: 7,
      color: 'from-yellow-500 to-yellow-600',
      nextLesson: 'Endgame Strategies',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Header with Icon */}
            <div className={`bg-gradient-to-r ${module.color} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <module.icon className="h-8 w-8" />
                <div className="text-right">
                  <div className="text-sm opacity-90">Progress</div>
                  <div className="text-xl font-bold">{module.progress}%</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mt-4 mb-2">{module.title}</h3>
              <p className="text-sm opacity-90">{module.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${module.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${module.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{module.completedLessons}/{module.totalLessons} lessons</span>
                <span>{module.progress}% complete</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Next lesson:</div>
                <div className="font-medium text-gray-900">{module.nextLesson}</div>
              </div>

              <Button asChild className="w-full group-hover:scale-105 transition-transform">
                <Link href={`/learn/${module.id}`} className="flex items-center justify-center gap-2">
                  Continue Learning
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
