// components/ai/projects/ProjectGallery.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid3X3, 
  List, 
  Filter,
  Search,
  Globe,
  Lock
} from 'lucide-react'
import { useAIProjects } from '@/hooks/useAI'
import { ProjectCard } from './ProjectCard'
import { ProjectListItem } from './ProjectListItem'
import { cn } from '@/lib/utils'
import { ProjectStatus } from '@prisma/client'

interface Props {
  userId?: string
  showPublicProjects?: boolean
}

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | ProjectStatus

export function ProjectGallery({ 
  userId, 
  showPublicProjects = false 
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyPublic, setShowOnlyPublic] = useState(showPublicProjects)
  
  const { projects, isLoading } = useAIProjects({
    userId: showOnlyPublic ? undefined : userId,
    status: filterStatus === 'all' ? undefined : filterStatus,
    isPublic: showOnlyPublic ? true : undefined
  })
  
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const statusFilters = [
    { value: 'all' as FilterStatus, label: 'All Projects' },
    { value: 'DRAFT' as FilterStatus, label: 'Drafts' },
    { value: 'SUBMITTED' as FilterStatus, label: 'Submitted' },
    { value: 'PUBLISHED' as FilterStatus, label: 'Published' }
  ]
  
  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  filterStatus === filter.value ?
                    "bg-purple-500 text-white" :
                    "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyPublic(!showOnlyPublic)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                showOnlyPublic ?
                  "bg-blue-500 text-white" :
                  "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {showOnlyPublic ? (
                <>
                  <Globe className="w-4 h-4" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  My Projects
                </>
              )}
            </button>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded transition-all duration-200",
                  viewMode === 'grid' ?
                    "bg-white text-purple-600 shadow-sm" :
                    "text-gray-600 hover:text-gray-900"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-all duration-200",
                  viewMode === 'list' ?
                    "bg-white text-purple-600 shadow-sm" :
                    "text-gray-600 hover:text-gray-900"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projects Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchQuery ? 
              `No projects found matching "${searchQuery}"` : 
              'No projects yet'}
          </p>
          {!showOnlyPublic && !searchQuery && (
            <p className="text-sm text-gray-400">
              Start creating your first AI project!
            </p>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectListItem project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}