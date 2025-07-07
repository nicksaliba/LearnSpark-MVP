// app/(platform)/teacher/ai-assistant/page.tsx
import { Metadata } from 'next'
import { requireTeacher } from '@/lib/auth-guards'
import { AIAssistantChat } from '@/components/teacher/ai-assistant/AIAssistantChat'
import { AssistantTools } from '@/components/teacher/ai-assistant/AssistantTools'

export const metadata: Metadata = {
  title: 'AI Teaching Assistant',
  description: 'Get AI-powered help with teaching tasks'
}

export default async function AIAssistantPage() {
  await requireTeacher()
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Teaching Assistant
        </h1>
        <p className="text-lg text-gray-600">
          Get help with lesson planning, student feedback, and more
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIAssistantChat />
        </div>
        
        <div>
          <AssistantTools />
        </div>
      </div>
    </div>
  )
}