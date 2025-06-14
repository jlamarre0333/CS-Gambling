'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SiSteam } from 'react-icons/si'
import { 
  UserIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface SteamProfile {
  steamid: string
  personaname: string
  avatarfull: string
  profileurl: string
  personastate: number
  lastlogoff?: number
}

interface SteamItem {
  id: string
  name: string
  icon_url: string
  rarity?: string
  exterior?: string
  type?: string
  weapon?: string
  tradable: boolean
  marketable: boolean
  price: number
  selected: boolean
}

interface InventoryResponse {
  success: boolean
  items: SteamItem[]
  totalValue: number
  totalItems: number
  steamId: string
  message?: string
}

interface ProfileResponse {
  success: boolean
  profile: SteamProfile
}

export default function SteamTestPage() {
  const [profile, setProfile] = useState<SteamProfile | null>(null)
  const [inventory, setInventory] = useState<SteamItem[]>([])
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [steamId, setSteamId] = useState('76561198000000000') // Default Steam ID
  const [totalValue, setTotalValue] = useState(0)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [tradableItems, setTradableItems] = useState<SteamItem[]>([])
  const [tradableLoading, setTradableLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authResult, setAuthResult] = useState<string>('')

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    try {
      // Check both backend and Steam server status
      const response = await fetch('http://localhost:3001/api/inventory/steam-status')
      if (response.ok) {
        const data = await response.json()
        setServerStatus(data.online ? 'online' : 'offline')
      } else {
        setServerStatus('offline')
      }
    } catch (error) {
      setServerStatus('offline')
    }
  }

  const fetchSteamProfile = async () => {
    if (!steamId.trim()) {
      setError('Please enter a valid Steam ID')
      return
    }

    setProfileLoading(true)
    setError('')
    
    try {
      const response = await fetch(`http://localhost:3001/api/inventory/profile/${steamId}`)
      
      if (response.ok) {
        const data: ProfileResponse = await response.json()
        if (data.success) {
          setProfile(data.profile)
        } else {
          setError('Failed to fetch Steam profile')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Steam profile not found or API error')
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure the backend is running on port 3001.')
      console.error('Steam Profile Error:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchSteamInventory = async () => {
    if (!steamId.trim()) {
      setError('Please enter a valid Steam ID')
      return
    }

    setInventoryLoading(true)
    setError('')
    
    try {
      const response = await fetch(`http://localhost:3001/api/inventory?steamId=${steamId}`)
      
      if (response.ok) {
        const data = await response.json()
        setInventory(data.items)
        setTotalValue(data.totalValue)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Steam inventory not found or private')
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure the backend is running on port 3001.')
      console.error('Steam Inventory Error:', err)
    } finally {
      setInventoryLoading(false)
    }
  }

  const fetchAllSteamData = async () => {
    setLoading(true)
    await Promise.all([fetchSteamProfile(), fetchSteamInventory()])
    setLoading(false)
  }

  const fetchTradableItems = async () => {
    if (!steamId.trim()) {
      setError('Please enter a valid Steam ID')
      return
    }

    setTradableLoading(true)
    setError('')
    
    try {
      const response = await fetch(`http://localhost:3001/api/inventory/tradable/${steamId}`)
      
      if (response.ok) {
        const data = await response.json()
        setTradableItems(data.items)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch tradable items')
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure the backend is running on port 3001.')
      console.error('Tradable Items Error:', err)
    } finally {
      setTradableLoading(false)
    }
  }

  const testSteamAuth = async () => {
    if (!steamId.trim()) {
      setError('Please enter a valid Steam ID')
      return
    }

    setAuthLoading(true)
    setError('')
    setAuthResult('')
    
    try {
      const response = await fetch('http://localhost:3001/api/steam-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steamId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAuthResult(`Authentication successful! User ID: ${data.user.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure the backend is running on port 3001.')
      console.error('Steam Auth Error:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'contraband': return 'text-red-500 border-red-500/30'
      case 'covert': return 'text-red-400 border-red-400/30'
      case 'classified': return 'text-pink-400 border-pink-400/30'
      case 'restricted': return 'text-purple-400 border-purple-400/30'
      case 'mil-spec': return 'text-blue-400 border-blue-400/30'
      case 'industrial grade': return 'text-gray-400 border-gray-400/30'
      case 'consumer grade': return 'text-gray-500 border-gray-500/30'
      default: return 'text-gray-400 border-gray-400/30'
    }
  }

  const getPersonaStateText = (state: number) => {
    switch (state) {
      case 0: return { text: 'Offline', color: 'text-gray-400' }
      case 1: return { text: 'Online', color: 'text-green-400' }
      case 2: return { text: 'Busy', color: 'text-yellow-400' }
      case 3: return { text: 'Away', color: 'text-orange-400' }
      case 4: return { text: 'Snooze', color: 'text-blue-400' }
      case 5: return { text: 'Looking to trade', color: 'text-purple-400' }
      case 6: return { text: 'Looking to play', color: 'text-green-500' }
      default: return { text: 'Unknown', color: 'text-gray-400' }
    }
  }

  const ServerStatusIndicator = () => (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-3 h-3 rounded-full ${
        serverStatus === 'online' ? 'bg-green-500' : 
        serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
      }`} />
      <span className="text-sm text-gray-300">
        Backend + Steam API: {
          serverStatus === 'online' ? 'Online' : 
          serverStatus === 'offline' ? 'Offline' : 'Checking...'
        }
      </span>
      {serverStatus === 'offline' && (
        <button
          onClick={checkServerStatus}
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          Retry
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SiSteam className="text-4xl text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Backend Steam Integration Test</h1>
                <p className="text-gray-400">Test backend Steam API integration and new endpoints</p>
              </div>
            </div>
            <ServerStatusIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="Enter Steam ID (17 digits) - e.g., 76561198000000000"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchSteamProfile}
                disabled={profileLoading || serverStatus === 'offline'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
                Profile
              </button>
              <button
                onClick={fetchSteamInventory}
                disabled={inventoryLoading || serverStatus === 'offline'}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {inventoryLoading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
                Inventory
              </button>
              <button
                onClick={fetchAllSteamData}
                disabled={loading || serverStatus === 'offline'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheckIcon className="w-4 h-4" />
                )}
                Both
              </button>
            </div>
          </div>

          {/* New Backend Integration Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={fetchTradableItems}
              disabled={tradableLoading || serverStatus === 'offline'}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {tradableLoading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CurrencyDollarIcon className="w-4 h-4" />
              )}
              Test Tradable Items Endpoint
            </button>
            <button
              onClick={testSteamAuth}
              disabled={authLoading || serverStatus === 'offline'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheckIcon className="w-4 h-4" />
              )}
                             Test Steam Authentication
             </button>
           </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
              >
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {authResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{authResult}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Steam Profile Section */}
            <AnimatePresence>
              {profile && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Steam Profile</h2>
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <img
                      src={profile.avatarfull}
                      alt={profile.personaname}
                      className="w-20 h-20 rounded-full border-2 border-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white mb-2 truncate">
                        {profile.personaname}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-400">
                          <span className="font-medium">Steam ID:</span> {profile.steamid}
                        </p>
                        <p className={getPersonaStateText(profile.personastate).color}>
                          <span className="font-medium text-gray-400">Status:</span> {getPersonaStateText(profile.personastate).text}
                        </p>
                        {profile.lastlogoff && (
                          <p className="text-gray-400">
                            <span className="font-medium">Last Online:</span> {new Date(profile.lastlogoff * 1000).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <a
                        href={profile.profileurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inventory Stats */}
            <AnimatePresence>
              {inventory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                    <h2 className="text-xl font-bold text-white">Inventory Stats</h2>
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {inventory.length}
                      </div>
                      <div className="text-sm text-gray-400">Total Items</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        ${totalValue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Total Value</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {inventory.filter(item => item.tradable).length}
                      </div>
                      <div className="text-sm text-gray-400">Tradable</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {inventory.filter(item => item.marketable).length}
                      </div>
                      <div className="text-sm text-gray-400">Marketable</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CS2 Inventory Grid */}
          <AnimatePresence>
            {inventory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gray-700/50 rounded-xl p-6 mt-6 border border-gray-600/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5 text-green-400" />
                    <h2 className="text-xl font-bold text-white">CS2 Inventory</h2>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                      {inventory.length} items
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Showing first 50 items
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {inventory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-gray-800/50 rounded-lg p-3 border hover:bg-gray-800/70 transition-all duration-200 ${getRarityColor(item.rarity)}`}
                    >
                      <div className="aspect-square mb-3 flex items-center justify-center bg-gray-900/50 rounded">
                        <img
                          src={item.icon_url}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="space-y-1">
                                                 <h3 className="text-white font-medium text-xs leading-tight overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                           {item.name}
                         </h3>
                        
                        {item.rarity && (
                          <p className={`text-xs font-medium ${getRarityColor(item.rarity).split(' ')[0]}`}>
                            {item.rarity}
                          </p>
                        )}
                        
                        {item.exterior && (
                          <p className="text-gray-400 text-xs">{item.exterior}</p>
                        )}
                        
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-green-400 font-semibold text-sm">
                            ${item.price.toFixed(2)}
                          </p>
                          <div className="flex gap-1">
                            {item.tradable && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full" title="Tradable" />
                            )}
                            {item.marketable && (
                              <div className="w-2 h-2 bg-green-400 rounded-full" title="Marketable" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tradable Items Section */}
          <AnimatePresence>
            {tradableItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gray-700/50 rounded-xl p-6 mt-6 border border-gray-600/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-orange-400" />
                    <h2 className="text-xl font-bold text-white">Tradable Items Only</h2>
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                      {tradableItems.length} items
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Backend filtered results
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tradableItems.slice(0, 24).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-gray-800/50 rounded-lg p-3 border hover:bg-gray-800/70 transition-all duration-200 ${getRarityColor(item.rarity)}`}
                    >
                      <div className="aspect-square mb-3 flex items-center justify-center bg-gray-900/50 rounded">
                        <img
                          src={item.icon_url}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-white font-medium text-xs leading-tight overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.name}
                        </h3>
                        
                        {item.rarity && (
                          <p className={`text-xs font-medium ${getRarityColor(item.rarity).split(' ')[0]}`}>
                            {item.rarity}
                          </p>
                        )}
                        
                        {item.exterior && (
                          <p className="text-gray-400 text-xs">{item.exterior}</p>
                        )}
                        
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-green-400 font-semibold text-sm">
                            ${item.price.toFixed(2)}
                          </p>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full" title="Tradable" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
} 