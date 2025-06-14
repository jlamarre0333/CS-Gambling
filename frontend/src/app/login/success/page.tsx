'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

const LoginSuccessPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const processLogin = async () => {
      try {
        const userData = searchParams.get('user')
        const token = searchParams.get('token')

        if (userData && token) {
          const user = JSON.parse(decodeURIComponent(userData))
          
          // Store user data in localStorage (the AuthContext will pick it up)
          localStorage.setItem('steamUser', JSON.stringify(user))
          localStorage.setItem('steamToken', token)
          
          console.log('Steam login successful:', user.username)
          
          // Redirect to homepage after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setError('Invalid authentication data')
        }
      } catch (error) {
        console.error('Error processing login:', error)
        setError('Failed to process login')
      } finally {
        setIsProcessing(false)
      }
    }

    processLogin()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-gaming flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gaming-card border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Login Failed</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-gaming flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gaming-card border border-green-500/20 rounded-2xl p-8 max-w-md w-full text-center"
      >
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-accent-primary text-6xl mb-4"
            >
              <ArrowPathIcon className="w-16 h-16 mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-4">Processing Login...</h1>
            <p className="text-gray-300">Please wait while we complete your Steam authentication.</p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-green-400 text-6xl mb-4"
            >
              <CheckCircleIcon className="w-16 h-16 mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-4">Login Successful!</h1>
            <p className="text-gray-300 mb-6">Welcome to CS Gambling! Redirecting you to the homepage...</p>
            <div className="flex items-center justify-center space-x-2 text-accent-primary">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default LoginSuccessPage 