interface AdminAction {
  id: string
  type: 'user_created' | 'user_deleted' | 'user_updated' | 'lesson_created' | 'lesson_updated' | 'settings_changed' | 'security_alert' | 'system_update' | 'content_moderated'
  description: string
  actor: {
    id: string
    name: string
    email: string
    role: string
  }
  target?: {
    id: string
    name: string
    type: string
  }
  metadata?: Record<string, any>
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'user_management' | 'content' | 'security' | 'system' | 'settings'
}

interface AdminStats {
  totalUsers: number
  totalSchools: number
  activeSchools: number
  totalTeachers: number
  totalStudents: number
  avgSchoolSize: number
  avgAchievementsPerSchool: number
  userGrowth: number
  schoolGrowth: number
  teacherGrowth: number
  studentGrowth: number
  completionRate: number
  completionGrowth: number
}

interface AdminAnalytics {
  overview: {
    totalUsers: number
    activeUsers: number
    lessonsCompleted: number
    averageScore: number
  }
  growthData: Array<{
    date: string
    users: number
    lessons: number
    engagement: number
  }>
  streaks: {
    current: number
    longest: number
  }
}

interface SystemHealth {
  api: {
    status: 'healthy' | 'warning' | 'error'
    uptime: string
    responseTime: string
  }
  database: {
    status: 'healthy' | 'warning' | 'error'
    connections: number
    size: string
  }
  storage: {
    status: 'healthy' | 'warning' | 'error'
    used: string
    total: string
  }
  jobs: {
    status: 'healthy' | 'warning' | 'error'
    queued: number
    failed: number
  }
  alerts?: Array<{
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
}

interface School {
  id: string
  name: string
  code: string
  adminEmail: string
  isActive: boolean
  district?: {
    name: string
  }
  studentCount: number
  teacherCount: number
  courseCount: number
  performance: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  school?: {
    name: string
    district?: {
      name: string
    }
  }
  isActive: boolean
  lastActive?: Date
  avatarUrl?: string
}