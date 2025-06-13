'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiLock } from 'react-icons/fi'
import { SiSteam } from 'react-icons/si'

const BACKEND_URL = 'http://localhost:3002'

interface User {
  steamId: string
  username: string
  avatar: string
  balance: number
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for Steam login completion from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== BACKEND_URL) return
      
      if (event.data.type === 'STEAM_LOGIN_SUCCESS') {
        console.log('Steam login successful:', event.data)
        localStorage.setItem('steamToken', event.data.token)
        setIsLoading(false)
        checkAuthStatus()
      } else if (event.data.type === 'STEAM_LOGIN_ERROR') {
        console.error('Steam login error:', event.data.error)
        setLoginError(event.data.error || 'Login failed')
        setIsLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('steamToken')
      if (!token) return

      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setLoginError('')
      } else {
        localStorage.removeItem('steamToken')
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('steamToken')
      setUser(null)
    }
  }

  const handleSteamLogin = () => {
    setIsLoading(true)
    setLoginError('')
    
    // Open Steam auth in popup
    const popup = window.open(
      `${BACKEND_URL}/api/auth/steam/login`,
      'steamLogin',
      'width=600,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
    )

    // Check if popup was blocked
    if (!popup) {
      setLoginError('Popup was blocked. Please allow popups for this site.')
      setIsLoading(false)
      return
    }

    // Monitor popup closure
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        setIsLoading(false)
      }
    }, 1000)

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        popup.close()
        setIsLoading(false)
        setLoginError('Login timeout. Please try again.')
      }
      clearInterval(checkClosed)
    }, 300000)
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('steamToken')
      if (token) {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      localStorage.removeItem('steamToken')
      setUser(null)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50"
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-purple-500">
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
            <p className="text-gray-300 mb-2">{user.username}</p>
            <p className="text-green-400 mb-6">Balance: ${user.balance?.toFixed(2)}</p>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
              >
                Go to Dashboard
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/inventory'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                View Your CS2 Inventory
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <SiSteam className="text-2xl text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">CS2 Gambling</h1>
          <p className="text-gray-400">Login with Steam to access your inventory</p>
        </div>

        {loginError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-300 text-sm text-center">{loginError}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSteamLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting to Steam...
              </>
            ) : (
              <>
                <SiSteam className="text-2xl" />
                Login with Steam
              </>
            )}
          </motion.button>
          
          <div className="text-center text-gray-400 text-sm">
            <p>🔒 Secure authentication via Steam OpenID</p>
            <p className="mt-1">Access your real CS2 inventory and skins</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-3 font-medium text-gray-300">What you get:</p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Real-time access to your CS2 inventory
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Live market pricing for all your skins
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Deposit skins to start gambling
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                Withdraw winnings back to Steam
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By logging in, you agree to our terms of service.<br />
            We only access your public Steam profile and inventory.
          </p>
        </div>
      </motion.div>
    </div>
  )
} 