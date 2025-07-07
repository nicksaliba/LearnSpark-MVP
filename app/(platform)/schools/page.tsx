// app/(platform)/admin/schools/page.tsx
import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-guards'
import { SchoolList } from '@/components/admin/schools/SchoolList'
import { SchoolStats } from '@/components/admin/schools/SchoolStats'
import { CreateSchoolButton } from '@/components/admin/schools/CreateSchoolButton'

export const metadata: Metadata = {
  title: 'School Management - Admin',
  description: 'Manage schools and their settings'
}

export default async function SchoolsPage() {
  await requireAdmin()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            School Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage schools and their configurations
          </p>
        </div>
        
        <CreateSchoolButton />
      </div>
      
      <SchoolStats />
      <SchoolList />
    </div>
  )
}