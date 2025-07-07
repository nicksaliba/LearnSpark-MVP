// components/teacher/training/TrainingCourses.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayCircle,
  Clock,
  Award,
  Users,
  Star,
  Lock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  modules: number
  enrolled: number
  rating: number
  progress?: number
  isLocked?: boolean
  thumbnail: string
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Teaching AI',
    description: 'Learn the fundamentals of teaching AI concepts to K-12 students',
    instructor: 'Dr. Sarah Chen',
    duration: '6 hours',
    level: 'beginner',
    modules: 8,
    enrolled: 1234,
    rating: 4.8,
    progress: 100,
    thumbnail: '🎯'
  },
  {
    id: '2',
    title: 'AI Ethics in the Classroom',
    description: 'Guide students through complex ethical considerations in AI',
    instructor: 'Prof. Michael Roberts',
    duration: '4 hours',
    level: 'intermediate',
    modules: 6,
    enrolled: 892,
    rating: 4.9,
    progress: 60,
    thumbnail: '⚖️'
  },
  {
    id: '3',
    title: 'Hands-on Machine Learning Projects',
    description: 'Create engaging ML projects for students of all ages',
    instructor: 'Dr. Emily Thompson',
    duration: '8 hours',
    level              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 # Phase 3: Teacher Features - Detailed Implementation Guide

## Overview
Phase 3 focuses on creating comprehensive tools for teachers to:
- Monitor student progress and engagement
- Manage assignments and curriculum
- Use AI-powered teaching assistance
- Access professional development resources

## 3.1 Teacher Dashboard

### Step 1: Create Teacher Layout
Create `app/(platform)/teacher/layout.tsx`:

```typescript
// app/(platform)/teacher/layout.tsx
import { requireTeacher } from '@/lib/auth-guards'
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar'
import { TeacherHeader } from '@/components/teacher/TeacherHeader'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireTeacher()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherHeader teacher={session.user} />
      
      <div className="flex">
        <TeacherSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}