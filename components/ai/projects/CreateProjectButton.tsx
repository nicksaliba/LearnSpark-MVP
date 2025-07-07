// components/ai/projects/CreateProjectButton.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function CreateProjectButton() {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  
  const handleClick = () => {
    // Navigate to the AI modules to start a new project
    router.push('/ai-modules')
  }
  
  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium",
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        "shadow-lg hover:shadow-xl transition-all duration-300"
      )}
    >
      <Plus className="w-5 h-5" />
      <span>Create New Project</span>
      
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </motion.div>
      )}
    </motion.button>
  )
}