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

      const data = await response.json()
      
      if (response.ok && data.success && data.items && data.items.length > 0) {
        // Transform API data to match our InventoryData interface
        const transformedItems: InventoryItem[] = data.items.map((item: any) => ({
          id: item.id.toString(),
          name: item.name || `CS2 Item ${item.id}`,
          market_name: item.name || `CS2 Item ${item.id}`,
          icon_url: item.icon_url || 'default_item',
          rarity: item.rarity || 'Consumer Grade',
          type: item.type || 'Unknown',
          wear: item.exterior || 'Field-Tested',
          price: (item.price || 0) / 100, // Convert cents to dollars
          tradable: item.tradable !== false,
          marketable: item.marketable !== false,
          exterior: item.exterior || 'Field-Tested'
        }))

        const inventoryData: InventoryData = {
          items: transformedItems,
          totalValue: (data.totalValue || 0) / 100, // Convert cents to dollars
          totalItems: data.totalItems || transformedItems.length,
          steamId: user?.steamId || '',
          lastUpdated: new Date(data.lastUpdated || Date.now())
        }

        setInventory(inventoryData)
        console.log('✅ Real inventory loaded successfully:', transformedItems.length, 'items, total value:', inventoryData.totalValue)
      } else {
        // Show demo data with explanation
        console.log('📝 Using demo data - real inventory not available')
        showDemoInventory()
        
        if (!response.ok) {
          setError(`Unable to load your CS2 inventory (HTTP ${response.status}). This is likely because your Steam inventory is set to private. Below is demo data showing what your inventory could look like.`)
        } else {
          setError('Your Steam inventory appears to be empty or private. Below is demo data showing what CS2 skins look like in our system.')
        }
      }
    } catch (err) {
      console.error('❌ Inventory fetch error:', err)
      showDemoInventory()
      setError('Unable to connect to Steam servers. Below is demo data showing what your CS2 inventory could look like.')
    } finally {
      setLoading(false)
    }
  }

  const showDemoInventory = () => {
    const demoInventory: InventoryData = {
      items: [
        {
          id: 'demo_1',
          name: 'AK-47 | Redline',
          market_name: 'AK-47 | Redline (Field-Tested)',
          icon_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJ6ZEpiLuSrY6njQO3-hE-NWz0cYDGIFM2aA7T_gK3kufng8S6uJ-fyiM1vCMh4yvVyhG-1x5SLrs4b5JCJ_c',
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
          name: 'AWP | Dragon Lore',
          market_name: 'AWP | Dragon Lore (Factory New)',
          icon_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJF_9W7m5a0mvLwOq7c2DtQ18tyi7-UrdSg3w21rhFvN2z7IdKVdFNsZQvY_wLrxe3og5fv756Yz3E16D5iuygA',
          rarity: 'Covert',
          type: 'Sniper Rifle',
          wear: 'Factory New',
          price: 8500.00,
          tradable: true,
          marketable: true,
          exterior: 'Factory New'
        },
        {
          id: 'demo_3',
          name: 'Glock-18 | Water Elemental',
          market_name: 'Glock-18 | Water Elemental (Factory New)',
          icon_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJmIGZnPnxDLfYkWNFppMh2L-Vp9-g2wXg_0NrYGGhJoOVdlU3aFnU-lC5wOjxxcjrJJJJJA',
          rarity: 'Classified',
          type: 'Pistol',
          wear: 'Factory New',
          price: 12.45,
          tradable: true,
          marketable: true,
          exterior: 'Factory New'
        },
        {
          id: 'demo_4',
          name: 'M4A4 | Howl',
          market_name: 'M4A4 | Howl (Field-Tested)',
          icon_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDLbUlWJE7fp9g-7J4cLw3VHj_kVoMGGhJY6QdAE7YVnT-1K9wOjxxcjrJJJJJA',
          rarity: 'Contraband',
          type: 'Rifle',
          wear: 'Field-Tested',
          price: 2800.00,
          tradable: true,
          marketable: true,
          exterior: 'Field-Tested'
        },
        {
          id: 'demo_5',
          name: 'Karambit | Fade',
          market_name: 'Karambit | Fade (Factory New)',
          icon_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI6_Vl2VQ7cRnk9bN_Iv9nBri-hE5Nzz7cYKRdlU3aFnU-lC5wOjxxcjrJJJJJA',
          rarity: 'Covert',
          type: 'Knife',
          wear: 'Factory New',
          price: 1850.00,
          tradable: true,
          marketable: true,
          exterior: 'Factory New'
        },
        {
          id: 'demo_6',
          name: 'Sport Gloves | Pandora\'s Box',
          market_name: 'Sport Gloves | Pandora\'s Box (Field-Tested)',
          icon_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJmIGZnPnxDLfYkWNFppMh2L-Vp9-g2wXg_0NrYGGhJoOVdlU3aFnU-lC5wOjxxcjrJJJJJA',
          rarity: 'Extraordinary',
          type: 'Gloves',
          wear: 'Field-Tested',
          price: 3200.00,
          tradable: true,
          marketable: true,
          exterior: 'Field-Tested'
        }
      ],
      totalValue: 16407.77,
      totalItems: 6,
      steamId: user?.steamId || '',
      lastUpdated: new Date()
    }
    
    setInventory(demoInventory)
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
      'Base Grade': 'text-gray-500 border-gray-500',
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
    if (type.includes('Rifle')) return '🔫'
    if (type.includes('Pistol')) return '🔫'
    if (type.includes('SMG')) return '🔫'
    if (type.includes('Shotgun')) return '🔫'
    if (type.includes('Sniper')) return '🎯'
    if (type.includes('Machinegun')) return '🔫'
    if (type.includes('Sticker')) return '🏷️'
    if (type.includes('Graffiti')) return '🎨'
    if (type.includes('Collectible')) return '🏆'
    return '📦'
  }

  const filteredItems = inventory?.items.filter(item => {
    if (filter === 'all') return true
    if (filter === 'weapons') return item.type.includes('Rifle') || item.type.includes('Pistol') || item.type.includes('SMG') || item.type.includes('Shotgun') || item.type.includes('Sniper') || item.type.includes('Machinegun')
    if (filter === 'knives') return item.type.includes('Knife')
    if (filter === 'gloves') return item.type.includes('Gloves')
    if (filter === 'stickers') return item.type.includes('Sticker') || item.type.includes('Graffiti')
    return true
  }).sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'rarity') {
      // Sort by rarity order: Extraordinary > Covert > Classified > Restricted > Mil-Spec > Industrial > Consumer > Base
      const rarityOrder = {
        'Extraordinary': 7,
        'Covert': 6,
        'Classified': 5,
        'Restricted': 4,
        'Mil-Spec Grade': 3,
        'Industrial Grade': 2,
        'Consumer Grade': 1,
        'Base Grade': 0
      }
      const aRarity = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0
      const bRarity = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0
      return bRarity - aRarity
    }
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
        <EnhancedCard className="p-6">
          <div className="flex items-start space-x-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {error.includes('demo data') ? 'Showing Demo Data' : 'Inventory Notice'}
              </h3>
              <p className="text-gray-300 mb-4">{error}</p>
              
              {error.includes('demo data') && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <h4 className="text-blue-400 font-semibold mb-2">How to show your real inventory:</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Open Steam and go to your Profile</li>
                    <li>Click "Edit Profile" → "Privacy Settings"</li>
                    <li>Set "Game details" to "Public"</li>
                    <li>Set "Inventory" to "Public"</li>
                    <li>Click "Refresh" above to reload your inventory</li>
                  </ol>
                </div>
              )}
              
              <div className="flex space-x-2">
                <EnhancedButton variant="primary" size="sm" onClick={fetchInventory}>
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Refresh Inventory
                </EnhancedButton>
                {error.includes('demo data') && (
                  <EnhancedButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setError(null)}
                  >
                    Hide Notice
                  </EnhancedButton>
                )}
              </div>
            </div>
          </div>
        </EnhancedCard>
      )}

      {/* Inventory Grid */}
      {inventory && !loading && (
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

          {/* Demo Data Banner */}
          {error && error.includes('demo data') && (
            <EnhancedCard variant="stats" className="p-4 border-2 border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-400 font-semibold">Demo Mode:</span>
                <span className="text-gray-300">These are sample CS2 skins for demonstration</span>
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
                className={`
                  relative bg-gray-800/50 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${selectedItems.includes(item.id) 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : `border-transparent hover:border-gray-600 ${getRarityColor(item.rarity)}`
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleItemSelection(item.id)}
              >
                {/* Item Image */}
                <div className="relative p-4">
                  <img
                    src={item.icon_url}
                    alt={item.name}
                    className="w-full h-24 object-contain mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try alternative Steam CDN URL first
                      if (!target.src.includes('steamcommunity-a.akamaihd.net')) {
                        target.src = item.icon_url.replace('community.cloudflare.steamstatic.com', 'steamcommunity-a.akamaihd.net');
                      } else {
                        // Fallback to default image
                        target.src = '/default-item.svg';
                      }
                    }}
                    loading="lazy"
                  />
                  
                  {/* Rarity indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getRarityColor(item.rarity).split(' ')[1]?.replace('border-', 'bg-') || 'bg-gray-400'}`}></div>
                  
                  {/* Selection indicator */}
                  {selectedItems.includes(item.id) && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4 pt-0">
                  <div className="flex items-center space-x-1 mb-2">
                    <span className="text-lg">{getItemTypeIcon(item.type)}</span>
                    <h3 className="text-white font-semibold text-sm truncate flex-1" title={item.name}>
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className={`${getRarityColor(item.rarity)} font-medium`}>
                      {item.rarity}
                    </div>
                    <div className="text-gray-400">
                      {item.exterior}
                    </div>
                    <div className="text-green-400 font-bold text-sm">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
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