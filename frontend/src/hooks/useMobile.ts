'use client'

import { useState, useEffect, useCallback } from 'react'

interface MobileUtils {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  touchPoints: number
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void
  preventZoom: () => void
  optimizeTouch: (element: HTMLElement) => () => void
  screenSize: {
    width: number
    height: number
    isSmall: boolean
    isMedium: boolean
    isLarge: boolean
  }
}

export const useMobile = (): MobileUtils => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [touchPoints, setTouchPoints] = useState(0)
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
    isSmall: false,
    isMedium: false,
    isLarge: false
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Device detection
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isTabletDevice = /ipad|android(?!.*mobile)/.test(userAgent) || (width >= 768 && width <= 1024)
      
      setIsMobile(isMobileDevice && !isTabletDevice)
      setIsTablet(isTabletDevice)
      setOrientation(width > height ? 'landscape' : 'portrait')
      
      // Screen size categories
      setScreenSize({
        width,
        height,
        isSmall: width < 640,
        isMedium: width >= 640 && width < 1024,
        isLarge: width >= 1024
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!navigator.vibrate) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 10, 10],
      warning: [50, 10, 50],
      error: [100, 50, 100]
    }

    try {
      navigator.vibrate(patterns[type])
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }, [])

  const preventZoom = useCallback(() => {
    // Prevent pinch-to-zoom on mobile
    let lastTouchEnd = 0
    
    const preventZoomHandler = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    const preventPinchHandler = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchend', preventZoomHandler, { passive: false })
    document.addEventListener('touchstart', preventPinchHandler, { passive: false })

    return () => {
      document.removeEventListener('touchend', preventZoomHandler)
      document.removeEventListener('touchstart', preventPinchHandler)
    }
  }, [])

  const optimizeTouch = useCallback((element: HTMLElement) => {
    // Optimize touch interactions for gambling actions
    let touchStartTime = 0
    let touchStartPos = { x: 0, y: 0 }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now()
      setTouchPoints(e.touches.length)
      
      if (e.touches.length === 1) {
        touchStartPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      }

      // Add visual feedback
      element.classList.add('touch-active')
      hapticFeedback('light')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
        
        const distance = Math.sqrt(
          Math.pow(currentPos.x - touchStartPos.x, 2) + 
          Math.pow(currentPos.y - touchStartPos.y, 2)
        )

        // If moved too far, cancel the touch action
        if (distance > 20) {
          element.classList.remove('touch-active')
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime
      setTouchPoints(0)
      element.classList.remove('touch-active')

      // Detect different touch patterns
      if (touchDuration < 150) {
        // Quick tap - trigger haptic for fast actions
        hapticFeedback('light')
      } else if (touchDuration > 500) {
        // Long press - trigger stronger haptic
        hapticFeedback('medium')
      }
    }

    // Add touch optimization styles
    element.style.touchAction = 'manipulation'
    element.style.userSelect = 'none'
    ;(element.style as any).webkitUserSelect = 'none'
    ;(element.style as any).webkitTouchCallout = 'none'
    ;(element.style as any).webkitTapHighlightColor = 'transparent'

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.classList.remove('touch-active')
    }
  }, [hapticFeedback])

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    touchPoints,
    hapticFeedback,
    preventZoom,
    optimizeTouch,
    screenSize
  }
} 