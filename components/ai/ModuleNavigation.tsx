// components/ai/ModuleNavigation.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  Cpu, 
  Rocket,
  Lock,
  CheckCircle2 
} from 'lucide-react'
import { useAIProgress } from '@/hooks/useAI'
import { cn } from '@/lib/utils'
import { GradeLevel } from '@prisma/client'

const moduleConfig = {
  [GradeLevel.K2]: {
    modules: [
      {
        id: 'smart-tech',
        name: 'Smart Technology',
        slug: 'k2-smart-tech',
        icon: Sparkles,
        color: 'from-yellow-400 to-orange-500',
        description: 'Discover how technology can be smart!'
      }
    ]
  },
  [GradeLevel.G35]: {
    modules: [
      {
        id: 'ai-basics',
        name: 'AI Basics',
        slug: '35-ai-basics',
        icon: Brain,
        color: 'from-blue-400 to-purple-500',
        description: 'Learn what AI is and how it works'
      }
    ]
  },
  [GradeLevel.G68]: {
    modules: [
      {
        id: 'ml-applications',
        name: 'Machine Learning',
        slug: '68-ml-applications',
        icon: Cpu,
        color: 'from-green-400 to-teal-500',
        description: 'Explore how computers learn from data'
      }
    ]
  },
  [GradeLevel.G912]: {
    modules: [
      {
        id: 'advanced-ai',
        name: 'Advanced AI',
        slug: '912-advanced-ai',
        icon: Rocket,
        color: 'from-purple-400 to-pink-500',
        description: 'Deep dive into neural networks and AI'
      }
    ]
  }
}

interface Props {
  userGradeLevel?: string | null
}

export function ModuleNavigation({ userGradeLevel }: Props) {
  const pathname = usePathname()
  const { progress, stats } = useAIProgress()
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  
  const gradeLevel = userGradeLevel as GradeLevel | null
  const modules = gradeLevel ? moduleConfig[gradeLevel]?.modules || [] : []
  
  // Add modules from other grade levels if unlocked
  const allModules = [...modules]
  
  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.filter(p => 
      p.lesson.module.slug === moduleId
    )
    const completed = moduleProgress.filter(p => p.status === 'COMPLETED').length
    const total = moduleProgress.length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }
  
  const isModuleLocked = (moduleId: string, index: number) => {
    // First module is always unlocked
    if (index === 0) return false
    
    // Check if previous module is completed
    const prevModule = allModules[index - 1]
    const prevProgress = getModuleProgress(prevModule.id)
    return prevProgress.percentage < 80 // Require 80% completion to unlock next
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-600" />
        AI Learning Path
      </h2>
      
      <div className="space-y-4">
        {allModules.map((module, index) => {
          const isActive = pathname.includes(module.slug)
          const isLocked = isModuleLocked(module.id, index)
          const moduleProgress = getModuleProgress(module.id)
          const Icon = module.icon
          
          return (
            <motion.div
              key={module.id}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
              onHoverStart={() => setHoveredModule(module.id)}
              onHoverEnd={() => setHoveredModule(null)}
            >
              <Link 
                href={isLocked ? '#' : `/ai-modules/${module.slug}`}
                className={cn(
                  "block relative overflow-hidden rounded-lg transition-all duration-300",
                  isActive && "ring-2 ring-purple-500 ring-offset-2",
                  isLocked && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10",
                  module.color
                )} />
                
                <div className="relative p-4 bg-white/90 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br text-white",
                        module.color
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {module.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : moduleProgress.percentage === 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : null}
                  </div>
                  
                  {!isLocked && moduleProgress.total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{moduleProgress.completed}/{moduleProgress.total} lessons</span>
                        <span>{Math.round(moduleProgress.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={cn("h-full bg-gradient-to-r", module.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${moduleProgress.percentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {hoveredModule === module.id && !isLocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
      
      {modules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No modules available for your grade level.</p>
          <p className="text-sm mt-2">Contact your teacher for assistance.</p>
        </div>
      )}
    </div>
  )
}