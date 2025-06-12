'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface TouchGestureConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  swipeThreshold?: number
  pinchThreshold?: number
  longPressDelay?: number
  preventScroll?: boolean
}

export interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

export const useTouchGestures = (config: TouchGestureConfig) => {
  const elementRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<TouchPoint | null>(null)
  const lastTouchRef = useRef<TouchPoint | null>(null)
  const touchesRef = useRef<Touch[]>([])
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [isPinching, setIsPinching] = useState(false)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    longPressDelay = 500,
    preventScroll = false
  } = config

  // Calculate distance between two points
  const getDistance = useCallback((touch1: TouchPoint, touch2: TouchPoint) => {
    const dx = touch1.x - touch2.x
    const dy = touch1.y - touch2.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Calculate distance between two touch points for pinch gestures
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    const touches = Array.from(e.touches)
    touchesRef.current = touches

    if (touches.length === 1) {
      const touch = touches[0]
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }
      
      touchStartRef.current = touchPoint
      lastTouchRef.current = touchPoint

      // Start long press timer
      if (config.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          setIsLongPressing(true)
          config.onLongPress?.()
        }, longPressDelay)
      }

      // Handle tap counting for double tap
      if (config.onDoubleTap) {
        tapCountRef.current++
        
        if (tapCountRef.current === 1) {
          tapTimerRef.current = setTimeout(() => {
            if (tapCountRef.current === 1 && config.onTap) {
              config.onTap()
            }
            tapCountRef.current = 0
          }, 300)
        } else if (tapCountRef.current === 2) {
          if (tapTimerRef.current) {
            clearTimeout(tapTimerRef.current)
          }
          config.onDoubleTap()
          tapCountRef.current = 0
        }
      }
    } else if (touches.length === 2 && config.onPinch) {
      setIsPinching(true)
      // Clear long press timer for multi-touch
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [config, preventScroll, longPressDelay])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    const touches = Array.from(e.touches)

    if (touches.length === 1 && touchStartRef.current) {
      const touch = touches[0]
      const currentPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }

      // Clear long press timer if finger moves
      if (longPressTimerRef.current) {
        const distance = getDistance(touchStartRef.current, currentPoint)
        if (distance > 10) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
          setIsLongPressing(false)
        }
      }

      lastTouchRef.current = currentPoint
    } else if (touches.length === 2 && isPinching && config.onPinch) {
      const currentDistance = getTouchDistance(touches[0], touches[1])
      const initialDistance = touchesRef.current.length === 2 
        ? getTouchDistance(touchesRef.current[0], touchesRef.current[1])
        : currentDistance

      if (initialDistance > 0) {
        const scale = currentDistance / initialDistance
        if (Math.abs(scale - 1) > pinchThreshold) {
          config.onPinch(scale)
        }
      }
    }
  }, [config, preventScroll, isPinching, getDistance, getTouchDistance, pinchThreshold])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    // Clear timers
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (touchStartRef.current && lastTouchRef.current && !isLongPressing) {
      const startPoint = touchStartRef.current
      const endPoint = lastTouchRef.current
      
      const deltaX = endPoint.x - startPoint.x
      const deltaY = endPoint.y - startPoint.y
      const distance = getDistance(startPoint, endPoint)
      const timeDiff = endPoint.timestamp - startPoint.timestamp

      // Detect swipe gestures (must be fast and long enough)
      if (distance > swipeThreshold && timeDiff < 500) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && config.onSwipeRight) {
            config.onSwipeRight()
          } else if (deltaX < 0 && config.onSwipeLeft) {
            config.onSwipeLeft()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && config.onSwipeDown) {
            config.onSwipeDown()
          } else if (deltaY < 0 && config.onSwipeUp) {
            config.onSwipeUp()
          }
        }
      }
    }

    // Reset states
    setIsLongPressing(false)
    setIsPinching(false)
    touchStartRef.current = null
    lastTouchRef.current = null
    touchesRef.current = []
  }, [config, preventScroll, isLongPressing, getDistance, swipeThreshold])

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      // Clear any pending timers
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  return {
    ref: elementRef,
    isLongPressing,
    isPinching
  }
}

// Hook for specific gaming gestures
export const useGameTouchGestures = () => {
  const [gestureState, setGestureState] = useState({
    isSpinning: false,
    currentVelocity: 0,
    lastSwipeDirection: null as 'left' | 'right' | 'up' | 'down' | null
  })

  const resetGestureState = useCallback(() => {
    setGestureState({
      isSpinning: false,
      currentVelocity: 0,
      lastSwipeDirection: null
    })
  }, [])

  const createSpinGesture = useCallback((onSpin: (velocity: number) => void) => {
    return useTouchGestures({
      onSwipeLeft: () => {
        setGestureState(prev => ({ 
          ...prev, 
          isSpinning: true, 
          currentVelocity: -1,
          lastSwipeDirection: 'left'
        }))
        onSpin(-1)
      },
      onSwipeRight: () => {
        setGestureState(prev => ({ 
          ...prev, 
          isSpinning: true, 
          currentVelocity: 1,
          lastSwipeDirection: 'right'
        }))
        onSpin(1)
      },
      swipeThreshold: 30,
      preventScroll: true
    })
  }, [])

  const createBetGesture = useCallback((
    onIncrease: () => void, 
    onDecrease: () => void,
    onPlace: () => void
  ) => {
    return useTouchGestures({
      onSwipeUp: onIncrease,
      onSwipeDown: onDecrease,
      onDoubleTap: onPlace,
      swipeThreshold: 40,
      preventScroll: true
    })
  }, [])

  return {
    gestureState,
    resetGestureState,
    createSpinGesture,
    createBetGesture
  }
} 