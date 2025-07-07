// hooks/useAdmin.ts
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/swr'
import { showToast } from '@/lib/toast'
import { useState, useCallback } from 'react'

// Admin Statistics
export function useAdminStats() {
  const { data, error, isLoading } = useSWR(
    '/api/admin/stats',
    fetcher,
    {
      refreshInterval: 60000, // 1 minute
    }
  )
  
  return {
    stats: data,
    isLoading,
    isError: error
  }
}

// User Management
export function useAdminUsers(params?: {
  page?: number
  search?: string
  role?: string
  status?: string
  school?: string
}) {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.role && params.role !== 'all') queryParams.append('role', params.role)
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
  if (params?.school && params.school !== 'all') queryParams.append('school', params.school)
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/users?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
  
  const updateUser = useCallback(async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update user')
      
      mutate()
      return response.json()
    } catch (error) {
      throw error
    }
  }, [mutate])
  
  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete user')
      
      mutate()
    } catch (error) {
      throw error
    }
  }, [mutate])
  
  const bulkUpdate = useCallback(async (userIds: string[], updates: any) => {
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, updates })
      })
      
      if (!response.ok) throw new Error('Failed to update users')
      
      showToast.success(`${userIds.length} users updated`)
      mutate()
      
      return response.json()
    } catch (error) {
      showToast.error('Failed to update users')
      throw error
    }
  }, [mutate])
  
  return {
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    updateUser,
    deleteUser,
    bulkUpdate,
    refetch: mutate
  }
}

// School Management
export function useAdminSchools(params?: {
  search?: string
  status?: string
  district?: string
}) {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
  if (params?.district) queryParams.append('district', params.district)
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/schools?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )
  
  const createSchool = useCallback(async (schoolData: any) => {
    try {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData)
      })
      
      if (!response.ok) throw new Error('Failed to create school')
      
      showToast.success('School created successfully')
      mutate()
      
      return response.json()
    } catch (error) {
      showToast.error('Failed to create school')
      throw error
    }
  }, [mutate])
  
  const updateSchool = useCallback(async (schoolId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update school')
      
      mutate()
      return response.json()
    } catch (error) {
      throw error
    }
  }, [mutate])
  
  const deleteSchool = useCallback(async (schoolId: string) => {
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete school')
      
      mutate()
    } catch (error) {
      throw error
    }
  }, [mutate])
  
  return {
    schools: data?.schools || [],
    isLoading,
    isError: error,
    createSchool,
    updateSchool,
    deleteSchool,
    refetch: mutate
  }
}

// Analytics
export function useAdminAnalytics(params?: {
  range?: string
  schoolId?: string
  districtId?: string
}) {
  const queryParams = new URLSearchParams()
  if (params?.range) queryParams.append('range', params.range)
  if (params?.schoolId) queryParams.append('schoolId', params.schoolId)
  if (params?.districtId) queryParams.append('districtId', params.districtId)
  
  const { data, error, isLoading } = useSWR(
    `/api/admin/analytics?${queryParams.toString()}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
    }
  )
  
  return {
    analytics: data,
    isLoading,
    isError: error
  }
}

// System Health
export function useSystemHealth() {
  const { data, error, isLoading } = useSWR(
    '/api/admin/system/health',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
    }
  )
  
  return {
    health: data,
    isLoading,
    isError: error
  }
}

// Audit Logs
export function useAuditLogs(params?: {
  page?: number
  action?: string
  userId?: string
  dateRange?: { start: Date; end: Date }
}) {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.action) queryParams.append('action', params.action)
  if (params?.userId) queryParams.append('userId', params.userId)
  if (params?.dateRange) {
    queryParams.append('startDate', params.dateRange.start.toISOString())
    queryParams.append('endDate', params.dateRange.end.toISOString())
  }
  
  const { data, error, isLoading } = useSWR(
    `/api/admin/audit-logs?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    logs: data?.logs || [],
    pagination: data?.pagination,
    isLoading,
    isError: error
  }
}