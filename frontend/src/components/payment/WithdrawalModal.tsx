'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowDownIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { EnhancedCard } from '../ui/EnhancedCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import { usePayment } from '@/contexts/PaymentContext'
import { useMobile } from '@/hooks/useMobile'
import { useTheme } from '@/contexts/ThemeContext'

interface SkinItem {
  name: string
  condition: string
  value: number
  assetId: string
  image?: string
  rarity?: string
  float?: number
}

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  presetAmount?: number
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, presetAmount }) => {
  const { balance, initiateWithdrawal, getAvailableSkinsForWithdrawal, loading } = usePayment()
  const { hapticFeedback, isMobile } = useMobile()
  const { isDark } = useTheme()
  
  const [amount, setAmount] = useState(presetAmount || 0)
  const [tradeUrl, setTradeUrl] = useState('')
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success' | 'error'>('amount')
  const [error, setError] = useState<string | null>(null)
  const [withdrawalResult, setWithdrawalResult] = useState<any>(null)
  const [availableSkins, setAvailableSkins] = useState<SkinItem[]>([])
  const [loadingSkins, setLoadingSkins] = useState(false)

  // Quick amount buttons
  const quickAmounts = [50, 100, 250, 500, 1000]

  useEffect(() => {
    if (presetAmount) {
      setAmount(presetAmount)
    }
  }, [presetAmount])

  const loadAvailableSkins = async (withdrawAmount: number) => {
    if (withdrawAmount <= 0) return

    try {
      setLoadingSkins(true)
      const skins = await getAvailableSkinsForWithdrawal(withdrawAmount)
      setAvailableSkins(skins)
    } catch (err) {
      console.error('Failed to load available skins:', err)
      setError('Failed to load available skins')
    } finally {
      setLoadingSkins(false)
    }
  }

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount)
    if (newAmount > 0) {
      loadAvailableSkins(newAmount)
    } else {
      setAvailableSkins([])
    }
  }

  const handleQuickAmount = (quickAmount: number) => {
    hapticFeedback('light')
    const finalAmount = Math.min(quickAmount, balance)
    handleAmountChange(finalAmount)
  }

  const handleMaxAmount = () => {
    hapticFeedback('light')
    handleAmountChange(balance)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Covert': return 'text-red-400'
      case 'Classified': return 'text-pink-400'
      case 'Restricted': return 'text-purple-400'
      case 'Mil-Spec': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const handleContinue = () => {
    if (amount <= 0) {
      setError('Please enter a valid withdrawal amount')
      hapticFeedback('error')
      return
    }

    if (amount > balance) {
      setError('Insufficient balance')
      hapticFeedback('error')
      return
    }

    if (amount < 10) {
      setError('Minimum withdrawal amount is $10.00')
      hapticFeedback('error')
      return
    }

    setStep('confirm')
    setError(null)
  }

  const handleConfirm = async () => {
    if (!tradeUrl) {
      setError('Please enter your Steam Trade URL')
      hapticFeedback('error')
      return
    }

    // Validate trade URL format
    const tradeUrlPattern = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/
    if (!tradeUrlPattern.test(tradeUrl)) {
      setError('Invalid trade URL format')
      hapticFeedback('error')
      return
    }

    setStep('processing')
    setError(null)

    try {
      const result = await initiateWithdrawal(amount, tradeUrl)
      setWithdrawalResult(result)
      setStep('success')
    } catch (err: any) {
      setError(err.message)
      setStep('error')
    }
  }

  const handleClose = () => {
    hapticFeedback('light')
    onClose()
    
    // Reset state after animation
    setTimeout(() => {
      setStep('amount')
      setAmount(presetAmount || 0)
      setTradeUrl('')
      setError(null)
      setWithdrawalResult(null)
      setAvailableSkins([])
    }, 300)
  }

  const renderSkinCard = (skin: SkinItem) => (
    <motion.div
      key={skin.assetId}
      className="relative"
      whileHover={{ scale: 1.02 }}
    >
      <EnhancedCard className={`
        p-4 h-full
        ${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}
      `}>
        {/* Skin Image */}
        <div className="relative mb-3">
          <div className={`
            w-full h-20 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900
            flex items-center justify-center mb-2
            ${isDark ? '' : 'border border-gray-200'}
          `}>
            <span className="text-gray-400 text-xs">Skin Image</span>
          </div>
          
          {/* Float badge */}
          <div className={`
            absolute top-1 right-1 px-2 py-1 rounded text-xs font-medium
            ${isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-700'}
          `}>
            {skin.float?.toFixed(3)}
          </div>
        </div>

        {/* Skin Details */}
        <div className="space-y-2">
          <h4 className={`
            font-semibold text-sm leading-tight
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            {skin.name}
          </h4>
          
          <div className="flex items-center justify-between text-xs">
            <span className={`
              ${isDark ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {skin.condition}
            </span>
            <span className={getRarityColor(skin.rarity || '')}>
              {skin.rarity}
            </span>
          </div>

          <div className="text-center">
            <span className="text-lg font-bold text-green-400">
              ${skin.value.toFixed(2)}
            </span>
          </div>
        </div>
      </EnhancedCard>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`
              w-full max-w-4xl max-h-[90vh] overflow-hidden
              ${isDark ? 'bg-gray-900' : 'bg-white'}
              rounded-2xl shadow-2xl
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`
              flex items-center justify-between p-6 border-b
              ${isDark ? 'border-gray-800' : 'border-gray-200'}
            `}>
              <div className="flex items-center space-x-3">
                <ArrowDownIcon className="w-6 h-6 text-orange-500" />
                <h2 className={`
                  text-xl font-bold
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}>
                  Withdraw Funds
                </h2>
              </div>
              
              <button
                onClick={handleClose}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
                `}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {step === 'amount' && (
                <div className="space-y-6">
                  {/* Balance Display */}
                  <EnhancedCard className="p-4 text-center">
                    <div className={`
                      text-sm mb-2
                      ${isDark ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      Available Balance
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                      ${balance.toFixed(2)}
                    </div>
                  </EnhancedCard>

                  {/* Amount Input */}
                  <div>
                    <label className={`
                      block text-sm font-medium mb-2
                      ${isDark ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="10"
                        max={balance}
                        step="0.01"
                        value={amount || ''}
                        onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-lg border text-lg
                          ${isDark 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }
                          focus:ring-2 focus:ring-orange-500 focus:border-transparent
                        `}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`
                        text-xs
                        ${isDark ? 'text-gray-500' : 'text-gray-600'}
                      `}>
                        Minimum withdrawal: $10.00
                      </p>
                      <button
                        onClick={handleMaxAmount}
                        className="text-xs text-orange-500 hover:text-orange-400 font-medium"
                      >
                        Max: ${balance.toFixed(2)}
                      </button>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className={`
                      block text-sm font-medium mb-2
                      ${isDark ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Quick Select
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {quickAmounts.map(quickAmount => (
                        <button
                          key={quickAmount}
                          onClick={() => handleQuickAmount(quickAmount)}
                          disabled={quickAmount > balance}
                          className={`
                            py-2 px-3 rounded-lg font-medium transition-colors text-sm
                            ${quickAmount <= balance
                              ? isDark 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                              : 'bg-gray-600 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          ${quickAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Skins Preview */}
                  {amount > 0 && (
                    <div>
                      <h3 className={`
                        text-lg font-semibold mb-4
                        ${isDark ? 'text-white' : 'text-gray-900'}
                      `}>
                        Available Skins (${amount.toFixed(2)})
                      </h3>
                      
                      {loadingSkins ? (
                        <div className="text-center py-8">
                          <LoadingSpinner />
                          <p className={`
                            text-sm mt-2
                            ${isDark ? 'text-gray-400' : 'text-gray-600'}
                          `}>
                            Loading available skins...
                          </p>
                        </div>
                      ) : availableSkins.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableSkins.slice(0, 8).map(renderSkinCard)}
                          {availableSkins.length > 8 && (
                            <div className={`
                              flex items-center justify-center p-4 rounded-lg border border-dashed
                              ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}
                            `}>
                              <div className="text-center">
                                <div className="text-lg font-semibold">+{availableSkins.length - 8}</div>
                                <div className="text-xs">more skins</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`
                          text-center py-8
                          ${isDark ? 'text-gray-400' : 'text-gray-600'}
                        `}>
                          <p>No skins available for this amount</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleClose}
                      className={`
                        flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                        ${isDark 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleContinue}
                      disabled={amount <= 0 || amount > balance || loading}
                      className={`
                        flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                        ${amount > 0 && amount <= balance && !loading
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-400 text-gray-300 cursor-not-allowed'
                        }
                      `}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  {/* Withdrawal Summary */}
                  <EnhancedCard className="p-6">
                    <h3 className={`
                      text-lg font-semibold mb-4
                      ${isDark ? 'text-white' : 'text-gray-900'}
                    `}>
                      Withdrawal Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Amount:
                        </span>
                        <span className="text-2xl font-bold text-orange-400">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Processing Fee:
                        </span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          $0.00
                        </span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            You'll receive:
                          </span>
                          <span className="text-xl font-bold text-green-400">
                            ${amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </EnhancedCard>

                  {/* Trade URL Input */}
                  <div>
                    <label className={`
                      block text-sm font-medium mb-2
                      ${isDark ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Steam Trade URL *
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={tradeUrl}
                        onChange={(e) => setTradeUrl(e.target.value)}
                        placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-lg border
                          ${isDark 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }
                          focus:ring-2 focus:ring-orange-500 focus:border-transparent
                        `}
                      />
                    </div>
                    <p className={`
                      text-xs mt-1
                      ${isDark ? 'text-gray-500' : 'text-gray-600'}
                    `}>
                      Get your trade URL from Steam > Inventory > Trade Offers > Create Trade URL
                    </p>
                  </div>

                  {/* Skins to Receive */}
                  {availableSkins.length > 0 && (
                    <div>
                      <h3 className={`
                        text-lg font-semibold mb-4
                        ${isDark ? 'text-white' : 'text-gray-900'}
                      `}>
                        Skins You'll Receive
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableSkins.map(renderSkinCard)}
                      </div>
                      
                      <div className="mt-4 text-center">
                        <span className={`
                          text-sm
                          ${isDark ? 'text-gray-400' : 'text-gray-600'}
                        `}>
                          Total Value: 
                        </span>
                        <span className="text-lg font-bold text-green-400 ml-2">
                          ${availableSkins.reduce((sum, skin) => sum + skin.value, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep('amount')}
                      className={`
                        flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                        ${isDark 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!tradeUrl || loading}
                      className={`
                        flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                        ${tradeUrl && !loading
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-400 text-gray-300 cursor-not-allowed'
                        }
                      `}
                    >
                      {loading ? 'Processing...' : `Withdraw $${amount.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" />
                  <h3 className={`
                    text-xl font-semibold mt-4 mb-2
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Processing Withdrawal
                  </h3>
                  <p className={`
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    Debiting your balance and preparing skins for trade...
                  </p>
                </div>
              )}

              {step === 'success' && withdrawalResult && (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className={`
                    text-xl font-semibold mb-2
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Withdrawal Initiated Successfully!
                  </h3>
                  <p className={`
                    mb-6
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {withdrawalResult.message}
                  </p>
                  
                  <EnhancedCard className="p-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Transaction ID:
                        </span>
                        <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {withdrawalResult.transactionId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Amount:
                        </span>
                        <span className="text-green-400 font-bold">
                          ${withdrawalResult.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Estimated Delivery:
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(withdrawalResult.estimatedDelivery).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </EnhancedCard>

                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <ClockIcon className="w-5 h-5 text-orange-400" />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Trade offer will be sent within 5 minutes
                    </span>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className={`
                    text-xl font-semibold mb-2
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Withdrawal Failed
                  </h3>
                  <p className={`
                    mb-6
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {error}
                  </p>
                  
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => setStep('amount')}
                      className={`
                        px-6 py-3 rounded-lg font-medium transition-colors
                        ${isDark 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WithdrawalModal 