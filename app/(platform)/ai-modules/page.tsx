// app/(platform)/ai-sandbox/page.tsx
import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-guards'
import { AISandbox } from '@/components/ai/sandbox/AISandbox'

export const metadata: Metadata = {
  title: 'AI Sandbox - Experiment with AI',
  description: 'A safe environment to experiment with AI concepts'
}

export default async function AISandboxPage() {
  await requireAuth()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Sandbox
          </h1>
          <p className="text-xl text-gray-600">
            Experiment with AI in a safe, interactive environment
          </p>
        </div>
        
        <AISandbox />
      </div>
    </div>
  )
}