import useSWR from 'swr'

export function useUserData() {
  const { data, error, isLoading, mutate } = useSWR('/api/user/data', {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    userData: data,
    isLoading,
    isError: !!error,
    refetch: mutate,
    // Optimistic XP update
    updateXP: (xpGained: number) => {
      mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ...currentData,
            user: {
              ...currentData.user,
              xpTotal: currentData.user.xpTotal + xpGained
            },
            xp: {
              ...currentData.xp,
              totalXP: currentData.xp.totalXP + xpGained,
              currentXP: currentData.xp.currentXP + xpGained
            }
          }
        },
        false
      )
    }
  }
}