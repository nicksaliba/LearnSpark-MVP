// app/(platform)/ai-modules/k2-smart-tech/page.tsx
import { Metadata } from 'next'
import { requireAuth, canAccessGradeLevel } from '@/lib/auth-guards'
import { prisma } from '@/lib/prisma'
import { LessonGrid } from '@/components/ai/lessons/LessonGrid'
import { ModuleHero } from '@/components/ai/ModuleHero'
import { GradeLevel } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Smart Technology - AI Learning',
  description: 'Learn how technology can be smart and help people'
}

export default async function SmartTechModulePage() {
  const session = await requireAuth()
  const canAccess = await canAccessGradeLevel(GradeLevel.K2)
  
  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          This content is for K-2 students
        </h1>
        <p className="text-gray-600">
          Please ask your teacher for access to age-appropriate content.
        </p>
      </div>
    )
  }
  
  // Fetch module and lessons
  const module = await prisma.aIModule.findUnique({
    where: { slug: 'smart-tech-intro' },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { orderIndex: 'asc' },
        include: {
          progress: {
            where: { userId: session.user.id },
            select: {
              status: true,
              score: true,
              completedAt: true
            }
          }
        }
      }
    }
  })
  
  if (!module) {
    return <div>Module not found</div>
  }
  
  return (
    <div className="space-y-8">
      <ModuleHero
        title={module.name}
        description={module.description}
        gradeLevel="K-2"
        lessonCount={module.lessons.length}
        estimatedTime="2-3 hours"
        theme="smart-tech"
      />
      
      <LessonGrid
        lessons={module.lessons}
        moduleSlug={module.slug}
        showProgress
      />
    </div>
  )
}