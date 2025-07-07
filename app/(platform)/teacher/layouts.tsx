// app/(platform)/teacher/layout.tsx
import { requireTeacher } from '@/lib/auth-guards'
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar'
import { TeacherHeader } from '@/components/teacher/TeacherHeader'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireTeacher()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherHeader teacher={session.user} />
      
      <div className="flex">
        <TeacherSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}