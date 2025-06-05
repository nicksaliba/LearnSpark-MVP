
// app/layout.tsx - Updated layout
import type { Metadata } from 'next'
import './globals.css'
import { SessionWrapper } from '@/components/auth/session-wrapper'

export const metadata: Metadata = {
  title: 'LearnSpark',
  description: 'Gamified Learning Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}