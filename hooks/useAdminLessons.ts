import useSWR from 'swr'

export function useAdminLessons() {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/lessons', {
    revalidateOnFocus: false,
    refreshInterval: 0, // Don't auto-refresh admin data
  })

  return {
    lessons: data?.lessons || [],
    isLoading,
    isError: !!error,
    refetch: mutate,
    // Optimistic create
    createLesson: (newLesson: any) => {
      mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ...currentData,
            lessons: [...currentData.lessons, newLesson]
          }
        },
        false
      )
    },
    // Optimistic delete
    deleteLesson: (lessonId: string) => {
      mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ...currentData,
            lessons: currentData.lessons.filter((l: any) => l.id !== lessonId)
          }
        },
        false
      )
    }
  }
}