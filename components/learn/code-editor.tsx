// components/learn/code-editor.tsx - Interactive Code Editor Component
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Code,
  Terminal,
  Sparkles
} from 'lucide-react'

interface TestCase {
  expectedOutput: string
  description: string
  input?: string
}

interface CodeEditorProps {
  lessonId: string
  initialCode: string
  language: 'python' | 'javascript' | 'html' | 'css'
  testCases: TestCase[]
  hints: string[]
  onSuccess: (solution: string) => void
  onXPEarned: (xp: number) => void
}

export function CodeEditor({
  lessonId,
  initialCode,
  language,
  testCases,
  hints,
  onSuccess,
  onXPEarned
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; error?: string }>>([])
  const [showHints, setShowHints] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [code])

  const runCode = async () => {
    setIsRunning(true)
    setOutput('')
    setTestResults([])
    setAttempts(prev => prev + 1)

    try {
      // Simulate code execution based on language
      let result = ''
      let results: Array<{ passed: boolean; error?: string }> = []

      if (language === 'python') {
        result = await executePythonCode(code)
        results = await runPythonTests(code, testCases)
      } else if (language === 'javascript') {
        result = await executeJavaScriptCode(code)
        results = await runJavaScriptTests(code, testCases)
      }

      setOutput(result)
      setTestResults(results)

      // Check if all tests passed
      const allPassed = results.every(r => r.passed)
      if (allPassed && !isCompleted) {
        setIsCompleted(true)
        onSuccess(code)
        
        // Calculate XP based on attempts (fewer attempts = more XP)
        const baseXP = 100
        const bonusXP = Math.max(0, 50 - (attempts * 10))
        const totalXP = baseXP + bonusXP
        
        onXPEarned(totalXP)
        
        // Show success animation
        setTimeout(() => {
          alert(`🎉 Excellent work! You earned ${totalXP} XP!`)
        }, 500)
      }
    } catch (error) {
      setOutput(`Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    setCode(initialCode)
    setOutput('')
    setTestResults([])
    setIsCompleted(false)
    setAttempts(0)
  }

  const getNextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(prev => prev + 1)
    }
    setShowHints(true)
  }

  return (
    <div className="space-y-6">
      {/* Code Editor Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Code Editor</h3>
              <p className="text-sm text-gray-600">
                Language: <Badge variant="outline">{language.toUpperCase()}</Badge>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetCode}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={getNextHint}>
              <Lightbulb className="h-4 w-4 mr-1" />
              Hint ({currentHint + 1}/{hints.length})
            </Button>
            <Button 
              onClick={runCode} 
              disabled={isRunning}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        </div>

        {/* Code Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full min-h-[300px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Write your code here..."
            disabled={isRunning}
          />
          {isRunning && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Running code...</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Output and Test Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Output Panel */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium">Output</h4>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[150px] overflow-auto">
            {output || 'Run your code to see output...'}
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium">Test Results</h4>
          </div>
          <div className="space-y-2">
            {testCases.map((testCase, index) => {
              const result = testResults[index]
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result?.passed 
                      ? 'bg-green-50 border-green-500' 
                      : result?.passed === false 
                        ? 'bg-red-50 border-red-500'
                        : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result?.passed === true ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : result?.passed === false ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-300 rounded-full" />
                    )}
                    <span className="text-sm font-medium">Test {index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">{testCase.description}</p>
                  {result?.error && (
                    <p className="text-xs text-red-600 mt-1">{result.error}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Hints Panel */}
      {showHints && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 mb-2">
                Hint {currentHint + 1} of {hints.length}
              </h4>
              <p className="text-yellow-800">{hints[currentHint]}</p>
              {currentHint < hints.length - 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={getNextHint}
                  className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Next Hint
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {isCompleted && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Excellent Work!
            </h3>
            <p className="text-gray-600 mb-4">
              You've successfully completed this coding challenge in {attempts} attempts!
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                All Tests Passed ✓
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                +{100 + Math.max(0, 50 - (attempts * 10))} XP
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Mock code execution functions
async function executePythonCode(code: string): Promise<string> {
  // In a real implementation, this would send code to a secure Python execution service
  // For demo purposes, we'll simulate some outputs
  const lines = code.split('\n').filter(line => line.trim().startsWith('print('))
  
  if (lines.length === 0) {
    return 'No output (no print statements found)'
  }
  
  // Simple simulation - extract content from print statements
  const outputs = lines.map(line => {
    const match = line.match(/print\((.*)\)/)
    if (match) {
      const content = match[1].trim()
      // Remove quotes for string literals
      if (content.startsWith('"') && content.endsWith('"')) {
        return content.slice(1, -1)
      }
      if (content.startsWith("'") && content.endsWith("'")) {
        return content.slice(1, -1)
      }
      return content
    }
    return ''
  })
  
  return outputs.join('\n')
}

async function executeJavaScriptCode(code: string): Promise<string> {
  // Similar simulation for JavaScript
  try {
    // Create a safe execution context
    const logs: string[] = []
    const mockConsole = {
      log: (...args: any[]) => logs.push(args.join(' '))
    }
    
    // Replace console.log calls
    const wrappedCode = code.replace(/console\.log/g, 'mockConsole.log')
    
    // Execute in a safe context
    const fn = new Function('mockConsole', wrappedCode)
    fn(mockConsole)
    
    return logs.join('\n') || 'No output'
  } catch (error) {
    return `Error: ${error}`
  }
}

async function runPythonTests(code: string, testCases: TestCase[]): Promise<Array<{ passed: boolean; error?: string }>> {
  // Simple test runner simulation
  return testCases.map((testCase, index) => {
    // For demo purposes, we'll check if the code contains certain patterns
    if (testCase.expectedOutput.includes('Name:') && code.includes('name =')) {
      return { passed: true }
    }
    if (testCase.expectedOutput.includes('Age:') && code.includes('age =')) {
      return { passed: true }
    }
    
    // Simple check - if code has basic structure, pass the test
    const hasVariables = code.includes('=') && code.includes('print(')
    return { 
      passed: hasVariables,
      error: hasVariables ? undefined : 'Make sure to create variables and print them'
    }
  })
}

async function runJavaScriptTests(code: string, testCases: TestCase[]): Promise<Array<{ passed: boolean; error?: string }>> {
  // Similar test logic for JavaScript
  return testCases.map((testCase, index) => {
    const hasConsoleLog = code.includes('console.log')
    const hasVariables = code.includes('=') || code.includes('let ') || code.includes('const ')
    
    return {
      passed: hasConsoleLog && hasVariables,
      error: (!hasConsoleLog || !hasVariables) ? 'Make sure to create variables and use console.log' : undefined
    }
  })
}