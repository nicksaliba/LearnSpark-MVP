// app/(platform)/teacher/assignments/page.tsx
import { Metadata } from 'next'
import { requireTeacher } from '@/lib/auth-guards'
import { AssignmentsList } from '@/components/teacher/assignments/AssignmentsList'
import { AssignmentFilters } from '@/components/teacher/assignments/AssignmentFilters'
import { CreateAssignmentButton } from '@/components/teacher/assignments/CreateAssignmentButton'

export const metadata: Metadata = {
  title: 'Assignments - Teacher Portal',
  description: 'Create and manage assignments'
}

export default async function AssignmentsPage() {
  const session = await requireTeacher()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">
            Create and manage AI learning assignments
          </p>
        </div>
        
        <CreateAssignmentButton />
      </div>
      
      <AssignmentFilters />
      <AssignmentsList teacherId={session.user.id} />
    </div>
  )
}