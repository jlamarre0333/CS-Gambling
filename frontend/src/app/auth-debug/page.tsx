'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function AuthDebugPage() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const [steamSessionData, setSteamSessionData] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Check localStorage for Steam session data
    const steamUser = localStorage.getItem('steam_user')
    const steamToken = localStorage.getItem('steam_token')
    const loginTime = localStorage.getItem('steam_login_time')

    setSteamSessionData({
      steamUser: steamUser ? JSON.parse(steamUser) : null,
      steamToken,
      loginTime,
      hasData: !!(steamUser && steamToken && loginTime)
    })

    // Check various debug info
    setDebugInfo({
      windowAvailable: typeof window !== 'undefined',
      localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage) : [],
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
    })
  }, [])

  const handleTestLogin = async () => {
    if (steamSessionData?.steamUser?.steamId) {
      await login(steamSessionData.steamUser.steamId)
    }
  }

  const clearSteamSession = () => {
    localStorage.removeItem('steam_user')
    localStorage.removeItem('steam_token')
    localStorage.removeItem('steam_login_time')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
        
        {/* Auth Context State */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>isLoading:</strong> {String(isLoading)}</div>
            <div><strong>isAuthenticated:</strong> {String(isAuthenticated)}</div>
            <div><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</div>
          </div>
        </div>

        {/* Steam Session Data */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Steam Session Data</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Has Steam Data:</strong> {String(steamSessionData?.hasData)}</div>
            <div><strong>Steam User:</strong> 
              <pre className="mt-2 bg-gray-700 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(steamSessionData?.steamUser, null, 2)}
              </pre>
            </div>
            <div><strong>Steam Token:</strong> {steamSessionData?.steamToken ? 'Present' : 'None'}</div>
            <div><strong>Login Time:</strong> {steamSessionData?.loginTime}</div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Window Available:</strong> {String(debugInfo.windowAvailable)}</div>
            <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
            <div><strong>LocalStorage Keys:</strong> {JSON.stringify(debugInfo.localStorageKeys)}</div>
            <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleTestLogin}
              disabled={!steamSessionData?.steamUser?.steamId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              Test Login with Steam Data
            </button>
            
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
            
            <button
              onClick={clearSteamSession}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
            >
              Clear Steam Session
            </button>
            
            <a
              href="http://localhost:3001/api/steam-auth/login"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded inline-block"
            >
              Steam Login (Direct)
            </a>
            
            <a
              href="/login"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded inline-block"
            >
              Go to Login Page
            </a>
            
            <a
              href="/"
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded inline-block"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 