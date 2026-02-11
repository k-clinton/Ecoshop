import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/data/types'
import { authService } from '@/services/auth'
import { resetSessionExpiredFlag } from '@/services/api'

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
          // Only log out if specifically unauthorized, forbidden, or session expired
          if (error.status === 401 || error.status === 403 || error.message === 'Session expired') {
            authService.logout()
            setState({ user: null, isAuthenticated: false, isLoading: false })
          } else {
            // For other errors (network, server down, etc.), keep the authenticated state
            // The user still has a valid token, just couldn't fetch user data right now
            // This prevents logout on page refresh when there are temporary network issues
            console.warn('Could not load user data, but token is still valid. Keeping session active.')
            setState({ user: null, isAuthenticated: true, isLoading: false })
            // Still start session monitor to handle activity tracking
            authService.startSessionMonitor()
          }
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    }

    loadUser()

    // Listen for session expiration events
    const handleSessionExpired = () => {
      setState({ user: null, isAuthenticated: false, isLoading: false })
      authService.stopSessionMonitor()

      // Redirect to sign in with session expired flag
      const currentPath = window.location.pathname
      if (currentPath !== '/signin' && currentPath !== '/signup') {
        window.location.href = '/signin?session_expired=1'
      }
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
      // Stop any existing session monitor
      authService.stopSessionMonitor()

      // Reset session expired flag for fresh login
      resetSessionExpiredFlag()

      // Login will set new token
      const { user } = await authService.login(email, password)
      setState({ user, isAuthenticated: true, isLoading: false })

      // Start fresh session monitor
      authService.startSessionMonitor()

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
      // Reset session expired flag for fresh login
      resetSessionExpiredFlag()
      
      const response = await authService.verifyEmail(userId, code)
      const { user } = response
      setState({ user, isAuthenticated: true, isLoading: false })

      // Start session monitor after successful verification
      authService.startSessionMonitor()

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
      // Stop any existing session monitor
      authService.stopSessionMonitor()

      // Reset session expired flag for fresh login
      resetSessionExpiredFlag()

      // Google sign in will set new token
      const { user } = await authService.googleSignIn(credential)
      setState({ user, isAuthenticated: true, isLoading: false })

      // Start fresh session monitor
      authService.startSessionMonitor()

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
