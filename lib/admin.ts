// lib/admin.ts - Admin Authentication Utils
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function isAdmin() {
  try {
    const session = await auth()
    if (!session?.user?.id) return false

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    })

    // For now, make admin check based on email
    // In production, you'd want a proper role system
    const adminEmails = [
      'nick.saliba@gmail.com',
      // Add your email here
      process.env.ADMIN_EMAIL
    ].filter(Boolean)

    return user ? adminEmails.includes(user.email) : false
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

export async function requireAdmin() {
  const isAdminUser = await isAdmin()
  if (!isAdminUser) {
    throw new Error('Admin access required')
  }
  return true
}