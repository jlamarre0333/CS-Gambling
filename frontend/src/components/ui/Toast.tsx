'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export interface ToastProps {
  id: string
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastComponentProps extends ToastProps {
  onRemove: (id: string) => void
}

const Toast: React.FC<ToastComponentProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  persistent = false,
  action,
  onClose,
  onRemove
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (persistent) return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100))
        if (newProgress <= 0) {
          clearInterval(progressInterval)
          handleClose()
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [duration, persistent])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
    setTimeout(() => onRemove(id), 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />
    }
  }

  const getStyles = () => {
    const baseStyles = 'relative overflow-hidden backdrop-blur-sm border rounded-xl shadow-lg'
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-900/20 border-green-500/30 shadow-green-500/10`
      case 'error':
        return `${baseStyles} bg-red-900/20 border-red-500/30 shadow-red-500/10`
      case 'warning':
        return `${baseStyles} bg-yellow-900/20 border-yellow-500/30 shadow-yellow-500/10`
      default:
        return `${baseStyles} bg-blue-900/20 border-blue-500/30 shadow-blue-500/10`
    }
  }

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${getStyles()} p-4 min-w-[320px] max-w-md`}
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          layout
        >
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="text-sm font-medium text-white mb-1">
                  {title}
                </h4>
              )}
              <p className="text-sm text-gray-300">
                {message}
              </p>
              
              {/* Action button */}
              {action && (
                <button
                  onClick={action.onClick}
                  className={`mt-2 text-xs font-medium px-2 py-1 rounded transition-colors ${
                    type === 'success' ? 'text-green-400 hover:bg-green-500/10' :
                    type === 'error' ? 'text-red-400 hover:bg-red-500/10' :
                    type === 'warning' ? 'text-yellow-400 hover:bg-yellow-500/10' :
                    'text-blue-400 hover:bg-blue-500/10'
                  }`}
                >
                  {action.label}
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          {!persistent && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
              <motion.div
                className={`h-full ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={`fixed z-50 ${getPositionStyles()}`}>
      <div className="space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Toast Hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  // Convenience methods
  const success = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, message, type: 'success' })

  const error = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, message, type: 'error' })

  const warning = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, message, type: 'warning' })

  const info = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, message, type: 'info' })

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
} 