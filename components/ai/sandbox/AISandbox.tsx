// components/ai/sandbox/AISandbox.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Brain, 
  MessageSquare, 
  Image,
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react'
import { CodeEditor } from './CodeEditor'
import { OutputPanel } from './OutputPanel'
import { TeachableMachine } from './TeachableMachine'
import { ChatbotBuilder } from './ChatbotBuilder'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

type SandboxMode = 'code' | 'teachable-machine' | 'chatbot' | 'neural-network'

const sandboxModes = [
  {
    id: 'code' as SandboxMode,
    name: 'Code Playground',
    icon: Code2,
    description: 'Write and run AI code',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'teachable-machine' as SandboxMode,
    name: 'Teachable Machine',
    icon: Image,
    description: 'Train image recognition',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'chatbot' as SandboxMode,
    name: 'Chatbot Builder',
    icon: MessageSquare,
    description: 'Create your own chatbot',
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'neural-network' as SandboxMode,
    name: 'Neural Network',
    icon: Brain,
    description: 'Visualize AI learning',
    color: 'from-orange-400 to-red-500'
  }
]

export function AISandbox() {
  const [activeMode, setActiveMode] = useState<SandboxMode>('code')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string>('')
  
  const handleRun = async (code: string) => {
    setIsRunning(true)
    setOutput('Running...\n')
    
    try {
      const response = await fetch('/api/ai/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, mode: activeMode })
      })
      
      if (!response.ok) throw new Error('Execution failed')
      
      const result = await response.json()
      setOutput(result.output)
      
      if (result.success) {
        showToast.success('Code executed successfully!')
      }
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
      showToast.error('Execution failed')
    } finally {
      setIsRunning(false)
    }
  }
  
  const handleReset = () => {
    setOutput('')
    showToast.info('Sandbox reset')
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mode Selector */}
      <div className="bg-gray-50 border-b p-4">
        <div className="flex flex-wrap gap-2">
          {sandboxModes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            
            return (
              <motion.button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "relative px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  isActive ? 
                    "bg-white shadow-md" : 
                    "hover:bg-white/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMode"
                    className={cn(
                      "absolute inset-0 rounded-lg bg-gradient-to-r opacity-10",
                      mode.color
                    )}
                  />
                )}
                
                <div className="relative flex items-center gap-2">
                  <Icon className={cn(
                    "w-4 h-4",
                    isActive && "text-purple-600"
                  )} />
                  <span className={cn(
                    "text-sm",
                    isActive ? "text-gray-900" : "text-gray-600"
                  )}>
                    {mode.name}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {sandboxModes.find(m => m.id === activeMode)?.description}
        </p>
      </div>
      
      {/* Sandbox Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeMode === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <CodeEditor
                initialCode={`# Welcome to AI Playground!
# Try this simple AI example:

import random

def ai_greeting(name):
    greetings = [
        f"Hello {name}! Ready to learn AI?",
        f"Hi {name}! Let's explore AI together!",
        f"Welcome {name}! AI is amazing!"
    ]
    return random.choice(greetings)

# Test the AI
print(ai_greeting("Student"))
`}
                language="python"
                onRun={handleRun}
                isRunning={isRunning}
              />
              
              <OutputPanel output={output} />
              
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  Powered by secure sandbox
                </div>
              </div>
            </motion.div>
          )}
          
          {activeMode === 'teachable-machine' && (
            <motion.div
              key="teachable"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TeachableMachine />
            </motion.div>
          )}
          
          {activeMode === 'chatbot' && (
            <motion.div
              key="chatbot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ChatbotBuilder />
            </motion.div>
          )}
          
          {activeMode === 'neural-network' && (
            <motion.div
              key="neural"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-12"
            >
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Neural Network Visualizer coming soon!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}