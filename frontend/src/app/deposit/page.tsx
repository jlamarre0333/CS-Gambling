'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  WalletIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiTrendingUp,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiEye,
  FiStar,
  FiFilter
} from 'react-icons/fi'

interface SkinItem {
  id: string;
  name: string;
  game: string;
  rarity: 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert' | 'Contraband';
  quality: 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
  price: number;
  value: number;
  image: string;
  marketPrice: number;
  float: number;
  stickers?: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'card' | 'ewallet' | 'skin';
  icon: string;
  fees: number;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  supported: boolean;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  method: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  txHash?: string;
  items?: SkinItem[];
}

const DepositPage = () => {
  const [steamConnected, setSteamConnected] = useState(true) // Set to true for demo
  const [selectedSkins, setSelectedSkins] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('value')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userBalance, setUserBalance] = useState(1250.75)
  const [filterRarity, setFilterRarity] = useState<string>('all')

  // Mock CS:GO/CS2 skin data with realistic names and values
  const steamInventory: SkinItem[] = [
    {
      id: '1',
      name: 'AK-47 | Redline',
      game: 'CS2',
      quality: 'Field-Tested',
      rarity: 'Classified',
      price: 45.30,
      value: 45.30,
      image: '/api/placeholder/100/75',
      marketPrice: 47.50,
      float: 0.25,
      stickers: ['Team Dignitas | Katowice 2014']
    },
    {
      id: '2',
      name: 'AWP | Dragon Lore',
      game: 'CS2',
      quality: 'Battle-Scarred',
      rarity: 'Covert',
      price: 2450.00,
      value: 2450.00,
      image: '/api/placeholder/100/75',
      marketPrice: 2500.00,
      float: 0.78,
      stickers: []
    },
    {
      id: '3',
      name: 'M4A4 | Howl',
      game: 'CS2',
      quality: 'Minimal Wear',
      rarity: 'Contraband',
      price: 1890.50,
      value: 1890.50,
      image: '/api/placeholder/100/75',
      marketPrice: 1950.00,
      float: 0.12,
      stickers: ['Crown (Foil)']
    },
    {
      id: '4',
      name: 'Glock-18 | Fade',
      game: 'CS2',
      quality: 'Factory New',
      rarity: 'Restricted',
      price: 285.75,
      value: 285.75,
      image: '/api/placeholder/100/75',
      marketPrice: 290.00,
      float: 0.03,
      stickers: []
    },
    {
      id: '5',
      name: 'Karambit | Doppler',
      game: 'CS2',
      quality: 'Factory New',
      rarity: 'Covert',
      price: 750.00,
      value: 750.00,
      image: '/api/placeholder/100/75',
      marketPrice: 780.00,
      float: 0.01,
      stickers: []
    },
    {
      id: '6',
      name: 'USP-S | Kill Confirmed',
      game: 'CS2',
      quality: 'Minimal Wear',
      rarity: 'Covert',
      price: 67.80,
      value: 67.80,
      image: '/api/placeholder/100/75',
      marketPrice: 70.00,
      float: 0.14,
      stickers: ['Virtus.pro | Katowice 2015']
    },
    {
      id: '7',
      name: 'Desert Eagle | Blaze',
      game: 'CS2',
      quality: 'Factory New',
      rarity: 'Restricted',
      price: 125.40,
      value: 125.40,
      image: '/api/placeholder/100/75',
      marketPrice: 130.00,
      float: 0.02,
      stickers: []
    },
    {
      id: '8',
      name: 'AK-47 | Fire Serpent',
      game: 'CS2',
      quality: 'Field-Tested',
      rarity: 'Covert',
      price: 890.25,
      value: 890.25,
      image: '/api/placeholder/100/75',
      marketPrice: 920.00,
      float: 0.31,
      stickers: ['Team EnVyUs | Katowice 2015']
    }
  ]

  const depositHistory = [
    { id: 1, items: 3, value: '$234.50', status: 'completed', time: '2 hours ago' },
    { id: 2, items: 1, value: '$89.75', status: 'completed', time: '1 day ago' },
    { id: 3, items: 5, value: '$456.20', status: 'completed', time: '3 days ago' },
  ]

  const filteredInventory = steamInventory.filter(skin =>
    skin.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'value') return b.value - a.value
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  const totalSelectedValue = selectedSkins.reduce((total, skinId) => {
    const skin = steamInventory.find(s => s.id === skinId)
    return total + (skin?.value || 0)
  }, 0)

  const toggleSkinSelection = (skinId: string) => {
    setSelectedSkins(prev => 
      prev.includes(skinId) 
        ? prev.filter(id => id !== skinId)
        : [...prev, skinId]
    )
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      'Consumer': 'border-gray-400',
      'Industrial': 'border-blue-400',
      'Mil-Spec': 'border-purple-400',
      'Restricted': 'border-pink-400',
      'Classified': 'border-red-400',
      'Covert': 'border-yellow-400',
      'Contraband': 'border-orange-400'
    }
    return colors[rarity as keyof typeof colors] || 'border-gray-400'
  }

  const handleDeposit = () => {
    if (selectedSkins.length === 0) return
    setIsLoading(true)
    // Simulate deposit process
    setTimeout(() => {
      setIsLoading(false)
      setSelectedSkins([])
      // Show success message
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'processing': return 'text-yellow-400 bg-yellow-500/20'
      case 'pending': return 'text-blue-400 bg-blue-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      case 'cancelled': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle />
      case 'processing': return <FiRefreshCw className="animate-spin" />
      case 'pending': return <FiClock />
      case 'failed': return <FiAlertCircle />
      case 'cancelled': return <FiAlertCircle />
      default: return <FiClock />
    }
  }

  const filteredSkins = filterRarity === 'all' 
    ? steamInventory 
    : steamInventory.filter(skin => skin.rarity === filterRarity)

  const handleSkinToggle = (skin: SkinItem) => {
    setSelectedSkins(prev => {
      const isSelected = prev.find(s => s === skin.id)
      if (isSelected) {
        return prev.filter(id => id !== skin.id)
      } else {
        return [...prev, skin.id]
      }
    })
  }

  const selectedSkinsValue = selectedSkins.reduce((sum, skinId) => {
    const skin = steamInventory.find(s => s.id === skinId)
    return sum + (skin?.value || 0)
  }, 0)

  const processPayment = () => {
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: activeTab as 'deposit' | 'withdrawal',
      method: selectedMethod?.name || 'Unknown',
      amount: selectedMethod?.type === 'skin' ? selectedSkinsValue : amount,
      status: 'processing',
      timestamp: new Date(),
      items: selectedMethod?.type === 'skin' ? selectedSkins.map(id => steamInventory.find(s => s.id === id)!) : undefined
    }

    setTransactions(prev => [newTransaction, ...prev])
    
    // Simulate processing
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'completed' as const }
          : tx
      ))
      
      if (activeTab === 'deposit') {
        setUserBalance(prev => prev + newTransaction.amount)
      } else {
        setUserBalance(prev => prev - newTransaction.amount)
      }
    }, 3000)

    setSelectedMethod(null)
    setAmount(0)
    setSelectedSkins([])
    setActiveTab('history')
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            💰 <span className="neon-text">Deposit Skins</span>
          </h1>
          <p className="text-xl text-gray-300">
            Connect your Steam account and deposit CS:GO/CS2 skins to start playing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Steam Connection Status */}
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Steam Account</h3>
                    {steamConnected ? (
                      <p className="text-accent-success flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Connected as SkinMaster2024
                      </p>
                    ) : (
                      <p className="text-gray-400">Not connected</p>
                    )}
                  </div>
                </div>
                
                {!steamConnected ? (
                  <button className="gaming-button">
                    Connect Steam
                  </button>
                ) : (
                  <button className="gaming-button-secondary">
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh Inventory
                  </button>
                )}
              </div>
            </div>

            {steamConnected && (
              <>
                {/* Inventory Controls */}
                <div className="gaming-card p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search skins..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="gaming-input pl-10 w-full"
                        />
                      </div>
                      
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="gaming-input"
                      >
                        <option value="value">Sort by Value</option>
                        <option value="name">Sort by Name</option>
                      </select>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {filteredInventory.length} items • Total: ${steamInventory.reduce((sum, skin) => sum + skin.value, 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Inventory Grid */}
                <div className="gaming-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Your Steam Inventory</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredInventory.map((skin) => (
                      <div
                        key={skin.id}
                        onClick={() => toggleSkinSelection(skin.id)}
                        className={`
                          bg-gaming-hover rounded-lg p-3 cursor-pointer transition-all duration-200 border-2
                          ${selectedSkins.includes(skin.id) 
                            ? 'border-accent-primary bg-accent-primary/10 shadow-neon scale-105' 
                            : `${getRarityColor(skin.rarity)} hover:border-accent-primary/50`
                          }
                        `}
                      >
                        <div className="aspect-square bg-gaming-card rounded mb-2 relative overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                            <span className="text-2xl">🔫</span>
                          </div>
                          
                          {selectedSkins.includes(skin.id) && (
                            <div className="absolute top-1 right-1">
                              <CheckCircleIcon className="w-5 h-5 text-accent-primary" />
                            </div>
                          )}
                          
                          {skin.stickers && skin.stickers.length > 0 && (
                            <div className="absolute bottom-1 left-1">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Has Stickers"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xs font-semibold text-white truncate mb-1">
                            {skin.name}
                          </div>
                          <div className="text-xs text-gray-400 mb-1">
                            {skin.quality}
                          </div>
                          <div className="text-sm font-bold text-accent-success">
                            ${skin.value.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Float: {skin.float}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deposit Summary */}
                {selectedSkins.length > 0 && (
                  <div className="gaming-card p-6 border-accent-primary">
                    <h3 className="text-xl font-bold text-white mb-4">Deposit Summary</h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Selected Items</div>
                        <div className="text-2xl font-bold text-white">{selectedSkins.length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Total Value</div>
                        <div className="text-2xl font-bold text-accent-success">
                          ${totalSelectedValue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setSelectedSkins([])}
                        className="gaming-button-secondary flex-1"
                      >
                        Clear Selection
                      </button>
                      <button 
                        onClick={handleDeposit}
                        disabled={isLoading}
                        className={`gaming-button flex-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? (
                          <>
                            <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <WalletIcon className="w-5 h-5 mr-2" />
                            Deposit Selected
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Balance */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Account Balance</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gaming-hover rounded-lg">
                  <div className="text-sm text-gray-400">Available Balance</div>
                  <div className="text-3xl font-bold text-accent-success">$1,247.85</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-gaming-hover rounded">
                    <div className="text-gray-400">Deposited</div>
                    <div className="font-semibold text-white">$2,890.50</div>
                  </div>
                  <div className="text-center p-2 bg-gaming-hover rounded">
                    <div className="text-gray-400">Withdrawn</div>
                    <div className="font-semibold text-white">$1,642.65</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="gaming-button-secondary w-full text-sm">
                  View Withdrawal Options
                </button>
                <button className="gaming-button-secondary w-full text-sm">
                  Transaction History
                </button>
                <button className="gaming-button-secondary w-full text-sm">
                  Trade URL Settings
                </button>
              </div>
            </div>

            {/* Recent Deposits */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Deposits</h3>
              <div className="space-y-3">
                {depositHistory.map((deposit) => (
                  <div key={deposit.id} className="p-3 bg-gaming-hover rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">
                        {deposit.items} items
                      </span>
                      <span className="text-sm font-semibold text-accent-success">
                        {deposit.value}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{deposit.time}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        deposit.status === 'completed' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {deposit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="gaming-card p-6 border-yellow-600/50">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-500 mb-2">Security Notice</h4>
                  <p className="text-sm text-gray-400">
                    Never share your trade URL or Steam credentials. We will never ask for your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositPage 