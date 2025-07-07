// app/(platform)/teacher/page.tsx
import { Metadata } from 'next'
import { requireTeacher } from '@/lib/auth-guards'
import { ClassOverview } from '@/components/teacher/dashboard/ClassOverview'
import { RecentActivity } from '@/components/teacher/dashboard/RecentActivity'
import { TeachingInsights } from '@/components/teacher/dashboard/TeachingInsights'
import { QuickActions } from '@/components/teacher/dashboard/QuickActions'

export const metadata: Metadata = {
  title: 'Teacher Dashboard - AI Learning Platform',
  description: 'Manage your classes and track student progress'
}

export default async function TeacherDashboard() {
  const session = await requireTeacher()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your classes and student progress
        </p>
      </div>
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClassOverview teacherId={session.user.id} />
          <RecentActivity teacherId={session.user.id} />
        </div>
        
        <div className="space-y-6">
          <TeachingInsights teacherId={session.user.id} />
        </div>
      </div>
    </div>
  )
}