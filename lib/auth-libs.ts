// lib/auth-utils.ts - Manual user management without adapter
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole, GradeLevel } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  username: string
  role: UserRole
  gradeLevel?: GradeLevel
  schoolId?: string
}

export interface UpdateUserData {
  username?: string
  email?: string
  role?: UserRole
  gradeLevel?: GradeLevel
  schoolId?: string
  avatarUrl?: string
}

// Create a new user
export async function createUser(userData: CreateUserData) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        role: userData.role,
        gradeLevel: userData.gradeLevel,
        schoolId: userData.schoolId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        gradeLevel: true,
        schoolId: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return { user, error: null }
  } catch (error) {
    console.error('Error creating user:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Failed to create user' 
    }
  }
}

// Update user data
export async function updateUser(userId: string, updateData: UpdateUserData) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        gradeLevel: true,
        schoolId: true,
        avatarUrl: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return { user, error: null }
  } catch (error) {
    console.error('Error updating user:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Failed to update user' 
    }
  }
}

// Delete user
export async function deleteUser(userId: string) {
  try {
    // Delete related records first (if needed)
    await prisma.userProgress.deleteMany({
      where: { userId }
    })

    await prisma.userAchievement.deleteMany({
      where: { userId }
    })

    await prisma.aIProgress.deleteMany({
      where: { userId }
    })

    await prisma.aIProject.deleteMany({
      where: { userId }
    })

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete user' 
    }
  }
}

// Change user password
export async function changePassword(userId: string, newPassword: string) {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 12)
    
    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash,
        updatedAt: new Date()
      }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error changing password:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to change password' 
    }
  }
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        gradeLevel: true,
        schoolId: true,
        avatarUrl: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    if (!user) {
      return { user: null, error: 'User not found' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      return { user: null, error: 'Invalid password' }
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user

    return { user: userWithoutPassword, error: null }
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}

// Get user by ID with full details
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        gradeLevel: true,
        schoolId: true,
        avatarUrl: true,
        xpTotal: true,
        level: true,
        createdAt: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            district: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    })

    return { user, error: null }
  } catch (error) {
    console.error('Error getting user:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Failed to get user' 
    }
  }
}

// Bulk user operations
export async function createBulkUsers(usersData: CreateUserData[]) {
  const results = {
    created: [] as any[],
    errors: [] as { email: string; error: string }[]
  }

  for (const userData of usersData) {
    const { user, error } = await createUser(userData)
    if (user) {
      results.created.push(user)
    } else {
      results.errors.push({ email: userData.email, error: error || 'Unknown error' })
    }
  }

  return results
}

// Update user last active timestamp
export async function updateLastActive(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    })
  } catch (error) {
    console.error('Error updating last active:', error)
  }
}