'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SteamUser {
  id: string
  steamId: string
  username: string
  avatar: string
  balance: number
  role: string
  isVip: boolean
  lastLoginAt: Date
  memberSince: Date
}

interface AuthContextType {
  user: SteamUser | null
  isLoading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
  updateBalance: (newBalance: number) => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SteamUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount and periodically
  useEffect(() => {
    checkAuth()
    
    // Check auth every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Handle URL parameters for login success/error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const loginStatus = urlParams.get('login')
    const welcomeBonus = urlParams.get('welcome')
    
    if (loginStatus === 'success') {
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Check auth to get user data
      checkAuth()
      
      // Show welcome message if new user
      if (welcomeBonus === 'true') {
        setTimeout(() => {
          alert('Welcome! You\'ve received $1000 bonus credits!')
        }, 1000)
      }
    }
  }, [])

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3001/api/steam-auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.user) {
          const userData: SteamUser = {
            ...data.user,
            lastLoginAt: new Date(data.user.lastLoginAt),
            memberSince: new Date(data.user.memberSince)
          }
          
          setUser(userData)
        } else {
          setUser(null)
        }
      } else {
        // Token might be expired, try to refresh
        const refreshed = await refreshToken()
        if (!refreshed) {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/steam-auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Token refreshed, check auth again
        await checkAuth()
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('http://localhost:3001/api/steam-auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      // Redirect to login page
      window.location.href = '/login'
    }
  }

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance })
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
    logout,
    updateBalance,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 