'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { useAuth } from '@/contexts/AuthContext'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
}

const SteamIntegrationTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending', message: 'Checking server status...' },
    { name: 'Steam Login Endpoint', status: 'pending', message: 'Testing Steam login availability...' },
    { name: 'Steam Profile API', status: 'pending', message: 'Testing Steam profile fetching...' },
    { name: 'CS2 Inventory API', status: 'pending', message: 'Testing CS2 inventory fetching...' },
    { name: 'User Authentication', status: 'pending', message: 'Checking authentication state...' }
  ])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, status: TestResult['status'], message: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    
    // Test 1: Backend Health Check
    try {
      const response = await fetch('http://localhost:3001/api/health')
      if (response.ok) {
        const data = await response.json()
        updateTest(0, 'success', `Server is healthy (${data.status})`)
      } else {
        updateTest(0, 'error', `Server returned ${response.status}`)
      }
    } catch (error) {
      updateTest(0, 'error', 'Cannot connect to backend server')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 2: Steam Login Endpoint
    try {
      const response = await fetch('http://localhost:3001/api/steam-auth/login', { method: 'HEAD' })
      if (response.status === 302 || response.status === 200) {
        updateTest(1, 'success', 'Steam login endpoint is available')
      } else {
        updateTest(1, 'error', `Steam login returned ${response.status}`)
      }
    } catch (error) {
      updateTest(1, 'error', 'Steam login endpoint not accessible')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 3: Steam Profile API (if user is authenticated)
    if (isAuthenticated && user?.steamId) {
      try {
        const response = await fetch(`http://localhost:3001/api/steam-auth/steam-profile/${user.steamId}`)
        if (response.ok) {
          const data = await response.json()
          updateTest(2, 'success', `Steam profile loaded for ${data.profile?.username || 'user'}`)
        } else {
          updateTest(2, 'error', `Profile API returned ${response.status}`)
        }
      } catch (error) {
        updateTest(2, 'error', 'Steam profile API not accessible')
      }
    } else {
      updateTest(2, 'pending', 'Login required to test Steam profile API')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 4: CS2 Inventory API (if user is authenticated)
    if (isAuthenticated && user?.steamId) {
      try {
        const response = await fetch(`http://localhost:3001/api/steam-auth/inventory/${user.steamId}`)
        if (response.ok) {
          const data = await response.json()
          updateTest(3, 'success', `CS2 inventory loaded (${data.totalItems || 0} items, $${data.totalValue?.toFixed(2) || '0.00'})`)
        } else {
          updateTest(3, 'error', `Inventory API returned ${response.status}`)
        }
      } catch (error) {
        updateTest(3, 'error', 'CS2 inventory API not accessible')
      }
    } else {
      updateTest(3, 'pending', 'Login required to test CS2 inventory API')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 5: User Authentication
    if (isAuthenticated && user) {
      updateTest(4, 'success', `Authenticated as ${user.username} (${user.steamId})`)
    } else {
      updateTest(4, 'pending', 'Not authenticated - click Steam Login to test')
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [isAuthenticated, user])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5'
      case 'error':
        return 'border-red-500/30 bg-red-500/5'
      default:
        return 'border-gray-500/30 bg-gray-500/5'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Steam Integration Test
          </h1>
          <p className="text-gray-400">
            Testing Steam authentication and CS2 inventory integration
          </p>
        </div>

        {/* User Status */}
        <EnhancedCard className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{user.username}</h3>
                    <p className="text-gray-400 text-sm">Steam ID: {user.steamId}</p>
                  </div>
                </>
              ) : (
                <>
                  <UserIcon className="w-12 h-12 text-gray-400" />
                  <div>
                    <h3 className="text-gray-400 font-semibold">Not Authenticated</h3>
                    <p className="text-gray-500 text-sm">Login with Steam to test full integration</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-2">
              <EnhancedButton
                variant="secondary"
                size="sm"
                onClick={runTests}
                disabled={isRunning}
                loading={isRunning}
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Rerun Tests
              </EnhancedButton>
              
              {!isAuthenticated && (
                <EnhancedButton
                  variant="primary"
                  size="sm"
                  onClick={() => { window.location.href = 'http://localhost:3001/api/steam-auth/login' }}
                >
                  Steam Login
                </EnhancedButton>
              )}
            </div>
          </div>
        </EnhancedCard>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnhancedCard className={`p-4 border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="text-white font-medium">{test.name}</h4>
                      <p className="text-gray-400 text-sm">{test.message}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${test.status === 'success' ? 'bg-green-500/20 text-green-400' : 
                        test.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {test.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          ))}
        </div>

        {/* Integration Status Summary */}
        <EnhancedCard className="p-6 mt-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Integration Status</h3>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-gray-400 text-sm">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-gray-400 text-sm">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">
                  {tests.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-gray-400 text-sm">Pending</div>
              </div>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  )
}

export default SteamIntegrationTest 