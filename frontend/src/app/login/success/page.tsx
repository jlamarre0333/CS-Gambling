'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LoginSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing login...')

  useEffect(() => {
    const handleLoginSuccess = async () => {
      try {
        const userParam = searchParams.get('user')
        const tokenParam = searchParams.get('token')

        if (!userParam || !tokenParam) {
          setStatus('error')
          setMessage('Invalid login data received')
          setTimeout(() => window.location.href = '/', 2000)
          return
        }

        // Parse user data from URL
        const userData = JSON.parse(decodeURIComponent(userParam))
        
        // Store session data in localStorage
        localStorage.setItem('steam_user', JSON.stringify(userData))
        localStorage.setItem('steam_token', tokenParam)
        localStorage.setItem('steam_login_time', new Date().toISOString())

        setStatus('success')
        setMessage('Login successful! Redirecting...')
        
        // Multiple redirect strategies for maximum reliability
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
        
        // Backup redirect after 3 seconds
        setTimeout(() => {
          if (window.location.pathname.includes('/login/success')) {
            window.location.replace('/')
          }
        }, 3000)

      } catch (error) {
        console.error('Login processing failed:', error)
        setStatus('error')
        setMessage('Failed to process login')
        setTimeout(() => window.location.href = '/', 2000)
      }
    }

    handleLoginSuccess()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <LoadingSpinner size="lg" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'processing' && 'Processing Login...'}
          {status === 'success' && 'Login Successful!'}
          {status === 'error' && 'Login Failed'}
        </h1>
        
        <p className="text-gray-400 mb-6">
          {message}
        </p>
        
                         {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Redirecting to homepage...</span>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Continue to Homepage
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Redirecting to home...</span>
          </div>
        )}
      </div>
    </div>
  )
} 