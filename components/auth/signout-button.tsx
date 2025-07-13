// components/auth/signout-button.tsx - Sign Out Button
'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignOutButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  showText?: boolean
}

export function SignOutButton({ 
  className, 
  variant = 'ghost', 
  size = 'default',
  showIcon = true,
  showText = true 
}: SignOutButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut({ 
        redirect: false 
      })
      
      // Manually redirect to ensure clean navigation
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {showText && 'Sign Out'}
    </Button>
  )
}