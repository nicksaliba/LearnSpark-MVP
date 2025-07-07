// app/(platform)/ai-modules/layout.tsx
import { requireAuth } from '@/lib/auth-guards'
import { ModuleNavigation } from '@/components/ai/ModuleNavigation'
import { ProgressTracker } from '@/components/ai/ProgressTracker'

export default async function AIModulesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Module Navigation */}
          <div className="lg:col-span-1">
            <ModuleNavigation userGradeLevel={session.user.gradeLevel} />
            <ProgressTracker userId={session.user.id} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}