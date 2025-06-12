'use client'

import React, { useState, memo, useCallback } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  onLoadingComplete?: () => void
  onError?: () => void
}

const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoadingComplete,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    onLoadingComplete?.()
  }, [onLoadingComplete])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  if (hasError) {
    return (
      <div 
        className={`bg-gaming-darker flex items-center justify-center text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gaming-darker animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoadingComplete}
        onError={handleError}
        style={{
          objectFit: 'cover',
        }}
      />
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// Skin image component with CS2 skin specific optimizations
export const SkinImage = memo<{
  skinName: string
  rarity?: string
  className?: string
  priority?: boolean
}>(({ skinName, rarity = 'Mil-Spec', className = '', priority = false }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Covert': return 'border-red-500'
      case 'Classified': return 'border-pink-500'
      case 'Restricted': return 'border-purple-500'
      case 'Mil-Spec': return 'border-blue-500'
      default: return 'border-gray-500'
    }
  }

  // Generate placeholder skin image URL based on name
  const skinImageUrl = `/images/skins/${skinName.toLowerCase().replace(/\s+/g, '-')}.webp`
  const fallbackImageUrl = `/images/skins/default-${rarity.toLowerCase()}.webp`

  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={skinImageUrl}
        alt={skinName}
        width={120}
        height={80}
        className={`rounded border-2 ${getRarityColor(rarity)} gaming-card`}
        priority={priority}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => {
          // Fallback to rarity-based default image if skin image fails
          console.warn(`Failed to load skin image: ${skinImageUrl}`)
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded" />
      <div className="absolute bottom-1 left-1 right-1">
        <div className="text-xs text-white font-semibold truncate">
          {skinName}
        </div>
      </div>
    </div>
  )
})

SkinImage.displayName = 'SkinImage'

// Avatar component with user avatar optimizations
export const UserAvatar = memo<{
  src?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}>(({ src, fallback, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  if (!src) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-gaming-card rounded-full flex items-center justify-center text-2xl ${className}`}
      >
        {fallback}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt="User avatar"
      width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      className={`${sizeClasses[size]} rounded-full ${className}`}
      quality={90}
    />
  )
})

UserAvatar.displayName = 'UserAvatar'

export default OptimizedImage 