'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CubeIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import EnhancedButton from './ui/EnhancedButton'
import { EnhancedCard } from './ui/EnhancedCard'
import LoadingSpinner from './ui/LoadingSpinner'

interface SteamItem {
  assetid: string
  classid: string
  instanceid: string
  amount: string
  pos: number
  name: string
  market_name: string
  market_hash_name: string
  icon_url: string
  tradable: boolean
  marketable: boolean
  commodity: boolean
  market_tradable_restriction: number
  market_marketable_restriction: number
  descriptions?: Array<{
    type: string
    value: string
    color?: string
  }>
  tags?: Array<{
    category: string
    internal_name: string
    localized_category_name: string
    localized_tag_name: string
    color?: string
  }>
  price?: number
  rarity?: string
  wear?: string
  stattrak?: boolean
}

interface SteamInventoryProps {
  steamId: string
  onItemSelect?: (item: SteamItem) => void
  onDeposit?: (items: SteamItem[]) => void
  showPrices?: boolean
  allowMultiSelect?: boolean
}

const SteamInventory: React.FC<SteamInventoryProps> = ({
  steamId,
  onItemSelect,
  onDeposit,
  showPrices = true,
  allowMultiSelect = true
}) => {
  const [items, setItems] = useState<SteamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'weapons' | 'knives' | 'gloves' | 'stickers'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rarity'>('price')
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    fetchInventory()
  }, [steamId])

  useEffect(() => {
    // Calculate total value of selected items
    const total = Array.from(selectedItems).reduce((sum, assetId) => {
      const item = items.find(i => i.assetid === assetId)
      return sum + (item?.price || 0)
    }, 0)
    setTotalValue(total)
  }, [selectedItems, items])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3001/api/steam-auth/steam-profile/${steamId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }

      const data = await response.json()
      
      if (data.inventory) {
        // Process and enhance inventory items
        const processedItems = await processInventoryItems(data.inventory)
        setItems(processedItems)
      } else {
        setItems([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const processInventoryItems = async (rawItems: any[]): Promise<SteamItem[]> => {
    // Filter CS2 items and add pricing/rarity info
    const cs2Items = rawItems.filter(item => 
      item.appid === 730 || // CS2/CSGO app ID
      item.market_hash_name?.includes('AK-47') ||
      item.market_hash_name?.includes('AWP') ||
      item.market_hash_name?.includes('Knife') ||
      item.market_hash_name?.includes('Gloves')
    )

    // Add mock pricing and rarity data (in real app, fetch from Steam Market API)
    return cs2Items.map(item => ({
      ...item,
      price: Math.random() * 500 + 10, // Mock price
      rarity: getRarity(item.market_hash_name || ''),
      wear: getWear(item.market_hash_name || ''),
      stattrak: item.market_hash_name?.includes('StatTrak™') || false
    }))
  }

  const getRarity = (name: string): string => {
    if (name.includes('★')) return 'Covert'
    if (name.includes('AK-47') || name.includes('AWP')) return 'Classified'
    if (name.includes('M4A4') || name.includes('M4A1-S')) return 'Restricted'
    if (name.includes('Glock') || name.includes('USP-S')) return 'Mil-Spec'
    return 'Consumer'
  }

  const getWear = (name: string): string => {
    if (name.includes('Factory New')) return 'FN'
    if (name.includes('Minimal Wear')) return 'MW'
    if (name.includes('Field-Tested')) return 'FT'
    if (name.includes('Well-Worn')) return 'WW'
    if (name.includes('Battle-Scarred')) return 'BS'
    return 'FN'
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'Covert': return 'text-red-400'
      case 'Classified': return 'text-pink-400'
      case 'Restricted': return 'text-purple-400'
      case 'Mil-Spec': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getWearColor = (wear: string): string => {
    switch (wear) {
      case 'FN': return 'text-green-400'
      case 'MW': return 'text-blue-400'
      case 'FT': return 'text-yellow-400'
      case 'WW': return 'text-orange-400'
      case 'BS': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    if (filter === 'weapons') return !item.market_hash_name?.includes('★') && !item.market_hash_name?.includes('Gloves')
    if (filter === 'knives') return item.market_hash_name?.includes('★') && item.market_hash_name?.includes('Knife')
    if (filter === 'gloves') return item.market_hash_name?.includes('Gloves')
    if (filter === 'stickers') return item.market_hash_name?.includes('Sticker')
    return true
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.market_name || '').localeCompare(b.market_name || '')
      case 'price':
        return (b.price || 0) - (a.price || 0)
      case 'rarity':
        const rarityOrder = ['Consumer', 'Mil-Spec', 'Restricted', 'Classified', 'Covert']
        return rarityOrder.indexOf(b.rarity || '') - rarityOrder.indexOf(a.rarity || '')
      default:
        return 0
    }
  })

  const handleItemClick = (item: SteamItem) => {
    if (allowMultiSelect) {
      const newSelected = new Set(selectedItems)
      if (newSelected.has(item.assetid)) {
        newSelected.delete(item.assetid)
      } else {
        newSelected.add(item.assetid)
      }
      setSelectedItems(newSelected)
    }
    
    onItemSelect?.(item)
  }

  const handleDeposit = () => {
    const itemsToDeposit = items.filter(item => selectedItems.has(item.assetid))
    onDeposit?.(itemsToDeposit)
  }

  if (loading) {
    return (
      <EnhancedCard className="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 mt-4">Loading your CS2 inventory...</p>
      </EnhancedCard>
    )
  }

  if (error) {
    return (
      <EnhancedCard className="p-8 text-center">
        <div className="text-red-400 mb-4">
          <CubeIcon className="w-12 h-12 mx-auto mb-2" />
          <p>Failed to load inventory</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
        <EnhancedButton onClick={fetchInventory} variant="secondary">
          Retry
        </EnhancedButton>
      </EnhancedCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <CubeIcon className="w-8 h-8 text-orange-400" />
            <span>CS2 Inventory</span>
          </h2>
          <p className="text-gray-400">
            {items.length} items • Selected: {selectedItems.size} • Value: ${totalValue.toFixed(2)}
          </p>
        </div>

        {selectedItems.size > 0 && onDeposit && (
          <EnhancedButton
            onClick={handleDeposit}
            variant="success"
            icon={<ArrowUpTrayIcon className="w-5 h-5" />}
          >
            Deposit Selected (${totalValue.toFixed(2)})
          </EnhancedButton>
        )}
      </div>

      {/* Filters */}
      <EnhancedCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <span className="text-gray-400 text-sm">Filter:</span>
            {['all', 'weapons', 'knives', 'gloves', 'stickers'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === filterType
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <span className="text-gray-400 text-sm">Sort:</span>
            {['price', 'name', 'rarity'].map((sortType) => (
              <button
                key={sortType}
                onClick={() => setSortBy(sortType as any)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  sortBy === sortType
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </EnhancedCard>

      {/* Items Grid */}
      {sortedItems.length === 0 ? (
        <EnhancedCard className="p-8 text-center">
          <CubeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Items Found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Your CS2 inventory appears to be empty or private.'
              : `No ${filter} found in your inventory.`
            }
          </p>
        </EnhancedCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {sortedItems.map((item, index) => (
              <motion.div
                key={item.assetid}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`relative cursor-pointer group ${
                  selectedItems.has(item.assetid) ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                <EnhancedCard 
                  variant="game" 
                  className="p-3 hover:scale-105 transition-transform"
                  hover={true}
                >
                  {/* Item Image */}
                  <div className="relative mb-3">
                    <img
                      src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`}
                      alt={item.market_name}
                      className="w-full h-20 object-contain"
                      loading="lazy"
                    />
                    
                    {/* StatTrak Badge */}
                    {item.stattrak && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                        ST
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {selectedItems.has(item.assetid) && (
                      <div className="absolute inset-0 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-medium truncate" title={item.market_name}>
                      {item.market_name}
                    </h4>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${getRarityColor(item.rarity || '')}`}>
                        {item.rarity}
                      </span>
                      <span className={`text-xs ${getWearColor(item.wear || '')}`}>
                        {item.wear}
                      </span>
                    </div>

                    {showPrices && item.price && (
                      <div className="text-green-400 text-sm font-semibold">
                        ${item.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default SteamInventory 