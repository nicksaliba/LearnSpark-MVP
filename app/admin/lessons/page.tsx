// app/admin/lessons/page.tsx - Lessons Management
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Code,
  Brain,
  Crown,
  BookOpen,
  Clock,
  Award,
  Users
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string
  module: string
  orderIndex: number
  xpReward: number
  content: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number
  }
  _count?: {
    progress: number
  }
}

const moduleIcons = {
  'code-kingdom': Code,
  'ai-citadel': Brain,
  'chess-arena': Crown
}

const moduleColors = {
  'code-kingdom': 'from-blue-500 to-blue-600',
  'ai-citadel': 'from-purple-500 to-purple-600',
  'chess-arena': 'from-yellow-500 to-yellow-600'
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/lessons')
      if (!response.ok) {
        throw new Error('Failed to fetch lessons')
      }
      const data = await response.json()
      console.log('📚 Admin lessons data received:', data)
      console.log('📚 Lessons array:', data.lessons)
      console.log('📚 First lesson:', data.lessons?.[0])
      setLessons(data.lessons)
    } catch (err) {
      setError('Failed to load lessons')
      console.error('Lessons fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete lesson')
      }

      setLessons(lessons.filter(lesson => lesson.id !== lessonId))
    } catch (err) {
      alert('Failed to delete lesson')
      console.error('Delete lesson error:', err)
    }
  }

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === 'all' || lesson.module === selectedModule
    return matchesSearch && matchesModule
  })

  const groupedLessons = filteredLessons.reduce((groups, lesson) => {
    const module = lesson.module
    if (!groups[module]) {
      groups[module] = []
    }
    groups[module].push(lesson)
    return groups
  }, {} as Record<string, Lesson[]>)

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lessons Management</h1>
          <p className="text-gray-600">Create and manage learning content</p>
        </div>
        <Button asChild>
          <Link href="/admin/lessons/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Lesson
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules</option>
            <option value="code-kingdom">Code Kingdom</option>
            <option value="ai-citadel">AI Citadel</option>
            <option value="chess-arena">Chess Arena</option>
          </select>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Lessons by Module */}
      {Object.entries(groupedLessons).map(([module, moduleLessons]) => {
        const Icon = moduleIcons[module as keyof typeof moduleIcons] || BookOpen
        const colorClass = moduleColors[module as keyof typeof moduleColors] || 'from-gray-500 to-gray-600'
        
        return (
          <div key={module} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`bg-gradient-to-r ${colorClass} p-2 rounded-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {module.replace('-', ' ')}
              </h2>
              <Badge variant="secondary">
                {moduleLessons.length} lessons
              </Badge>
            </div>

            <div className="grid gap-4">
              {moduleLessons
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((lesson) => (
                <Card key={lesson.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lesson.orderIndex}. {lesson.title}
                        </h3>
                        <Badge className={difficultyColors[lesson.content.difficulty]}>
                          {lesson.content.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {lesson.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.content.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>{lesson.xpReward} XP</span>
                        </div>
                        {lesson._count && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{lesson._count.progress} completions</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild={!!lesson.id}
                        disabled={!lesson.id}
                      >
                        {lesson.id ? (
                          <Link href={`/learn/${module}/${lesson.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="cursor-not-allowed">
                            <Eye className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild={!!lesson.id}
                        disabled={!lesson.id}
                      >
                        {lesson.id ? (
                          <Link href={`/admin/lessons/${lesson.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="cursor-not-allowed">
                            <Edit className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => lesson.id && handleDeleteLesson(lesson.id)}
                        disabled={!lesson.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {filteredLessons.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedModule !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first lesson'
            }
          </p>
          {!searchTerm && selectedModule === 'all' && (
            <Button asChild>
              <Link href="/admin/lessons/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Lesson
              </Link>
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}