// components/admin/users/UserTable.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react'
import { useAdminUsers } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { showToast } from '@/lib/toast'

export function UserTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    school: 'all'
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showActions, setShowActions] = useState<string | null>(null)
  
  const { users, pagination, isLoading, updateUser, deleteUser } = useAdminUsers({
    page,
    search,
    ...filters
  })
  
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }
  
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await deleteUser(userId)
      showToast.success('User deleted successfully')
    } catch (error) {
      showToast.error('Failed to delete user')
    }
  }
  
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUser(userId, { isActive: !currentStatus })
      showToast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
    } catch (error) {
      showToast.error('Failed to update user status')
    }
  }
  
  const roleColors = {
    STUDENT: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-green-100 text-green-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    SUPER_ADMIN: 'bg-red-100 text-red-700'
  }
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || '/default-avatar.png'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-gray-900 hover:text-purple-600"
                      >
                        {user.name}
                      </Link>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    roleColors[user.role]
                  )}>
                    {user.role}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {user.school?.name || 'No school'}
                  </div>
                  {user.school?.district && (
                    <div className="text-xs text-gray-500">
                      {user.school.district.name}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                      user.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    )}
                  >
                    {user.isActive ? (
                      <>
                        <Check className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastActive ? 
                    formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) :
                    'Never'
                  }
                </td>
                
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {showActions === user.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                      >
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit User
                        </Link>
                        
                        <button
                          onClick={() => {/* Reset password logic */}}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Shield className="w-4 h-4" />
                          Reset Password
                        </button>
                        
                        <button
                          onClick={() => {/* Send email logic */}}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Mail className="w-4 h-4" />
                          Send Email
                        </button>
                        
                        <hr className="my-1" />
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </motion.div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={cn(
                "px-3 py-1 rounded-lg border",
                page === 1
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "px-3 py-1 rounded-lg border",
                  page === i + 1
                    ? "border-purple-500 bg-purple-500 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className={cn(
                "px-3 py-1 rounded-lg border",
                page === pagination.pages
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}