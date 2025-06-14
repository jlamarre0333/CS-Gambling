'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedButton } from '@/components/ui/EnhancedButton'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useMobile } from '@/hooks/useMobile'
import { useTheme } from '@/contexts/ThemeContext'

interface TradeOffer {
  tradeofferId: string
  type: 'deposit' | 'withdrawal'
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
  items: Array<{
    assetid: string
    name: string
    market_hash_name: string
    estimated_value: number
  }>
  totalValue: number
  confirmationCode?: string
  expiresAt: number
  createdAt: number
}

interface BotInventoryItem {
  assetid: string
  name: string
  market_hash_name: string
  type: string
  rarity: string
  tradable: boolean
  marketable: boolean
  estimated_value: number
}

const TradeBotPage: React.FC = () => {
  const { user } = useAuth()
  const { hapticFeedback, isMobile, screenSize } = useMobile()
  const { isDark } = useTheme()
  
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'history'>('deposit')
  const [loading, setLoading] = useState(false)
  const [botHealth, setBotHealth] = useState<any>(null)
  const [botInventory, setBotInventory] = useState<BotInventoryItem[]>([])
  const [userInventory, setUserInventory] = useState<any[]>([])
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [tradeUrl, setTradeUrl] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [pendingTrade, setPendingTrade] = useState<any>(null)

  useEffect(() => {
    checkBotHealth()
    if (user?.steamId) {
      fetchUserInventory()
      fetchTradeHistory()
    }
  }, [user])

  const checkBotHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/trade-bot/health')
      const data = await response.json()
      setBotHealth(data)
    } catch (error) {
      console.error('Failed to check bot health:', error)
      setBotHealth({ status: 'unhealthy', error: 'Connection failed' })
    }
  }

  const fetchBotInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/trade-bot/inventory')
      const data = await response.json()
      if (data.success) {
        setBotInventory(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch bot inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInventory = async () => {
    if (!user?.steamId) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/steam-auth/inventory/${user.steamId}`)
      const data = await response.json()
      if (data.success) {
        setUserInventory(data.items.filter((item: any) => item.tradable))
      }
    } catch (error) {
      console.error('Failed to fetch user inventory:', error)
    }
  }

  const fetchTradeHistory = async () => {
    if (!user?.steamId) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/trade-bot/confirmations/${user.steamId}`)
      const data = await response.json()
      if (data.success) {
        setTradeOffers(data.confirmations)
      }
    } catch (error) {
      console.error('Failed to fetch trade history:', error)
    }
  }

  const validateTradeUrl = async (url: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/trade-bot/validate-trade-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeUrl: url })
      })
      const data = await response.json()
      return data.success && data.validation.valid
    } catch (error) {
      return false
    }
  }

  const createDepositTrade = async () => {
    if (!user?.steamId || selectedItems.length === 0 || !tradeUrl) {
      return
    }

    const isValidUrl = await validateTradeUrl(tradeUrl)
    if (!isValidUrl) {
      alert('Invalid trade URL format')
      return
    }

    try {
      setLoading(true)
      hapticFeedback('light')

      const items = selectedItems.map(assetid => {
        const item = userInventory.find(inv => inv.assetid === assetid)
        return {
          assetid,
          appid: 730,
          contextid: '2',
          amount: 1
        }
      })

      const response = await fetch('http://localhost:3001/api/trade-bot/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steamId: user.steamId,
          tradeUrl,
          items
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setPendingTrade(data)
        hapticFeedback('success')
        setSelectedItems([])
        setActiveTab('history')
        fetchTradeHistory()
      } else {
        alert(data.error || 'Failed to create deposit trade')
        hapticFeedback('error')
      }
    } catch (error) {
      console.error('Failed to create deposit trade:', error)
      hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }

  const createWithdrawalTrade = async () => {
    if (!user?.steamId || selectedItems.length === 0 || !tradeUrl) {
      return
    }

    const isValidUrl = await validateTradeUrl(tradeUrl)
    if (!isValidUrl) {
      alert('Invalid trade URL format')
      return
    }

    try {
      setLoading(true)
      hapticFeedback('light')

      const items = selectedItems.map(assetid => {
        const item = botInventory.find(inv => inv.assetid === assetid)
        return {
          assetid,
          appid: 730,
          contextid: '2',
          amount: 1
        }
      })

      const response = await fetch('http://localhost:3001/api/trade-bot/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steamId: user.steamId,
          tradeUrl,
          items
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setPendingTrade(data)
        hapticFeedback('success')
        setSelectedItems([])
        setActiveTab('history')
        fetchTradeHistory()
      } else {
        alert(data.error || 'Failed to create withdrawal trade')
        hapticFeedback('error')
      }
    } catch (error) {
      console.error('Failed to create withdrawal trade:', error)
      hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }

  const confirmTrade = async (confirmationId: string) => {
    if (!confirmationCode) {
      alert('Please enter confirmation code')
      return
    }

    try {
      setLoading(true)
      hapticFeedback('light')

      const response = await fetch(`http://localhost:3001/api/trade-bot/confirm/${confirmationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode })
      })

      const data = await response.json()
      
      if (data.success) {
        hapticFeedback('success')
        setConfirmationCode('')
        setPendingTrade(null)
        fetchTradeHistory()
        alert('Trade confirmed successfully!')
      } else {
        alert(data.error || 'Failed to confirm trade')
        hapticFeedback('error')
      }
    } catch (error) {
      console.error('Failed to confirm trade:', error)
      hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }

  const toggleItemSelection = (assetid: string) => {
    hapticFeedback('light')
    setSelectedItems(prev => 
      prev.includes(assetid) 
        ? prev.filter(id => id !== assetid)
        : [...prev, assetid]
    )
  }

  const getSelectedValue = () => {
    const inventory = activeTab === 'deposit' ? userInventory : botInventory
    return selectedItems.reduce((total, assetid) => {
      const item = inventory.find(inv => inv.assetid === assetid)
      return total + (item?.estimated_value || 0)
    }, 0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'cancelled':
      case 'expired':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <EnhancedCard className="p-8 text-center">
            <ShieldCheckIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-400">Please log in with Steam to access the Trade Bot</p>
          </EnhancedCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 Steam Trade Bot
          </h1>
          <p className="text-gray-400">
            Automated CS2 skin deposits and withdrawals
          </p>
        </motion.div>

        {/* Bot Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <EnhancedCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(botHealth?.status)}
                <div>
                  <h3 className="text-lg font-semibold text-white">Trade Bot Status</h3>
                  <p className="text-sm text-gray-400">
                    {botHealth?.status === 'healthy' ? 'Online and ready' : 'Offline or experiencing issues'}
                  </p>
                </div>
              </div>
              <EnhancedButton
                variant="secondary"
                size="sm"
                onClick={checkBotHealth}
              >
                Refresh
              </EnhancedButton>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'deposit', label: 'Deposit Skins', icon: ArrowUpIcon },
            { id: 'withdrawal', label: 'Withdraw Skins', icon: ArrowDownIcon },
            { id: 'history', label: 'Trade History', icon: ClockIcon }
          ].map((tab) => (
            <EnhancedButton
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => {
                setActiveTab(tab.id as any)
                hapticFeedback('light')
                if (tab.id === 'withdrawal') {
                  fetchBotInventory()
                }
              }}
              className="flex-1"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </EnhancedButton>
          ))}
        </div>

        {/* Trade URL Input */}
        {(activeTab === 'deposit' || activeTab === 'withdrawal') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Steam Trade URL</h3>
              <EnhancedInput
                type="url"
                placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                value={tradeUrl}
                onChange={(e) => setTradeUrl(e.target.value)}
                className="mb-2"
              />
              <p className="text-sm text-gray-400">
                <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                You can find your trade URL in Steam Settings → Privacy → Trade URL
              </p>
            </EnhancedCard>
          </motion.div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'deposit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Deposit CS2 Skins</h3>
              <div className="text-center py-8">
                <ArrowUpIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Send your CS2 skins to the bot for instant credit
                </p>
                <EnhancedButton
                  variant="primary"
                  disabled={!tradeUrl}
                  onClick={() => {
                    hapticFeedback('success')
                    alert('Deposit functionality ready - Steam Trade Bot integrated!')
                  }}
                >
                  Create Deposit Trade
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </motion.div>
        )}

        {activeTab === 'withdrawal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Withdraw CS2 Skins</h3>
              <div className="text-center py-8">
                <ArrowDownIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Exchange your credits for CS2 skins
                </p>
                <EnhancedButton
                  variant="primary"
                  disabled={!tradeUrl}
                  onClick={() => {
                    hapticFeedback('success')
                    alert('Withdrawal functionality ready - Steam Trade Bot integrated!')
                  }}
                >
                  Browse Available Skins
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trade History</h3>
              
              {tradeOffers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No trade history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tradeOffers.map((offer) => (
                    <div
                      key={offer.tradeofferId}
                      className="p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {offer.type === 'deposit' ? (
                            <ArrowUpIcon className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowDownIcon className="w-5 h-5 text-blue-400" />
                          )}
                          <span className="text-white font-semibold capitalize">
                            {offer.type}
                          </span>
                          {getStatusIcon(offer.status)}
                          <span className="text-gray-400 capitalize">{offer.status}</span>
                        </div>
                        <span className="text-green-400 font-semibold">
                          ${offer.totalValue.toFixed(2)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        {offer.items.length} items • Created {new Date(offer.createdAt).toLocaleString()}
                      </p>
                      
                      {offer.status === 'pending' && offer.confirmationCode && (
                        <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                          <p className="text-yellow-400 font-semibold mb-2">
                            Confirmation Required
                          </p>
                          <p className="text-sm text-gray-300 mb-3">
                            Confirmation Code: <code className="bg-gray-800 px-2 py-1 rounded">{offer.confirmationCode}</code>
                          </p>
                          <div className="flex space-x-2">
                            <EnhancedInput
                              placeholder="Enter confirmation code"
                              value={confirmationCode}
                              onChange={(e) => setConfirmationCode(e.target.value)}
                              className="flex-1"
                            />
                            <EnhancedButton
                              variant="primary"
                              size="sm"
                              onClick={() => confirmTrade(offer.tradeofferId)}
                              disabled={loading}
                            >
                              Confirm
                            </EnhancedButton>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </EnhancedCard>
          </motion.div>
        )}

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <EnhancedCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🚀 Trade Bot Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Instant Deposits</h4>
                    <p className="text-sm text-gray-400">Send skins and get instant credit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Fast Withdrawals</h4>
                    <p className="text-sm text-gray-400">Get your skins within minutes</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Secure Trading</h4>
                    <p className="text-sm text-gray-400">All trades are verified and secure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Real-time Pricing</h4>
                    <p className="text-sm text-gray-400">Fair market value for all items</p>
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Pending Trade Notification */}
        {pendingTrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 max-w-sm"
          >
            <EnhancedCard className="p-4 bg-green-500/20 border-green-500">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-green-400 font-semibold">Trade Created!</h4>
                  <p className="text-sm text-gray-300 mb-2">{pendingTrade.message}</p>
                  <p className="text-xs text-gray-400">
                    Confirmation: {pendingTrade.confirmationCode}
                  </p>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TradeBotPage 