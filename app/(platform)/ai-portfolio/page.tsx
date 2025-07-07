// app/(platform)/ai-portfolio/page.tsx
import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-guards'
import { ProjectGallery } from '@/components/ai/projects/ProjectGallery'
import { ProjectStats } from '@/components/ai/projects/ProjectStats'
import { CreateProjectButton } from '@/components/ai/projects/CreateProjectButton'

export const metadata: Metadata = {
  title: 'My AI Portfolio',
  description: 'Showcase your AI projects and creations'
}

export default async function PortfolioPage() {
  const session = await requireAuth()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My AI Portfolio
            </h1>
            <p className="text-xl text-gray-600">
              Showcase your AI projects and share with the community
            </p>
          </div>
          
          <CreateProjectButton />
        </div>
        
        {/* Stats */}
        <ProjectStats userId={session.user.id} />
        
        {/* Projects */}
        <ProjectGallery userId={session.user.id} />
      </div>
    </div>
  )
}