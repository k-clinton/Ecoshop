import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/data/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers: (User & { password: string })[] = [
  { id: 'admin-1', email: 'admin@ecoshop.com', name: 'Admin User', role: 'admin', password: 'admin123' },
  { id: 'user-1', email: 'user@example.com', name: 'Jane Doe', role: 'customer', password: 'user123' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ecoshop_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setState({ user, isAuthenticated: true, isLoading: false })
      } catch {
        localStorage.removeItem('ecoshop_user')
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const user = mockUsers.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem('ecoshop_user', JSON.stringify(userWithoutPassword))
    setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false })
    
    return { success: true }
  }

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists' }
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'customer',
      password,
    }
    
    mockUsers.push(newUser)
    
    const { password: _, ...userWithoutPassword } = newUser
    localStorage.setItem('ecoshop_user', JSON.stringify(userWithoutPassword))
    setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false })
    
    return { success: true }
  }

  const signOut = () => {
    localStorage.removeItem('ecoshop_user')
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
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
