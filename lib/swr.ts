// hooks/useLessons.ts - Fixed SWR implementation
import useSWR from 'swr'

// Fetcher function with proper error handling
const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    ;(error as any).info = await res.json()
    ;(error as any).status = res.status
    throw error
  }
  
  return res.json()
}

// Lesson type definition
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
    objectives: string[]
  }
  userProgress?: {
    status: 'not_started' | 'in_progress' | 'completed'
    score: number
  }
}

interface LessonsResponse {
  lessons: Lesson[]
  count: number
}

export function useLessons(module?: string) {
  const { data, error, isLoading, mutate } = useSWR<LessonsResponse>(
    module ? `/api/lessons?module=${module}` : '/api/lessons',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  )

  return {
    lessons: data?.lessons || [],
    count: data?.count || 0,
    isLoading,
    isError: error,
    refetch: mutate,
    // Helper methods
    refresh: () => mutate(),
    invalidate: () => mutate(undefined, { revalidate: true }),
  }
}

// Hook for a single lesson
export function useLesson(lessonId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    lessonId ? `/api/lessons/${lessonId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    lesson: data?.lesson || null,
    userProgress: data?.userProgress || null,
    isLoading,
    isError: error,
    refetch: mutate,
  }
}

// Hook for user progress data
export function useUserData() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/user/data',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  )

  return {
    userData: data || null,
    isLoading,
    isError: error,
    refetch: mutate,
    refresh: () => mutate(),
  }
}

// Hook for user progress
export function useUserProgress() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/user/progress',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    progress: data?.progress || [],
    isLoading,
    isError: error,
    refetch: mutate,
    updateProgress: (lessonId: string, status: string, score?: number) => {
      // Optimistic update
      mutate(
        (current: any) => {
          if (!current) return current
          
          const updatedProgress = current.progress.map((p: any) => 
            p.lessonId === lessonId 
              ? { ...p, status, score: score || p.score }
              : p
          )
          
          return { ...current, progress: updatedProgress }
        },
        false
      )
      
      // Trigger revalidation
      mutate()
    }
  }
}

// Admin-specific hooks
export function useAdminLessons() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/lessons',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    lessons: data?.lessons || [],
    isLoading,
    isError: error,
    refetch: mutate,
    refresh: () => mutate(),
  }
}

export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/stats',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    stats: data || null,
    isLoading,
    isError: error,
    refetch: mutate,
  }
}

// Export the fetcher for custom usage
export { fetcher }