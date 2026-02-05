import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyEmail, resendCode } = useAuth()
  const { showToast } = useToast()
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const userId = searchParams.get('userId') || ''
  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (!userId || !email) {
      navigate('/signup')
    }
  }, [userId, email, navigate])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }
    
    if (!/^\d*$/.test(value)) {
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    
    setCode(newCode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      showToast('Please enter all 6 digits', 'error')
      return
    }

    setIsLoading(true)

    try {
      console.log('Verifying email with userId:', userId, 'code:', verificationCode)
      const result = await verifyEmail(userId, verificationCode)
      console.log('Verification result:', result)

      if (result.success) {
        showToast('Email verified successfully!', 'success')
        console.log('Navigating to home page...')
        navigate('/')
      } else {
        showToast(result.error || 'Verification failed', 'error')
        setCode(['', '', '', '', '', ''])
        document.getElementById('code-0')?.focus()
      }
    } catch (error) {
      console.error('Verification error:', error)
      showToast('Verification failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    
    const result = await resendCode(email)
    
    if (result.success) {
      showToast('Verification code sent!', 'success')
    } else {
      showToast(result.error || 'Failed to resend code', 'error')
    }
    
    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-center mb-4">
              Enter verification code
            </label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="font-medium text-green-600 hover:text-green-500 disabled:text-gray-400"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
