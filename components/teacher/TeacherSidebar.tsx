// components/teacher/TeacherSidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  Bot,
  FolderOpen,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/teacher',
    icon: LayoutDashboard,
    description: 'Overview and insights'
  },
  {
    label: 'My Classes',
    href: '/teacher/classes',
    icon: Users,
    description: 'Manage your classes'
  },
  {
    label: 'Assignments',
    href: '/teacher/assignments',
    icon: BookOpen,
    description: 'Create and grade work'
  },
  {
    label: 'Analytics',
    href: '/teacher/analytics',
    icon: BarChart3,
    description: 'Student performance'
  },
  {
    label: 'AI Assistant',
    href: '/teacher/ai-assistant',
    icon: Bot,
    description: 'Teaching support AI'
  },
  {
    label: 'Resources',
    href: '/teacher/resources',
    icon: FolderOpen,
    description: 'Teaching materials'
  },
  {
    label: 'Messages',
    href: '/teacher/messages',
    icon: MessageSquare,
    description: 'Student communication'
  },
  {
    label: 'Training',
    href: '/teacher/training',
    icon: GraduationCap,
    description: 'Professional development'
  },
  {
    label: 'Settings',
    href: '/teacher/settings',
    icon: Settings,
    description: 'Preferences'
  }
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-white border-r border-gray-200 min-h-screen sticky top-0"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900">Teacher Portal</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive ? 
                    "bg-purple-50 text-purple-700" : 
                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-purple-600"
                )} />
                
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                )}
                
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-6 bg-purple-600 rounded-full"
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