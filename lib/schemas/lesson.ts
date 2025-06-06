// lib/schemas/lesson.ts - Shared Lesson Schema
import { z } from 'zod'

export const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  module: z.enum(['code-kingdom', 'ai-citadel', 'chess-arena'], {
    errorMap: () => ({ message: 'Invalid module selected' })
  }),
  orderIndex: z.number().int().positive('Order index must be a positive number'),
  xpReward: z.number().int().nonnegative('XP reward cannot be negative'),
  content: z.object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
      errorMap: () => ({ message: 'Invalid difficulty level' })
    }),
    estimatedTime: z.number().int().positive('Estimated time must be positive'),
    objectives: z.array(z.string()).min(1, 'At least one objective is required'),
    theory: z.string().optional(),
    initialCode: z.string().optional(),
    language: z.string().optional().default('python'),
    testCases: z.array(z.object({
      expectedOutput: z.string(),
      description: z.string(),
      input: z.string().optional()
    })).optional().default([]),
    hints: z.array(z.string()).optional().default([])
  })
})

export type LessonFormData = z.infer<typeof lessonSchema>