import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { signIn, signInWithGoogle } = useAuth()
  const { addToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: string })?.from || '/'
  
  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired')
    if (sessionExpired) {
      // Clear any lingering auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('lastActivity')
      addToast('Your session has expired. Please sign in again.', 'error')
    }
  }, [searchParams, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await signIn(email, password)
    
    setIsLoading(false)
    
    if (result.success) {
      addToast('Welcome back!', 'success')
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Sign in failed')
    }
  }
  
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('')
    setIsLoading(true)
    
    const result = await signInWithGoogle(credentialResponse.credential)
    
    setIsLoading(false)
    
    if (result.success) {
      addToast('Welcome!', 'success')
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Google sign in failed')
    }
  }
  
  const handleGoogleError = () => {
    setError('Google sign in failed. Please try again.')
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-semibold text-foreground mb-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span>EcoShop</span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground mt-6">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width={400}
                />
              </GoogleOAuthProvider>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
