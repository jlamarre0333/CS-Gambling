'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const LoginErrorPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('An unknown error occurred')

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setErrorMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-gaming flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gaming-card border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-red-400 text-6xl mb-4"
        >
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Steam Login Failed</h1>
        
        <p className="text-gray-300 mb-6">{errorMessage}</p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Homepage</span>
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Common Issues:</h3>
          <ul className="text-xs text-gray-400 space-y-1 text-left">
            <li>• Make sure you're logged into Steam</li>
            <li>• Check your Steam privacy settings</li>
            <li>• Try refreshing and logging in again</li>
            <li>• Ensure Steam Community is accessible</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginErrorPage 