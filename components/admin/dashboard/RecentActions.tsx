// components/admin/dashboard/RecentActions.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity,
  UserPlus,
  UserMinus,
  Settings,
  BookOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MoreVertical,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface AdminAction {
  id: string
  type: 'user_created' | 'user_deleted' | 'user_updated' | 'lesson_created' | 'lesson_updated' | 'settings_changed' | 'security_alert' | 'system_update' | 'content_moderated'
  description: string
  actor: {
    id: string
    name: string
    email: string
    role: string
  }
  target?: {
    id: string
    name: string
    type: string
  }
  metadata?: Record<string, any>
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'user_management' | 'content' | 'security' | 'system' | 'settings'
}

// Mock data - replace with real API data
const mockActions: AdminAction[] = [
  {
    id: '1',
    type: 'user_created',
    description: 'Created new student account',
    actor: { id: '1', name: 'Ms. Johnson', email: 'teacher1@school.edu', role: 'TEACHER' },
    target: { id: '2', name: 'Emma Wilson', type: 'student' },
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: 'low',
    category: 'user_management'
  },
  {
    id: '2',
    type: 'lesson_updated',
    description: 'Modified AI Basics lesson content',
    actor: { id: '3', name: 'Admin User', email: 'admin@school.edu', role: 'ADMIN' },
    target: { id: '4', name: 'Introduction to AI', type: 'lesson' },
    metadata: { changes: ['content', 'difficulty'] },
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'medium',
    category: 'content'
  },
  {
    id: '3',
    type: 'security_alert',
    description: 'Multiple failed login attempts detected',
    actor: { id: 'system', name: 'System', email: '', role: 'SYSTEM' },
    target: { id: '5', name: 'teacher2@school.edu', type: 'user' },
    metadata: { attempts: 5, ip: '192.168.1.100' },
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    severity: 'high',
    category: 'security'
  },
  {
    id: '4',
    type: 'settings_changed',
    description: 'Updated school AI module permissions',
    actor: { id: '3', name: 'Admin User', email: 'admin@school.edu', role: 'ADMIN' },
    target: { id: '6', name: 'Demo Elementary School', type: 'school' },
    metadata: { setting: 'ai_modules', previous: ['basic'], new: ['basic', 'advanced'] },
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'medium',
    category: 'settings'
  },
  {
    id: '5',
    type: 'user_updated',
    description: 'Changed user role from Student to Teacher',
    actor: { id: '3', name: 'Admin User', email: 'admin@school.edu', role: 'ADMIN' },
    target: { id: '7', name: 'David Chen', type: 'user' },
    metadata: { previous_role: 'STUDENT', new_role: 'TEACHER' },
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    severity: 'medium',
    category: 'user_management'
  },
  {
    id: '6',
    type: 'content_moderated',
    description: 'Flagged inappropriate student project',
    actor: { id: '1', name: 'Ms. Johnson', email: 'teacher1@school.edu', role: 'TEACHER' },
    target: { id: '8', name: 'AI Chatbot Project', type: 'project' },
    metadata: { reason: 'inappropriate_content', action: 'hidden' },
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    severity: 'high',
    category: 'content'
  },
  {
    id: '7',
    type: 'system_update',
    description: 'Platform maintenance completed',
    actor: { id: 'system', name: 'System', email: '', role: 'SYSTEM' },
    metadata: { version: '2.1.3', duration: '45 minutes' },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'low',
    category: 'system'
  },
  {
    id: '8',
    type: 'lesson_created',
    description: 'Added new Neural Networks lesson',
    actor: { id: '3', name: 'Admin User', email: 'admin@school.edu', role: 'ADMIN' },
    target: { id: '9', name: 'Understanding Neural Networks', type: 'lesson' },
    metadata: { module: 'advanced-ai', grade_level: 'G912' },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    severity: 'low',
    category: 'content'
  }
]

const actionIcons = {
  user_created: UserPlus,
  user_deleted: UserMinus,
  user_updated: Settings,
  lesson_created: BookOpen,
  lesson_updated: BookOpen,
  settings_changed: Settings,
  security_alert: AlertTriangle,
  system_update: RefreshCw,
  content_moderated: Shield
}

const severityColors = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-blue-600 bg-blue-50',
  high: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50'
}

const categoryColors = {
  user_management: 'from-blue-400 to-blue-600',
  content: 'from-green-400 to-green-600',
  security: 'from-red-400 to-red-600',
  system: 'from-purple-400 to-purple-600',
  settings: 'from-orange-400 to-orange-600'
}

export function RecentActions() {
  const [filter, setFilter] = useState<AdminAction['category'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)
  
  // In production, this would use real data
  const { actions, isLoading, refetch } = useAdminActions() || { 
    actions: mockActions, 
    isLoading: false, 
    refetch: () => {} 
  }
  
  const filteredActions = actions.filter(action => {
    const matchesFilter = filter === 'all' || action.category === filter
    const matchesSearch = searchTerm === '' || 
      action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.target?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })
  
  const getActionIcon = (type: AdminAction['type']) => {
    const Icon = actionIcons[type] || Activity
    return Icon
  }
  
  const formatActionTime = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true })
  }
  
  const getCategoryGradient = (category: AdminAction['category']) => {
    return categoryColors[category] || 'from-gray-400 to-gray-600'
  }
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Actions</h2>
              <p className="text-sm text-gray-600">Administrative activities and system events</p>
            </div>
          </div>
          
          <button
            onClick={refetch}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search actions..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AdminAction['category'] | 'all')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="user_management">User Management</option>
            <option value="content">Content</option>
            <option value="security">Security</option>
            <option value="system">System</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>
      
      {/* Actions List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {filteredActions.length > 0 ? (
          filteredActions.map((action, index) => {
            const Icon = getActionIcon(action.type)
            const isExpanded = showDetails === action.id
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    getCategoryGradient(action.category)
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {action.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>by {action.actor.name}</span>
                          {action.target && (
                            <>
                              <span>•</span>
                              <span>{action.target.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatActionTime(action.timestamp)}
                          </span>
                        </div>
                        
                        {/* Severity Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            severityColors[action.severity]
                          )}>
                            {action.severity.toUpperCase()}
                          </span>
                          
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            {action.category.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {/* Expanded Details */}
                        {isExpanded && action.metadata && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Details:</h4>
                            <div className="space-y-1">
                              {Object.entries(action.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span className="text-gray-900 font-mono">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {action.metadata && (
                          <button
                            onClick={() => setShowDetails(isExpanded ? null : action.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title={isExpanded ? "Hide details" : "Show details"}
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        
                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchTerm || filter !== 'all' 
                ? 'No actions match your filters' 
                : 'No recent actions to display'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {filteredActions.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {filteredActions.length} of {actions.length} actions
            </span>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              View all actions →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}