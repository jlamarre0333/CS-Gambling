'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { useAuth } from '@/contexts/AuthContext'
import { usePayment } from '@/contexts/PaymentContext'
import { useMobile } from '@/hooks/useMobile'
import { useTheme } from '@/contexts/ThemeContext'
import DepositModal from '@/components/payment/DepositModal'
import WithdrawalModal from '@/components/payment/WithdrawalModal'
import TransactionHistory from '@/components/payment/TransactionHistory'

const PaymentPage: React.FC = () => {
  const { user } = useAuth()
  const { balance, pendingTransactions, refreshBalance } = usePayment()
  const { hapticFeedback, isMobile } = useMobile()
  const { isDark } = useTheme()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'pending'>('overview')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EnhancedCard className="p-8 text-center">
          <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Please Log In
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You need to be logged in to access payment features.
          </p>
        </EnhancedCard>
      </div>
    )
  }

  const handleDeposit = () => {
    hapticFeedback('light')
    setShowDepositModal(true)
  }

  const handleWithdrawal = () => {
    hapticFeedback('light')
    setShowWithdrawalModal(true)
  }

  const handleTabChange = (tab: 'overview' | 'history' | 'pending') => {
    hapticFeedback('light')
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`
            text-4xl font-bold mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Payment Center
          </h1>
          <p className={`
            text-lg
            ${isDark ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Manage your deposits, withdrawals, and transaction history
          </p>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <EnhancedCard variant="premium" className="p-8 text-center">
            <div className="mb-6">
              <div className={`
                text-sm font-medium mb-2
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Current Balance
              </div>
              <div className="text-5xl font-bold text-green-400 mb-4">
                ${balance.toFixed(2)}
              </div>
              <button
                onClick={refreshBalance}
                className={`
                  text-sm text-orange-500 hover:text-orange-400 transition-colors
                  ${isDark ? '' : 'hover:text-orange-600'}
                `}
              >
                Refresh Balance
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeposit}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Deposit Skins</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdrawal}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <MinusIcon className="w-5 h-5" />
                <span>Withdraw Funds</span>
              </motion.button>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <EnhancedCard className="p-6 text-center">
              <ArrowDownIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">
                ${(Math.random() * 5000 + 1000).toFixed(0)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Deposited
              </div>
            </EnhancedCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EnhancedCard className="p-6 text-center">
              <ArrowUpIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-400">
                ${(Math.random() * 3000 + 500).toFixed(0)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Withdrawn
              </div>
            </EnhancedCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EnhancedCard className="p-6 text-center">
              <ClockIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">
                {pendingTransactions.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Transactions
              </div>
            </EnhancedCard>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'history', label: 'History', icon: ClockIcon },
              { key: 'pending', label: 'Pending', icon: ClockIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key as any)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all
                  ${activeTab === key
                    ? 'bg-orange-500 text-white'
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
                {key === 'pending' && pendingTransactions.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingTransactions.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <EnhancedCard className="p-6">
                <h3 className={`
                  text-xl font-bold mb-4
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}>
                  Recent Activity
                </h3>
                <TransactionHistory limit={5} />
              </EnhancedCard>
              
              <EnhancedCard className="p-6">
                <h3 className={`
                  text-xl font-bold mb-4
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}>
                  Payment Methods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`
                    p-4 rounded-lg border-2 border-dashed
                    ${isDark ? 'border-gray-700' : 'border-gray-300'}
                  `}>
                    <div className="text-center">
                      <CurrencyDollarIcon className={`
                        w-8 h-8 mx-auto mb-2
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}
                      `} />
                      <h4 className={`
                        font-semibold mb-1
                        ${isDark ? 'text-white' : 'text-gray-900'}
                      `}>
                        CS:GO Skins
                      </h4>
                      <p className={`
                        text-sm
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        Deposit and withdraw using CS:GO skins
                      </p>
                    </div>
                  </div>
                  
                  <div className={`
                    p-4 rounded-lg border-2 border-dashed opacity-50
                    ${isDark ? 'border-gray-700' : 'border-gray-300'}
                  `}>
                    <div className="text-center">
                      <CurrencyDollarIcon className={`
                        w-8 h-8 mx-auto mb-2
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}
                      `} />
                      <h4 className={`
                        font-semibold mb-1
                        ${isDark ? 'text-white' : 'text-gray-900'}
                      `}>
                        Cryptocurrency
                      </h4>
                      <p className={`
                        text-sm
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        Coming Soon
                      </p>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'history' && (
            <EnhancedCard className="p-6">
              <h3 className={`
                text-xl font-bold mb-4
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                Transaction History
              </h3>
              <TransactionHistory />
            </EnhancedCard>
          )}

          {activeTab === 'pending' && (
            <EnhancedCard className="p-6">
              <h3 className={`
                text-xl font-bold mb-4
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                Pending Transactions
              </h3>
              <TransactionHistory showPendingOnly />
            </EnhancedCard>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <DepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      <WithdrawalModal 
        isOpen={showWithdrawalModal} 
        onClose={() => setShowWithdrawalModal(false)} 
      />
    </div>
  )
}

export default PaymentPage 