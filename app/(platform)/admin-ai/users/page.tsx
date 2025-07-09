// app/(platform)/admin/users/page.tsx
import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-guards'
import { UserTable } from '@/components/admin/users/UserTable'
import { UserFilters } from '@/components/admin/users/UserFilters'
import { UserActions } from '@/components/admin/users/UserActions'

export const metadata: Metadata = {
  title: 'User Management - Admin',
  description: 'Manage platform users'
}

export default async function UsersPage() {
  await requireAdmin()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users across all schools and districts
          </p>
        </div>
        
        <UserActions />
      </div>
      
      <UserFilters />
      <UserTable />
    </div>
  )
}