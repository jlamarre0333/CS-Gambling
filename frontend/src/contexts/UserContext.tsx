'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  username: string
  balance: number
  level: number
  experience?: number
  avatar?: string
  stats?: {
    totalGames: number
    wins: number
    totalWagered: number
    totalWon: number
  }
}

interface UserContextType {
  user: User | null
  login: (username: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gambling-user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        // Refresh user data from API
        refreshUserData(userData.id)
      } catch (error) {
        console.error('Error loading saved user:', error)
        localStorage.removeItem('gambling-user')
      }
    }
  }, [])

  const refreshUserData = async (userId: string) => {
    try {
      const response = await api.getUserProfile(userId)
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('gambling-user', JSON.stringify(response.user))
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const login = async (username: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await api.demoLogin(username)
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('gambling-user', JSON.stringify(response.user))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gambling-user')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('gambling-user', JSON.stringify(updatedUser))
    }
  }

  const value: UserContextType = {
    user,
    login,
    logout,
    updateUser,
    isLoading
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
} 