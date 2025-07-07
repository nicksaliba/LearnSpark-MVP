// components/admin/AdminSidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  Users,
  School,
  Building2,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Database,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Platform overview'
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management',
    badge: 'new'
  },
  {
    label: 'Schools',
    href: '/admin/schools',
    icon: School,
    description: 'School management'
  },
  {
    label: 'Districts',
    href: '/admin/districts',
    icon: Building2,
    description: 'District oversight',
    superAdminOnly: true
  },
  {
    label: 'Curriculum',
    href: '/admin/curriculum',
    icon: BookOpen,
    description: 'Content management'
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform insights'
  },
  {
    label: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security settings',
    superAdminOnly: true
  },
  {
    label: 'System',
    href: '/admin/system',
    icon: Database,
    description: 'System configuration',
    superAdminOnly: true
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Generate reports'
  },
  {
    label: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'System alerts'
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin preferences'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  
  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => 
    !item.superAdminOnly || (item.superAdminOnly && isSuperAdmin)
  )
  
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-gray-900 text-white min-h-screen sticky top-0"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold">Admin Portal</h2>
                <p className="text-xs text-gray-400">
                  {isSuperAdmin ? 'Super Admin' : 'School Admin'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive ? 
                    "bg-purple-600 text-white" : 
                    "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-white"
                )} />
                
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">
                        {item.description}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-purple-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-6 bg-white rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </motion.aside>
  )
}