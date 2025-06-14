'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'game' | 'stats' | 'premium' | 'glow'
  hover?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  glowColor?: string
  tiltEffect?: boolean
  pulseEffect?: boolean
  borderGradient?: boolean
  backgroundPattern?: boolean
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  loading = false,
  disabled = false,
  onClick,
  glowColor,
  tiltEffect = false,
  pulseEffect = false,
  borderGradient = false,
  backgroundPattern = false
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Motion values for tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]))
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]))

  // Handle mouse move for tilt and glow effects
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = event.clientX - centerX
    const mouseY = event.clientY - centerY
    
    setMousePosition({ x: mouseX, y: mouseY })

    if (tiltEffect) {
      x.set(mouseX / (rect.width / 2))
      y.set(mouseY / (rect.height / 2))
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
    if (tiltEffect) {
      x.set(0)
      y.set(0)
    }
  }

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300'
    
    switch (variant) {
      case 'game':
        return `${baseStyles} bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700/50 backdrop-blur-sm`
      case 'stats':
        return `${baseStyles} bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 backdrop-blur-sm`
      case 'premium':
        return `${baseStyles} bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 backdrop-blur-sm`
      case 'glow':
        return `${baseStyles} bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-orange-500/30 backdrop-blur-sm`
      default:
        return `${baseStyles} bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-600/30 backdrop-blur-sm`
    }
  }

  // Hover effects
  const getHoverStyles = () => {
    if (!hover || disabled) return ''
    
    switch (variant) {
      case 'game':
        return 'hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02]'
      case 'stats':
        return 'hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]'
      case 'premium':
        return 'hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02]'
      case 'glow':
        return 'hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-500/20 hover:scale-[1.02]'
      default:
        return 'hover:border-gray-500/50 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.01]'
    }
  }

  // Glow effect styles
  const getGlowEffect = () => {
    if (!isHovered || disabled) return {}
    
    const color = glowColor || (variant === 'glow' ? '#f97316' : '#6b7280')
    return {
      boxShadow: `0 0 20px ${color}40, 0 0 40px ${color}20, 0 0 60px ${color}10`
    }
  }

  // Background pattern
  const backgroundPatternStyle = backgroundPattern ? {
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
    `
  } : {}

  const cardVariants = {
    initial: { 
      scale: 1,
      opacity: 1
    },
    hover: { 
      scale: hover && !disabled ? 1.02 : 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    tap: { 
      scale: onClick && !disabled ? 0.98 : 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={`
        ${getVariantStyles()}
        ${getHoverStyles()}
        ${onClick && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        rounded-xl p-6
      `}
      style={{
        rotateX: tiltEffect ? rotateX : 0,
        rotateY: tiltEffect ? rotateY : 0,
        transformStyle: tiltEffect ? 'preserve-3d' : 'flat',
        ...getGlowEffect(),
        ...backgroundPatternStyle
      }}
      variants={cardVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : "initial"}
      whileTap={!disabled ? "tap" : "initial"}
      animate={pulseEffect && !disabled ? "pulse" : "initial"}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      {/* Border gradient overlay */}
      {borderGradient && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Shine effect */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)`,
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <LoadingSpinner variant="casino" size="lg" color="orange" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-0 ${loading ? 'pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Ambient light effect */}
      {variant === 'glow' && isHovered && !disabled && (
        <div 
          className="absolute inset-0 rounded-xl opacity-20 blur-xl"
          style={{
            background: `radial-gradient(circle at ${50 + (mousePosition.x / 10)}% ${50 + (mousePosition.y / 10)}%, #f97316 0%, transparent 70%)`
          }}
        />
      )}
    </motion.div>
  )
}

// Preset card variants for common use cases
export const GameCard: React.FC<Omit<EnhancedCardProps, 'variant'>> = (props) => (
  <EnhancedCard {...props} variant="game" tiltEffect hover />
)

export const StatsCard: React.FC<Omit<EnhancedCardProps, 'variant'>> = (props) => (
  <EnhancedCard {...props} variant="stats" backgroundPattern />
)

export const PremiumCard: React.FC<Omit<EnhancedCardProps, 'variant'>> = (props) => (
  <EnhancedCard {...props} variant="premium" borderGradient pulseEffect />
)

export const GlowCard: React.FC<Omit<EnhancedCardProps, 'variant'>> = (props) => (
  <EnhancedCard {...props} variant="glow" tiltEffect glowColor="#f97316" />
) 