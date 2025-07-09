// app/(platform)/admin/layout.tsx
import { requireAdmin } from '@/lib/auth-guards'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminProvider } from '@/contexts/AdminContext'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()
  
  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader admin={session.user} />
        
        <div className="flex">
          <AdminSidebar />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}