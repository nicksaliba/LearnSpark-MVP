
// components/dashboard/welcome-header.tsx - Welcome Header Component
'use client'

import { useSession, signOut } from 'next-auth/react'
import { Trophy, Flame, Target } from 'lucide-react'

export function WelcomeHeader() {
  const { data: session } = useSession()
  
  // Mock data - replace with real user data
  const userName = session?.user?.name || 'Adventurer'
  const currentTime = new Date().getHours()
  
  const getGreeting = () => {
    if (currentTime < 12) return 'Good morning'
    if (currentTime < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivation = () => {
    const motivations = [
      "Ready to level up your skills? 🚀",
      "Time to conquer some coding challenges! 💻",
      "Let's turn curiosity into expertise! 🎯",
      "Your learning adventure awaits! ⚡",
      "Ready to unlock new achievements? 🏆"
    ]
    return motivations[Math.floor(Math.random() * motivations.length)]
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {userName}! 🎮
          </h1>
          <p className="text-gray-600 text-lg">
            {getMotivation()}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">
            <Flame className="h-4 w-4" />
            7 day streak
          </div>
          <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium">
            <Trophy className="h-4 w-4" />
            Level 5
          </div>
          <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
            <Target className="h-4 w-4" />
            3 goals
          </div>
        </div>
      </div>
    </div>
  )
}