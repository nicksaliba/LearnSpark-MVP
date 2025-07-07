// components/ai/sandbox/ChatbotBuilder.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User,
  Settings,
  Plus,
  Trash2,
  Save,
  Play,
  Edit2,
  MessageSquare
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ChatRule {
  id: string
  trigger: string
  response: string
  enabled: boolean
}

interface ChatbotPersonality {
  name: string
  greeting: string
  unknownResponse: string
  personality: 'friendly' | 'professional' | 'playful' | 'educational'
}

export function ChatbotBuilder() {
  const [isConfiguring, setIsConfiguring] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Chatbot configuration
  const [personality, setPersonality] = useState<ChatbotPersonality>({
    name: 'AI Assistant',
    greeting: 'Hello! How can I help you today?',
    unknownResponse: "I'm not sure about that. Can you ask me something else?",
    personality: 'friendly'
  })
  
  const [rules, setRules] = useState<ChatRule[]>([
    {
      id: '1',
      trigger: 'hello',
      response: 'Hi there! How are you doing?',
      enabled: true
    },
    {
      id: '2',
      trigger: 'help',
      response: 'I can answer questions about AI and help you learn!',
      enabled: true
    },
    {
      id: '3',
      trigger: 'what is ai',
      response: 'AI stands for Artificial Intelligence - it\'s when computers can do smart things like understand language or recognize pictures!',
      enabled: true
    }
  ])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleAddRule = () => {
    const newRule: ChatRule = {
      id: Date.now().toString(),
      trigger: '',
      response: '',
      enabled: true
    }
    setRules([...rules, newRule])
  }
  
  const handleUpdateRule = (id: string, field: keyof ChatRule, value: any) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ))
  }
  
  const handleDeleteRule = (id: string) => {
    if (rules.length <= 1) {
      showToast.error('You need at least one rule')
      return
    }
    setRules(rules.filter(rule => rule.id !== id))
  }
  
  const handleStartTesting = () => {
    // Validate rules
    const invalidRules = rules.filter(rule => !rule.trigger || !rule.response)
    if (invalidRules.length > 0) {
      showToast.error('Please fill in all rule fields')
      return
    }
    
    setIsConfiguring(false)
    setIsTesting(true)
    
    // Add greeting message
    setMessages([{
      id: Date.now().toString(),
      role: 'bot',
      content: personality.greeting,
      timestamp: new Date()
    }])
    
    showToast.success('Chatbot is ready to test!')
  }
  
  const handleStopTesting = () => {
    setIsTesting(false)
    setIsConfiguring(true)
    setMessages([])
    setInputMessage('')
  }
  
  const findMatchingRule = (message: string): ChatRule | null => {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Find rules that match the message
    const matchingRules = rules.filter(rule => 
      rule.enabled && normalizedMessage.includes(rule.trigger.toLowerCase())
    )
    
    // Return the most specific match (longest trigger)
    return matchingRules.sort((a, b) => 
      b.trigger.length - a.trigger.length
    )[0] || null
  }
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isTesting) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    // Find matching rule
    const matchingRule = findMatchingRule(inputMessage)
    const response = matchingRule ? matchingRule.response : personality.unknownResponse
    
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      content: response,
      timestamp: new Date()
    }
    
    setIsTyping(false)
    setMessages(prev => [...prev, botMessage])
  }
  
  const personalityStyles = {
    friendly: 'from-blue-400 to-blue-600',
    professional: 'from-gray-400 to-gray-600',
    playful: 'from-purple-400 to-pink-600',
    educational: 'from-green-400 to-emerald-600'
  }
  
  const handleSaveChatbot = () => {
    // In a real app, this would save to the database
    showToast.success('Chatbot configuration saved!')
  }
  
  return (
    <div className="space-y-6">
      {isConfiguring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Personality Configuration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              Chatbot Personality
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={personality.name}
                  onChange={(e) => setPersonality({ ...personality, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Give your bot a name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personality Type
                </label>
                <select
                  value={personality.personality}
                  onChange={(e) => setPersonality({ 
                    ...personality, 
                    personality: e.target.value as ChatbotPersonality['personality'] 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="playful">Playful</option>
                  <option value="educational">Educational</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greeting Message
                </label>
                <input
                  type="text"
                  value={personality.greeting}
                  onChange={(e) => setPersonality({ ...personality, greeting: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What should your bot say first?"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unknown Response
                </label>
                <input
                  type="text"
                  value={personality.unknownResponse}
                  onChange={(e) => setPersonality({ ...personality, unknownResponse: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What to say when the bot doesn't understand"
                />
              </div>
            </div>
          </div>
          
          {/* Rules Configuration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Chat Rules
              </h3>
              <button
                onClick={handleAddRule}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>
            
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          When user says (trigger)
                        </label>
                        <input
                          type="text"
                          value={rule.trigger}
                          onChange={(e) => handleUpdateRule(rule.id, 'trigger', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., hello, help, what is AI"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Bot responds with
                        </label>
                        <textarea
                          value={rule.response}
                          onChange={(e) => handleUpdateRule(rule.id, 'response', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Type the bot's response"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => handleUpdateRule(rule.id, 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                      
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        disabled={rules.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              💡 Tip: Rules are checked in order. More specific triggers should come first.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveChatbot}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
            
            <button
              onClick={handleStartTesting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Play className="w-4 h-4" />
              Test Chatbot
            </button>
          </div>
        </motion.div>
      )}
      
      {isTesting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {/* Chat Header */}
          <div className={cn(
            "bg-gradient-to-r text-white p-4 rounded-t-lg flex items-center justify-between",
            personalityStyles[personality.personality]
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{personality.name}</h3>
                <p className="text-xs opacity-90">AI Chatbot</p>
              </div>
            </div>
            
            <button
              onClick={handleStopTesting}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              <Edit2 className="w-4 h-4 inline mr-1" />
              Edit Bot
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="bg-gray-50 rounded-b-lg p-4 h-96 overflow-y-auto">
            <div className="space-y-4">
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
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    message.role === 'bot' ? 
                      "bg-purple-100 text-purple-600" : 
                      "bg-gray-200 text-gray-600"
                  )}>
                    {message.role === 'bot' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className={cn(
                    "max-w-[70%] rounded-lg p-3",
                    message.role === 'bot' ? 
                      "bg-white" : 
                      "bg-purple-500 text-white"
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === 'bot' ? "text-gray-400" : "text-purple-200"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                inputMessage.trim() && !isTyping ?
                  "bg-purple-500 text-white hover:bg-purple-600" :
                  "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
          
          <p className="text-xs text-center text-gray-500">
            <MessageSquare className="w-3 h-3 inline mr-1" />
            This is a rule-based chatbot. It responds based on the rules you configured.
          </p>
        </motion.div>
      )}
    </div>
  )
}