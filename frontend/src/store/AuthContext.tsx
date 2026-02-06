import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/data/types'
import { authService } from '@/services/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; userId?: string; email?: string; requiresVerification?: boolean }>
  verifyEmail: (userId: string, code: string) => Promise<{ success: boolean; error?: string }>
  resendCode: (email: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (user: User) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser()
          setState({ user, isAuthenticated: true, isLoading: false })
          authService.startSessionMonitor()
        } catch (error: any) {
          console.error('Failed to load user:', error);
          // Only log out if specifically unauthorized or forbidden
          if (error.status === 401 || error.status === 403 || error.message === 'Session expired') {
            authService.logout()
          }
          // For other errors (network, server), we stop loading but don't necessarily clear token immediately
          // giving the user a chance to refresh or retry.
          // However, if we can't load the user, the app might not render correctly.
          // Setting isAuthenticated: false will redirect to login in protected routes.
          setState({ user: null, isAuthenticated: false, isLoading: false })
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    }

    loadUser()

    // Listen for session expiration events
    const handleSessionExpired = () => {
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)

    // Cleanup on unmount
    return () => {
      authService.stopSessionMonitor()
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user } = await authService.login(email, password)
      setState({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string; userId?: string; email?: string; requiresVerification?: boolean }> => {
    try {
      const data = await authService.register(email, password, name)
      return { success: true, userId: data.userId, email: data.email, requiresVerification: data.requiresVerification }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const verifyEmail = async (userId: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.verifyEmail(userId, code)
      const { user } = response
      setState({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Verification failed' }
    }
  }

  const resendCode = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.resendVerificationCode(email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to resend code' }
    }
  }

  const signInWithGoogle = async (credential: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user } = await authService.googleSignIn(credential)
      setState({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Google sign in failed' }
    }
  }

  const updateUser = (user: User) => {
    setState(prev => ({ ...prev, user }))
  }

  const signOut = () => {
    authService.logout()
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, verifyEmail, resendCode, signInWithGoogle, updateUser, signOut }}>
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
