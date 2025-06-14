'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginTestPage() {
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const userParam = searchParams.get('user')
    const tokenParam = searchParams.get('token')

    if (userParam && tokenParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam))
        setUserData(parsedUser)
        
        // Store in localStorage
        localStorage.setItem('steam_user', JSON.stringify(parsedUser))
        localStorage.setItem('steam_token', tokenParam)
        localStorage.setItem('steam_login_time', new Date().toISOString())
        
        console.log('Login data stored successfully:', parsedUser)
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Login Test Page</h1>
        
        {userData ? (
          <div className="space-y-4">
            <div className="text-green-400">
              ✅ Login data received successfully!
            </div>
            
            <div className="text-left text-sm space-y-2">
              <div><strong>Username:</strong> {userData.username}</div>
              <div><strong>Steam ID:</strong> {userData.steamId}</div>
              <div><strong>Balance:</strong> ${userData.balance}</div>
            </div>
            
            <div className="text-blue-400">
              🔄 Redirecting to homepage in 2 seconds...
            </div>
            
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Go to Homepage Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-yellow-400">
              ⚠️ No login data found
            </div>
            
            <div className="space-x-4">
              <a
                href="http://localhost:3001/api/steam-auth/login"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded inline-block"
              >
                Try Steam Login
              </a>
              
              <a
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded inline-block"
              >
                Go Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 