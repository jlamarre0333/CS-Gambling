'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CubeIcon,
  StarIcon,
  FireIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { EnhancedCard } from './ui/EnhancedCard'
import EnhancedButton from './ui/EnhancedButton'
import LoadingSpinner from './ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useMobile } from '@/hooks/useMobile'
import { useTheme } from '@/contexts/ThemeContext'

interface InventoryItem {
  id: string
  name: string
  market_name: string
  icon_url: string
  rarity: string
  type: string
  wear?: string
  price: number
  tradable: boolean
  marketable: boolean
  exterior?: string
  stickers?: Array<{
    name: string
    img: string
  }>
}

interface InventoryData {
  items: InventoryItem[]
  totalValue: number
  totalItems: number
  steamId: string
  lastUpdated: Date
}

const SteamInventory: React.FC = () => {
  const { user } = useAuth()
  const { hapticFeedback, isMobile, screenSize } = useMobile()
  const { isDark } = useTheme()
  const [inventory, setInventory] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'weapons' | 'knives' | 'gloves' | 'stickers'>('all')
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'rarity'>('price')

  useEffect(() => {
    if (user?.steamId) {
      fetchInventory()
    }
  }, [user])

  const fetchInventory = async () => {
    if (!user?.steamId) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🎒 Fetching CS2 inventory for Steam ID:', user.steamId)
      
      const response = await fetch(`http://localhost:3001/api/steam-auth/inventory/${user.steamId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Transform API data to match our InventoryData interface
        const transformedItems: InventoryItem[] = data.items.map((item: any) => ({
          id: item.id.toString(),
          name: item.name || `CS2 Item ${item.defindex}`,
          market_name: item.name || `CS2 Item ${item.defindex}`,
          icon_url: item.image ? item.image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', '') : 'default_item',
          rarity: getRarityName(item.rarity),
          type: item.type || 'Unknown',
          wear: getQualityName(item.quality),
          price: item.estimatedValue || 0,
          tradable: item.tradable !== false,
          marketable: item.marketable !== false,
          exterior: getQualityName(item.quality)
        }))

        const inventoryData: InventoryData = {
          items: transformedItems,
          totalValue: data.totalValue || 0,
          totalItems: data.totalItems || transformedItems.length,
          steamId: data.steamId,
          lastUpdated: new Date(data.lastUpdated || Date.now())
        }

        setInventory(inventoryData)
        
        if (data.message) {
          console.log('📝 Inventory message:', data.message)
        }
      } else {
        throw new Error(data.error || 'Failed to fetch inventory')
      }
    } catch (err) {
      console.error('❌ Inventory fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to server')
      
      // Fallback to demo data
      const demoInventory: InventoryData = {
        items: [
          {
            id: 'demo_1',
            name: 'AK-47 | Redline (Demo)',
            market_name: 'AK-47 | Redline (Field-Tested)',
            icon_url: 'default_ak47',
            rarity: 'Classified',
            type: 'Rifle',
            wear: 'Field-Tested',
            price: 45.32,
            tradable: true,
            marketable: true,
            exterior: 'Field-Tested'
          },
          {
            id: 'demo_2',
            name: 'Glock-18 | Water Elemental (Demo)',
            market_name: 'Glock-18 | Water Elemental (Factory New)',
            icon_url: 'default_glock',
            rarity: 'Classified',
            type: 'Pistol',
            wear: 'Factory New',
            price: 12.45,
            tradable: true,
            marketable: true,
            exterior: 'Factory New'
          }
        ],
        totalValue: 57.77,
        totalItems: 2,
        steamId: user.steamId,
        lastUpdated: new Date()
      }
      setInventory(demoInventory)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions to convert Steam API data
  const getRarityName = (rarity: number): string => {
    const rarityMap: { [key: number]: string } = {
      1: 'Consumer Grade',
      2: 'Industrial Grade', 
      3: 'Mil-Spec Grade',
      4: 'Restricted',
      5: 'Classified',
      6: 'Covert',
      7: 'Contraband'
    }
    return rarityMap[rarity] || 'Consumer Grade'
  }

  const getQualityName = (quality: number): string => {
    const qualityMap: { [key: number]: string } = {
      0: 'Normal',
      1: 'Genuine',
      3: 'Vintage',
      5: 'Unusual',
      6: 'Unique',
      7: 'Community',
      8: 'Valve',
      9: 'Self-Made',
      10: 'Strange',
      11: 'Strange'
    }
    return qualityMap[quality] || 'Field-Tested'
  }

  const getRarityColor = (rarity: string) => {
    const rarityColors: { [key: string]: string } = {
      'Consumer Grade': 'text-gray-400 border-gray-400',
      'Industrial Grade': 'text-blue-400 border-blue-400',
      'Mil-Spec Grade': 'text-purple-400 border-purple-400',
      'Restricted': 'text-pink-400 border-pink-400',
      'Classified': 'text-red-400 border-red-400',
      'Covert': 'text-orange-400 border-orange-400',
      'Contraband': 'text-yellow-400 border-yellow-400',
      'Extraordinary': 'text-yellow-300 border-yellow-300'
    }
    return rarityColors[rarity] || 'text-gray-400 border-gray-400'
  }

  const getItemTypeIcon = (type: string) => {
    if (type.includes('Knife')) return '🔪'
    if (type.includes('Gloves')) return '🧤'
    if (type.includes('Rifle') || type.includes('Pistol') || type.includes('SMG')) return '🔫'
    if (type.includes('Sticker')) return '🏷️'
    return '📦'
  }

  const filteredItems = inventory?.items.filter(item => {
    if (filter === 'all') return true
    if (filter === 'weapons') return item.type.includes('Rifle') || item.type.includes('Pistol') || item.type.includes('SMG')
    if (filter === 'knives') return item.type.includes('Knife')
    if (filter === 'gloves') return item.type.includes('Gloves')
    if (filter === 'stickers') return item.type.includes('Sticker')
    return true
  }).sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'rarity') return b.price - a.price // Use price as rarity proxy
    return 0
  }) || []

  const toggleItemSelection = (itemId: string) => {
    hapticFeedback('light')
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getSelectedValue = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = inventory?.items.find(i => i.id === itemId)
      return total + (item?.price || 0)
    }, 0)
  }

  if (!user) {
    return (
      <EnhancedCard className="p-8 text-center">
        <div className="text-gray-400">
          <CubeIcon className="w-12 h-12 mx-auto mb-2" />
          <p>Login to view your Steam inventory</p>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <EnhancedCard variant="premium" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <CubeIcon className="w-8 h-8 text-orange-500" />
              <span>CS:GO Inventory</span>
            </h2>
            {inventory && (
              <p className="text-gray-400 mt-1">
                {inventory.totalItems} items • Total value: ${inventory.totalValue.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <EnhancedButton
              variant="secondary"
              size="sm"
              onClick={fetchInventory}
              disabled={loading}
              loading={loading}
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Refresh
            </EnhancedButton>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'weapons', 'knives', 'gloves', 'stickers'].map((filterType) => (
            <EnhancedButton
              key={filterType}
              variant={filter === filterType ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(filterType as any)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </EnhancedButton>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Sort by:</span>
          {['price', 'name', 'rarity'].map((sortType) => (
            <EnhancedButton
              key={sortType}
              variant={sortBy === sortType ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(sortType as any)}
            >
              {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
            </EnhancedButton>
          ))}
        </div>
      </EnhancedCard>

      {/* Loading State */}
      {loading && (
        <EnhancedCard className="p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading your inventory...</p>
        </EnhancedCard>
      )}

      {/* Error State */}
      {error && (
        <EnhancedCard className="p-8 text-center">
          <div className="text-red-400">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold mb-2">Failed to load inventory</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <EnhancedButton variant="primary" onClick={fetchInventory}>
              Try Again
            </EnhancedButton>
          </div>
        </EnhancedCard>
      )}

      {/* Inventory Grid */}
      {inventory && !loading && !error && (
        <>
          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <EnhancedCard variant="stats" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">
                    {selectedItems.length} items selected
                  </span>
                  <span className="text-gray-400 ml-2">
                    Total: ${getSelectedValue().toFixed(2)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <EnhancedButton variant="primary" size="sm">
                    Deposit Selected
                  </EnhancedButton>
                  <EnhancedButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear
                  </EnhancedButton>
                </div>
              </div>
            </EnhancedCard>
          )}

          {/* Items Grid */}
          <div className={`
            grid gap-4 
            ${screenSize.isSmall ? 'grid-cols-2' : screenSize.isMedium ? 'grid-cols-3' : 'grid-cols-4 lg:grid-cols-6'}
          `}>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleItemSelection(item.id)}
                className="cursor-pointer"
              >
                <EnhancedCard 
                  variant="default" 
                  className={`
                    p-3 transition-all duration-200 
                    ${selectedItems.includes(item.id) 
                      ? 'ring-2 ring-orange-500 bg-orange-500/10' 
                      : 'hover:bg-gray-800/60'
                    }
                    ${getRarityColor(item.rarity).includes('border') ? `border-2 ${getRarityColor(item.rarity).split(' ')[1]}` : ''}
                  `}
                >
                  {/* Item Image */}
                  <div className="relative mb-2">
                    <img
                      src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`}
                      alt={item.name}
                      className="w-full h-20 object-contain bg-gray-900/50 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-item.png'
                      }}
                    />
                    <div className="absolute top-1 right-1 text-lg">
                      {getItemTypeIcon(item.type)}
                    </div>
                    {selectedItems.includes(item.id) && (
                      <div className="absolute inset-0 bg-orange-500/20 rounded flex items-center justify-center">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="text-center">
                    <h4 className={`
                      text-xs font-semibold mb-1 line-clamp-2 
                      ${getRarityColor(item.rarity).split(' ')[0]}
                    `}>
                      {item.market_name || item.name}
                    </h4>
                    
                    {item.exterior && (
                      <p className="text-xs text-gray-400 mb-1">
                        {item.exterior}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center space-x-1 text-xs">
                      <CurrencyDollarIcon className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        {item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Tradable/Marketable Status */}
                    <div className="flex justify-center space-x-1 mt-1">
                      {item.tradable && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Tradable" />
                      )}
                      {item.marketable && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full" title="Marketable" />
                      )}
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <EnhancedCard className="p-8 text-center">
              <div className="text-gray-400">
                <CubeIcon className="w-12 h-12 mx-auto mb-2" />
                <p>No items found for the selected filter</p>
              </div>
            </EnhancedCard>
          )}
        </>
      )}
    </div>
  )
}

export default SteamInventory 