// components/ai/sandbox/CodeEditor.tsx
'use client'

import { useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { Play, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initialCode?: string
  language?: string
  onRun: (code: string) => void
  isRunning?: boolean
}

export function CodeEditor({ 
  initialCode = '', 
  language = 'python',
  onRun,
  isRunning = false
}: Props) {
  const [code, setCode] = useState(initialCode)
  
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '')
  }
  
  const handleRun = () => {
    if (!isRunning && code.trim()) {
      onRun(code)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <button
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
            isRunning || !code.trim() ?
              "bg-gray-200 text-gray-400 cursor-not-allowed" :
              "bg-green-500 text-white hover:bg-green-600"
          )}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Code
            </>
          )}
        </button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <MonacoEditor
          height="400px"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </div>
  )
}