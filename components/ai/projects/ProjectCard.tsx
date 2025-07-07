// components/ai/projects/ProjectCard.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Eye, 
  Heart, 
  MessageCircle,
  ExternalLink,
  Code2,
  Brain,
  MessageSquare,
  Image,
  MoreVertical
} from 'lucide-react'
import { AIProjectWithRelations } from '@/types/ai-platform'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  project: AIProjectWithRelations
}

const projectTypeIcons = {
  TEACHABLE_MACHINE: Image,
  CHATBOT: MessageSquare,
  NEURAL_NETWORK: Brain,
  GAME_AI: Code2,
  DATA_VISUALIZATION: Eye,
  ML_MODEL: Brain,
  CREATIVE_AI: Image
}

const projectTypeColors = {
  TEACHABLE_MACHINE: 'from-green-400 to-emerald-500',
  CHATBOT: 'from-purple-400 to-pink-500',
  NEURAL_NETWORK: 'from-orange-400 to-red-500',
  GAME_AI: 'from-blue-400 to-indigo-500',
  DATA_VISUALIZATION: 'from-cyan-400 to-blue-500',
  ML_MODEL: 'from-yellow-400 to-orange-500',
  CREATIVE_AI: 'from-pink-400 to-purple-500'
}

export function ProjectCard({ project }: Props) {
  const [isLiked, setIsLiked] = useState(false)
  const Icon = projectTypeIcons[project.projectType] || Code2
  const gradientColor = projectTypeColors[project.projectType] || 'from-gray-400 to-gray-500'
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLiked(!isLiked)
    // TODO: Call API to update likes
  }
  
  return (
    <Link href={`/ai-portfolio/project/${project.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* Project Type Header */}
        <div className={cn(
          "h-32 bg-gradient-to-br flex items-center justify-center relative",
          gradientColor
        )}>
          <Icon className="w-12 h-12 text-white/80" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              project.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
              project.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            )}>
              {project.status}
            </span>
          </div>
        </div>
        
        <div className="p-5">
          {/* Title & Author */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <img
              src={project.user.avatarUrl || '/default-avatar.png'}
              alt={project.user.username}
              className="w-5 h-5 rounded-full"
            />
            <span>{project.user.username}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(project.createdAt))} ago</span>
          </div>
          
          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}
          
          {/* Lesson Info */}
          <div className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Lesson:</span> {project.lesson.title}
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Heart className={cn(
                  "w-4 h-4",
                  isLiked && "fill-red-500 text-red-500"
                )} />
                <span className="text-sm">{project.likes}</span>
              </button>
              
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{project.views}</span>
              </div>
            </div>
            
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}