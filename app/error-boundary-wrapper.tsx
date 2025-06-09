'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ReactNode } from 'react'

interface ErrorBoundaryWrapperProps {
  children: ReactNode
}

export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to your error tracking service
        console.error('Application Error:', { error, errorInfo })
        
        // In production, send to Sentry or similar
        if (process.env.NODE_ENV === 'production') {
          // window.Sentry?.captureException(error, { extra: errorInfo })
        }
      }}
      resetKeys={[]}
    >
      {children}
    </ErrorBoundary>
  )
}