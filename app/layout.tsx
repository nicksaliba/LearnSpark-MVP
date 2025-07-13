// app/layout.tsx - Root Layout with Session Provider
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionWrapper } from "@/components/auth/session-wrapper"
import { ToastProvider } from "@/components/providers/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LearnSpark - AI Education Platform",
  description: "Learn AI, coding, and more with interactive lessons",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
          <ToastProvider />
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}