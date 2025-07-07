// components/admin/schools/SchoolList.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  School,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  BarChart,
  Mail,
  Search,
  Filter
} from 'lucide-react'
import { useAdminSchools } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { showToast } from '@/lib/toast'

export function SchoolList() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null)
  
  const { schools, isLoading, updateSchool, deleteSchool } = useAdminSchools({
    search,
    status: filter
  })
  
  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure? This will remove all associated users and data.')) return
    
    try {
      await deleteSchool(schoolId)
      showToast.success('School deleted successfully')
    } catch (error) {
      showToast.error('Failed to delete school')
    }
  }
  
  const handleToggleStatus = async (schoolId: string, currentStatus: boolean) => {
    try {
      await updateSchool(schoolId, { isActive: !currentStatus })
      showToast.success(`School ${!currentStatus ? 'activated' : 'deactivated'}`)
    } catch (error) {
      showToast.error('Failed to update school status')
    }
  }
  
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schools..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Schools</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {/* School Cards */}
      {schools.map((school:any, index:any) => (
        <motion.div
          key={school.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* School Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  <School className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {school.name}
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      school.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Code: {school.code} • District: {school.district?.name || 'None'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Admin: {school.adminEmail}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/schools/${school.id}/analytics`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Analytics"
                >
                  <BarChart className="w-4 h-4 text-gray-600" />
                </Link>
                
                <Link
                  href={`/admin/schools/${school.id}/settings`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setExpandedSchool(
                      expandedSchool === school.id ? null : school.id
                    )}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {expandedSchool === school.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                    >
                      <Link
                        href={`/admin/schools/${school.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edit School
                      </Link>
                      
                      <button
                        onClick={() => handleToggleStatus(school.id, school.isActive)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Settings className="w-4 h-4" />
                        {school.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Mail className="w-4 h-4" />
                        Contact Admin
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={() => handleDeleteSchool(school.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete School
                        </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* School Stats */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-4 gap-4 pt-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Students</p>
                <p className="text-xl font-semibold text-gray-900">
                  {school.studentCount || 0}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Teachers</p>
                <p className="text-xl font-semibold text-gray-900">
                  {school.teacherCount || 0}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Courses</p>
                <p className="text-xl font-semibold text-gray-900">
                  {school.courseCount || 0}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Performance</p>
                <p className="text-xl font-semibold text-gray-900">
                  {school.performance || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Empty State */}
      {schools.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <School className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No schools found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}