'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSession, SessionUser, UseSessionReturn } from '@/hooks/useSession'

// Update SteamUser interface to match SessionUser
export interface SteamUser {
  id?: string // Optional for backward compatibility
  steamId: string
  username: string
  avatar: string
  balance: number
  role: 'user' | 'vip' | 'admin'
  isVip: boolean
  lastLoginAt: Date
  memberSince: Date
  level?: number
}

interface AuthContextType extends UseSessionReturn {
  // Backward compatibility methods
  checkAuth: () => Promise<void>
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
  const session = useSession()

  // Backward compatibility methods
  const checkAuth = async (): Promise<void> => {
    await session.refreshSession()
  }

  const updateBalance = (newBalance: number) => {
    if (session.user) {
      session.updateUserData({ balance: newBalance })
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    return await session.refreshSession()
  }

  const value: AuthContextType = {
    ...session,
    checkAuth,
    updateBalance,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 