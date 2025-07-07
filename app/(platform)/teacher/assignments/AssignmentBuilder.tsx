// components/teacher/assignments/AssignmentBuilder.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  ChevronRight
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useAILessons } from '@/hooks/useAI'
import { useTeacherClasses } from '@/hooks/useTeacher'

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  classIds: z.array(z.string()).min(1, 'Select at least one class'),
  lessonIds: z.array(z.string()).min(1, 'Select at least one lesson'),
  dueDate: z.string().min(1, 'Due date is required'),
  allowLateSubmission: z.boolean(),
  maxAttempts: z.number().int().positive(),
  showHints: z.boolean(),
  randomizeQuestions: z.boolean()
})

type AssignmentFormData = z.infer<typeof assignmentSchema>

interface Props {
  onSave: (data: AssignmentFormData) => void
  onCancel: () => void
}

export function AssignmentBuilder({ onSave, onCancel }: Props) {
  const [step, setStep] = useState(1)
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  
  const { lessons } = useAILessons()
  const { classes } = useTeacherClasses()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      allowLateSubmission: true,
      maxAttempts: 3,
      showHints: true,
      randomizeQuestions: false
    }
  })
  
  const watchedData = watch()
  
  const handleLessonToggle = (lessonId: string) => {
    const updated = selectedLessons.includes(lessonId)
      ? selectedLessons.filter(id => id !== lessonId)
      : [...selectedLessons, lessonId]
    
    setSelectedLessons(updated)
    setValue('lessonIds', updated)
  }
  
  const handleClassToggle = (classId: string) => {
    const updated = selectedClasses.includes(classId)
      ? selectedClasses.filter(id => id !== classId)
      : [...selectedClasses, classId]
    
    setSelectedClasses(updated)
    setValue('classIds', updated)
  }
  
  const onSubmit = (data: AssignmentFormData) => {
    onSave(data)
    showToast.success('Assignment created successfully!')
  }
  
  const steps = [
    { number: 1, title: 'Basic Info', icon: BookOpen },
    { number: 2, title: 'Select Lessons', icon: BookOpen },
    { number: 3, title: 'Choose Classes', icon: Users },
    { number: 4, title: 'Settings', icon: Settings },
    { number: 5, title: 'Review', icon: Eye }
  ]
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => {
          const Icon = s.icon
          const isActive = s.number === step
          const isCompleted = s.number < step
          
          return (
            <div key={s.number} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(s.number)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  isActive ? 
                    "bg-purple-100 text-purple-700" :
                  isCompleted ?
                    "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-500"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{s.title}</span>
              </button>
              
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          )
        })}
      </div>
      
      <AnimatePresence mode="wait">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Assignment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  {...register('title')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Machine Learning"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe what students will learn and do..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Step 2: Select Lessons */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Select AI Lessons</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lessons.map((lesson) => (
                <label
                  key={lesson.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    selectedLessons.includes(lesson.id) ?
                      "border-purple-500 bg-purple-50" :
                      "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedLessons.includes(lesson.id)}
                    onChange={() => handleLessonToggle(lesson.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.estimatedTime} min
                      </span>
                      <span>{lesson.difficulty}</span>
                      <span>+{lesson.xpReward} XP</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            {errors.lessonIds && (
              <p className="text-sm text-red-600 mt-2">{errors.lessonIds.message}</p>
            )}
          </motion.div>
        )}
        
        {/* Step 3: Choose Classes */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Assign to Classes</h3>
            
            <div className="space-y-3">
              {classes.map((classItem) => (
                <label
                  key={classItem.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    selectedClasses.includes(classItem.id) ?
                      "border-purple-500 bg-purple-50" :
                      "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(classItem.id)}
                    onChange={() => handleClassToggle(classItem.id)}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                    <p className="text-sm text-gray-600">
                      {classItem.gradeLevel} • {classItem.students.length} students
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                </label>
              ))}
            </div>
            
            {errors.classIds && (
              <p className="text-sm text-red-600 mt-2">{errors.classIds.message}</p>
            )}
          </motion.div>
        )}
        
        {/* Step 4: Settings */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Assignment Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">
                    Allow Late Submission
                  </label>
                  <p className="text-sm text-gray-600">
                    Students can submit after the due date
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register('allowLateSubmission')}
                  className="w-5 h-5 text-purple-600"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">
                    Show Hints
                  </label>
                  <p className="text-sm text-gray-600">
                    Display helpful hints during lessons
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register('showHints')}
                  className="w-5 h-5 text-purple-600"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">
                    Randomize Questions
                  </label>
                  <p className="text-sm text-gray-600">
                    Show questions in random order
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register('randomizeQuestions')}
                  className="w-5 h-5 text-purple-600"
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-gray-900 mb-2">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  {...register('maxAttempts', { valueAsNumber: true })}
                  min="1"
                  max="10"
                  className="w-24 px-3 py-1 border border-gray-300 rounded-lg"
                />
                {errors.maxAttempts && (
                  <p className="text-sm text-red-600 mt-1">{errors.maxAttempts.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Step 5: Review */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Review Assignment</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {watchedData.title || 'Untitled Assignment'}
                </h4>
                <p className="text-sm text-gray-600">
                  {watchedData.description || 'No description'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Due Date</p>
                  <p className="font-medium">
                    {watchedData.dueDate ? 
                      new Date(watchedData.dueDate).toLocaleString() : 
                      'Not set'
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Max Attempts</p>
                  <p className="font-medium">{watchedData.maxAttempts}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Selected Lessons</p>
                <div className="space-y-1">
                  {selectedLessons.map(id => {
                    const lesson = lessons.find(l => l.id === id)
                    return lesson ? (
                      <p key={id} className="text-sm">• {lesson.title}</p>
                    ) : null
                  })}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Assigned Classes</p>
                <div className="space-y-1">
                  {selectedClasses.map(id => {
                    const classItem = classes.find(c => c.id === id)
                    return classItem ? (
                      <p key={id} className="text-sm">
                        • {classItem.name} ({classItem.students.length} students)
                      </p>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {step === 1 ? 'Cancel' : 'Previous'}
        </button>
        
        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Create Assignment
          </button>
        )}
      </div>
    </form>
  )
}