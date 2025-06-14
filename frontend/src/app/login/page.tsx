'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const LoginPage = () => {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  const handleSteamLogin = () => {
    // Redirect to our backend Steam OAuth endpoint
    window.location.href = 'http://localhost:3001/api/steam-auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">CS</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to CS Gambling</h1>
            <p className="text-gray-400">Login with your Steam account to start playing</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center space-x-3 text-gray-300">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm">Secure Steam authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <UserGroupIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Join thousands of players</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Start with $1000 bonus</span>
            </div>
          </div>

          {/* Steam Login Button */}
          <motion.button
            onClick={handleSteamLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>Login with Steam</span>
          </motion.button>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Why Steam Login?</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Secure authentication through Steam</li>
              <li>• Access to your CS2 inventory</li>
              <li>• No need to create a new account</li>
              <li>• Instant verification and setup</li>
            </ul>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage 