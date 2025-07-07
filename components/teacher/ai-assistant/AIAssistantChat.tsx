// components/teacher/ai-assistant/AIAssistantChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User,
  Sparkles,
  Paperclip,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCw
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: string[]
  suggestions?: string[]
  feedback?: 'positive' | 'negative' | null
}

const quickPrompts = [
  "Help me create a quiz about machine learning basics",
  "Suggest activities for teaching AI ethics to 5th graders",
  "Generate discussion questions about bias in AI",
  "Create a rubric for evaluating AI projects",
  "Explain neural networks in simple terms for kids"
]

export function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI teaching assistant. I can help you with:\n\n• Creating quizzes and assessments\n• Generating lesson plans and activities\n• Providing personalized student feedback\n• Explaining complex AI concepts simply\n• Suggesting teaching strategies\n\nHow can I assist you today?",
      timestamp: new Date(),
      suggestions: quickPrompts.slice(0, 3)
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/teacher/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          context: messages.slice(-5) // Send last 5 messages for context
        })
      })
      
      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      showToast.error('Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }
  
  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ))
    showToast.success('Thank you for your feedback!')
  }
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    showToast.success('Copied to clipboard!')
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    // Handle file upload logic here
    showToast.info('File upload feature coming soon!')
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Always here to help</p>
          </div>
        </div>
        
        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear chat"
        >
          <RotateCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === 'assistant' ? 
                  "bg-purple-100" : 
                  "bg-gray-200"
              )}>
                {message.role === 'assistant' ? (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
              
              <div className={cn(
                "flex-1 max-w-[80%]",
                message.role === 'user' && "flex flex-col items-end"
              )}>
                <div className={cn(
                  "rounded-lg p-4",
                  message.role === 'assistant' ? 
                    "bg-gray-50" : 
                    "bg-purple-500 text-white"
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="text-xs opacity-75">
                          📎 {attachment}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Assistant Actions */}
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleCopy(message.content)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(message.id, 'positive')}
                      className={cn(
                        "p-1.5 rounded transition-all",
                        message.feedback === 'positive' ?
                          "text-green-600 bg-green-50" :
                          "text-gray-400 hover:text-green-600 hover:bg-green-50"
                      )}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(message.id, 'negative')}
                      className={cn(
                        "p-1.5 rounded transition-all",
                        message.feedback === 'negative' ?
                          "text-red-600 bg-red-50" :
                          "text-gray-400 hover:text-red-600 hover:bg-red-50"
                      )}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Suggested follow-ups:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-sm p-2 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className={cn(
                  "text-xs mt-1",
                  message.role === 'assistant' ? "text-gray-400" : "text-purple-200"
                )}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w