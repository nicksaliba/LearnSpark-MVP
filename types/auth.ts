export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  xpTotal: number
  level: number
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}
