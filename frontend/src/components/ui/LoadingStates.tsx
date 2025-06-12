'use client'

import React, { memo } from 'react'

// Skeleton Loading Components
export const SkeletonCard = memo(() => (
  <div className="gaming-card p-6 animate-pulse">
    <div className="h-4 bg-gaming-darker rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gaming-darker rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gaming-darker rounded w-2/3"></div>
  </div>
))

export const SkeletonText = memo(({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i}
        className={`h-3 bg-gaming-darker rounded ${
          i === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      />
    ))}
  </div>
))

export const SkeletonButton = memo(() => (
  <div className="h-10 bg-gaming-darker rounded-lg animate-pulse w-32"></div>
))

export const SkeletonAvatar = memo(() => (
  <div className="w-12 h-12 bg-gaming-darker rounded-full animate-pulse"></div>
))

// Game-specific skeleton loaders
export const SkeletonGameTile = memo(() => (
  <div className="gaming-card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gaming-darker rounded"></div>
      <div className="h-6 w-16 bg-gaming-darker rounded-full"></div>
    </div>
    <div className="h-6 bg-gaming-darker rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gaming-darker rounded w-full mb-6"></div>
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="h-3 bg-gaming-darker rounded w-20 mb-1"></div>
        <div className="h-4 bg-gaming-darker rounded w-16"></div>
      </div>
      <div>
        <div className="h-3 bg-gaming-darker rounded w-16 mb-1"></div>
        <div className="h-4 bg-gaming-darker rounded w-20"></div>
      </div>
    </div>
    <div className="border-t border-gray-700 pt-3">
      <div className="h-3 bg-gaming-darker rounded w-24 mb-1"></div>
      <div className="flex gap-1">
        <div className="h-5 bg-gaming-darker rounded w-20"></div>
        <div className="h-5 bg-gaming-darker rounded w-16"></div>
      </div>
    </div>
  </div>
))

export const SkeletonInventoryGrid = memo(({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 border-2 border-gaming-border rounded-lg animate-pulse">
        <div className="h-4 bg-gaming-darker rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gaming-darker rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gaming-darker rounded w-1/3"></div>
      </div>
    ))}
  </div>
))

export const SkeletonLeaderboard = memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="p-6 bg-gaming-hover rounded-lg border border-gaming-border animate-pulse">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4 flex items-center space-x-4">
            <div className="w-8 h-8 bg-gaming-darker rounded"></div>
            <div className="w-12 h-12 bg-gaming-darker rounded-full"></div>
            <div>
              <div className="h-4 bg-gaming-darker rounded w-24 mb-2"></div>
              <div className="h-3 bg-gaming-darker rounded w-16"></div>
            </div>
          </div>
          <div className="col-span-8 grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="text-center">
                <div className="h-3 bg-gaming-darker rounded w-16 mx-auto mb-1"></div>
                <div className="h-4 bg-gaming-darker rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
))

// Loading Spinners
export const Spinner = memo(({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-accent-primary border-t-transparent ${sizeClasses[size]} ${className}`} />
  )
})

export const LoadingButton = memo(({ children, isLoading = false, className = '', ...props }: {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
  [key: string]: any
}) => (
  <button 
    className={`gaming-button flex items-center justify-center ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
    disabled={isLoading}
    {...props}
  >
    {isLoading && <Spinner size="sm" className="mr-2" />}
    {children}
  </button>
))

// Progress Indicators
export const ProgressBar = memo(({ 
  progress, 
  className = '', 
  showPercentage = true,
  color = 'accent-primary',
  animated = true 
}: {
  progress: number
  className?: string
  showPercentage?: boolean
  color?: string
  animated?: boolean
}) => (
  <div className={className}>
    {showPercentage && (
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">Progress</span>
        <span className="text-white">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-gaming-dark rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${animated ? 'ease-out' : ''} bg-${color}`}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  </div>
))

// Loading States for specific pages
export const LoadingPage = memo(() => (
  <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-8 bg-gaming-darker rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gaming-darker rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  </div>
))

export const LoadingOverlay = memo(({ message = 'Loading...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="gaming-card p-8 text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <div className="text-white font-semibold">{message}</div>
    </div>
  </div>
))

// Optimized list components
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 60,
  containerHeight = 400,
  className = ''
}: {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  itemHeight?: number
  containerHeight?: number
  className?: string
}) => {
  const [scrollTop, setScrollTop] = React.useState(0)
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )
  
  const visibleItems = items.slice(startIndex, endIndex)
  
  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  )
})

export default {
  SkeletonCard,
  SkeletonText,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonGameTile,
  SkeletonInventoryGrid,
  SkeletonLeaderboard,
  Spinner,
  LoadingButton,
  ProgressBar,
  LoadingPage,
  LoadingOverlay,
  VirtualizedList
} 