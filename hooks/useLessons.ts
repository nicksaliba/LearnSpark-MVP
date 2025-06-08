// 2. Add SWR for Data Fetching
// hooks/useLessons.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLessons(module?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    module ? `/api/lessons?module=${module}` : '/api/lessons',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    lessons: data?.lessons || [],
    isLoading,
    isError: error,
    refetch: mutate
  }
}