// components/layout/main-nav.tsx - Main Navigation
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings,
  GraduationCap
} from 'lucide-react'
import { isAdminRole, isTeacherRole } from '@/lib/roles'

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session?.user) return null

  const userRole = session.user.role

  // Define navigation items based on role
  const navItems = [
    // Student navigation
    {
      href: '/learn',
      label: 'Learn',
      icon: BookOpen,
      roles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      href: '/ai-modules',
      label: 'AI Modules',
      icon: Brain,
      roles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      href: '/achievements',
      label: 'Achievements',
      icon: Trophy,
      roles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN']
    },
    // Teacher navigation
    {
      href: '/teacher',
      label: 'Teaching',
      icon: GraduationCap,
      roles: ['TEACHER', 'ADMIN', 'SUPER_ADMIN']
    },
    {
      href: '/teacher/classes',
      label: 'Classes',
      icon: Users,
      roles: ['TEACHER', 'ADMIN', 'SUPER_ADMIN']
    },
    // Admin navigation
    {
      href: '/admin',
      label: 'Admin',
      icon: Settings,
      roles: ['ADMIN', 'SUPER_ADMIN']
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'SUPER_ADMIN']
    },
  ]

  // Filter items based on user role
  const visibleItems = navItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <nav className="flex items-center space-x-6">
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600',
              isActive
                ? 'text-blue-600'
                : 'text-gray-600'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}