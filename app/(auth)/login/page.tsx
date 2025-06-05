// app/(auth)/login/page.tsx - Login page
import { LoginForm } from '@/components/auth/login-form'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Sparkles className="h-8 w-8" />
            LearnSpark
          </Link>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  )
}