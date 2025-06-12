'use client'

import React, { useState, useEffect, useCallback, memo, useRef } from 'react'
import { XMarkIcon, TrophyIcon, FireIcon, BellIcon, GiftIcon, UsersIcon } from '@heroicons/react/24/outline'

export type NotificationType = 'big_win' | 'jackpot' | 'new_round' | 'achievement' | 'friend_activity' | 'system' | 'warning' | 'success' | 'info'

export interface ToastNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  avatar?: string
  amount?: number
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  metadata?: {
    game?: string
    user?: string
    round?: number
    timestamp?: Date
  }
}

interface ToastProps {
  notification: ToastNotification
  onDismiss: (id: string) => void
}

const Toast = memo<ToastProps>(({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 50)

    // Auto-dismiss unless persistent
    if (!notification.persistent) {
      const duration = notification.duration || getDefaultDuration(notification.type)
      timeoutRef.current = setTimeout(() => {
        handleDismiss()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [notification])

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300)
  }, [notification.id, onDismiss])

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'big_win':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500 text-yellow-100'
      case 'jackpot':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 text-purple-100'
      case 'new_round':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500 text-blue-100'
      case 'achievement':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 text-green-100'
      case 'friend_activity':
        return 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500 text-indigo-100'
      case 'system':
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500 text-gray-100'
      case 'warning':
        return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500 text-orange-100'
      case 'success':
        return 'bg-gradient-to-r from-green-500/20 to-teal-500/20 border-green-500 text-green-100'
      case 'info':
        return 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500 text-blue-100'
      default:
        return 'bg-gaming-card border-gaming-border text-white'
    }
  }

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'big_win':
        return '💰'
      case 'jackpot':
        return '🎰'
      case 'new_round':
        return '🔄'
      case 'achievement':
        return '🏆'
      case 'friend_activity':
        return '👥'
      case 'system':
        return '⚙️'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'info':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  const getDefaultDuration = (type: NotificationType) => {
    switch (type) {
      case 'big_win':
      case 'jackpot':
        return 8000 // 8 seconds for major wins
      case 'achievement':
        return 6000 // 6 seconds for achievements
      case 'warning':
        return 10000 // 10 seconds for warnings
      default:
        return 5000 // 5 seconds default
    }
  }

  return (
    <div
      className={`
        relative max-w-sm w-full border-2 rounded-lg shadow-neon backdrop-blur-sm
        transition-all duration-300 ease-out transform
        ${getTypeStyles(notification.type)}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'scale-95' : 'scale-100'}
      `}
    >
      {/* Glow effect for big wins */}
      {(notification.type === 'big_win' || notification.type === 'jackpot') && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-lg animate-pulse" />
      )}

      <div className="relative p-4">
        <div className="flex items-start space-x-3">
          {/* Icon/Avatar */}
          <div className="flex-shrink-0">
            {notification.avatar ? (
              <div className="w-10 h-10 bg-gaming-card rounded-full flex items-center justify-center text-2xl">
                {notification.avatar}
              </div>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center text-2xl">
                {getTypeIcon(notification.type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold truncate">
                {notification.title}
              </h4>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm opacity-90 mb-2">
              {notification.message}
            </p>

            {/* Amount display for wins */}
            {notification.amount && (
              <div className="text-lg font-bold text-accent-success mb-2">
                ${notification.amount.toLocaleString()}
              </div>
            )}

            {/* Metadata */}
            {notification.metadata && (
              <div className="flex items-center space-x-2 text-xs opacity-70 mb-2">
                {notification.metadata.game && (
                  <span>🎮 {notification.metadata.game}</span>
                )}
                {notification.metadata.round && (
                  <span>Round #{notification.metadata.round}</span>
                )}
                {notification.metadata.timestamp && (
                  <span>{notification.metadata.timestamp.toLocaleTimeString()}</span>
                )}
              </div>
            )}

            {/* Action button */}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        {!notification.persistent && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b">
            <div
              className="h-full bg-white/50 rounded-b transition-all ease-linear"
              style={{
                animationDuration: `${notification.duration || getDefaultDuration(notification.type)}ms`,
                animation: 'shrink linear forwards'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
})

Toast.displayName = 'Toast'

// Main Toast Container Component
interface ToastContainerProps {
  notifications: ToastNotification[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  maxVisible?: number
}

export const ToastContainer = memo<ToastContainerProps>(({
  notifications,
  onDismiss,
  position = 'top-right',
  maxVisible = 5
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const visibleNotifications = notifications.slice(0, maxVisible)

  if (visibleNotifications.length === 0) return null

  return (
    <div className={`fixed z-50 flex flex-col space-y-3 ${getPositionClasses()}`}>
      {visibleNotifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
})

ToastContainer.displayName = 'ToastContainer'

// Toast Context and Hook
interface ToastContextType {
  notifications: ToastNotification[]
  addNotification: (notification: Omit<ToastNotification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  const addNotification = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: ToastNotification = {
      ...notification,
      id
    }

    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <ToastContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <ToastContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Predefined notification helpers
export const createBigWinNotification = (
  winner: string,
  amount: number,
  game: string,
  avatar?: string
): Omit<ToastNotification, 'id'> => ({
  type: 'big_win',
  title: 'BIG WIN! 🎉',
  message: `${winner} just won big!`,
  avatar,
  amount,
  duration: 8000,
  metadata: {
    game,
    user: winner,
    timestamp: new Date()
  },
  action: {
    label: 'View Game',
    onClick: () => {
      // Navigate to game
      window.location.href = `/${game.toLowerCase()}`
    }
  }
})

export const createJackpotNotification = (
  winner: string,
  amount: number,
  round: number,
  avatar?: string
): Omit<ToastNotification, 'id'> => ({
  type: 'jackpot',
  title: 'JACKPOT WINNER! 🎰',
  message: `${winner} hit the jackpot!`,
  avatar,
  amount,
  duration: 10000,
  metadata: {
    game: 'Jackpot',
    user: winner,
    round,
    timestamp: new Date()
  }
})

export const createNewRoundNotification = (
  game: string,
  round: number,
  potValue?: number
): Omit<ToastNotification, 'id'> => ({
  type: 'new_round',
  title: 'New Round Started! 🔄',
  message: `${game} Round #${round} is now open for bets!`,
  amount: potValue,
  duration: 4000,
  metadata: {
    game,
    round,
    timestamp: new Date()
  },
  action: {
    label: 'Join Now',
    onClick: () => {
      window.location.href = `/${game.toLowerCase()}`
    }
  }
})

export const createAchievementNotification = (
  title: string,
  description: string,
  reward?: string
): Omit<ToastNotification, 'id'> => ({
  type: 'achievement',
  title: `Achievement Unlocked! 🏆`,
  message: `${title}: ${description}`,
  duration: 6000,
  metadata: {
    timestamp: new Date()
  },
  action: reward ? {
    label: 'Claim Reward',
    onClick: () => {
      // Handle reward claim
    }
  } : undefined
})

export default ToastContainer 