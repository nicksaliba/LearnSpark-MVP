// hooks/useTeacher.ts
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/swr'
import { showToast } from '@/lib/toast'
import { useState, useCallback } from 'react'

// Types for Teacher data
interface TeacherClass {
  id: string
  name: string
  gradeLevel: string
  students: Array<{
    id: string
    name: string
    email?: string
    avatarUrl?: string
  }>
  averageProgress: number
  activeToday: number
  weeklyAchievements: number
  alerts: number
  createdAt: Date
  updatedAt: Date
}

interface Assignment {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'closed'
  dueDate: string
  classIds: string[]
  lessonIds: string[]
  submissions: number
  graded: number
  settings: {
    allowLateSubmission: boolean
    maxAttempts: number
    showHints: boolean
    randomizeQuestions: boolean
  }
}

interface StudentDetail {
  id: string
  name: string
  email: string
  avatarUrl?: string
  gradeLevel: string
  xp: number
  level: number
  lessonsCompleted: number
  projectsCreated: number
  averageScore: number
  lastActive: Date
  currentStreak: number
  achievements: Array<{
    id: string
    title: string
    unlockedAt: Date
  }>
}

interface ClassAnalytics {
  classId: string
  className: string
  totalStudents: number
  averageProgress: number
  averageScore: number
  completionRate: number
  engagementRate: number
  topPerformers: StudentDetail[]
  strugglingStudents: StudentDetail[]
  recentActivity: Array<{
    studentId: string
    studentName: string
    action: string
    timestamp: Date
  }>
  weeklyProgress: Array<{
    week: string
    completions: number
    averageScore: number
  }>
}

interface TeacherStats {
  totalStudents: number
  totalClasses: number
  totalAssignments: number
  averageClassProgress: number
  pendingSubmissions: number
  recentAchievements: number
  upcomingDeadlines: Array<{
    assignmentId: string
    title: string
    dueDate: Date
    remainingSubmissions: number
  }>
}

// Fetch teacher's classes
export function useTeacherClasses(teacherId?: string) {
  const { data, error, isLoading, mutate } = useSWR<{ classes: TeacherClass[] }>(
    teacherId ? `/api/teacher/classes?teacherId=${teacherId}` : '/api/teacher/classes',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
  
  const addClass = useCallback(async (classData: {
    name: string
    gradeLevel: string
    studentEmails?: string[]
  }) => {
    try {
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      })
      
      if (!response.ok) throw new Error('Failed to create class')
      
      const newClass = await response.json()
      showToast.success('Class created successfully!')
      
      // Update cache
      mutate()
      
      return newClass
    } catch (error) {
      showToast.error('Failed to create class')
      throw error
    }
  }, [mutate])
  
  const updateClass = useCallback(async (classId: string, updates: Partial<TeacherClass>) => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update class')
      
      showToast.success('Class updated successfully!')
      mutate()
      
      return response.json()
    } catch (error) {
      showToast.error('Failed to update class')
      throw error
    }
  }, [mutate])
  
  const deleteClass = useCallback(async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    
    try {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete class')
      
      showToast.success('Class deleted successfully!')
      mutate()
    } catch (error) {
      showToast.error('Failed to delete class')
      throw error
    }
  }, [mutate])
  
  return {
    classes: data?.classes || [],
    isLoading,
    isError: error,
    refetch: mutate,
    addClass,
    updateClass,
    deleteClass
  }
}

// Fetch class details with students
export function useClassDetails(classId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    classId ? `/api/teacher/classes/${classId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )
  
  const addStudent = useCallback(async (studentEmail: string) => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: studentEmail })
      })
      
      if (!response.ok) throw new Error('Failed to add student')
      
      showToast.success('Student added successfully!')
      mutate()
      
      return response.json()
    } catch (error) {
      showToast.error('Failed to add student')
      throw error
    }
  }, [classId, mutate])
  
  const removeStudent = useCallback(async (studentId: string) => {
    if (!confirm('Remove this student from the class?')) return
    
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students/${studentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to remove student')
      
      showToast.success('Student removed from class')
      mutate()
    } catch (error) {
      showToast.error('Failed to remove student')
      throw error
    }
  }, [classId, mutate])
  
  return {
    classData: data,
    students: data?.students || [],
    isLoading,
    isError: error,
    refetch: mutate,
    addStudent,
    removeStudent
  }
}

// Fetch teacher's assignments
export function useTeacherAssignments(filters?: {
  status?: string
  classId?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.classId) params.append('classId', filters.classId)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  
  const { data, error, isLoading, mutate } = useSWR<{ 
    assignments: Assignment[]
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }>(
    `/api/teacher/assignments${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
  
  const publishAssignment = useCallback(async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}/publish`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to publish assignment')
      
      showToast.success('Assignment published!')
      mutate()
      
      return response.json()
    } catch (error) {
      showToast.error('Failed to publish assignment')
      throw error
    }
  }, [mutate])
  
  const deleteAssignment = useCallback(async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete assignment')
      
      showToast.success('Assignment deleted')
      mutate()
    } catch (error) {
      showToast.error('Failed to delete assignment')
      throw error
    }
  }, [mutate])
  
  return {
    assignments: data?.assignments || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refetch: mutate,
    publishAssignment,
    deleteAssignment
  }
}

// Fetch student analytics
export function useStudentAnalytics(studentId: string) {
  const { data, error, isLoading } = useSWR<StudentDetail & {
    progress: Array<{
      lessonId: string
      lessonTitle: string
      status: string
      score: number
      completedAt?: Date
      timeSpent: number
    }>
    projects: Array<{
      id: string
      title: string
      type: string
      createdAt: Date
      score?: number
    }>
    strengths: string[]
    areasForImprovement: string[]
  }>(
    studentId ? `/api/teacher/analytics/student/${studentId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 300000, // 5 minutes
    }
  )
  
  return {
    analytics: data,
    isLoading,
    isError: error
  }
}

// Fetch class analytics
export function useClassAnalytics(classId: string) {
  const { data, error, isLoading } = useSWR<ClassAnalytics>(
    classId ? `/api/teacher/analytics/class/${classId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 300000,
    }
  )
  
  return {
    analytics: data,
    isLoading,
    isError: error
  }
}

// Get teacher statistics
export function useTeacherStats() {
  const { data, error, isLoading } = useSWR<TeacherStats>(
    '/api/teacher/stats',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // 1 minute
    }
  )
  
  return {
    stats: data,
    isLoading,
    isError: error
  }
}

// Create assignment
export function useCreateAssignment() {
  const [isCreating, setIsCreating] = useState(false)
  
  const createAssignment = async (assignmentData: {
    title: string
    description: string
    classIds: string[]
    lessonIds: string[]
    dueDate: string
    settings: {
      allowLateSubmission: boolean
      maxAttempts: number
      showHints: boolean
      randomizeQuestions: boolean
    }
  }) => {
    setIsCreating(true)
    
    try {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      })
      
      if (!response.ok) throw new Error('Failed to create assignment')
      
      const assignment = await response.json()
      showToast.success('Assignment created successfully!')
      
      // Invalidate assignments cache
      mutate((key: string) => key.startsWith('/api/teacher/assignments'))
      
      return assignment
    } catch (error) {
      showToast.error('Failed to create assignment')
      throw error
    } finally {
      setIsCreating(false)
    }
  }
  
  return { createAssignment, isCreating }
}

// Grade submission
export function useGradeSubmission() {
  const [isGrading, setIsGrading] = useState(false)
  
  const gradeSubmission = async (submissionId: string, grade: {
    score: number
    feedback: string
    rubric?: Record<string, number>
  }) => {
    setIsGrading(true)
    
    try {
      const response = await fetch(`/api/teacher/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grade)
      })
      
      if (!response.ok) throw new Error('Failed to grade submission')
      
      showToast.success('Submission graded successfully!')
      
      // Invalidate related caches
      mutate((key: string) => key.includes('submissions') || key.includes('assignments'))
      
      return response.json()
    } catch (error) {
      showToast.error('Failed to grade submission')
      throw error
    } finally {
      setIsGrading(false)
    }
  }
  
  return { gradeSubmission, isGrading }
}

// Batch operations
export function useBatchOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  
  const batchGrade = async (grades: Array<{
    submissionId: string
    score: number
    feedback?: string
  }>) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/teacher/submissions/batch-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades })
      })
      
      if (!response.ok) throw new Error('Failed to process batch grading')
      
      const result = await response.json()
      showToast.success(`${result.processed} submissions graded`)
      
      mutate((key: string) => key.includes('submissions'))
      
      return result
    } catch (error) {
      showToast.error('Failed to process batch grading')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }
  
  const sendBulkMessage = async (message: {
    recipientIds: string[]
    subject: string
    content: string
    type: 'email' | 'notification'
  }) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/teacher/messages/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
      
      if (!response.ok) throw new Error('Failed to send messages')
      
      const result = await response.json()
      showToast.success(`Message sent to ${result.sent} recipients`)
      
      return result
    } catch (error) {
      showToast.error('Failed to send messages')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }
  
  return { batchGrade, sendBulkMessage, isProcessing }
}

// Recent activity feed
export function useRecentActivity(filters?: {
  classId?: string
  days?: number
}) {
  const params = new URLSearchParams()
  if (filters?.classId) params.append('classId', filters.classId)
  if (filters?.days) params.append('days', filters.days.toString())
  
  const { data, error, isLoading } = useSWR<{
    activities: Array<{
      id: string
      type: 'submission' | 'achievement' | 'progress' | 'login'
      studentId: string
      studentName: string
      studentAvatar?: string
      description: string
      metadata?: any
      timestamp: Date
    }>
  }>(
    `/api/teacher/activity${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
    }
  )
  
  return {
    activities: data?.activities || [],
    isLoading,
    isError: error
  }
}

// Export all hooks
export {
  type TeacherClass,
  type Assignment,
  type StudentDetail,
  type ClassAnalytics,
  type TeacherStats
}