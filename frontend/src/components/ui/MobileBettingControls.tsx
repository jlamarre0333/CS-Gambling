'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MinusIcon, 
  PlusIcon, 
  CurrencyDollarIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useMobile } from '@/hooks/useMobile'
import { useTheme } from '@/contexts/ThemeContext'
// Import EnhancedButton would be added here if needed

interface MobileBettingControlsProps {
  balance: number
  betAmount: number
  onBetAmountChange: (amount: number) => void
  onPlaceBet: () => void
  minBet?: number
  maxBet?: number
  disabled?: boolean
  isLoading?: boolean
  quickBetAmounts?: number[]
  className?: string
}

export const MobileBettingControls: React.FC<MobileBettingControlsProps> = ({
  balance,
  betAmount,
  onBetAmountChange,
  onPlaceBet,
  minBet = 0.01,
  maxBet = 1000,
  disabled = false,
  isLoading = false,
  quickBetAmounts = [1, 5, 10, 25, 50, 100],
  className = ''
}) => {
  const { hapticFeedback, isMobile, screenSize, optimizeTouch } = useMobile()
  const { isDark } = useTheme()
  const [inputValue, setInputValue] = useState(betAmount.toString())
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const betButtonRef = useRef<HTMLButtonElement>(null)

  // Optimize touch interactions
  useEffect(() => {
    if (betButtonRef.current && isMobile) {
      const cleanup = optimizeTouch(betButtonRef.current)
      return cleanup
    }
  }, [isMobile, optimizeTouch])

  // Update input when betAmount changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(betAmount.toString())
    }
  }, [betAmount, isEditing])

  const handleBetAmountChange = (newAmount: number) => {
    const clampedAmount = Math.max(minBet, Math.min(maxBet, Math.min(balance, newAmount)))
    onBetAmountChange(clampedAmount)
    setInputValue(clampedAmount.toString())
    hapticFeedback('light')
  }

  const handleQuickBet = (amount: number) => {
    handleBetAmountChange(amount)
    hapticFeedback('medium')
  }

  const handleIncrease = () => {
    const increment = betAmount < 1 ? 0.1 : betAmount < 10 ? 1 : betAmount < 100 ? 10 : 100
    handleBetAmountChange(betAmount + increment)
  }

  const handleDecrease = () => {
    const decrement = betAmount <= 1 ? 0.1 : betAmount <= 10 ? 1 : betAmount <= 100 ? 10 : 100
    handleBetAmountChange(betAmount - decrement)
  }

  const handleMaxBet = () => {
    handleBetAmountChange(Math.min(balance, maxBet))
    hapticFeedback('heavy')
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    const value = parseFloat(inputValue) || minBet
    handleBetAmountChange(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handlePlaceBet = () => {
    hapticFeedback('success')
    onPlaceBet()
  }

  const isValidBet = betAmount >= minBet && betAmount <= maxBet && betAmount <= balance

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Balance Display */}
      <div className={`
        flex items-center justify-between p-4 rounded-2xl border
        ${isDark 
          ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
          : 'bg-white/50 border-gray-200/50 backdrop-blur-sm'
        }
      `}>
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isDark ? 'bg-green-500/20' : 'bg-green-500/10'}
          `}>
            <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Available Balance
            </p>
            <p className="text-lg font-bold text-green-500">
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Bet Amount Input */}
      <div className={`
        p-4 rounded-2xl border
        ${isDark 
          ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
          : 'bg-white/50 border-gray-200/50 backdrop-blur-sm'
        }
      `}>
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Bet Amount
        </p>
        
        <div className="flex items-center space-x-3">
          {/* Decrease Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDecrease}
            disabled={disabled || betAmount <= minBet}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all
              ${disabled || betAmount <= minBet
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
              }
              ${isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }
            `}
            style={{ 
              minHeight: isMobile ? '48px' : '40px',
              minWidth: isMobile ? '48px' : '40px'
            }}
          >
            <MinusIcon className="w-5 h-5" />
          </motion.button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <div className={`
              flex items-center border-2 rounded-xl transition-all
              ${isEditing 
                ? 'border-orange-500 ring-2 ring-orange-500/20'
                : isDark ? 'border-gray-600' : 'border-gray-300'
              }
              ${isDark ? 'bg-gray-700' : 'bg-white'}
            `}>
              <span className={`pl-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                $
              </span>
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                disabled={disabled}
                className={`
                  flex-1 px-2 py-3 text-lg font-bold text-center bg-transparent outline-none 
                  ${isDark ? 'text-white' : 'text-gray-900'}
                  ${isMobile ? 'text-xl' : 'text-lg'}
                `}
                style={{ 
                  minHeight: isMobile ? '48px' : '40px',
                  fontSize: isMobile ? '18px' : '16px'
                }}
              />
            </div>
          </div>

          {/* Increase Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleIncrease}
            disabled={disabled || betAmount >= Math.min(balance, maxBet)}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all
              ${disabled || betAmount >= Math.min(balance, maxBet)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
              }
              ${isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }
            `}
            style={{ 
              minHeight: isMobile ? '48px' : '40px',
              minWidth: isMobile ? '48px' : '40px'
            }}
          >
            <PlusIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Quick Bet Amounts */}
      <div className={`
        p-4 rounded-2xl border
        ${isDark 
          ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
          : 'bg-white/50 border-gray-200/50 backdrop-blur-sm'
        }
      `}>
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Quick Bets
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          {quickBetAmounts.map((amount) => (
            <motion.button
              key={amount}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickBet(amount)}
              disabled={disabled || amount > balance}
              className={`
                py-3 px-2 rounded-xl text-sm font-semibold transition-all
                ${disabled || amount > balance
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95'
                }
                ${betAmount === amount
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                }
              `}
              style={{ 
                minHeight: isMobile ? '44px' : '36px',
                fontSize: isMobile ? '14px' : '12px'
              }}
            >
              ${amount}
            </motion.button>
          ))}
        </div>

        {/* Max Bet Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleMaxBet}
          disabled={disabled || balance === 0}
          className={`
            w-full mt-3 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2
            ${disabled || balance === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-105 active:scale-95'
            }
            ${isDark
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
            }
          `}
          style={{ minHeight: isMobile ? '48px' : '40px' }}
        >
          <StarIcon className="w-4 h-4" />
          <span>Max Bet (${Math.min(balance, maxBet).toFixed(2)})</span>
        </motion.button>
      </div>

      {/* Place Bet Button */}
      <motion.button
        ref={betButtonRef}
        whileTap={{ scale: 0.98 }}
        onClick={handlePlaceBet}
        disabled={disabled || !isValidBet || isLoading}
        className={`
          w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-3
          ${disabled || !isValidBet || isLoading
            ? 'opacity-50 cursor-not-allowed bg-gray-600'
            : 'hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25'
          }
          text-white
        `}
        style={{ 
          minHeight: isMobile ? '56px' : '48px',
          fontSize: isMobile ? '18px' : '16px'
        }}
      >
        {isLoading ? (
          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <BoltIcon className="w-6 h-6" />
            <span>Place Bet - ${betAmount.toFixed(2)}</span>
          </>
        )}
      </motion.button>

      {/* Bet Validation Messages */}
      {!isValidBet && (
        <div className={`
          p-3 rounded-xl border text-sm
          ${isDark 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-600'
          }
        `}>
          {betAmount < minBet && `Minimum bet is $${minBet}`}
          {betAmount > maxBet && `Maximum bet is $${maxBet}`}
          {betAmount > balance && `Insufficient balance`}
        </div>
      )}
    </div>
  )
} 