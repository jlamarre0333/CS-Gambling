'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LinkIcon,
  ShieldCheckIcon
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

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedSkins?: SkinItem[]
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, preselectedSkins = [] }) => {
  const { initiateDeposit, getSkinPrices, loading } = usePayment()
  const { hapticFeedback, isMobile } = useMobile()
  const { isDark } = useTheme()
  
  const [selectedSkins, setSelectedSkins] = useState<SkinItem[]>(preselectedSkins)
  const [tradeUrl, setTradeUrl] = useState('')
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success' | 'error'>('select')
  const [error, setError] = useState<string | null>(null)
  const [depositResult, setDepositResult] = useState<any>(null)
  const [availableSkins, setAvailableSkins] = useState<SkinItem[]>([])
  const [loadingPrices, setLoadingPrices] = useState(false)

  // Mock available skins for demo
  useEffect(() => {
    if (isOpen) {
      setAvailableSkins([
        {
          name: 'AK-47 | Redline',
          condition: 'Field-Tested',
          value: 65.50,
          assetId: 'ak47_redline_ft_001',
          image: '/skins/ak47-redline.jpg',
          rarity: 'Classified',
          float: 0.23
        },
        {
          name: 'AWP | Asiimov',
          condition: 'Field-Tested',
          value: 85.00,
          assetId: 'awp_asiimov_ft_001',
          image: '/skins/awp-asiimov.jpg',
          rarity: 'Covert',
          float: 0.19
        },
        {
          name: 'Glock-18 | Fade',
          condition: 'Factory New',
          value: 280.00,
          assetId: 'glock_fade_fn_001',
          image: '/skins/glock-fade.jpg',
          rarity: 'Restricted',
          float: 0.03
        },
        {
          name: 'M4A1-S | Knight',
          condition: 'Factory New',
          value: 750.00,
          assetId: 'm4a1s_knight_fn_001',
          image: '/skins/m4a1s-knight.jpg',
          rarity: 'Covert',
          float: 0.01
        },
        {
          name: 'Karambit | Doppler',
          condition: 'Factory New',
          value: 850.00,
          assetId: 'karambit_doppler_fn_001',
          image: '/skins/karambit-doppler.jpg',
          rarity: 'Covert',
          float: 0.02
        }
      ])
    }
  }, [isOpen])

  const toggleSkinSelection = (skin: SkinItem) => {
    hapticFeedback('light')
    
    setSelectedSkins(prev => {
      const isSelected = prev.some(s => s.assetId === skin.assetId)
      if (isSelected) {
        return prev.filter(s => s.assetId !== skin.assetId)
      } else {
        return [...prev, skin]
      }
    })
  }

  const getTotalValue = () => {
    return selectedSkins.reduce((sum, skin) => sum + skin.value, 0)
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

  const handleConfirm = async () => {
    if (selectedSkins.length === 0) {
      setError('Please select at least one skin')
      hapticFeedback('error')
      return
    }

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
      const result = await initiateDeposit(selectedSkins, tradeUrl)
      setDepositResult(result)
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
      setStep('select')
      setSelectedSkins([])
      setTradeUrl('')
      setError(null)
      setDepositResult(null)
    }, 300)
  }

  const renderSkinCard = (skin: SkinItem) => {
    const isSelected = selectedSkins.some(s => s.assetId === skin.assetId)
    
    return (
      <motion.div
        key={skin.assetId}
        className={`
          relative cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-orange-500' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => toggleSkinSelection(skin)}
      >
        <EnhancedCard className={`
          p-4 h-full
          ${isSelected 
            ? isDark ? 'bg-orange-500/10 border-orange-500/50' : 'bg-orange-50 border-orange-200'
            : isDark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50'
          }
        `}>
          {/* Skin Image */}
          <div className="relative mb-3">
            <div className={`
              w-full h-24 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900
              flex items-center justify-center mb-2
              ${isDark ? '' : 'border border-gray-200'}
            `}>
              <span className="text-gray-400 text-sm">Skin Image</span>
            </div>
            
            {/* Float badge */}
            <div className={`
              absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium
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

            <div className="flex items-center justify-between">
              <span className={`
                text-lg font-bold text-green-400
              `}>
                ${skin.value.toFixed(2)}
              </span>
              
              {isSelected && (
                <CheckCircleIcon className="w-5 h-5 text-orange-500" />
              )}
            </div>
          </div>
        </EnhancedCard>
      </motion.div>
    )
  }

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
                <CurrencyDollarIcon className="w-6 h-6 text-orange-500" />
                <h2 className={`
                  text-xl font-bold
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}>
                  Deposit Skins
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
              {step === 'select' && (
                <div className="space-y-6">
                  {/* Trade URL Input */}
                  <div>
                    <label className={`
                      block text-sm font-medium mb-2
                      ${isDark ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Steam Trade URL
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

                  {/* Skin Selection */}
                  <div>
                    <h3 className={`
                      text-lg font-semibold mb-4
                      ${isDark ? 'text-white' : 'text-gray-900'}
                    `}>
                      Select Skins to Deposit
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSkins.map(renderSkinCard)}
                    </div>
                  </div>

                  {/* Selection Summary */}
                  {selectedSkins.length > 0 && (
                    <EnhancedCard className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`
                          font-semibold
                          ${isDark ? 'text-white' : 'text-gray-900'}
                        `}>
                          Selected Items ({selectedSkins.length})
                        </h4>
                        <div className="text-xl font-bold text-green-400">
                          ${getTotalValue().toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedSkins.map(skin => (
                          <div key={skin.assetId} className="flex items-center justify-between text-sm">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              {skin.name}
                            </span>
                            <span className="text-green-400 font-medium">
                              ${skin.value.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </EnhancedCard>
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
                      onClick={handleConfirm}
                      disabled={selectedSkins.length === 0 || !tradeUrl || loading}
                      className={`
                        flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                        ${selectedSkins.length > 0 && tradeUrl && !loading
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-400 text-gray-300 cursor-not-allowed'
                        }
                      `}
                    >
                      {loading ? 'Processing...' : `Deposit $${getTotalValue().toFixed(2)}`}
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
                    Processing Deposit
                  </h3>
                  <p className={`
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    Creating trade offer and processing your deposit...
                  </p>
                </div>
              )}

              {step === 'success' && depositResult && (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className={`
                    text-xl font-semibold mb-2
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Deposit Initiated Successfully!
                  </h3>
                  <p className={`
                    mb-6
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {depositResult.message}
                  </p>
                  
                  <EnhancedCard className="p-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Transaction ID:
                        </span>
                        <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {depositResult.transactionId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Total Value:
                        </span>
                        <span className="text-green-400 font-bold">
                          ${depositResult.totalValue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Expires:
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(depositResult.expiresAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </EnhancedCard>

                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <ClockIcon className="w-5 h-5 text-orange-400" />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Please accept the trade offer within 30 minutes
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
                    Deposit Failed
                  </h3>
                  <p className={`
                    mb-6
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {error}
                  </p>
                  
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => setStep('select')}
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

export default DepositModal 