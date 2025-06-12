import { useState, useEffect, createContext, useContext } from 'react'
import apiService, { User } from '@/services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const status = await apiService.getAuthStatus()
      
      if (status.authenticated) {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = () => {
    window.location.href = apiService.getSteamLoginUrl()
  }

  const logout = async () => {
    try {
      await apiService.logout()
      setUser(null)
      setIsAuthenticated(false)
      // Redirect to home or login page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const refreshUser = async () => {
    if (isAuthenticated) {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('User refresh failed:', error)
      }
    }
  }

  useEffect(() => {
    checkAuthStatus()

    // Check for auth success/failure in URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auth') === 'success') {
      // Remove the auth param from URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Refresh auth status
      setTimeout(checkAuthStatus, 1000)
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    checkAuthStatus
  }
} 