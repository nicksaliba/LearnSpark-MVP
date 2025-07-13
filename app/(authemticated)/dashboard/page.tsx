// app/(authenticated)/dashboard/page.tsx - Fixed Dashboard Page
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDefaultRoute } from '@/lib/auth-guards'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Redirect to appropriate dashboard based on role
  const defaultRoute = getDefaultRoute(session.user.role)
  redirect(defaultRoute)
}