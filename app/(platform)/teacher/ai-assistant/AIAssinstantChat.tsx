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
  RotateCw,
  FileText,
  Code,
  Image as ImageIcon
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  suggestions?: string[]
  feedback?: 'positive' | 'negative' | null
  tools?: ToolResult[]
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
}

interface ToolResult {
  type: 'quiz' | 'rubric' | 'lesson-plan' | 'feedback'
  content: any
  downloadUrl?: string
}

const quickPrompts = [
  "Help me create a quiz about machine learning basics",
  "Suggest activities for teaching AI ethics to 5th graders",
  "Generate discussion questions about bias in AI",
  "Create a rubric for evaluating AI projects",
  "Explain neural networks in simple terms for kids",
  "Write feedback for a student struggling with coding",
  "Design a hands-on activity for teaching data classification",
  "Help me adapt this lesson for visual learners"
]

export function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI teaching assistant. I can help you with:\n\n• Creating quizzes and assessments\n• Generating lesson plans and activities\n• Providing personalized student feedback\n• Explaining complex AI concepts simply\n• Suggesting teaching strategies\n• Adapting content for different learners\n\nHow can I assist you today?",
      timestamp: new Date(),
      suggestions: quickPrompts.slice(0, 3)
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
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
      timestamp: new Date(),
      attachments: [...attachments]
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/teacher/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          context: messages.slice(-5), // Send last 5 messages for context
          attachments
        })
      })
      
      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
        tools: data.tools
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      showToast.error('Failed to get response. Please try again.')
      console.error('AI Assistant error:', error)
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
    
    // Send feedback to backend
    fetch('/api/teacher/ai-assistant/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, feedback })
    })
  }
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    showToast.success('Copied to clipboard!')
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + file.name,
      name: file.name,
      type: file.type,
      size: file.size
    }))
    
    setAttachments(prev => [...prev, ...newAttachments])
    showToast.success(`${files.length} file(s) attached`)
  }
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }
  
  const downloadTool = (tool: ToolResult) => {
    // In production, generate actual file and download
    showToast.info('Downloading ' + tool.type + '...')
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon
    if (type.includes('pdf')) return FileText
    return Code
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Teaching Assistant</h3>
            <p className="text-xs text-gray-500">Always here to help</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setMessages([messages[0]])
            showToast.info('Chat cleared')
          }}
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
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => {
                        const FileIcon = getFileIcon(attachment.type)
                        return (
                          <div 
                            key={attachment.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded",
                              message.role === 'assistant' ? 
                                "bg-white" : 
                                "bg-purple-600"
                            )}
                          >
                            <FileIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm truncate flex-1">
                              {attachment.name}
                            </span>
                            <span className="text-xs opacity-75">
                              {formatFileSize(attachment.size)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Tool Results */}
                  {message.tools && message.tools.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.tools.map((tool, index) => (
                        <div 
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">
                              {tool.type.replace('-', ' ')} Generated
                            </span>
                            <button
                              onClick={() => downloadTool(tool)}
                              className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                            {JSON.stringify(tool.content, null, 2)}
                          </div>
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
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 border-t pt-2">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.slice(0, 4).map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.type)
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                >
                  <FileIcon className="w-4 h-4 text-gray-500" />
                  <span className="max-w-[150px] truncate">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="p-4 border-t"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv"
            multiple
          />
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about teaching AI..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "px-4 py-2 rounded-lg transition-all flex items-center gap-2",
              input.trim() && !isLoading ?
                "bg-purple-500 text-white hover:bg-purple-600" :
                "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}