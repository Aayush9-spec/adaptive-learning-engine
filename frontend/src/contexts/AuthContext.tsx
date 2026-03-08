'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = 'https://b3fw6ipszl.execute-api.us-east-1.amazonaws.com'

interface User {
  id: string
  username: string
  role: 'student' | 'teacher' | 'admin'
  grade?: number
  subscription_tier?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, role: string, grade?: number) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // Only check localStorage, don't redirect here
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Validate the data structure
        if (userData && userData.id && userData.username) {
          setUser(userData)
        } else {
          // Invalid data, clear it
          localStorage.removeItem('user')
        }
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    const userData: User = {
      id: data.user_id,
      username: data.username,
      role: data.role,
      grade: data.grade,
      subscription_tier: data.subscription_tier
    }
    
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    router.push('/dashboard')
  }

  const register = async (username: string, password: string, role: string, grade?: number) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role, grade }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await response.json()
    const userData: User = {
      id: data.user_id,
      username: data.username,
      role: data.role,
      grade: data.grade
    }
    
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    router.push('/dashboard')
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
