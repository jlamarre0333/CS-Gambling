'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { JWTManager } from '@/lib/jwt'
import { useMobile } from '@/hooks/useMobile'

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

interface PaymentStats {
  totalDeposits: number
  totalWithdrawals: number
  pendingDeposits: number
  pendingWithdrawals: number
  netFlow: number
  totalTransactions: number
}

interface PaymentContextType {
  balance: number
  transactions: Transaction[]
  pendingTransactions: Transaction[]
  loading: boolean
  error: string | null
  
  // Actions
  refreshBalance: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshPendingTransactions: () => Promise<void>
  
  // Deposit methods
  initiateDeposit: (selectedSkins: SkinItem[], tradeUrl: string) => Promise<any>
  
  // Withdrawal methods
  initiateWithdrawal: (amount: number, tradeUrl: string, selectedSkins?: SkinItem[]) => Promise<any>
  getAvailableSkinsForWithdrawal: (amount: number) => Promise<SkinItem[]>
  
  // Transaction management
  getTransaction: (transactionId: string) => Promise<Transaction | null>
  cancelTransaction: (transactionId: string) => Promise<boolean>
  
  // Skin pricing
  getSkinPrices: (skinNames: string[], condition?: string) => Promise<Record<string, number>>
  
  // Admin functions (if admin)
  getPaymentStats: () => Promise<PaymentStats | null>
  getAllTransactions: (limit?: number, offset?: number) => Promise<{ transactions: Transaction[]; total: number; hasMore: boolean } | null>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { hapticFeedback } = useMobile()
  
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API request helper
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = JWTManager.getToken()
    
    const response = await fetch(`http://localhost:3001/api/payments${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshed = await JWTManager.refreshToken()
      if (refreshed) {
        // Retry with new token
        const newToken = JWTManager.getToken()
        return fetch(`http://localhost:3001/api/payments${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...options.headers
          }
        })
      }
    }

    return response
  }

  // Refresh balance
  const refreshBalance = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await apiRequest('/balance')
      const data = await response.json()
      
      if (data.success) {
        setBalance(data.balance)
        setError(null)
      } else {
        setError(data.message || 'Failed to load balance')
      }
    } catch (err) {
      console.error('Balance refresh error:', err)
      setError('Failed to load balance')
    } finally {
      setLoading(false)
    }
  }

  // Refresh transactions
  const refreshTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await apiRequest('/transactions?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.transactions)
        setError(null)
      } else {
        setError(data.message || 'Failed to load transactions')
      }
    } catch (err) {
      console.error('Transactions refresh error:', err)
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  // Refresh pending transactions
  const refreshPendingTransactions = async () => {
    if (!user) return

    try {
      const response = await apiRequest('/pending')
      const data = await response.json()
      
      if (data.success) {
        setPendingTransactions(data.transactions)
        setError(null)
      } else {
        setError(data.message || 'Failed to load pending transactions')
      }
    } catch (err) {
      console.error('Pending transactions refresh error:', err)
      setError('Failed to load pending transactions')
    }
  }

  // Initiate deposit
  const initiateDeposit = async (selectedSkins: SkinItem[], tradeUrl: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      hapticFeedback('light')
      
      const response = await apiRequest('/deposit', {
        method: 'POST',
        body: JSON.stringify({
          selectedSkins,
          tradeUrl
        })
      })

      const data = await response.json()
      
      if (data.success) {
        hapticFeedback('success')
        await refreshPendingTransactions()
        await refreshTransactions()
        return data
      } else {
        hapticFeedback('error')
        throw new Error(data.message || 'Deposit failed')
      }
    } catch (err) {
      console.error('Deposit error:', err)
      hapticFeedback('error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Initiate withdrawal
  const initiateWithdrawal = async (amount: number, tradeUrl: string, selectedSkins?: SkinItem[]) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      hapticFeedback('light')
      
      const response = await apiRequest('/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          tradeUrl,
          selectedSkins
        })
      })

      const data = await response.json()
      
      if (data.success) {
        hapticFeedback('success')
        await refreshBalance()
        await refreshPendingTransactions()
        await refreshTransactions()
        return data
      } else {
        hapticFeedback('error')
        throw new Error(data.message || 'Withdrawal failed')
      }
    } catch (err) {
      console.error('Withdrawal error:', err)
      hapticFeedback('error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get available skins for withdrawal
  const getAvailableSkinsForWithdrawal = async (amount: number): Promise<SkinItem[]> => {
    try {
      const response = await apiRequest(`/available-skins?amount=${amount}`)
      const data = await response.json()
      
      if (data.success) {
        return data.skins
      } else {
        throw new Error(data.message || 'Failed to get available skins')
      }
    } catch (err) {
      console.error('Available skins error:', err)
      throw err
    }
  }

  // Get transaction by ID
  const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
    try {
      const response = await apiRequest(`/transaction/${transactionId}`)
      const data = await response.json()
      
      if (data.success) {
        return data.transaction
      } else {
        return null
      }
    } catch (err) {
      console.error('Get transaction error:', err)
      return null
    }
  }

  // Cancel transaction
  const cancelTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      hapticFeedback('light')
      
      const response = await apiRequest(`/cancel/${transactionId}`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        hapticFeedback('success')
        await refreshBalance()
        await refreshPendingTransactions()
        await refreshTransactions()
        return true
      } else {
        hapticFeedback('error')
        throw new Error(data.message || 'Failed to cancel transaction')
      }
    } catch (err) {
      console.error('Cancel transaction error:', err)
      hapticFeedback('error')
      return false
    }
  }

  // Get skin prices
  const getSkinPrices = async (skinNames: string[], condition: string = 'Field-Tested'): Promise<Record<string, number>> => {
    try {
      const response = await apiRequest(`/skin-prices?skins=${skinNames.join(',')}&condition=${condition}`)
      const data = await response.json()
      
      if (data.success) {
        return data.prices
      } else {
        throw new Error(data.message || 'Failed to get skin prices')
      }
    } catch (err) {
      console.error('Skin prices error:', err)
      throw err
    }
  }

  // Admin: Get payment stats
  const getPaymentStats = async (): Promise<PaymentStats | null> => {
    if (!user || user.role !== 'admin') return null

    try {
      const response = await apiRequest('/admin/stats')
      const data = await response.json()
      
      if (data.success) {
        return data.stats
      } else {
        return null
      }
    } catch (err) {
      console.error('Payment stats error:', err)
      return null
    }
  }

  // Admin: Get all transactions
  const getAllTransactions = async (limit: number = 100, offset: number = 0) => {
    if (!user || user.role !== 'admin') return null

    try {
      const response = await apiRequest(`/admin/transactions?limit=${limit}&offset=${offset}`)
      const data = await response.json()
      
      if (data.success) {
        return {
          transactions: data.transactions,
          total: data.total,
          hasMore: data.hasMore
        }
      } else {
        return null
      }
    } catch (err) {
      console.error('All transactions error:', err)
      return null
    }
  }

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      refreshBalance()
      refreshTransactions()
      refreshPendingTransactions()
    } else {
      setBalance(0)
      setTransactions([])
      setPendingTransactions([])
    }
  }, [user])

  // Auto-refresh pending transactions every 30 seconds
  useEffect(() => {
    if (user && pendingTransactions.length > 0) {
      const interval = setInterval(() => {
        refreshPendingTransactions()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user, pendingTransactions.length])

  const value: PaymentContextType = {
    balance,
    transactions,
    pendingTransactions,
    loading,
    error,
    
    refreshBalance,
    refreshTransactions,
    refreshPendingTransactions,
    
    initiateDeposit,
    initiateWithdrawal,
    getAvailableSkinsForWithdrawal,
    
    getTransaction,
    cancelTransaction,
    
    getSkinPrices,
    
    getPaymentStats,
    getAllTransactions
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}

export default PaymentProvider 