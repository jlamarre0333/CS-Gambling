'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'win' | 'jackpot'
  title: string
  message: string
  duration?: number
  icon?: React.ReactNode
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

const NotificationItem: React.FC<{ notification: Notification; onRemove: (id: string) => void }> = ({
  notification,
  onRemove
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id)
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onRemove])

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/90 border-green-400 text-white'
      case 'error':
        return 'bg-red-500/90 border-red-400 text-white'
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-400 text-white'
      case 'info':
        return 'bg-blue-500/90 border-blue-400 text-white'
      case 'win':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white shadow-neon'
      case 'jackpot':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-neon animate-pulse-neon'
      default:
        return 'bg-gaming-card border-gaming-border text-white'
    }
  }

  const getIcon = () => {
    if (notification.icon) return notification.icon
    
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6" />
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6" />
      case 'warning':
        return <ExclamationCircleIcon className="w-6 h-6" />
      case 'info':
        return <InformationCircleIcon className="w-6 h-6" />
      case 'win':
        return <TrophyIcon className="w-6 h-6" />
      case 'jackpot':
        return <span className="text-2xl">💎</span>
      default:
        return <InformationCircleIcon className="w-6 h-6" />
    }
  }

  return (
    <div className={`
      relative p-4 rounded-lg border-2 backdrop-blur-sm transition-all duration-300 
      animate-slide-up ${getNotificationStyle()}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <p className="text-sm opacity-90 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg">
        <div 
          className="h-full bg-white/60 rounded-b-lg transition-all ease-linear"
          style={{ 
            animation: `shrink ${notification.duration || 5000}ms linear forwards` 
          }}
        />
      </div>
    </div>
  )
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message })
  }

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message })
  }

  const showWin = (title: string, message: string, amount?: number) => {
    addNotification({ 
      type: 'win', 
      title, 
      message,
      duration: 7000,
      icon: <span className="text-2xl">🎉</span>
    })
  }

  const showJackpot = (title: string, message: string) => {
    addNotification({ 
      type: 'jackpot', 
      title, 
      message,
      duration: 10000,
      icon: <span className="text-3xl animate-bounce">💎</span>
    })
  }

  const showInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWin,
    showJackpot,
    showInfo
  }
}

export default NotificationSystem 