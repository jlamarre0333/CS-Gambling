'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPackage, FiDollarSign, FiCheck, FiX, FiRefreshCw, FiArrowLeft } from 'react-icons/fi'

const BACKEND_URL = 'http://localhost:3002'

interface SkinItem {
  id: string
  name: string
  price: number
  image: string
  rarity: string
  exterior?: string
  weapon?: string
  tradable: boolean
  marketable: boolean
  selected: boolean
}

interface User {
  steamId: string
  username: string
  avatar: string
  balance: number
}

export default function InventoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [inventory, setInventory] = useState<SkinItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDepositing, setIsDepositing] = useState(false)
  const [totalValue, setTotalValue] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('steamToken')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        await loadInventory()
      } else {
        localStorage.removeItem('steamToken')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      window.location.href = '/login'
    }
  }

  const loadInventory = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('steamToken')
      
      const response = await fetch(`${BACKEND_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(data.items)
        setTotalValue(data.totalValue)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load inventory')
      }
    } catch (error) {
      console.error('Inventory load failed:', error)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const getSelectedValue = () => {
    return inventory
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0)
  }

  const depositSelectedItems = async () => {
    if (selectedItems.length === 0) return

    try {
      setIsDepositing(true)
      const token = localStorage.getItem('steamToken')
      
      const response = await fetch(`${BACKEND_URL}/api/inventory/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ skinIds: selectedItems })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully deposited ${data.depositedCount} items worth $${data.depositedValue.toFixed(2)}!`)
        setSelectedItems([])
        await loadInventory() // Reload to update available items
      } else {
        const errorData = await response.json()
        alert('Deposit failed: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed: Network error')
    } finally {
      setIsDepositing(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      'Consumer Grade': 'border-gray-400 bg-gray-400/20',
      'Industrial Grade': 'border-blue-400 bg-blue-400/20',
      'Mil-Spec Grade': 'border-purple-400 bg-purple-400/20',
      'Restricted': 'border-pink-400 bg-pink-400/20',
      'Classified': 'border-red-400 bg-red-400/20',
      'Covert': 'border-orange-400 bg-orange-400/20',
      'Contraband': 'border-yellow-400 bg-yellow-400/20',
    }
    return colors[rarity] || 'border-gray-400 bg-gray-400/20'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Your Inventory</h2>
          <p className="text-gray-400">Fetching your CS2 skins...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <FiArrowLeft />
              </button>
              
              {user && (
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-white">{user.username}'s Inventory</h1>
                    <p className="text-gray-400">Balance: ${user.balance?.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={loadInventory}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              {selectedItems.length > 0 && (
                <button
                  onClick={depositSelectedItems}
                  disabled={isDepositing}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDepositing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    <>
                      <FiDollarSign />
                      Deposit ${getSelectedValue().toFixed(2)} ({selectedItems.length} items)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
            <p className="text-red-400 text-sm mt-1">
              Make sure your Steam inventory is public and you own CS2 items.
            </p>
          </div>
        </div>
      )}

      {/* Inventory Stats */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiPackage className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Items</p>
                <p className="text-white text-xl font-semibold">{inventory.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-white text-xl font-semibold">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <FiCheck className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Selected</p>
                <p className="text-white text-xl font-semibold">
                  {selectedItems.length} (${getSelectedValue().toFixed(2)})
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="max-w-7xl mx-auto">
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
            <p className="text-gray-400 mb-4">
              {error ? 'Unable to load inventory.' : 'No tradable CS2 skins found in your inventory.'}
            </p>
            <button
              onClick={loadInventory}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {inventory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleItemSelection(item.id)}
                className={`relative bg-gray-800/50 backdrop-blur-xl rounded-xl p-3 border cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedItems.includes(item.id)
                    ? 'border-green-500 bg-green-500/20'
                    : `${getRarityColor(item.rarity)}`
                }`}
              >
                {/* Selection Indicator */}
                {selectedItems.includes(item.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white text-sm" />
                  </div>
                )}

                {/* Item Image */}
                <div className="aspect-square bg-gray-700 rounded-lg mb-2 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-skin.png'
                    }}
                  />
                </div>

                {/* Item Info */}
                <div className="text-center">
                  <h3 className="text-white text-sm font-medium mb-1 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-green-400 font-semibold">${item.price.toFixed(2)}</p>
                  {item.exterior && (
                    <p className="text-gray-400 text-xs mt-1">{item.exterior}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 