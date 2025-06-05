// app/(auth)/register/page.tsx - Register page
import { RegisterForm } from '@/components/auth/register-form'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
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

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  )
}