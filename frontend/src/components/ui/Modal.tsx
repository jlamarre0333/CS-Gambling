'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import EnhancedButton from './EnhancedButton'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'gaming' | 'premium' | 'danger'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  footer?: React.ReactNode
  className?: string
  overlayClassName?: string
  contentClassName?: string
  preventScroll?: boolean
  centered?: boolean
  animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  preventScroll = true,
  centered = true,
  animation = 'scale'
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Handle body scroll
  useEffect(() => {
    if (!preventScroll) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, preventScroll])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'lg':
        return 'max-w-4xl'
      case 'xl':
        return 'max-w-6xl'
      case 'full':
        return 'max-w-[95vw] max-h-[95vh]'
      default:
        return 'max-w-2xl'
    }
  }

  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = 'relative bg-gradient-to-br backdrop-blur-sm border rounded-2xl shadow-2xl'
    
    switch (variant) {
      case 'gaming':
        return `${baseStyles} from-gray-900/95 to-gray-800/95 border-orange-500/30 shadow-orange-500/20`
      case 'premium':
        return `${baseStyles} from-yellow-900/20 to-orange-900/20 border-yellow-500/40 shadow-yellow-500/20`
      case 'danger':
        return `${baseStyles} from-red-900/20 to-red-800/20 border-red-500/40 shadow-red-500/20`
      default:
        return `${baseStyles} from-gray-900/95 to-gray-800/95 border-gray-600/30 shadow-gray-500/20`
    }
  }

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const getModalVariants = () => {
    const baseTransition = { type: "spring", stiffness: 300, damping: 30 }
    
    switch (animation) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: baseTransition },
          exit: { opacity: 0, transition: { duration: 0.2 } }
        }
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 100 },
          visible: { opacity: 1, y: 0, transition: baseTransition },
          exit: { opacity: 0, y: 100, transition: { duration: 0.2 } }
        }
      case 'slide-down':
        return {
          hidden: { opacity: 0, y: -100 },
          visible: { opacity: 1, y: 0, transition: baseTransition },
          exit: { opacity: 0, y: -100, transition: { duration: 0.2 } }
        }
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 100 },
          visible: { opacity: 1, x: 0, transition: baseTransition },
          exit: { opacity: 0, x: 100, transition: { duration: 0.2 } }
        }
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -100 },
          visible: { opacity: 1, x: 0, transition: baseTransition },
          exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
        }
      default: // scale
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1, transition: baseTransition },
          exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
        }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${overlayClassName}`}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
          />

          {/* Modal container */}
          <div className={`
            flex min-h-full items-center justify-center p-4
            ${centered ? 'items-center' : 'items-start pt-16'}
          `}>
            <motion.div
              ref={modalRef}
              className={`
                ${getVariantStyles()}
                ${getSizeStyles()}
                w-full
                ${className}
              `}
              variants={getModalVariants()}
              initial="hidden"
              animate="visible"
              exit="exit"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                  {title && (
                    <h2 
                      id="modal-title"
                      className={`text-xl font-semibold ${
                        variant === 'gaming' ? 'text-orange-400' :
                        variant === 'premium' ? 'text-yellow-400' :
                        variant === 'danger' ? 'text-red-400' :
                        'text-white'
                      }`}
                    >
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <EnhancedButton
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="ml-auto text-gray-400 hover:text-white"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </EnhancedButton>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={`p-6 ${contentClassName}`}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/50">
                  {footer}
                </div>
              )}

              {/* Glow effect for gaming variant */}
              {variant === 'gaming' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 pointer-events-none" />
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm()
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      footer={
        <div className="flex space-x-3">
          <EnhancedButton
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </EnhancedButton>
          <EnhancedButton
            variant={variant === 'danger' ? 'error' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </EnhancedButton>
        </div>
      }
    >
      <p className="text-gray-300">{message}</p>
    </Modal>
  )
}

// Hook for modal state management
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle
  }
} 