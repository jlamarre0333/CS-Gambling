'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface SteamUser {
  id: string
  steamId: string
  username: string
  avatar: string
  profileUrl: string
  balance: number
  isOnline: boolean
}

const SteamTestPage: React.FC = () => {
  const [user, setUser] = useState<SteamUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<{
    backend: boolean
    steam: boolean
  }>({ backend: false, steam: false })

  useEffect(() => {
    checkServerStatus()
    
    // Check if user data is in URL (from Steam callback)
    const urlParams = new URLSearchParams(window.location.search)
    const userData = urlParams.get('user')
    const token = urlParams.get('token')
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData))
        setUser(parsedUser)
        console.log('✅ Steam login successful:', parsedUser)
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (err) {
        console.error('❌ Failed to parse user data:', err)
        setError('Failed to parse user data from Steam')
      }
    }
  }, [])

  const checkServerStatus = async () => {
    try {
      // Check backend server
      const backendResponse = await fetch('http://localhost:3001/api/health')
      const backendOk = backendResponse.ok
      
      // Check Steam auth endpoint
      const steamResponse = await fetch('http://localhost:3001/health')
      const steamOk = steamResponse.ok
      
      setServerStatus({
        backend: backendOk,
        steam: steamOk
      })
    } catch (err) {
      console.error('Server status check failed:', err)
    }
  }

  const handleSteamLogin = () => {
    setLoading(true)
    setError(null)
    
    // Redirect to Steam login
    window.location.href = 'http://localhost:3001/api/steam-auth/login'
  }

  const handleLogout = () => {
    setUser(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Steam API Integration Test</h1>
          <p className="text-gray-400">Testing Steam Web API Key: 9D0FC6D133693B6F6***</p>
        </div>

        {/* Server Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              {serverStatus.backend ? (
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h3 className="text-white font-semibold">Backend Server</h3>
                <p className="text-gray-400 text-sm">
                  {serverStatus.backend ? 'Online (Port 3001)' : 'Offline'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              {serverStatus.steam ? (
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h3 className="text-white font-semibold">Steam Auth</h3>
                <p className="text-gray-400 text-sm">
                  {serverStatus.steam ? 'Ready' : 'Not Available'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
          {!user ? (
            <div className="text-center">
              <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Steam Authentication Test</h2>
              <p className="text-gray-400 mb-6">
                Click the button below to test Steam login with your API key
              </p>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <motion.button
                onClick={handleSteamLogin}
                disabled={loading || !serverStatus.backend}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                         disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                         text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200
                         flex items-center space-x-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlobeAltIcon className="w-5 h-5" />
                <span>{loading ? 'Redirecting...' : 'Login with Steam'}</span>
              </motion.button>

              <p className="text-gray-500 text-sm mt-4">
                You'll be redirected to Steam's login page
              </p>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-green-500/50"
                />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user.username}!</h2>
                <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Steam Authentication Successful</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">Steam ID</span>
                  </div>
                  <p className="text-gray-300 font-mono text-sm">{user.steamId}</p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <GlobeAltIcon className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold">Status</span>
                  </div>
                  <p className="text-gray-300">
                    {user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">Profile</span>
                  </div>
                  <a 
                    href={user.profileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Steam Profile
                  </a>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-semibold">Balance</span>
                  </div>
                  <p className="text-green-400 font-bold text-lg">
                    ${user.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Test Another Account
              </motion.button>
            </div>
          )}
        </div>

        {/* API Key Info */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-blue-400 font-semibold mb-2">Steam Web API Configuration</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="text-blue-400">API Key:</span> 9D0FC6D133693B6F6FD1A71935254257
            </p>
            <p className="text-gray-300">
              <span className="text-blue-400">Domain:</span> localhost
            </p>
            <p className="text-gray-300">
              <span className="text-blue-400">Callback URL:</span> http://localhost:3001/api/steam-auth/callback
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SteamTestPage 