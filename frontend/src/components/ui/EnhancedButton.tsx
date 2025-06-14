'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

interface EnhancedButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  hapticFeedback?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  hapticFeedback = true,
  className = '',
  type = 'button'
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)

  const isLoading = loading || internalLoading

  const handleClick = async () => {
    if (disabled || isLoading || !onClick) return

    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }

    try {
      setInternalLoading(true)
      await onClick()
    } catch (error) {
      console.error('Button click error:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-orange-500/25',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-gray-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-yellow-500/25',
    error: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25',
    ghost: 'bg-transparent border-2 border-gray-600 hover:border-orange-500 text-gray-300 hover:text-white hover:bg-orange-500/10'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        relative overflow-hidden rounded-xl font-semibold transition-all duration-300 
        transform focus:outline-none focus:ring-4 focus:ring-orange-500/20
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${className}
      `}
      whileHover={!disabled && !isLoading ? { 
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
      } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
    >
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={isPressed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Button content */}
      <div className="relative flex items-center justify-center space-x-2">
        {isLoading ? (
          <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} variant="default" color="secondary" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <motion.div
                className={iconSizeClasses[size]}
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
            
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {children}
            </motion.span>
            
            {icon && iconPosition === 'right' && (
              <motion.div
                className={iconSizeClasses[size]}
                initial={{ x: 5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Shine effect */}
      {!disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}

export default EnhancedButton 