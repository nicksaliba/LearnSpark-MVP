// components/teacher/dashboard/ClassOverview.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  Clock,
  Award,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useTeacherClasses } from '@/hooks/useTeacher'
import { cn } from '@/lib/utils'

interface Props {
  teacherId: string
}

export function ClassOverview({ teacherId }: Props) {
  const { classes, isLoading } = useTeacherClasses(teacherId)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          My Classes
        </h2>
      </div>
      
      <div className="p-6 space-y-4">
        {classes.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-all duration-200",
              selectedClass === classItem.id ? 
                "border-purple-500 bg-purple-50" : 
                "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setSelectedClass(
              selectedClass === classItem.id ? null : classItem.id
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {classItem.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Grade {classItem.gradeLevel} • {classItem.students.length} students
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Avg Progress
                    </div>
                    <div className="font-semibold text-gray-900">
                      {classItem.averageProgress}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      Active Today
                    </div>
                    <div className="font-semibold text-gray-900">
                      {classItem.activeToday}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <Award className="w-4 h-4" />
                      Achievements
                    </div>
                    <div className="font-semibold text-gray-900">
                      {classItem.weeklyAchievements}
                    </div>
                  </div>
                </div>
                
                {classItem.alerts > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    {classItem.alerts} student{classItem.alerts !== 1 ? 's' : ''} need attention
                  </div>
                )}
              </div>
              
              <Link
                href={`/teacher/classes/${classItem.id}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
            
            {selectedClass === classItem.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t"
              >
                <div className="flex gap-3">
                  <Link
                    href={`/teacher/classes/${classItem.id}/students`}
                    className="flex-1 text-center py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    View Students
                  </Link>
                  <Link
                    href={`/teacher/classes/${classItem.id}/assignments`}
                    className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Assignments
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
        
        {classes.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No classes yet</p>
            <Link
              href="/teacher/classes/new"
              className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block"
            >
              Create your first class
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}