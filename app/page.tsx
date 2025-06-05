
// app/page.tsx - Landing page (no session required)
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, Code, Brain, Crown } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="animate-bounce-in">
            <Sparkles className="mx-auto mb-8 h-16 w-16 text-yellow-400" />
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              Learn<span className="text-yellow-400">Spark</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100 md:text-2xl">
              Transform learning into an epic adventure. Master coding, AI, and chess 
              through gamified quests and challenges.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
                <Link href="/register">Start Your Quest</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/login">Continue Journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-4xl font-bold text-gray-900">
            Choose Your Adventure
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <ModuleCard
              icon={<Code className="h-12 w-12" />}
              title="Code Kingdom"
              description="Become a Code Wizard! Learn Python, JavaScript, and more through interactive challenges."
              color="blue"
              href="/learn/code-kingdom"
            />
            <ModuleCard
              icon={<Brain className="h-12 w-12" />}
              title="AI Citadel"
              description="Master AI as an AI Ethicist! Explore machine learning and ethical AI development."
              color="purple"
              href="/learn/ai-citadel"
            />
            <ModuleCard
              icon={<Crown className="h-12 w-12" />}
              title="Chess Arena"
              description="Rise as a Strategic Commander! Master chess tactics and strategic thinking."
              color="yellow"
              href="/learn/chess-arena"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function ModuleCard({ 
  icon, 
  title, 
  description, 
  color, 
  href 
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'blue' | 'purple' | 'yellow'
  href: string
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
  }

  return (
    <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <Link href={href}>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-8 text-white`}>
          <div className="mb-4 flex justify-center">{icon}</div>
          <h3 className="mb-4 text-2xl font-bold">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </Link>
    </Card>
  )
}