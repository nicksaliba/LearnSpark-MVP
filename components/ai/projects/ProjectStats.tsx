// components/ai/projects/ProjectStats.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  Trophy, 
  Eye, 
  Heart,
  TrendingUp,
  Award
} from 'lucide-react'
import { useAIProjects } from '@/hooks/useAI'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
}

export function ProjectStats({ userId }: Props) {
  const { projects } = useAIProjects({ userId })
  
  const stats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'PUBLISHED').length,
    totalViews: projects.reduce((sum, p) => sum + p.views, 0),
    totalLikes: projects.reduce((sum, p) => sum + p.likes, 0),
    averageScore: projects
      .filter(p => p.score)
      .reduce((sum, p, _, arr) => sum + (p.score || 0) / arr.length, 0) || 0
  }
  
  const statCards = [
    {
      label: 'Total Projects',
      value: stats.total,
      icon: FolderOpen,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Published',
      value: stats.published,
      icon: Award,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Avg Score',
      value: stats.averageScore > 0 ? `${Math.round(stats.averageScore)}%` : 'N/A',
      icon: TrendingUp,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
              stat.bgColor
            )}>
              <Icon className={cn(
                "w-6 h-6 bg-gradient-to-br bg-clip-text text-transparent",
                stat.color
              )} />
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            
            <div className="text-sm text-gray-600">
              {stat.label}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}