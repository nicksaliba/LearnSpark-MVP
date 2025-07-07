// app/(platform)/teacher/training/page.tsx
import { Metadata } from 'next'
import { requireTeacher } from '@/lib/auth-guards'
import { TrainingCourses } from '@/components/teacher/training/TrainingCourses'
import { Certifications } from '@/components/teacher/training/Certifications'
import { LearningPath } from '@/components/teacher/training/LearningPath'

export const metadata: Metadata = {
  title: 'Professional Development',
  description: 'AI education training and certifications'
}

export default async function TrainingPage() {
  const session = await requireTeacher()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Professional Development
        </h1>
        <p className="text-gray-600 mt-1">
          Enhance your AI teaching skills with expert-led courses
        </p>
      </div>
      
      <LearningPath teacherId={session.user.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrainingCourses />
        </div>
        
        <div>
          <Certifications teacherId={session.user.id} />
        </div>
      </div>
    </div>
  )
}