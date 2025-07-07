// app/(platform)/admin/page.tsx
import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-guards'
import { PlatformOverview } from '@/components/admin/dashboard/PlatformOverview'
import { SystemHealth } from '@/components/admin/dashboard/SystemHealth'
import { UserGrowth } from '@/components/admin/dashboard/UserGrowth'
import { RecentActions } from '@/components/admin/dashboard/RecentActions'
import { QuickStats } from '@/components/admin/dashboard/QuickStats'

export const metadata: Metadata = {
  title: 'Admin Dashboard - AI Education Platform',
  description: 'Platform administration and monitoring'
}

export default async function AdminDashboard() {
  const session = await requireAdmin()
  const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage your AI education platform
        </p>
      </div>
      
      <QuickStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PlatformOverview />
          <UserGrowth />
        </div>
        
        <div className="space-y-6">
          <SystemHealth />
          {isSuperAdmin && <RecentActions />}
        </div>
      </div>
    </div>
  )
}