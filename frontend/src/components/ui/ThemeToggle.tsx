'use client'

import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { useMobile } from '@/hooks/useMobile'

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { theme, toggleTheme, isDark } = useTheme()
  const { hapticFeedback, optimizeTouch, isMobile } = useMobile()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Optimize touch interactions on mobile
  useEffect(() => {
    if (buttonRef.current && isMobile) {
      const cleanup = optimizeTouch(buttonRef.current)
      return cleanup
    }
  }, [isMobile, optimizeTouch])

  const handleToggle = () => {
    hapticFeedback('light')
    toggleTheme()
  }

  const sizeClasses = {
    sm: 'w-10 h-6 p-1',
    md: 'w-12 h-7 p-1',
    lg: 'w-16 h-9 p-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleToggle}
      className={`
        relative inline-flex items-center rounded-full transition-all duration-300
        ${sizeClasses[size]}
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/25' 
          : 'bg-gradient-to-r from-orange-400 to-yellow-500 shadow-lg shadow-orange-500/25'
        }
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-purple-500' : 'focus:ring-orange-500'}
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <motion.div
        className={`
          flex items-center justify-center rounded-full bg-white shadow-md
          ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
        `}
        initial={false}
        animate={{
          x: isDark ? 0 : size === 'sm' ? 16 : size === 'md' ? 20 : 28,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <MoonIcon className={`${iconSizes[size]} text-indigo-600`} />
          ) : (
            <SunIcon className={`${iconSizes[size]} text-orange-500`} />
          )}
        </motion.div>
      </motion.div>

      {/* Gaming-style glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDark
            ? '0 0 20px rgba(139, 92, 246, 0.3)'
            : '0 0 20px rgba(251, 146, 60, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
} 