'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  isVisible,
  onClose,
  duration = 4000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50 text-green-100'
      case 'error':
        return 'bg-red-900/90 border-red-500/50 text-red-100'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100'
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50 text-blue-100'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
    }
  }

  const getAnimationProps = () => {
    const isTop = position.includes('top')
    const isCenter = position.includes('center')
    
    return {
      initial: { 
        opacity: 0, 
        y: isTop ? -50 : 50,
        x: isCenter ? 0 : 50,
        scale: 0.9
      },
      animate: { 
        opacity: 1, 
        y: 0,
        x: 0,
        scale: 1
      },
      exit: { 
        opacity: 0, 
        y: isTop ? -50 : 50,
        x: isCenter ? 0 : 50,
        scale: 0.9
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          {...getAnimationProps()}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3
          }}
          className={`
            fixed z-50 ${getPositionClasses()}
            max-w-sm w-full mx-4 sm:mx-0
          `}
        >
          <div className={`
            ${getColors()}
            rounded-lg border backdrop-blur-sm
            shadow-lg shadow-black/20
            p-4 flex items-start space-x-3
            relative overflow-hidden
          `}>
            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
              />
            )}
            
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-5">
                {message}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast Hook for easier usage
export const useToast = () => {
  const [toast, setToast] = React.useState<{
    type: ToastType
    message: string
    isVisible: boolean
  } | null>(null)

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null)
  }

  const ToastComponent = toast ? (
    <Toast
      type={toast.type}
      message={toast.message}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  ) : null

  return {
    showToast,
    hideToast,
    ToastComponent
  }
}

export default Toast 