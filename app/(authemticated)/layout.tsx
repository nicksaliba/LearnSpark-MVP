// app/(authenticated)/layout.tsx - Protected Layout
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserNav } from '@/components/layout/user-nav'
import { MainNav } from '@/components/layout/main-nav'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">LearnSpark</span>
              </Link>
            </div>

            {/* Navigation */}
            <MainNav />

            {/* User Menu */}
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}