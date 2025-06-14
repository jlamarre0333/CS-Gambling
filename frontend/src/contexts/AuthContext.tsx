'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SteamUser {
  id: string
  steamId: string
  username: string
  avatar: string
  profileUrl: string
  balance: number
  level: number
  isOnline: boolean
  lastLogin: Date
  createdAt: Date
}

interface AuthContextType {
  user: SteamUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (steamId: string) => Promise<boolean>
  logout: () => void
  updateBalance: (newBalance: number) => void
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
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('steamUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('steamUser')
      }
    }
  }, [])

  const login = async (steamId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      console.log(`Attempting to login with Steam ID: ${steamId}`)
      
      // Call our backend Steam authentication endpoint
      const response = await fetch('http://localhost:3001/api/steam-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steamId }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.user) {
          const userData: SteamUser = {
            ...data.user,
            lastLogin: new Date(data.user.lastLogin),
            createdAt: new Date(data.user.createdAt)
          }
          
          setUser(userData)
          localStorage.setItem('steamUser', JSON.stringify(userData))
          
          console.log('Steam login successful:', userData.username)
          return true
        } else {
          console.error('Login failed:', data.error || 'Unknown error')
          return false
        }
      } else {
        const errorData = await response.json()
        console.error('Login request failed:', errorData.error || 'Server error')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('steamUser')
    console.log('User logged out')
  }

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      localStorage.setItem('steamUser', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateBalance
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 