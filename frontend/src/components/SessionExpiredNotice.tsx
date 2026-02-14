import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export function SessionExpiredNotice() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check URL for session expired parameter
    const params = new URLSearchParams(location.search)
    if (params.get('session_expired') === '1') {
      setShow(true)
      // Remove the query parameter
      params.delete('session_expired')
      const newSearch = params.toString()
      navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true })
    }

    // Listen for session expiration events
    const handleSessionExpired = () => {
      setShow(true)
      // Auto-hide after 5 seconds
      setTimeout(() => setShow(false), 5000)
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [location, navigate])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">Session Expired</h3>
            <p className="text-sm text-yellow-800">
              Your session has expired for security. Please sign in again to continue.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
