// components/learn/code-editor.tsx - Enhanced Interactive Code Editor
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
  Sparkles,
  AlertTriangle,
  Trophy
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
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; error?: string; actual?: string }>>([])
  const [showHints, setShowHints] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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
      console.log('🏃 Running code:', { language, codeLength: code.length })
      
      // Simulate code execution based on language
      let result = ''
      let results: Array<{ passed: boolean; error?: string; actual?: string }> = []

      if (language === 'python') {
        result = await executePythonCode(code)
        results = await runPythonTests(code, testCases)
      } else if (language === 'javascript') {
        result = await executeJavaScriptCode(code)
        results = await runJavaScriptTests(code, testCases)
      } else {
        result = 'Code execution not implemented for this language yet.'
        results = testCases.map(() => ({ passed: false, error: 'Language not supported' }))
      }

      setOutput(result)
      setTestResults(results)

      console.log('📊 Test results:', results)

      // Check if all tests passed
      const allPassed = results.length > 0 && results.every(r => r.passed)
      
      if (allPassed && !isCompleted) {
        console.log('🎉 All tests passed!')
        setIsCompleted(true)
        setShowSuccess(true)
        
        // Calculate XP based on attempts (fewer attempts = more XP)
        const baseXP = 100
        const bonusXP = Math.max(0, 50 - (attempts * 10))
        const totalXP = baseXP + bonusXP
        
        onXPEarned(totalXP)
        onSuccess(code)
        
        // Hide success animation after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000)
      } else if (results.length > 0) {
        const passedCount = results.filter(r => r.passed).length
        console.log(`📊 ${passedCount}/${results.length} tests passed`)
      }
    } catch (error) {
      console.error('💥 Code execution error:', error)
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
    setShowHints(false)
    setCurrentHint(0)
    setShowSuccess(false)
  }

  const getNextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(prev => prev + 1)
    }
    setShowHints(true)
  }

  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      {showSuccess && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 animate-bounce-in">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Excellent Work!
            </h3>
            <p className="text-gray-600">
              All tests passed! You've mastered this coding challenge.
            </p>
          </div>
        </Card>
      )}

      {/* Code Editor Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Interactive Code Editor</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{language.toUpperCase()}</Badge>
                {attempts > 0 && (
                  <Badge variant="secondary">
                    Attempt {attempts}
                  </Badge>
                )}
                {totalTests > 0 && (
                  <Badge className={passedTests === totalTests ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {passedTests}/{totalTests} tests passing
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetCode} disabled={isRunning}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {hints.length > 0 && (
              <Button variant="outline" size="sm" onClick={getNextHint} disabled={isRunning}>
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint ({Math.min(currentHint + 1, hints.length)}/{hints.length})
              </Button>
            )}
            <Button 
              onClick={runCode} 
              disabled={isRunning || isCompleted}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : isCompleted ? 'Completed' : 'Run Code'}
            </Button>
          </div>
        </div>

        {/* Code Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full min-h-[300px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
            placeholder="Write your code here..."
            disabled={isRunning || isCompleted}
            spellCheck={false}
          />
          {isRunning && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Running code...</span>
              </div>
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
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
            {output && !isRunning && (
              <Badge variant="secondary" className="ml-auto">
                {output.split('\n').length} lines
              </Badge>
            )}
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[150px] max-h-[300px] overflow-auto">
            {isRunning ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                Executing code...
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className="text-gray-500">Run your code to see output...</span>
            )}
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium">Test Results</h4>
            {testResults.length > 0 && (
              <Badge 
                className={`ml-auto ${
                  passedTests === totalTests 
                    ? 'bg-green-100 text-green-800' 
                    : passedTests > 0 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {passedTests}/{totalTests} passing
              </Badge>
            )}
          </div>
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {testCases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No test cases defined for this lesson</p>
              </div>
            ) : testCases.map((testCase, index) => {
              const result = testResults[index]
              const isPending = !result && !isRunning
              const isRunningThis = isRunning && !result
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                    result?.passed 
                      ? 'bg-green-50 border-green-500' 
                      : result?.passed === false 
                        ? 'bg-red-50 border-red-500'
                        : isRunningThis
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isRunningThis ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    ) : result?.passed === true ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : result?.passed === false ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-300 rounded-full" />
                    )}
                    <span className="text-sm font-medium">
                      Test {index + 1}
                      {isRunningThis && <span className="text-blue-600 ml-1">Running...</span>}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{testCase.description}</p>
                  
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-medium text-gray-700">Expected:</span>
                      <code className="ml-2 bg-gray-100 px-1 rounded text-gray-800">
                        {testCase.expectedOutput}
                      </code>
                    </div>
                    
                    {result?.actual && (
                      <div>
                        <span className="font-medium text-gray-700">Actual:</span>
                        <code className={`ml-2 px-1 rounded ${
                          result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.actual}
                        </code>
                      </div>
                    )}
                    
                    {result?.error && (
                      <div className="text-red-600">
                        <span className="font-medium">Error:</span>
                        <span className="ml-2">{result.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Hints Panel */}
      {showHints && hints.length > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-yellow-900">
                  Hint {currentHint + 1} of {hints.length}
                </h4>
                {currentHint < hints.length - 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getNextHint}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Next Hint
                  </Button>
                )}
              </div>
              <p className="text-yellow-800">{hints[currentHint]}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Summary */}
      {isCompleted && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Coding Challenge Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              Outstanding work! You've successfully completed this coding challenge in {attempts} attempts.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Tests Passed
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                +{100 + Math.max(0, 50 - (attempts * 10))} XP
              </Badge>
              {attempts === 1 && (
                <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Perfect Score!
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Enhanced code execution functions
async function executePythonCode(code: string): Promise<string> {
  try {
    // Simple simulation for Python output
    const lines = code.split('\n')
    const outputs: string[] = []
    const variables: Record<string, any> = {}
    
    // First pass: collect variable assignments
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes('=') && !trimmed.startsWith('print(') && !trimmed.includes('==')) {
        const [varName, varValue] = trimmed.split('=').map(s => s.trim())
        
        // Parse the value
        if (varValue.startsWith('"') && varValue.endsWith('"')) {
          variables[varName] = varValue.slice(1, -1) // Remove quotes
        } else if (varValue.startsWith("'") && varValue.endsWith("'")) {
          variables[varName] = varValue.slice(1, -1) // Remove quotes
        } else if (varValue === 'True') {
          variables[varName] = true
        } else if (varValue === 'False') {
          variables[varName] = false
        } else if (!isNaN(Number(varValue))) {
          variables[varName] = Number(varValue)
        } else {
          variables[varName] = varValue
        }
      }
    }
    
    console.log('🔍 Variables found:', variables)
    
    // Second pass: process print statements
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('print(')) {
        const match = trimmed.match(/print\((.*)\)/)
        if (match) {
          let content = match[1].trim()
          
          // Handle different print formats
          if (content.includes('f"') || content.includes("f'")) {
            // F-string simulation
            content = content.replace(/f["'](.*)["']/, '$1')
            content = content.replace(/\{([^}]+)\}/g, (_, expr) => {
              const varName = expr.trim()
              return variables[varName] !== undefined ? String(variables[varName]) : expr
            })
            outputs.push(content)
          } else if (content.startsWith('"') && content.endsWith('"')) {
            // String literal
            outputs.push(content.slice(1, -1))
          } else if (content.startsWith("'") && content.endsWith("'")) {
            // String literal
            outputs.push(content.slice(1, -1))
          } else if (content.includes(',')) {
            // Multiple arguments like print("Name:", name)
            const parts = content.split(',').map(p => p.trim())
            const result = parts.map(part => {
              if (part.startsWith('"') && part.endsWith('"')) {
                return part.slice(1, -1)
              } else if (part.startsWith("'") && part.endsWith("'")) {
                return part.slice(1, -1)
              } else if (variables[part] !== undefined) {
                return String(variables[part])
              } else {
                return part
              }
            }).join(' ')
            outputs.push(result)
          } else if (variables[content] !== undefined) {
            // Single variable
            outputs.push(String(variables[content]))
          } else {
            // Fallback - just output the content
            outputs.push(content)
          }
        }
      }
    }
    
    return outputs.length > 0 ? outputs.join('\n') : 'No output (no print statements found)'
  } catch (error) {
    return `Error: ${error}`
  }
}

async function executeJavaScriptCode(code: string): Promise<string> {
  try {
    const logs: string[] = []
    const mockConsole = {
      log: (...args: any[]) => logs.push(args.join(' '))
    }
    
    // Replace console.log calls and execute
    const wrappedCode = code.replace(/console\.log/g, 'mockConsole.log')
    const fn = new Function('mockConsole', wrappedCode)
    fn(mockConsole)
    
    return logs.join('\n') || 'No output'
  } catch (error) {
    return `Error: ${error}`
  }
}

async function runPythonTests(code: string, testCases: TestCase[]): Promise<Array<{ passed: boolean; error?: string; actual?: string }>> {
  return testCases.map((testCase, index) => {
    try {
      const expectedOutput = testCase.expectedOutput.trim()
      
      // Execute the code to get actual output
      const actualOutput = executePythonCodeSync(code)
      
      console.log(`🧪 Test ${index + 1}:`, {
        expected: expectedOutput,
        actual: actualOutput
      })
      
      // Compare outputs
      const passed = actualOutput.trim() === expectedOutput
      
      return { 
        passed, 
        actual: actualOutput,
        error: passed ? undefined : `Expected "${expectedOutput}" but got "${actualOutput}"`
      }
      
    } catch (error) {
      return { 
        passed: false, 
        error: `Test error: ${error}`,
        actual: 'Test execution failed'
      }
    }
  })
}

// Synchronous version for testing
function executePythonCodeSync(code: string): string {
  try {
    const lines = code.split('\n')
    const outputs: string[] = []
    const variables: Record<string, any> = {}
    
    // First pass: collect variable assignments
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes('=') && !trimmed.startsWith('print(') && !trimmed.includes('==')) {
        const [varName, varValue] = trimmed.split('=').map(s => s.trim())
        
        // Parse the value
        if (varValue.startsWith('"') && varValue.endsWith('"')) {
          variables[varName] = varValue.slice(1, -1)
        } else if (varValue.startsWith("'") && varValue.endsWith("'")) {
          variables[varName] = varValue.slice(1, -1)
        } else if (varValue === 'True') {
          variables[varName] = true
        } else if (varValue === 'False') {
          variables[varName] = false
        } else if (!isNaN(Number(varValue))) {
          variables[varName] = Number(varValue)
        } else {
          variables[varName] = varValue
        }
      }
    }
    
    // Second pass: process print statements
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('print(')) {
        const match = trimmed.match(/print\((.*)\)/)
        if (match) {
          let content = match[1].trim()
          
          if (content.includes('f"') || content.includes("f'")) {
            // F-string
            content = content.replace(/f["'](.*)["']/, '$1')
            content = content.replace(/\{([^}]+)\}/g, (_, expr) => {
              const varName = expr.trim()
              return variables[varName] !== undefined ? String(variables[varName]) : expr
            })
            outputs.push(content)
          } else if (content.startsWith('"') && content.endsWith('"')) {
            outputs.push(content.slice(1, -1))
          } else if (content.startsWith("'") && content.endsWith("'")) {
            outputs.push(content.slice(1, -1))
          } else if (content.includes(',')) {
            // Multiple arguments
            const parts = content.split(',').map(p => p.trim())
            const result = parts.map(part => {
              if (part.startsWith('"') && part.endsWith('"')) {
                return part.slice(1, -1)
              } else if (part.startsWith("'") && part.endsWith("'")) {
                return part.slice(1, -1)
              } else if (variables[part] !== undefined) {
                return String(variables[part])
              } else {
                return part
              }
            }).join(' ')
            outputs.push(result)
          } else if (variables[content] !== undefined) {
            // Single variable
            outputs.push(String(variables[content]))
          } else {
            outputs.push(content)
          }
        }
      }
    }
    
    return outputs.join('\n')
  } catch (error) {
    return `Error: ${error}`
  }
}

async function runJavaScriptTests(code: string, testCases: TestCase[]): Promise<Array<{ passed: boolean; error?: string; actual?: string }>> {
  return testCases.map((testCase) => {
    const hasConsoleLog = code.includes('console.log')
    const hasVariables = code.includes('=') || code.includes('let ') || code.includes('const ')
    
    return {
      passed: hasConsoleLog && hasVariables,
      error: (!hasConsoleLog || !hasVariables) ? 'Make sure to create variables and use console.log' : undefined,
      actual: hasConsoleLog && hasVariables ? testCase.expectedOutput : 'Missing console.log or variables'
    }
  })
}