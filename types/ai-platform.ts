// types/ai-platform.ts - AI Platform Type Definitions
import { 
  User, 
  AILesson, 
  AIProject, 
  AIProgress, 
  AIModule,
  UserRole,
  GradeLevel,
  Difficulty,
  ProjectType,
  ProjectStatus,
  LessonStatus,
  EthicsTopic
} from '@prisma/client'

// Extended types with relations
export interface AILessonWithProgress extends AILesson {
  module: AIModule
  progress: AIProgress[]
}

export interface AIProjectWithRelations extends AIProject {
  user: Pick<User, 'id' | 'username' | 'avatarUrl'>
  lesson: AILessonWithModule
}

export interface AILessonWithModule extends AILesson {
  module: AIModule
}

// Form data types
export interface CreateLessonData {
  title: string
  description: string
  moduleId: string
  gradeLevel: GradeLevel
  difficulty: Difficulty
  orderIndex: number
  xpReward: number
  estimatedTime: number
  content: {
    objectives: string[]
    theory: string
    activities?: any[]
  }
  resources?: any
}

export interface CreateProjectData {
  lessonId: string
  title: string
  description?: string
  projectType: ProjectType
  projectData: any
}

// Analytics types
export interface PersonalAnalytics {
  overview: {
    totalXP: number
    currentLevel: number
    joinedDate: Date
    lessonsCompleted: number
    projectsCreated: number
    averageScore: number
  }
  streaks: {
    current: number
    longest: number
  }
  moduleProgress: Record<string, {
    completed: number
    total: number
    avgScore: number
  }>
  recentActivity: Array<{
    lessonTitle: string
    status: LessonStatus
    score: number
    date: Date
  }>
}

export interface ClassAnalytics {
  studentCount: number
  averageProgress: number
  topPerformers: Array<{
    student: Pick<User, 'id' | 'username' | 'avatarUrl'>
    xp: number
    lessonsCompleted: number
  }>
  strugglingStudents: Array<{
    student: Pick<User, 'id' | 'username' | 'avatarUrl'>
    lastActive: Date
    completionRate: number
  }>
}

export interface SchoolAnalytics {
  overview: {
    totalStudents: number
    totalTeachers: number
    totalLessonsCompleted: number
    totalProjectsCreated: number
    averageCompletionRate: number
  }
  moduleEngagement: Record<string, {
    studentCount: number
    completions: number
  }>
  gradeLevelDistribution: Array<{
    gradeLevel: GradeLevel
    _count: number
  }>
}

// Component prop types
export interface AILessonCardProps {
  lesson: AILessonWithProgress
  onStart: () => void
  onContinue: () => void
  isLocked?: boolean
}

export interface AIProjectCardProps {
  project: AIProjectWithRelations
  onView: () => void
  onEdit?: () => void
  showActions?: boolean
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface APIError {
  error: string
  details?: any
}

// Feature flags
export interface FeatureFlags {
  aiSandbox: boolean
  teacherAIAssistant: boolean
  advancedAnalytics: boolean
}