// hooks/useAI.ts - Custom hooks for AI features
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/swr'
import { 
  AILessonWithProgress, 
  AIProjectWithRelations,
  PersonalAnalytics,
  GradeLevel,
  LessonStatus,
  ProjectStatus 
} from '@/types/ai-platform'
import { showToast } from '@/lib/toast'

// Fetch AI lessons with optional filters
export function useAILessons(filters?: {
  gradeLevel?: GradeLevel
  moduleId?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (filters?.gradeLevel) params.append('gradeLevel', filters.gradeLevel)
  if (filters?.moduleId) params.append('moduleId', filters.moduleId)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  
  const { data, error, isLoading } = useSWR(
    `/api/ai/lessons${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
  
  return {
    lessons: data?.lessons || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/ai/lessons${params.toString() ? `?${params.toString()}` : ''}`)
  }
}

// Fetch single AI lesson
export function useAILesson(lessonId: string) {
  const { data, error, isLoading } = useSWR(
    lessonId ? `/api/ai/lessons/${lessonId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    lesson: data as AILessonWithProgress | null,
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/ai/lessons/${lessonId}`)
  }
}

// Fetch user's AI progress
export function useAIProgress() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/ai/progress',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
  
  const updateProgress = async (
    lessonId: string, 
    status: LessonStatus, 
    score?: number,
    timeSpent?: number
  ) => {
    try {
      const response = await fetch('/api/ai/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, status, score, timeSpent })
      })
      
      if (!response.ok) throw new Error('Failed to update progress')
      
      const updated = await response.json()
      
      // Optimistic update
      mutate((current: any) => {
        if (!current) return current
        
        const updatedProgress = current.progress.map((p: any) =>
          p.lessonId === lessonId ? { ...p, ...updated } : p
        )
        
        return { ...current, progress: updatedProgress }
      }, false)
      
      showToast.success('Progress saved!')
      
      // Revalidate
      mutate()
      
      return updated
    } catch (error) {
      showToast.error('Failed to save progress')
      throw error
    }
  }
  
  return {
    progress: data?.progress || [],
    stats: data?.stats,
    isLoading,
    isError: error,
    updateProgress,
    refresh: () => mutate()
  }
}

// Fetch AI projects
export function useAIProjects(filters?: {
  userId?: string
  lessonId?: string
  status?: ProjectStatus
  isPublic?: boolean
}) {
  const params = new URLSearchParams()
  if (filters?.userId) params.append('userId', filters.userId)
  if (filters?.lessonId) params.append('lessonId', filters.lessonId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.isPublic !== undefined) params.append('public', filters.isPublic.toString())
  
  const { data, error, isLoading } = useSWR(
    `/api/ai/projects${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
  
  return {
    projects: (data?.projects || []) as AIProjectWithRelations[],
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/ai/projects${params.toString() ? `?${params.toString()}` : ''}`)
  }
}

// Create new AI project
export function useCreateAIProject() {
  const createProject = async (projectData: {
    lessonId: string
    title: string
    description?: string
    projectType: string
    projectData: any
  }) => {
    try {
      const response = await fetch('/api/ai/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) throw new Error('Failed to create project')
      
      const project = await response.json()
      
      showToast.success('Project created successfully!')
      
      // Invalidate projects cache
      mutate((key: string) => typeof key === 'string' && key.startsWith('/api/ai/projects'))
      
      return project
    } catch (error) {
      showToast.error('Failed to create project')
      throw error
    }
  }
  
  return { createProject }
}

// Fetch analytics
export function useAIAnalytics(scope: 'personal' | 'class' | 'school' = 'personal') {
  const { data, error, isLoading } = useSWR(
    `/api/ai/analytics?scope=${scope}`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: scope === 'personal' ? 0 : 300000, // Refresh every 5 min for class/school
    }
  )
  
  return {
    analytics: data as PersonalAnalytics | null,
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/ai/analytics?scope=${scope}`)
  }
}

// Check feature flags
export function useFeatureFlags() {
  const flags = {
    aiSandbox: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
    teacherAIAssistant: false, // Will be enabled based on user role
    advancedAnalytics: false,  // Will be enabled based on user role
  }
  
  return flags
}