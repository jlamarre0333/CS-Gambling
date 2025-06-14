'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  TrashIcon,
  ChevronRightIcon
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

interface Transaction {
  id: string
  steamId: string
  type: 'deposit' | 'withdrawal' | 'balance_credit' | 'balance_debit'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount?: number
  totalValue?: number
  skins?: SkinItem[]
  tradeUrl?: string
  createdAt: string
  completedAt?: string
  expiresAt?: string
  steps?: TransactionStep[]
  message?: string
}

interface TransactionStep {
  step: string
  timestamp: string | null
  status: 'pending' | 'completed' | 'failed'
}

interface TransactionHistoryProps {
  showPendingOnly?: boolean
  limit?: number
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  showPendingOnly = false, 
  limit = 50 
}) => {
  const { 
    transactions, 
    pendingTransactions, 
    refreshTransactions, 
    refreshPendingTransactions,
    cancelTransaction,
    getTransaction,
    loading 
  } = usePayment()
  const { hapticFeedback, isMobile } = useMobile()
  const { isDark } = useTheme()
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const displayTransactions = showPendingOnly ? pendingTransactions : transactions

  useEffect(() => {
    if (showPendingOnly) {
      refreshPendingTransactions()
    } else {
      refreshTransactions()
    }
  }, [showPendingOnly])

  const getStatusIcon = (status: string, type: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'failed':
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      case 'pending':
      default:
        return <ClockIcon className="w-5 h-5 text-orange-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'balance_credit':
        return <ArrowDownIcon className="w-5 h-5 text-green-400" />
      case 'withdrawal':
      case 'balance_debit':
        return <ArrowUpIcon className="w-5 h-5 text-red-400" />
      default:
        return <ArrowDownIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'failed':
      case 'cancelled':
        return 'text-red-400'
      case 'pending':
      default:
        return 'text-orange-400'
    }
  }

  const getTransactionAmount = (transaction: Transaction) => {
    if (transaction.type === 'deposit') {
      return transaction.totalValue || 0
    } else if (transaction.type === 'withdrawal') {
      return transaction.amount || 0
    } else if (transaction.type === 'balance_credit') {
      return transaction.amount || 0
    } else if (transaction.type === 'balance_debit') {
      return Math.abs(transaction.amount || 0)
    }
    return 0
  }

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Skin Deposit'
      case 'withdrawal':
        return 'Skin Withdrawal'
      case 'balance_credit':
        return 'Balance Credit'
      case 'balance_debit':
        return 'Balance Debit'
      default:
        return type
    }
  }

  const handleViewDetails = async (transactionId: string) => {
    hapticFeedback('light')
    
    const transaction = await getTransaction(transactionId)
    if (transaction) {
      setSelectedTransaction(transaction)
      setShowDetails(true)
    }
  }

  const handleCancelTransaction = async (transactionId: string) => {
    if (cancelling) return
    
    hapticFeedback('light')
    setCancelling(transactionId)
    
    try {
      const success = await cancelTransaction(transactionId)
      if (success) {
        hapticFeedback('success')
      } else {
        hapticFeedback('error')
      }
    } catch (error) {
      hapticFeedback('error')
    } finally {
      setCancelling(null)
    }
  }

  const renderTransactionCard = (transaction: Transaction) => {
    const amount = getTransactionAmount(transaction)
    const canCancel = transaction.status === 'pending' && 
                     (transaction.type === 'deposit' || transaction.type === 'withdrawal')
    
    return (
      <motion.div
        key={transaction.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <EnhancedCard className={`
          p-4 cursor-pointer transition-all duration-200
          ${isDark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Type Icon */}
              <div className={`
                p-2 rounded-lg
                ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
              `}>
                {getTypeIcon(transaction.type)}
              </div>
              
              {/* Transaction Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`
                    font-semibold
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    {formatTransactionType(transaction.type)}
                  </h4>
                  {getStatusIcon(transaction.status, transaction.type)}
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`
                    text-sm
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </span>
                  
                  <span className={`
                    text-sm font-medium capitalize
                    ${getStatusColor(transaction.status)}
                  `}>
                    {transaction.status}
                  </span>
                  
                  {transaction.skins && transaction.skins.length > 0 && (
                    <span className={`
                      text-sm
                      ${isDark ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      {transaction.skins.length} skin{transaction.skins.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Amount and Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`
                  text-lg font-bold
                  ${transaction.type === 'deposit' || transaction.type === 'balance_credit'
                    ? 'text-green-400'
                    : 'text-red-400'
                  }
                `}>
                  {transaction.type === 'deposit' || transaction.type === 'balance_credit' ? '+' : '-'}
                  ${amount.toFixed(2)}
                </div>
                
                {transaction.expiresAt && transaction.status === 'pending' && (
                  <div className={`
                    text-xs
                    ${isDark ? 'text-gray-500' : 'text-gray-600'}
                  `}>
                    Expires {new Date(transaction.expiresAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewDetails(transaction.id)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}
                  `}
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                
                {canCancel && (
                  <button
                    onClick={() => handleCancelTransaction(transaction.id)}
                    disabled={cancelling === transaction.id}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${cancelling === transaction.id
                        ? 'opacity-50 cursor-not-allowed'
                        : isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                      }
                    `}
                  >
                    {cancelling === transaction.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
                
                <ChevronRightIcon className={`
                  w-4 h-4
                  ${isDark ? 'text-gray-600' : 'text-gray-400'}
                `} />
              </div>
            </div>
          </div>
        </EnhancedCard>
      </motion.div>
    )
  }

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowDetails(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`
            w-full max-w-2xl max-h-[90vh] overflow-hidden
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
            <h2 className={`
              text-xl font-bold
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Transaction Details
            </h2>
            <button
              onClick={() => setShowDetails(false)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
              `}
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Basic Info */}
              <EnhancedCard className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Transaction ID
                    </span>
                    <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTransaction.id}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Type
                    </span>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatTransactionType(selectedTransaction.type)}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Status
                    </span>
                    <div className={`font-medium capitalize ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Amount
                    </span>
                    <div className="font-bold text-lg text-green-400">
                      ${getTransactionAmount(selectedTransaction).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Created
                    </span>
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedTransaction.completedAt && (
                    <div>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        Completed
                      </span>
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(selectedTransaction.completedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </EnhancedCard>

              {/* Skins */}
              {selectedTransaction.skins && selectedTransaction.skins.length > 0 && (
                <div>
                  <h3 className={`
                    text-lg font-semibold mb-4
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Skins ({selectedTransaction.skins.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTransaction.skins.map((skin, index) => (
                      <EnhancedCard key={index} className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900
                            flex items-center justify-center
                            ${isDark ? '' : 'border border-gray-200'}
                          `}>
                            <span className="text-gray-400 text-xs">IMG</span>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className={`
                              font-medium text-sm
                              ${isDark ? 'text-white' : 'text-gray-900'}
                            `}>
                              {skin.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className={`
                                text-xs
                                ${isDark ? 'text-gray-400' : 'text-gray-600'}
                              `}>
                                {skin.condition}
                              </span>
                              <span className="text-green-400 font-medium text-sm">
                                ${skin.value.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </EnhancedCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {selectedTransaction.steps && selectedTransaction.steps.length > 0 && (
                <div>
                  <h3 className={`
                    text-lg font-semibold mb-4
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Transaction Steps
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedTransaction.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {getStatusIcon(step.status, 'step')}
                        <div className="flex-1">
                          <div className={`
                            font-medium capitalize
                            ${isDark ? 'text-white' : 'text-gray-900'}
                          `}>
                            {step.step.replace(/_/g, ' ')}
                          </div>
                          {step.timestamp && (
                            <div className={`
                              text-xs
                              ${isDark ? 'text-gray-500' : 'text-gray-600'}
                            `}>
                              {new Date(step.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <span className={`
                          text-xs font-medium capitalize
                          ${getStatusColor(step.status)}
                        `}>
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (loading && displayTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" />
        <p className={`
          text-sm mt-2
          ${isDark ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Loading transactions...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayTransactions.length > 0 ? (
        <>
          {displayTransactions.slice(0, limit).map(renderTransactionCard)}
          {displayTransactions.length > limit && (
            <div className="text-center py-4">
              <button
                onClick={() => {
                  hapticFeedback('light')
                  // Implement load more functionality
                }}
                className={`
                  text-orange-500 hover:text-orange-400 font-medium
                  ${isDark ? '' : 'hover:text-orange-600'}
                `}
              >
                Load More Transactions
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className={`
            text-gray-400 mb-4
          `}>
            <ClockIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className={`
            text-lg font-semibold mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            No {showPendingOnly ? 'Pending ' : ''}Transactions
          </h3>
          <p className={`
            ${isDark ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {showPendingOnly 
              ? 'You have no pending transactions at the moment.'
              : 'Your transaction history will appear here.'
            }
          </p>
        </div>
      )}
      
      {showDetails && renderTransactionDetails()}
    </div>
  )
}

export default TransactionHistory 