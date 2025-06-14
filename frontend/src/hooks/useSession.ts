'use client'

import { useState, useEffect, useCallback } from 'react'
import { jwtManager, JWTPayload } from '@/lib/jwt'
import { useMobile } from './useMobile'

export interface SessionUser {
  steamId: string
  username: string
  avatar: string
  role: 'user' | 'vip' | 'admin'
  balance?: number
  isVip?: boolean
  memberSince?: Date
  lastLoginAt?: Date
  level?: number
}

export interface SessionState {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastActivity: Date | null
}

export interface SessionActions {
  login: (steamId: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  updateUserData: (userData: Partial<SessionUser>) => void
  clearError: () => void
}

export interface UseSessionReturn extends SessionState, SessionActions {}

export const useSession = (): UseSessionReturn => {
  const { hapticFeedback } = useMobile()
  
  const [state, setState] = useState<SessionState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    lastActivity: null,
  })

  // Initialize session from stored tokens
  useEffect(() => {
    initializeSession()
    
    // Check for Steam login callback
    const urlParams = new URLSearchParams(window.location.search)
    const steamUser = urlParams.get('user')
    const steamToken = urlParams.get('token')
    
    if (steamUser && steamToken) {
      handleSteamCallback(steamUser, steamToken)
    }
  }, [])

  // Session activity tracking
  useEffect(() => {
    if (state.isAuthenticated) {
      updateLastActivity()
      
      const activityHandler = () => updateLastActivity()
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      
      events.forEach(event => {
        document.addEventListener(event, activityHandler, { passive: true })
      })

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, activityHandler)
        })
      }
    }
  }, [state.isAuthenticated])

  const initializeSession = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // First check for Steam session data (from login callback)
      const steamUser = localStorage.getItem('steam_user')
      const steamToken = localStorage.getItem('steam_token')
      const loginTime = localStorage.getItem('steam_login_time')

      if (steamUser && steamToken && loginTime) {
        // Check if session is still valid (24 hours)
        const loginDate = new Date(loginTime)
        const now = new Date()
        const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)

        if (hoursSinceLogin < 24) {
          const userData = JSON.parse(steamUser)
          setState(prev => ({
            ...prev,
            user: {
              steamId: userData.steamId,
              username: userData.username,
              avatar: userData.avatar,
              role: userData.role || 'user',
              balance: userData.balance || 0,
              isVip: userData.isVip || false,
              memberSince: userData.memberSince ? new Date(userData.memberSince) : new Date(),
              lastLoginAt: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
              level: userData.level || 1
            },
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date()
          }))
          return
        } else {
          // Session expired, clear storage
          localStorage.removeItem('steam_user')
          localStorage.removeItem('steam_token')
          localStorage.removeItem('steam_login_time')
        }
      }

      // Fallback to JWT if available
      if (jwtManager.isAuthenticated()) {
        const userInfo = jwtManager.getUserInfo()
        if (userInfo && userInfo.sub) {
          // Fetch full user data from backend
          const userData = await fetchUserData(userInfo.sub)
          setState(prev => ({
            ...prev,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date()
          }))
          return
        }
      }

      // No valid session found
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }))
    } catch (error) {
      console.error('Session initialization failed:', error)
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize session'
      }))
    }
  }

  const fetchUserData = async (steamId: string): Promise<SessionUser> => {
    const authHeaders = getAuthHeaders()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization
    }

    const response = await fetch(`http://localhost:3001/api/user/profile/${steamId}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform backend data to SessionUser format
    return {
      steamId: data.steamId,
      username: data.username,
      avatar: data.avatar,
      role: data.role || 'user',
      balance: data.balance || 0,
      isVip: data.isVip || false,
      memberSince: data.memberSince ? new Date(data.memberSince) : new Date(),
      lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : new Date(),
      level: data.level || 1
    }
  }

  const handleSteamCallback = async (steamUserData: string, steamToken: string) => {
    try {
      const userData = JSON.parse(decodeURIComponent(steamUserData))
      
      // Store Steam session data
      localStorage.setItem('steam_user', JSON.stringify(userData))
      localStorage.setItem('steam_token', steamToken)
      localStorage.setItem('steam_login_time', new Date().toISOString())
      
      // Update session state
      setState(prev => ({
        ...prev,
        user: {
          steamId: userData.steamId,
          username: userData.username,
          avatar: userData.avatar,
          role: userData.role || 'user',
          balance: userData.balance || 0,
          isVip: userData.isVip || false,
          memberSince: userData.memberSince ? new Date(userData.memberSince) : new Date(),
          lastLoginAt: new Date(),
          level: userData.level || 1
        },
        isAuthenticated: true,
        isLoading: false,
        lastActivity: new Date()
      }))
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      console.log('✅ Steam login successful:', userData)
    } catch (error) {
      console.error('❌ Steam callback error:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to process Steam login',
        isLoading: false
      }))
    }
  }

  const updateLastActivity = useCallback(() => {
    setState(prev => ({ ...prev, lastActivity: new Date() }))
  }, [])

  const login = async (steamId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Check if we already have Steam session data stored
      const steamUser = localStorage.getItem('steam_user')
      const steamToken = localStorage.getItem('steam_token')

      if (steamUser && steamToken) {
        const userData = JSON.parse(steamUser)
        if (userData.steamId === steamId) {
          // Use existing session data
          setState(prev => ({
            ...prev,
            user: {
              steamId: userData.steamId,
              username: userData.username,
              avatar: userData.avatar,
              role: userData.role || 'user',
              balance: userData.balance || 0,
              isVip: userData.isVip || false,
              memberSince: userData.memberSince ? new Date(userData.memberSince) : new Date(),
              lastLoginAt: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
              level: userData.level || 1
            },
            isAuthenticated: true,
            isLoading: false,
            lastActivity: new Date()
          }))

          hapticFeedback('success')
          return true
        }
      }

      // Fallback: Try to authenticate with backend
      try {
        const response = await fetch('http://localhost:3001/api/auth/steam-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ steamId }),
          credentials: 'include'
        })

        if (response.ok) {
          const authData = await response.json()
          
          if (authData.accessToken && authData.refreshToken) {
            // Store JWT tokens
            jwtManager.setTokens({
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken
            })

            // Fetch user data
            const userData = await fetchUserData(steamId)
            
            setState(prev => ({
              ...prev,
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: new Date()
            }))

            hapticFeedback('success')
            return true
          }
        }
      } catch (backendError) {
        console.log('Backend auth not available, using Steam session only')
      }

      // If we reach here and still have no session, fail
      throw new Error('No valid session data available')

    } catch (error) {
      console.error('Login failed:', error)
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
      
      hapticFeedback('error')
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Clear Steam session data
      localStorage.removeItem('steam_user')
      localStorage.removeItem('steam_token')
      localStorage.removeItem('steam_login_time')
      
      // Logout on server and clear JWT tokens if available
      try {
        await jwtManager.logout()
      } catch (jwtError) {
        console.log('JWT logout not available, clearing local tokens only')
        jwtManager.clearAllTokens()
      }
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: null,
      })

      hapticFeedback('medium')
    } catch (error) {
      console.error('Logout failed:', error)
      
      // Force clear all session data
      localStorage.removeItem('steam_user')
      localStorage.removeItem('steam_token')
      localStorage.removeItem('steam_login_time')
      jwtManager.clearAllTokens()
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: null,
      })
      
      hapticFeedback('error')
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      // First check for Steam session
      const steamUser = localStorage.getItem('steam_user')
      const steamToken = localStorage.getItem('steam_token')
      const loginTime = localStorage.getItem('steam_login_time')

      if (steamUser && steamToken && loginTime) {
        // Check if session is still valid (24 hours)
        const loginDate = new Date(loginTime)
        const now = new Date()
        const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)

        if (hoursSinceLogin < 24) {
          const userData = JSON.parse(steamUser)
          setState(prev => ({
            ...prev,
            user: {
              steamId: userData.steamId,
              username: userData.username,
              avatar: userData.avatar,
              role: userData.role || 'user',
              balance: userData.balance || 0,
              isVip: userData.isVip || false,
              memberSince: userData.memberSince ? new Date(userData.memberSince) : new Date(),
              lastLoginAt: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
              level: userData.level || 1
            },
            isAuthenticated: true,
            error: null,
            lastActivity: new Date()
          }))
          return true
        } else {
          // Steam session expired
          localStorage.removeItem('steam_user')
          localStorage.removeItem('steam_token')
          localStorage.removeItem('steam_login_time')
        }
      }

      // Fallback to JWT refresh
      if (!jwtManager.getRefreshToken()) {
        await logout()
        return false
      }

      await jwtManager.refreshAccessToken()
      
      const userInfo = jwtManager.getUserInfo()
      if (userInfo && userInfo.sub) {
        const userData = await fetchUserData(userInfo.sub)
        setState(prev => ({
          ...prev,
          user: userData,
          isAuthenticated: true,
          error: null,
          lastActivity: new Date()
        }))
        return true
      }

      await logout()
      return false
    } catch (error) {
      console.error('Session refresh failed:', error)
      await logout()
      return false
    }
  }

  const updateUserData = useCallback((userData: Partial<SessionUser>) => {
    setState(prev => {
      if (prev.user) {
        const updatedUser = { ...prev.user, ...userData }
        
        // Update localStorage if we have Steam session data
        const steamUser = localStorage.getItem('steam_user')
        if (steamUser) {
          const currentSteamData = JSON.parse(steamUser)
          const updatedSteamData = { ...currentSteamData, ...userData }
          localStorage.setItem('steam_user', JSON.stringify(updatedSteamData))
        }
        
        return {
          ...prev,
          user: updatedUser
        }
      }
      return prev
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    login,
    logout,
    refreshSession,
    updateUserData,
    clearError,
  }
}

// Helper function for getting auth headers (re-export from jwt for convenience)
const getAuthHeaders = () => {
  const token = jwtManager.getAccessToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
} 