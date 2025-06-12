'use client'

import React, { useState, useRef, useEffect, memo } from 'react'
import { useTouchGestures } from '@/hooks/useTouchGestures'
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// Mobile-optimized game container
interface MobileGameContainerProps {
  children: React.ReactNode
  className?: string
  enableSwipeNavigation?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export const MobileGameContainer = memo<MobileGameContainerProps>(({
  children,
  className = '',
  enableSwipeNavigation = false,
  onSwipeLeft,
  onSwipeRight
}) => {
  const touchGestures = useTouchGestures({
    onSwipeLeft: enableSwipeNavigation ? onSwipeLeft : undefined,
    onSwipeRight: enableSwipeNavigation ? onSwipeRight : undefined,
    swipeThreshold: 50,
    preventScroll: false
  })

  return (
    <div 
      ref={touchGestures.ref as React.RefObject<HTMLDivElement>}
      className={`min-h-screen pb-20 sm:pb-8 ${className}`}
    >
      {/* Mobile-specific header padding */}
      <div className="pt-safe-top">
        {children}
      </div>
      
      {/* Bottom safe area for mobile devices */}
      <div className="h-safe-bottom" />
    </div>
  )
})

MobileGameContainer.displayName = 'MobileGameContainer'

// Touch-optimized button component
interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  onLongPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  haptic?: boolean
  className?: string
}

export const TouchButton = memo<TouchButtonProps>(({
  children,
  onClick,
  onLongPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  haptic = true,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleHaptic = () => {
    if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10) // Subtle haptic feedback
    }
  }

  const touchGestures = useTouchGestures({
    onTap: () => {
      if (!disabled) {
        handleHaptic()
        onClick?.()
      }
    },
    onLongPress: () => {
      if (!disabled && onLongPress) {
        handleHaptic()
        onLongPress()
      }
    },
    longPressDelay: 500
  })

  const variants = {
    primary: 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white',
    secondary: 'bg-gaming-card border border-accent-primary text-accent-primary',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
  }

  const sizes = {
    sm: 'py-2 px-4 text-sm min-h-[44px]',
    md: 'py-3 px-6 text-base min-h-[48px]',
    lg: 'py-4 px-8 text-lg min-h-[52px]',
    xl: 'py-5 px-10 text-xl min-h-[56px]'
  }

  return (
    <button
      ref={touchGestures.ref as React.RefObject<HTMLButtonElement>}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        font-semibold rounded-lg transition-all duration-200 select-none
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'active:scale-95 hover:shadow-neon'
        }
        ${isPressed ? 'scale-95' : ''}
        ${touchGestures.isLongPressing ? 'ring-2 ring-accent-primary' : ''}
        ${className}
      `}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      disabled={disabled}
    >
      {children}
    </button>
  )
})

TouchButton.displayName = 'TouchButton'

// Swipeable skin selector for mobile
interface SwipeableSkinSelectorProps {
  skins: Array<{
    name: string
    value: number
    condition: string
    image?: string
    selected?: boolean
  }>
  onSelect: (skinName: string) => void
  maxVisible?: number
  className?: string
}

export const SwipeableSkinSelector = memo<SwipeableSkinSelectorProps>(({
  skins,
  onSelect,
  maxVisible = 3,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (currentIndex < skins.length - maxVisible) {
        setIsAnimating(true)
        setCurrentIndex(prev => prev + 1)
        setTimeout(() => setIsAnimating(false), 300)
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        setIsAnimating(true)
        setCurrentIndex(prev => prev - 1)
        setTimeout(() => setIsAnimating(false), 300)
      }
    },
    swipeThreshold: 30,
    preventScroll: true
  })

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Factory New': return 'text-blue-400'
      case 'Minimal Wear': return 'text-green-400'
      case 'Field-Tested': return 'text-yellow-400'
      case 'Well-Worn': return 'text-orange-400'
      case 'Battle-Scarred': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const visibleSkins = skins.slice(currentIndex, currentIndex + maxVisible)

  return (
    <div className={`${className}`}>
      {/* Navigation indicators */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
          className={`p-2 rounded-lg ${
            currentIndex > 0 
              ? 'text-accent-primary hover:bg-gaming-hover' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <div className="text-sm text-gray-400">
          {Math.min(currentIndex + maxVisible, skins.length)} of {skins.length} skins
        </div>
        
        <button
          onClick={() => currentIndex < skins.length - maxVisible && setCurrentIndex(prev => prev + 1)}
          className={`p-2 rounded-lg ${
            currentIndex < skins.length - maxVisible
              ? 'text-accent-primary hover:bg-gaming-hover' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          disabled={currentIndex >= skins.length - maxVisible}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Swipeable skin container */}
      <div 
        ref={touchGestures.ref as React.RefObject<HTMLDivElement>}
        className="overflow-hidden"
      >
        <div 
          className={`flex transition-transform duration-300 ${isAnimating ? 'ease-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * (100 / maxVisible)}%)` }}
        >
          {skins.map((skin, index) => (
            <div 
              key={`${skin.name}-${index}`}
              className={`flex-none w-full px-1`}
              style={{ width: `${100 / maxVisible}%` }}
            >
              <TouchButton
                onClick={() => onSelect(skin.name)}
                variant={skin.selected ? 'primary' : 'secondary'}
                className="w-full h-auto py-3"
                size="sm"
              >
                <div className="text-left">
                  <div className="font-semibold text-sm truncate">{skin.name}</div>
                  <div className={`text-xs ${getConditionColor(skin.condition)}`}>
                    {skin.condition}
                  </div>
                  <div className="text-accent-success font-semibold text-sm">
                    ${skin.value.toFixed(2)}
                  </div>
                </div>
              </TouchButton>
            </div>
          ))}
        </div>
      </div>

      {/* Page dots indicator */}
      <div className="flex justify-center mt-3 space-x-1">
        {Array.from({ length: Math.ceil(skins.length / maxVisible) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * maxVisible)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / maxVisible) === index
                ? 'bg-accent-primary'
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
})

SwipeableSkinSelector.displayName = 'SwipeableSkinSelector'

// Mobile-optimized numeric input with touch controls
interface TouchNumericInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  prefix?: string
  suffix?: string
  disabled?: boolean
}

export const TouchNumericInput = memo<TouchNumericInputProps>(({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  prefix,
  suffix,
  disabled = false
}) => {
  const increment = () => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="flex items-center bg-gaming-card border border-gaming-border rounded-lg overflow-hidden">
        <TouchButton
          onClick={decrement}
          disabled={disabled || value <= min}
          variant="secondary"
          size="sm"
          className="rounded-none border-0 bg-transparent min-h-[48px]"
        >
          <ChevronDownIcon className="w-5 h-5" />
        </TouchButton>
        
        <div className="flex-1 text-center py-3 px-4 text-white font-semibold">
          {prefix}{value.toFixed(2)}{suffix}
        </div>
        
        <TouchButton
          onClick={increment}
          disabled={disabled || value >= max}
          variant="secondary"
          size="sm"
          className="rounded-none border-0 bg-transparent min-h-[48px]"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </TouchButton>
      </div>
    </div>
  )
})

TouchNumericInput.displayName = 'TouchNumericInput'

// Mobile game controls panel
interface MobileGameControlsProps {
  children: React.ReactNode
  className?: string
  position?: 'bottom' | 'top'
  collapsible?: boolean
}

export const MobileGameControls = memo<MobileGameControlsProps>(({
  children,
  className = '',
  position = 'bottom',
  collapsible = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const positionClasses = {
    bottom: 'fixed bottom-0 left-0 right-0 pb-safe-bottom',
    top: 'sticky top-16 z-40'
  }

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div className={`bg-gaming-darker/95 backdrop-blur-md border-t border-gaming-border 
        ${position === 'bottom' ? 'border-t' : 'border-b'} 
        transition-transform duration-300 ${isCollapsed ? 'transform translate-y-full' : ''}`}>
        
        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-2 flex justify-center"
          >
            <div className="w-12 h-1 bg-gray-600 rounded-full" />
          </button>
        )}
        
        <div className="p-4 max-w-lg mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
})

MobileGameControls.displayName = 'MobileGameControls'

// Mobile-optimized modal
interface MobileModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
}

export const MobileModal = memo<MobileModalProps>(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    fullscreen: 'w-full h-full max-w-none max-h-none rounded-none'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`
          relative bg-gaming-card border border-gaming-border rounded-lg shadow-xl
          w-full ${sizeClasses[size]} ${size === 'fullscreen' ? 'h-full' : 'max-h-[90vh]'}
          overflow-y-auto
        `}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gaming-border">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <TouchButton
                onClick={onClose}
                variant="secondary"
                size="sm"
                className="p-2 min-h-[36px]"
              >
                ✕
              </TouchButton>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
})

MobileModal.displayName = 'MobileModal' 