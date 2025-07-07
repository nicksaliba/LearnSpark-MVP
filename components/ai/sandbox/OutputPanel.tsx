// components/ai/sandbox/OutputPanel.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  output: string
  className?: string
}

export function OutputPanel({ output, className }: Props) {
  const outputRef = useRef<HTMLPreElement>(null)
  
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-gray-700">
        <Terminal className="w-4 h-4" />
        <h3 className="font-medium">Output</h3>
      </div>
      
      <pre
        ref={outputRef}
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 font-mono text-sm"
      >
        {output || 'Output will appear here...'}
      </pre>
    </div>
  )
}