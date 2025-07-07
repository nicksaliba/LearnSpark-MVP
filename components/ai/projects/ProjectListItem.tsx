// components/ai/projects/ProjectListItem.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Eye, 
  Heart, 
  ExternalLink,
  Code2,
  Brain,
  MessageSquare,
  Image,
  Calendar,
  Trophy,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Globe,
  Lock as LockIcon
} from 'lucide-react'
import { AIProjectWithRelations } from '@/types/ai-platform'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { showToast } from '@/lib/toast'

interface Props {
  project: AIProjectWithRelations
  onEdit?: (projectId: string) => void
  onDelete?: (projectId: string) => void
  showActions?: boolean
  isOwner?: boolean
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

const projectTypeLabels = {
  TEACHABLE_MACHINE: 'Teachable Machine',
  CHATBOT: 'Chatbot',
  NEURAL_NETWORK: 'Neural Network',
  GAME_AI: 'Game AI',
  DATA_VISUALIZATION: 'Data Visualization',
  ML_MODEL: 'ML Model',
  CREATIVE_AI: 'Creative AI'
}

export function ProjectListItem({ 
  project, 
  onEdit,
  onDelete,
  showActions = true,
  isOwner = false
}: Props) {
  const [isLiked, setIsLiked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const Icon = projectTypeIcons[project.projectType] || Code2
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLiked(!isLiked)
    // TODO: Call API to update likes
    showToast.success(isLiked ? 'Removed from favorites' : 'Added to favorites')
  }
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    // Copy project link to clipboard
    const projectUrl = `${window.location.origin}/ai-portfolio/project/${project.id}`
    navigator.clipboard.writeText(projectUrl)
    showToast.success('Project link copied to clipboard!')
  }
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete?.(project.id)
      showToast.success('Project deleted')
    }
  }
  
  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    REVIEWED: 'bg-purple-100 text-purple-700',
    PUBLISHED: 'bg-green-100 text-green-700'
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
    >
      <Link href={`/ai-portfolio/project/${project.id}`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Project Type Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            
            {/* Project Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    {project.title}
                    {project.isPublic ? (
                      <Globe className="w-4 h-4 text-gray-400" />
                    ) : (
                      <LockIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <img
                        src={project.user.avatarUrl || '/default-avatar.png'}
                        alt={project.user.username}
                        className="w-4 h-4 rounded-full"
                      />
                      <span>{project.user.username}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(project.createdAt))} ago</span>
                    </div>
                    
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      statusColors[project.status]
                    )}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                {/* Actions Menu */}
                {showActions && isOwner && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setShowMenu(!showMenu)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            onEdit?.(project.id)
                            setShowMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Project
                        </button>
                        
                        <button
                          onClick={handleShare}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share Link
                        </button>
                        
                        <hr className="my-1" />
                        
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Project
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Description */}
              {project.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              {/* Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    Type: <span className="font-medium text-gray-700">
                      {projectTypeLabels[project.projectType]}
                    </span>
                  </span>
                  
                  <span className="text-gray-500">
                    Lesson: <span className="font-medium text-gray-700">
                      {project.lesson.title}
                    </span>
                  </span>
                  
                  {project.score && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-700">{project.score}%</span>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
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
                  
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}