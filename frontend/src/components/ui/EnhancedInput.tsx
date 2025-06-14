'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface EnhancedInputProps {
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  error?: string
  success?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  className?: string
  variant?: 'default' | 'gaming' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  suffix?: React.ReactNode
  floatingLabel?: boolean
  showPasswordToggle?: boolean
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: string) => string | null
  }
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  className = '',
  variant = 'default',
  size = 'md',
  icon,
  suffix,
  floatingLabel = true,
  showPasswordToggle = true,
  validation
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = value !== undefined ? value : internalValue
  const hasValue = currentValue.length > 0
  const isPasswordType = type === 'password'
  const actualType = isPasswordType && showPassword ? 'text' : type

  // Validation logic
  const validateInput = (val: string) => {
    if (!validation) return null

    if (validation.required && !val.trim()) {
      return 'This field is required'
    }

    if (validation.minLength && val.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return 'Invalid format'
    }

    if (validation.custom) {
      return validation.custom(val)
    }

    return null
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    if (value === undefined) {
      setInternalValue(newValue)
    }
    
    onChange?.(newValue)

    // Validate on change
    if (validation) {
      const error = validateInput(newValue)
      setValidationError(error)
    }
  }

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()

    // Validate on blur
    if (validation) {
      const error = validateInput(currentValue)
      setValidationError(error)
    }
  }

  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = 'w-full transition-all duration-300 rounded-xl border backdrop-blur-sm'
    
    switch (variant) {
      case 'gaming':
        return `${baseStyles} bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-orange-500/50 focus:bg-gray-900/70`
      case 'premium':
        return `${baseStyles} bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 text-white placeholder-yellow-200/50 focus:border-yellow-400/60 focus:shadow-lg focus:shadow-yellow-500/10`
      default:
        return `${baseStyles} bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/70`
    }
  }

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-4 py-4 text-lg'
      default:
        return 'px-4 py-3 text-base'
    }
  }

  // Get error/success styles
  const getStateStyles = () => {
    if (error || validationError) {
      return 'border-red-500/50 focus:border-red-500/70 bg-red-900/10'
    }
    if (success) {
      return 'border-green-500/50 focus:border-green-500/70 bg-green-900/10'
    }
    return ''
  }

  // Label animation variants
  const labelVariants = {
    default: {
      top: size === 'lg' ? '1rem' : size === 'sm' ? '0.5rem' : '0.75rem',
      fontSize: size === 'lg' ? '1.125rem' : size === 'sm' ? '0.875rem' : '1rem',
      color: '#9CA3AF',
      transition: { duration: 0.2 }
    },
    focused: {
      top: '-0.5rem',
      fontSize: '0.75rem',
      color: variant === 'gaming' ? '#F97316' : variant === 'premium' ? '#F59E0B' : '#3B82F6',
      transition: { duration: 0.2 }
    }
  }

  const shouldFloatLabel = floatingLabel && (isFocused || hasValue)

  return (
    <div className={`relative ${className}`}>
      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={actualType}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          placeholder={floatingLabel ? '' : placeholder}
          className={`
            ${getVariantStyles()}
            ${getSizeStyles()}
            ${getStateStyles()}
            ${icon ? 'pl-10' : ''}
            ${(isPasswordType && showPasswordToggle) || suffix ? 'pr-10' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            ${variant === 'gaming' ? 'focus:ring-orange-500' : variant === 'premium' ? 'focus:ring-yellow-500' : 'focus:ring-blue-500'}
          `}
        />

        {/* Floating label */}
        {floatingLabel && label && (
          <motion.label
            className="absolute left-4 pointer-events-none bg-gray-900 px-1 rounded"
            variants={labelVariants}
            animate={shouldFloatLabel ? 'focused' : 'default'}
            onClick={() => inputRef.current?.focus()}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </motion.label>
        )}

        {/* Static label */}
        {!floatingLabel && label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Password toggle */}
        {isPasswordType && showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Suffix */}
        {suffix && !isPasswordType && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {suffix}
          </div>
        )}

        {/* Focus ring animation */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className={`absolute inset-0 rounded-xl border-2 pointer-events-none ${
                variant === 'gaming' ? 'border-orange-500/30' : 
                variant === 'premium' ? 'border-yellow-500/30' : 
                'border-blue-500/30'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Error/Success message */}
      <AnimatePresence>
        {(error || validationError || success) && (
          <motion.div
            className="flex items-center mt-2 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(error || validationError) && (
              <>
                <ExclamationCircleIcon className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-red-400">{error || validationError}</span>
              </>
            )}
            {success && !error && !validationError && (
              <>
                <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-green-400">{success}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character count */}
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${
            currentValue.length > maxLength * 0.8 ? 'text-yellow-400' : 'text-gray-500'
          }`}>
            {currentValue.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

// Preset input variants
export const GamingInput: React.FC<Omit<EnhancedInputProps, 'variant'>> = (props) => (
  <EnhancedInput {...props} variant="gaming" />
)

export const PremiumInput: React.FC<Omit<EnhancedInputProps, 'variant'>> = (props) => (
  <EnhancedInput {...props} variant="premium" />
) 