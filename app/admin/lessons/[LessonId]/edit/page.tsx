// app/admin/lessons/[lessonId]/edit/page.tsx - Edit Lesson Page
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface LessonFormData {
  title: string
  description: string
  module: string
  orderIndex: number
  xpReward: number
  content: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number
    objectives: string[]
    theory: string
    initialCode: string
    language: string
    testCases: Array<{
      expectedOutput: string
      description: string
      input?: string
    }>
    hints: string[]
  }
}

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params?.lessonId as string
  
  const [formData, setFormData] = useState<LessonFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'code' | 'preview'>('basic')

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/lessons/${lessonId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch lesson')
      }

      const { lesson } = await response.json()
      setFormData(lesson)
    } catch (err) {
      setError('Failed to load lesson')
      console.error('Lesson fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return

    setIsSaving(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        throw new Error('Title and description are required')
      }

      // Clean up empty arrays
      const cleanedData = {
        ...formData,
        content: {
          ...formData.content,
          objectives: formData.content.objectives.filter(obj => obj.trim()),
          hints: formData.content.hints.filter(hint => hint.trim()),
          testCases: formData.content.testCases.filter(tc => tc.expectedOutput.trim())
        }
      }

      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update lesson')
      }

      router.push('/admin/lessons')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lesson')
    } finally {
      setIsSaving(false)
    }
  }

  // Helper functions for managing arrays (same as in new lesson page)
  const addObjective = () => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        objectives: [...prev!.content.objectives, '']
      }
    }))
  }

  const removeObjective = (index: number) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        objectives: prev!.content.objectives.filter((_, i) => i !== index)
      }
    }))
  }

  const updateObjective = (index: number, value: string) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        objectives: prev!.content.objectives.map((obj, i) => i === index ? value : obj)
      }
    }))
  }

  const addTestCase = () => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        testCases: [...prev!.content.testCases, { expectedOutput: '', description: '' }]
      }
    }))
  }

  const removeTestCase = (index: number) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        testCases: prev!.content.testCases.filter((_, i) => i !== index)
      }
    }))
  }

  const updateTestCase = (index: number, field: string, value: string) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        testCases: prev!.content.testCases.map((tc, i) => 
          i === index ? { ...tc, [field]: value } : tc
        )
      }
    }))
  }

  const addHint = () => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        hints: [...prev!.content.hints, '']
      }
    }))
  }

  const removeHint = (index: number) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        hints: prev!.content.hints.filter((_, i) => i !== index)
      }
    }))
  }

  const updateHint = (index: number, value: string) => {
    if (!formData) return
    setFormData(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        hints: prev!.content.hints.map((hint, i) => i === index ? value : hint)
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error && !formData) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Lesson</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchLesson}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/admin/lessons">Back to Lessons</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!formData) return null

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'code', label: 'Code & Tests' },
    { id: 'preview', label: 'Preview' }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/lessons">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Lesson</h1>
            <p className="text-gray-600">Modify lesson content and settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/learn/${formData.module}/${lessonId}`} target="_blank">
              Preview Live
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                placeholder="Enter lesson title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module *
              </label>
              <select
                value={formData.module}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, module: e.target.value }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="code-kingdom">Code Kingdom</option>
                <option value="ai-citadel">AI Citadel</option>
                <option value="chess-arena">Chess Arena</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
              placeholder="Describe what students will learn in this lesson"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.content.difficulty}
                onChange={(e) => setFormData(prev => prev ? ({
                  ...prev,
                  content: { ...prev.content, difficulty: e.target.value as any }
                }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Index
              </label>
              <Input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, orderIndex: parseInt(e.target.value) || 1 }) : null)}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                XP Reward
              </label>
              <Input
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, xpReward: parseInt(e.target.value) || 100 }) : null)}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Time (minutes)
            </label>
            <Input
              type="number"
              value={formData.content.estimatedTime}
              onChange={(e) => setFormData(prev => prev ? ({
                ...prev,
                content: { ...prev.content, estimatedTime: parseInt(e.target.value) || 15 }
              }) : null)}
              min="1"
              className="w-32"
            />
          </div>
        </Card>
      )}

      {/* Content Tab - Similar to new lesson page but with formData checks */}
      {activeTab === 'content' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Learning Content</h2>
          
          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Learning Objectives
              </label>
              <Button variant="outline" size="sm" onClick={addObjective}>
                <Plus className="h-4 w-4 mr-1" />
                Add Objective
              </Button>
            </div>
            <div className="space-y-2">
              {formData.content.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  {formData.content.objectives.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Theory Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theory Content (HTML supported)
            </label>
            <textarea
              value={formData.content.theory || ''}
              onChange={(e) => setFormData(prev => prev ? ({
                ...prev,
                content: { ...prev.content, theory: e.target.value }
              }) : null)}
              placeholder="Enter lesson theory content. You can use HTML tags for formatting."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;code&gt;, etc.
            </p>
          </div>
        </Card>
      )}

      {/* Code & Tests Tab */}
      {activeTab === 'code' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Code & Testing</h2>
          
          {/* Programming Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language
            </label>
            <select
              value={formData.content.language || 'python'}
              onChange={(e) => setFormData(prev => prev ? ({
                ...prev,
                content: { ...prev.content, language: e.target.value }
              }) : null)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>

          {/* Initial Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Code Template
            </label>
            <textarea
              value={formData.content.initialCode || ''}
              onChange={(e) => setFormData(prev => prev ? ({
                ...prev,
                content: { ...prev.content, initialCode: e.target.value }
              }) : null)}
              placeholder="Enter the initial code template that students will see"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 resize-none font-mono text-sm"
            />
          </div>

          {/* Test Cases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Test Cases
              </label>
              <Button variant="outline" size="sm" onClick={addTestCase}>
                <Plus className="h-4 w-4 mr-1" />
                Add Test Case
              </Button>
            </div>
            <div className="space-y-4">
              {formData.content.testCases?.map((testCase, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                    {formData.content.testCases && formData.content.testCases.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <Input
                        value={testCase.description}
                        onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                        placeholder="Describe what this test case validates"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        placeholder="Expected output from the code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </Card>
              )) || []}
            </div>
          </div>

          {/* Hints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Hints
              </label>
              <Button variant="outline" size="sm" onClick={addHint}>
                <Plus className="h-4 w-4 mr-1" />
                Add Hint
              </Button>
            </div>
            <div className="space-y-2">
              {formData.content.hints?.map((hint, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    placeholder={`Hint ${index + 1}`}
                  />
                  {formData.content.hints && formData.content.hints.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHint(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )) || []}
            </div>
          </div>
        </Card>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Lesson Preview</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{formData.title}</h1>
                <p className="text-gray-600">{formData.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={
                  formData.content.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  formData.content.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {formData.content.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {formData.xpReward} XP
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-sm">
                <span className="text-gray-600">Module:</span>
                <div className="font-medium capitalize">{formData.module.replace('-', ' ')}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Estimated Time:</span>
                <div className="font-medium">{formData.content.estimatedTime} minutes</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Order:</span>
                <div className="font-medium">Lesson {formData.orderIndex}</div>
              </div>
            </div>

            {/* Learning Objectives */}
            {formData.content.objectives.filter(obj => obj.trim()).length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Learning Objectives</h3>
                <ul className="space-y-1">
                  {formData.content.objectives
                    .filter(obj => obj.trim())
                    .map((objective, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Theory Preview */}
            {formData.content.theory && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Theory Content</h3>
                <div 
                  className="prose max-w-none text-sm bg-white p-4 rounded border"
                  dangerouslySetInnerHTML={{ __html: formData.content.theory }}
                />
              </div>
            )}

            {/* Code Preview */}
            {formData.content.initialCode && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Initial Code ({formData.content.language})</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                  {formData.content.initialCode}
                </pre>
              </div>
            )}

            {/* Test Cases Preview */}
            {formData.content.testCases && formData.content.testCases.filter(tc => tc.expectedOutput.trim()).length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Test Cases</h3>
                <div className="space-y-2">
                  {formData.content.testCases
                    .filter(tc => tc.expectedOutput.trim())
                    .map((testCase, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Test {index + 1}: {testCase.description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Expected: <code className="bg-gray-100 px-1 rounded">{testCase.expectedOutput}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hints Preview */}
            {formData.content.hints && formData.content.hints.filter(hint => hint.trim()).length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Hints Available</h3>
                <div className="space-y-1">
                  {formData.content.hints
                    .filter(hint => hint.trim())
                    .map((hint, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      💡 {hint}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}