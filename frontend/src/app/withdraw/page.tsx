'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUpTrayIcon, ClockIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface UserSkin {
  id: string
  name: string
  value: number
  condition: string
  rarity: string
  tradeLock?: boolean
  lockExpiry?: Date
}

interface WithdrawalRequest {
  id: string
  skins: UserSkin[]
  totalValue: number
  status: 'pending' | 'approved' | 'declined' | 'completed'
  requestDate: Date
  completedDate?: Date
  tradeUrl?: string
}

const WithdrawPage = () => {
  const [selectedSkins, setSelectedSkins] = useState<string[]>([])
  const [balance, setBalance] = useState(1247.85)
  const [tradeUrl, setTradeUrl] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'rarity'>('value')
  const [filterBy, setFilterBy] = useState<'all' | 'available' | 'locked'>('all')
  const [showHistory, setShowHistory] = useState(false)

  const userInventory: UserSkin[] = [
    { id: '1', name: 'AK-47 Redline', value: 45.50, condition: 'Field-Tested', rarity: 'Classified' },
    { id: '2', name: 'AWP Dragon Lore', value: 2450.00, condition: 'Battle-Scarred', rarity: 'Covert' },
    { id: '3', name: 'Glock-18 Fade', value: 125.75, condition: 'Factory New', rarity: 'Restricted', tradeLock: true, lockExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { id: '4', name: 'Desert Eagle Blaze', value: 89.30, condition: 'Minimal Wear', rarity: 'Restricted' },
    { id: '5', name: 'M4A1-S Hot Rod', value: 156.80, condition: 'Factory New', rarity: 'Classified' },
    { id: '6', name: 'Karambit Doppler', value: 750.00, condition: 'Factory New', rarity: 'Covert' },
    { id: '7', name: 'USP-S Kill Confirmed', value: 234.50, condition: 'Minimal Wear', rarity: 'Covert' },
    { id: '8', name: 'AK-47 Fire Serpent', value: 1890.50, condition: 'Minimal Wear', rarity: 'Covert', tradeLock: true, lockExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { id: '9', name: 'Butterfly Knife', value: 567.30, condition: 'Well-Worn', rarity: 'Covert' },
    { id: '10', name: 'M4A4 Howl', value: 1234.80, condition: 'Field-Tested', rarity: 'Covert' }
  ]

  const withdrawalHistory: WithdrawalRequest[] = [
    {
      id: 'w1',
      skins: [userInventory[0], userInventory[1]],
      totalValue: 2495.50,
      status: 'completed',
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcdefgh'
    },
    {
      id: 'w2',
      skins: [userInventory[3]],
      totalValue: 89.30,
      status: 'pending',
      requestDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
      tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcdefgh'
    },
    {
      id: 'w3',
      skins: [userInventory[4], userInventory[5]],
      totalValue: 906.80,
      status: 'approved',
      requestDate: new Date(Date.now() - 30 * 60 * 1000),
      tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcdefgh'
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Covert': return 'border-red-500 bg-red-500/10'
      case 'Classified': return 'border-pink-500 bg-pink-500/10'
      case 'Restricted': return 'border-purple-500 bg-purple-500/10'
      case 'Mil-Spec': return 'border-blue-500 bg-blue-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Factory New': return 'text-blue-400'
      case 'Minimal Wear': return 'text-green-400'
      case 'Field-Tested': return 'text-yellow-400'
      case 'Well-Worn': return 'text-orange-400'
      case 'Battle-Scarred': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'approved': return 'text-blue-400'
      case 'pending': return 'text-yellow-400'
      case 'declined': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'approved': return <ArrowPathIcon className="w-5 h-5 text-blue-400" />
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-400" />
      case 'declined': return <XCircleIcon className="w-5 h-5 text-red-400" />
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const filteredSkins = userInventory
    .filter(skin => {
      const matchesSearch = skin.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'available' && !skin.tradeLock) ||
        (filterBy === 'locked' && skin.tradeLock)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value': return b.value - a.value
        case 'name': return a.name.localeCompare(b.name)
        case 'rarity': 
          const rarityOrder = { 'Covert': 4, 'Classified': 3, 'Restricted': 2, 'Mil-Spec': 1 }
          return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder]
        default: return 0
      }
    })

  const toggleSkinSelection = (skinId: string) => {
    const skin = userInventory.find(s => s.id === skinId)
    if (skin?.tradeLock) return

    setSelectedSkins(prev => 
      prev.includes(skinId) 
        ? prev.filter(id => id !== skinId)
        : [...prev, skinId]
    )
  }

  const getTotalSelectedValue = () => {
    return selectedSkins.reduce((total, skinId) => {
      const skin = userInventory.find(s => s.id === skinId)
      return total + (skin?.value || 0)
    }, 0)
  }

  const getSelectedSkins = () => {
    return selectedSkins.map(id => userInventory.find(s => s.id === id)).filter(Boolean) as UserSkin[]
  }

  const submitWithdrawal = () => {
    if (selectedSkins.length === 0) return
    if (!tradeUrl.trim()) {
      alert('Please enter your Steam trade URL')
      return
    }

    // Simulate withdrawal submission
    alert(`Withdrawal request submitted for ${selectedSkins.length} skins worth $${getTotalSelectedValue().toFixed(2)}`)
    setSelectedSkins([])
  }

  const formatTimeRemaining = (expiry: Date) => {
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📤 <span className="neon-text">Withdraw Skins</span>
          </h1>
          <p className="text-xl text-gray-300">
            Cash out your CS2 skins to your Steam account
          </p>
          <div className="mt-4 text-lg">
            <span className="text-gray-400">Available Balance: </span>
            <span className="text-accent-success font-bold">${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                !showHistory
                  ? 'bg-accent-primary text-gaming-dark shadow-neon'
                  : 'bg-gaming-card text-gray-300 hover:bg-gaming-hover border border-gaming-border'
              }`}
            >
              <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
              Withdraw Skins
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                showHistory
                  ? 'bg-accent-primary text-gaming-dark shadow-neon'
                  : 'bg-gaming-card text-gray-300 hover:bg-gaming-hover border border-gaming-border'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Withdrawal History
            </button>
          </div>
        </div>

        {!showHistory ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Trade URL Input */}
              <div className="gaming-card p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Steam Trade URL</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={tradeUrl}
                    onChange={(e) => setTradeUrl(e.target.value)}
                    placeholder="https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=..."
                    className="gaming-input w-full"
                  />
                  <p className="text-sm text-gray-400">
                    📋 <strong>How to find your trade URL:</strong> Go to Steam → Inventory → Trade Offers → Who can send me Trade Offers → Copy Trade URL
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="gaming-card p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search skins..."
                      className="gaming-input w-full pl-10"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="gaming-input"
                  >
                    <option value="value">Sort by Value</option>
                    <option value="name">Sort by Name</option>
                    <option value="rarity">Sort by Rarity</option>
                  </select>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="gaming-input"
                  >
                    <option value="all">All Skins</option>
                    <option value="available">Available</option>
                    <option value="locked">Trade Locked</option>
                  </select>
                </div>
              </div>

              {/* Inventory Grid */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Your Inventory ({filteredSkins.length} items)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredSkins.map((skin) => (
                    <button
                      key={skin.id}
                      onClick={() => toggleSkinSelection(skin.id)}
                      disabled={skin.tradeLock}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left relative
                        ${selectedSkins.includes(skin.id)
                          ? 'border-accent-primary bg-accent-primary/10' 
                          : `${getRarityColor(skin.rarity)} hover:bg-opacity-20`
                        }
                        ${skin.tradeLock ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {skin.tradeLock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          🔒 {formatTimeRemaining(skin.lockExpiry!)}
                        </div>
                      )}
                      
                      <div className="font-semibold text-white text-sm mb-1">{skin.name}</div>
                      <div className={`text-xs mb-2 ${getConditionColor(skin.condition)}`}>
                        {skin.condition} • {skin.rarity}
                      </div>
                      <div className="text-accent-success font-semibold">
                        ${skin.value.toFixed(2)}
                      </div>
                      
                      {selectedSkins.includes(skin.id) && (
                        <div className="absolute top-2 left-2 text-accent-primary">
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Items */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Selected Items</h3>
                {selectedSkins.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No items selected</p>
                ) : (
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {getSelectedSkins().map((skin) => (
                      <div key={skin.id} className="p-3 bg-gaming-hover rounded-lg">
                        <div className="font-semibold text-white text-sm">{skin.name}</div>
                        <div className="text-accent-success text-sm">${skin.value.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedSkins.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">Total Value:</span>
                      <span className="text-accent-success font-bold text-lg">
                        ${getTotalSelectedValue().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">Items:</span>
                      <span className="text-white font-semibold">{selectedSkins.length}</span>
                    </div>
                    <button 
                      onClick={submitWithdrawal}
                      disabled={!tradeUrl.trim()}
                      className={`gaming-button w-full ${
                        !tradeUrl.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <ArrowUpTrayIcon className="w-5 h-5 mr-2 inline" />
                      Request Withdrawal
                    </button>
                  </div>
                )}
              </div>

              {/* Withdrawal Info */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">ℹ️ Withdrawal Info</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>• <strong>Processing time:</strong> 15-30 minutes</div>
                  <div>• <strong>Minimum withdrawal:</strong> $5.00</div>
                  <div>• <strong>Trade lock:</strong> New items are locked for 7 days</div>
                  <div>• <strong>Fees:</strong> No withdrawal fees</div>
                  <div>• <strong>Support:</strong> Contact us if issues arise</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 Your Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Withdrawn:</span>
                    <span className="text-white">$3,450.75</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Successful Trades:</span>
                    <span className="text-white">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Processing:</span>
                    <span className="text-white">18 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available Items:</span>
                    <span className="text-white">{userInventory.filter(s => !s.tradeLock).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Withdrawal History */
          <div className="gaming-card p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Withdrawal History</h3>
            <div className="space-y-4">
              {withdrawalHistory.map((request) => (
                <div key={request.id} className="p-6 bg-gaming-hover rounded-lg border border-gaming-border">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`font-semibold capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-4">
                      <div className="text-white font-semibold mb-1">
                        {request.skins.length} items • ${request.totalValue.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {request.skins.slice(0, 2).map(skin => skin.name).join(', ')}
                        {request.skins.length > 2 && ` +${request.skins.length - 2} more`}
                      </div>
                    </div>
                    
                    <div className="md:col-span-3">
                      <div className="text-gray-400 text-sm">Requested</div>
                      <div className="text-white">{request.requestDate.toLocaleDateString()}</div>
                    </div>
                    
                    <div className="md:col-span-3">
                      {request.completedDate && (
                        <>
                          <div className="text-gray-400 text-sm">Completed</div>
                          <div className="text-white">{request.completedDate.toLocaleDateString()}</div>
                        </>
                      )}
                      {request.status === 'pending' && (
                        <div className="text-yellow-400 text-sm">Processing...</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WithdrawPage 