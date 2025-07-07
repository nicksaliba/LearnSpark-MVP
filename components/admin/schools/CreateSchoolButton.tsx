// components/admin/schools/CreateSchoolButton.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, School, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminSchools } from '@/hooks/useAdmin'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const createSchoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters'),
  code: z.string().min(3, 'School code must be at least 3 characters').max(10, 'School code must be at most 10 characters'),
  adminEmail: z.string().email('Invalid email address'),
  districtId: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(5, 'Valid ZIP code required'),
    country: z.string().optional()
  }),
  settings: z.object({
    maxStudents: z.number().int().positive(),
    enabledModules: z.array(z.string()),
    gradeRange: z.object({
      min: z.string().default('K'),
      max: z.string().default('12')
    })
  })
})

type CreateSchoolData = z.infer<typeof createSchoolSchema>

export function CreateSchoolButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { createSchool } = useAdminSchools()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateSchoolData>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      settings: {
        maxStudents: 500,
        enabledModules: ['ai-basics', 'ethics'],
        gradeRange: {
          min: 'K',
          max: '12'
        }
      }
    }
  })
  
const onSubmit = async (data: CreateSchoolData) => {
  setIsCreating(true);
  try {
    const transformedData = {
      ...data,
      address: {
        ...data.address,
        country: data.address.country || undefined, // Make country optional
      },
      settings: {
        ...data.settings,
        maxStudents: data.settings.maxStudents || undefined, // Remove default if needed
        enabledModules: data.settings.enabledModules.length > 0 ? data.settings.enabledModules : [], // Ensure empty array
      },
    };
    await createSchool(transformedData);
    showToast.success('School created successfully!');
    reset();
    setIsOpen(false);
  } catch (error) {
    showToast.error('Failed to create school');
  } finally {
    setIsCreating(false);
  }
};
  
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Create School
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <School className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Create New School
                      </h2>
                      <p className="text-sm text-gray-600">
                        Add a new school to the platform
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Basic Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            School Name
                          </label>
                          <input
                            {...register('name')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Lincoln Elementary School"
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            School Code
                          </label>
                          <input
                            {...register('code')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="LES001"
                          />
                          {errors.code && (
                            <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Administrator Email
                        </label>
                        <input
                          {...register('adminEmail')}
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="admin@school.edu"
                        />
                        {errors.adminEmail && (
                          <p className="text-sm text-red-600 mt-1">{errors.adminEmail.message}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Address */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Address
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            {...register('address.street')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="123 Education Lane"
                          />
                          {errors.address?.street && (
                            <p className="text-sm text-red-600 mt-1">{errors.address.street.message}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              {...register('address.city')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Springfield"
                            />
                            {errors.address?.city && (
                              <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              {...register('address.state')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="IL"
                            />
                            {errors.address?.state && (
                              <p className="text-sm text-red-600 mt-1">{errors.address.state.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP Code
                            </label>
                            <input
                              {...register('address.zip')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="62701"
                            />
                            {errors.address?.zip && (
                              <p className="text-sm text-red-600 mt-1">{errors.address.zip.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Students
                          </label>
                          <input
                            {...register('settings.maxStudents', { valueAsNumber: true })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="500"
                            />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade Range
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              {...register('settings.gradeRange.min')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="K">K</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                            </select>
                            <span className="text-gray-500">to</span>
                            <select
                              {...register('settings.gradeRange.max')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="K">K</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enabled Modules
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'ai-basics', label: 'AI Basics' },
                            { value: 'ml-applications', label: 'Machine Learning' },
                            { value: 'ethics', label: 'AI Ethics' },
                            { value: 'advanced-ai', label: 'Advanced AI' }
                          ].map((module) => (
                            <label key={module.value} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={module.value}
                                {...register('settings.enabledModules')}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">{module.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isCreating}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      isCreating
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    )}
                  >
                    {isCreating ? 'Creating...' : 'Create School'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}