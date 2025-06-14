'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, User as ApiUser } from '@/lib/api'

interface GuestUser {
  id: string
  username: string
  balance: number
  avatar: string
  isGuest: true
  gamesPlayed: number
  totalWon: number
  totalLost: number
  backendId?: string // Backend user ID for API calls
}

interface GuestContextType {
  guestUser: GuestUser | null
  createGuestUser: (username?: string) => Promise<void>
  updateBalance: (newBalance: number) => Promise<void>
  addGameResult: (won: number, lost: number) => void
  clearGuest: () => void
  syncWithBackend: () => Promise<void>
}

const GuestContext = createContext<GuestContextType | undefined>(undefined)

export const useGuest = () => {
  const context = useContext(GuestContext)
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider')
  }
  return context
}

const generateGuestId = () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const generateGuestAvatar = () => {
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=guest1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=guest2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=guest3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=guest4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=guest5'
  ]
  return avatars[Math.floor(Math.random() * avatars.length)]
}

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null)

  // Load guest user from localStorage on mount
  useEffect(() => {
    const savedGuest = localStorage.getItem('cs2_guest_user')
    if (savedGuest) {
      try {
        setGuestUser(JSON.parse(savedGuest))
      } catch (error) {
        console.error('Failed to load guest user:', error)
        localStorage.removeItem('cs2_guest_user')
      }
    }
  }, [])

  // Save guest user to localStorage whenever it changes
  useEffect(() => {
    if (guestUser) {
      localStorage.setItem('cs2_guest_user', JSON.stringify(guestUser))
    } else {
      localStorage.removeItem('cs2_guest_user')
    }
  }, [guestUser])

  const createGuestUser = async (username?: string) => {
    try {
      // Create user on backend
      const response = await api.createUser(username)
      
      if (response.success && response.data) {
        const backendUser = response.data.user
        const newGuest: GuestUser = {
          id: generateGuestId(),
          username: backendUser.username,
          balance: backendUser.balance,
          avatar: generateGuestAvatar(),
          isGuest: true,
          gamesPlayed: backendUser.gamesPlayed,
          totalWon: backendUser.totalWon,
          totalLost: backendUser.totalLost,
          backendId: backendUser.id
        }
        setGuestUser(newGuest)
      } else {
        // Fallback to local-only guest
        const newGuest: GuestUser = {
          id: generateGuestId(),
          username: username || `Guest_${Math.floor(Math.random() * 9999)}`,
          balance: 1000,
          avatar: generateGuestAvatar(),
          isGuest: true,
          gamesPlayed: 0,
          totalWon: 0,
          totalLost: 0
        }
        setGuestUser(newGuest)
      }
    } catch (error) {
      console.error('Failed to create backend user:', error)
      // Fallback to local-only guest
      const newGuest: GuestUser = {
        id: generateGuestId(),
        username: username || `Guest_${Math.floor(Math.random() * 9999)}`,
        balance: 1000,
        avatar: generateGuestAvatar(),
        isGuest: true,
        gamesPlayed: 0,
        totalWon: 0,
        totalLost: 0
      }
      setGuestUser(newGuest)
    }
  }

  const updateBalance = async (newBalance: number) => {
    if (guestUser) {
      const updatedBalance = Math.max(0, newBalance)
      
      // Update backend if connected
      if (guestUser.backendId) {
        try {
          await api.updateUserBalance(guestUser.backendId, updatedBalance)
        } catch (error) {
          console.error('Failed to update backend balance:', error)
        }
      }
      
      setGuestUser({ ...guestUser, balance: updatedBalance })
    }
  }

  const syncWithBackend = async () => {
    if (guestUser?.backendId) {
      try {
        const response = await api.getUser(guestUser.backendId)
        if (response.success && response.data) {
          const backendUser = response.data.user
          setGuestUser({
            ...guestUser,
            balance: backendUser.balance,
            gamesPlayed: backendUser.gamesPlayed,
            totalWon: backendUser.totalWon,
            totalLost: backendUser.totalLost
          })
        }
      } catch (error) {
        console.error('Failed to sync with backend:', error)
      }
    }
  }

  const addGameResult = (won: number, lost: number) => {
    if (guestUser) {
      setGuestUser({
        ...guestUser,
        gamesPlayed: guestUser.gamesPlayed + 1,
        totalWon: guestUser.totalWon + won,
        totalLost: guestUser.totalLost + lost,
        balance: guestUser.balance + won - lost
      })
    }
  }

  const clearGuest = () => {
    setGuestUser(null)
  }

  return (
    <GuestContext.Provider value={{
      guestUser,
      createGuestUser,
      updateBalance,
      addGameResult,
      clearGuest,
      syncWithBackend
    }}>
      {children}
    </GuestContext.Provider>
  )
} 