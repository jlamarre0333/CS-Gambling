'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AchievementNotificationProps {
  isVisible: boolean
  onClose: () => void
  type: 'achievement' | 'challenge' | 'level_up' | 'badge'
  title: string
  description: string
  icon: string
  rewards?: string[]
  autoHide?: boolean
  duration?: number
}

export const AchievementNotification = ({
  isVisible,
  onClose,
  type,
  title,
  description,
  icon,
  rewards = [],
  autoHide = true,
  duration = 5000
}: AchievementNotificationProps) => {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHide, duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'achievement':
        return {
          gradient: 'from-yellow-500 to-orange-500',
          bgGradient: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/30',
          shadow: 'shadow-yellow-500/20'
        }
      case 'challenge':
        return {
          gradient: 'from-blue-500 to-purple-500',
          bgGradient: 'from-blue-500/20 to-purple-500/20',
          border: 'border-blue-500/30',
          shadow: 'shadow-blue-500/20'
        }
      case 'level_up':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bgGradient: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          shadow: 'shadow-green-500/20'
        }
      case 'badge':
        return {
          gradient: 'from-pink-500 to-rose-500',
          bgGradient: 'from-pink-500/20 to-rose-500/20',
          border: 'border-pink-500/30',
          shadow: 'shadow-pink-500/20'
        }
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/30',
          shadow: 'shadow-gray-500/20'
        }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`
            relative overflow-hidden rounded-xl border-2 backdrop-blur-md
            bg-gradient-to-br ${typeStyles.bgGradient} ${typeStyles.border}
            shadow-2xl ${typeStyles.shadow}
          `}>
            {/* Animated background glow */}
            <div className={`
              absolute inset-0 bg-gradient-to-r ${typeStyles.gradient} opacity-5
              animate-pulse
            `} />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`
                  text-4xl bg-gradient-to-br ${typeStyles.gradient} bg-clip-text text-transparent
                  filter drop-shadow-lg
                `}>
                  {icon}
                </div>
                
                <div className="flex-1">
                  <div className={`
                    text-sm font-bold uppercase tracking-wide mb-1
                    bg-gradient-to-r ${typeStyles.gradient} bg-clip-text text-transparent
                  `}>
                    {type.replace('_', ' ')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {description}
                  </p>
                </div>
              </div>

              {/* Rewards */}
              {rewards.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">
                    Rewards:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rewards.map((reward, index) => (
                      <span
                        key={index}
                        className={`
                          text-xs px-3 py-1 rounded-full border
                          bg-gradient-to-r ${typeStyles.bgGradient} ${typeStyles.border}
                          text-white font-medium
                        `}
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress bar for auto-hide */}
              {autoHide && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${typeStyles.gradient}`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing achievement notifications
export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'achievement' | 'challenge' | 'level_up' | 'badge'
    title: string
    description: string
    icon: string
    rewards?: string[]
  }>>([])

  const showNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showAchievement = (title: string, description: string, icon: string, rewards: string[] = []) => {
    showNotification({
      type: 'achievement',
      title,
      description,
      icon,
      rewards
    })
  }

  const showChallenge = (title: string, description: string, icon: string, rewards: string[] = []) => {
    showNotification({
      type: 'challenge',
      title,
      description,
      icon,
      rewards
    })
  }

  const showLevelUp = (level: number, title: string, rewards: string[] = []) => {
    showNotification({
      type: 'level_up',
      title: `Level ${level} Reached!`,
      description: title,
      icon: '⭐',
      rewards
    })
  }

  const showBadge = (title: string, description: string, icon: string) => {
    showNotification({
      type: 'badge',
      title,
      description,
      icon
    })
  }

  return {
    notifications,
    showAchievement,
    showChallenge,
    showLevelUp,
    showBadge,
    hideNotification
  }
}

// Notification container component
export const AchievementNotificationContainer = () => {
  const { notifications, hideNotification } = useAchievementNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
      {notifications.map((notification, index) => (
        <div key={notification.id} className="pointer-events-auto" style={{ marginTop: index * 16 }}>
          <AchievementNotification
            isVisible={true}
            onClose={() => hideNotification(notification.id)}
            type={notification.type}
            title={notification.title}
            description={notification.description}
            icon={notification.icon}
            rewards={notification.rewards}
          />
        </div>
      ))}
    </div>
  )
} 