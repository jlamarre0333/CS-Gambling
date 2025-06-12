'use client'

import React, { useState, useEffect, memo } from 'react'

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = memo(({
  from,
  to,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(from)

  useEffect(() => {
    const startTime = Date.now()
    const difference = to - from

    const updateCount = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease out cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentCount = from + (difference * easeOutCubic)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(to)
      }
    }

    updateCount()
  }, [from, to, duration])

  const formatNumber = (num: number) => {
    if (decimals === 0) {
      return Math.floor(num).toLocaleString()
    }
    return num.toFixed(decimals)
  }

  return (
    <span className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
})

export default AnimatedCounter 