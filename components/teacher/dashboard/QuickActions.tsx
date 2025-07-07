// components/teacher/dashboard/QuickActions.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  Plus, 
  FileText, 
  Users, 
  BarChart,
  Sparkles 
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const actions = [
  {
    label: 'Create Assignment',
    icon: Plus,
    href: '/teacher/assignments/new',
    color: 'from-blue-400 to-blue-600',
    description: 'Assign new AI lessons'
  },
  {
    label: 'Grade Work',
    icon: FileText,
    href: '/teacher/assignments/grade',
    color: 'from-green-400 to-green-600',
    description: 'Review submissions'
  },
  {
    label: 'View Analytics',
    icon: BarChart,
    href: '/teacher/analytics',
    color: 'from-purple-400 to-purple-600',
    description: 'Class performance'
  },
  {
    label: 'AI Assistant',
    icon: Sparkles,
    href: '/teacher/ai-assistant',
    color: 'from-orange-400 to-orange-600',
    description: 'Get teaching help'
  }
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon
        
        return (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className="block bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 bg-gradient-to-br",
                action.color
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}