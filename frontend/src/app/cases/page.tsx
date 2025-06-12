'use client'

import React, { useState, useEffect } from 'react'
import { GiftIcon, CubeIcon, SparklesIcon, TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CaseSkin {
  name: string
  rarity: string
  value: number
  image?: string
  chance: number
}

interface CaseType {
  name: string
  price: number
  image: string
  skins: CaseSkin[]
}

const CaseOpeningPage = () => {
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [revealedSkin, setRevealedSkin] = useState<CaseSkin | null>(null)
  const [openingAnimation, setOpeningAnimation] = useState<'closed' | 'opening' | 'opened'>('closed')
  const [balance, setBalance] = useState(1247.85)

  const cases: CaseType[] = [
    {
      name: 'Chroma 3 Case',
      price: 2.50,
      image: '📦',
      skins: [
        { name: 'AK-47 Phantom Disruptor', rarity: 'Covert', value: 89.50, chance: 0.26 },
        { name: 'M4A1-S Chantico\'s Fire', rarity: 'Covert', value: 156.20, chance: 0.26 },
        { name: 'Galil AR Eco', rarity: 'Classified', value: 34.80, chance: 1.6 },
        { name: 'FAMAS Djinn', rarity: 'Classified', value: 12.45, chance: 1.6 },
        { name: 'P2000 Oceanic', rarity: 'Classified', value: 8.90, chance: 1.6 },
        { name: 'P250 Asiimov', rarity: 'Restricted', value: 6.20, chance: 3.2 },
        { name: 'Sawed-Off Fubar', rarity: 'Restricted', value: 4.50, chance: 3.2 },
        { name: 'UMP-45 Primal Saber', rarity: 'Restricted', value: 3.80, chance: 3.2 },
        { name: 'Dual Berettas Ventilators', rarity: 'Restricted', value: 2.90, chance: 3.2 },
        { name: 'CZ75-Auto Red Astor', rarity: 'Restricted', value: 1.80, chance: 3.2 },
        { name: 'MP9 Bioleak', rarity: 'Mil-Spec', value: 1.20, chance: 15.98 },
        { name: 'MAG-7 Counter Terrace', rarity: 'Mil-Spec', value: 0.95, chance: 15.98 },
        { name: 'G3SG1 Orange Crash', rarity: 'Mil-Spec', value: 0.75, chance: 15.98 },
        { name: 'Nova Gila', rarity: 'Mil-Spec', value: 0.60, chance: 15.98 },
        { name: 'Tec-9 Re-Entry', rarity: 'Mil-Spec', value: 0.45, chance: 15.98 }
      ]
    },
    {
      name: 'Prisma Case',
      price: 3.20,
      image: '💎',
      skins: [
        { name: 'AK-47 The Empress', rarity: 'Covert', value: 245.30, chance: 0.26 },
        { name: 'M4A4 The Emperor', rarity: 'Covert', value: 189.75, chance: 0.26 },
        { name: 'Desert Eagle Sunset Storm 弐', rarity: 'Classified', value: 67.40, chance: 1.6 },
        { name: 'R8 Revolver Skull Crusher', rarity: 'Classified', value: 45.60, chance: 1.6 },
        { name: 'XM1014 Incinegator', rarity: 'Classified', value: 23.80, chance: 1.6 },
        { name: 'AUG Momentum', rarity: 'Restricted', value: 8.90, chance: 3.2 },
        { name: 'P90 Off World', rarity: 'Restricted', value: 6.70, chance: 3.2 },
        { name: 'Five-SeveN Angry Mob', rarity: 'Restricted', value: 4.20, chance: 3.2 },
        { name: 'Tec-9 Bamboozle', rarity: 'Restricted', value: 3.50, chance: 3.2 },
        { name: 'SSG 08 Fever Dream', rarity: 'Restricted', value: 2.80, chance: 3.2 }
      ]
    },
    {
      name: 'Operation Bravo Case',
      price: 8.50,
      image: '🎖️',
      skins: [
        { name: 'AK-47 Fire Serpent', rarity: 'Covert', value: 1890.50, chance: 0.26 },
        { name: 'Desert Eagle Golden Koi', rarity: 'Covert', value: 456.80, chance: 0.26 },
        { name: 'USP-S Overgrowth', rarity: 'Classified', value: 234.60, chance: 1.6 },
        { name: 'P90 Emerald Dragon', rarity: 'Classified', value: 189.40, chance: 1.6 },
        { name: 'Galil AR Orange DDPAT', rarity: 'Classified', value: 156.20, chance: 1.6 },
        { name: 'P2000 Ocean Foam', rarity: 'Restricted', value: 78.90, chance: 3.2 },
        { name: 'Dual Berettas Black Limba', rarity: 'Restricted', value: 45.60, chance: 3.2 },
        { name: 'Mac-10 Graven', rarity: 'Restricted', value: 34.50, chance: 3.2 },
        { name: 'MP7 Anodized Navy', rarity: 'Restricted', value: 23.40, chance: 3.2 },
        { name: 'Nova Tempest', rarity: 'Restricted', value: 18.70, chance: 3.2 }
      ]
    },
    {
      name: 'Clutch Case',
      price: 1.80,
      image: '⚡',
      skins: [
        { name: 'AK-47 Neon Rider', rarity: 'Covert', value: 234.50, chance: 0.26 },
        { name: 'USP-S Cortex', rarity: 'Covert', value: 178.90, chance: 0.26 },
        { name: 'MP7 Bloodsport', rarity: 'Classified', value: 89.40, chance: 1.6 },
        { name: 'Glock-18 Moonrise', rarity: 'Classified', value: 67.80, chance: 1.6 },
        { name: 'M4A4 Neo-Noir', rarity: 'Classified', value: 45.90, chance: 1.6 },
        { name: 'CZ75-Auto Red Astor', rarity: 'Restricted', value: 12.30, chance: 3.2 },
        { name: 'Negev Loudmouth', rarity: 'Restricted', value: 8.90, chance: 3.2 },
        { name: 'R8 Revolver Grip', rarity: 'Restricted', value: 6.40, chance: 3.2 },
        { name: 'FAMAS Mecha Industries', rarity: 'Restricted', value: 4.20, chance: 3.2 },
        { name: 'SG 553 Phantom', rarity: 'Restricted', value: 2.80, chance: 3.2 }
      ]
    }
  ]

  const recentDrops = [
    { user: 'SkinMaster', item: 'AK-47 Fire Serpent', value: 1890.50, time: '2 min ago', avatar: '👑' },
    { user: 'CSGOPro', item: 'Desert Eagle Golden Koi', value: 456.80, time: '5 min ago', avatar: '⚡' },
    { user: 'TradeKing', item: 'M4A1-S Chantico\'s Fire', value: 156.20, time: '8 min ago', avatar: '💎' },
    { user: 'GamerX', item: 'AK-47 The Empress', value: 245.30, time: '12 min ago', avatar: '🔥' },
    { user: 'ProPlayer', item: 'USP-S Cortex', value: 178.90, time: '15 min ago', avatar: '🎮' }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Covert': return 'border-red-500 bg-red-500/20 text-red-400'
      case 'Classified': return 'border-pink-500 bg-pink-500/20 text-pink-400'
      case 'Restricted': return 'border-purple-500 bg-purple-500/20 text-purple-400'
      case 'Mil-Spec': return 'border-blue-500 bg-blue-500/20 text-blue-400'
      default: return 'border-gray-500 bg-gray-500/20 text-gray-400'
    }
  }

  const openCase = async (caseType: CaseType) => {
    if (balance < caseType.price) {
      alert('Insufficient balance!')
      return
    }

    setSelectedCase(caseType)
    setIsOpening(true)
    setOpeningAnimation('opening')
    setBalance(prev => prev - caseType.price)

    // Simulate opening animation
    setTimeout(() => {
      // Calculate random skin based on rarity chances
      const random = Math.random() * 100
      let cumulativeChance = 0
      let selectedSkin = caseType.skins[caseType.skins.length - 1] // Default to most common

      for (const skin of caseType.skins) {
        cumulativeChance += skin.chance
        if (random <= cumulativeChance) {
          selectedSkin = skin
          break
        }
      }

      setRevealedSkin(selectedSkin)
      setOpeningAnimation('opened')
      setBalance(prev => prev + selectedSkin.value)
      
      setTimeout(() => {
        setIsOpening(false)
        setOpeningAnimation('closed')
        setRevealedSkin(null)
        setSelectedCase(null)
      }, 4000)
    }, 3000)
  }

  const closeModal = () => {
    setIsOpening(false)
    setOpeningAnimation('closed')
    setRevealedSkin(null)
    setSelectedCase(null)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📦 <span className="neon-text">Case Opening</span>
          </h1>
          <p className="text-xl text-gray-300">
            Open CS2 cases and unbox legendary skins!
          </p>
          <div className="mt-4 text-lg">
            <span className="text-gray-400">Balance: </span>
            <span className="text-accent-success font-bold">${balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cases */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {cases.map((caseType, index) => (
                <div key={index} className="gaming-card p-6 text-center hover:transform hover:scale-105 transition-all duration-200">
                  <div className="text-6xl mb-4">{caseType.image}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{caseType.name}</h3>
                  <div className="text-accent-success font-bold text-lg mb-4">
                    ${caseType.price.toFixed(2)}
                  </div>
                  
                  {/* Sample Skins Preview */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Contains:</div>
                    <div className="space-y-1">
                      {caseType.skins.slice(0, 3).map((skin, idx) => (
                        <div key={idx} className={`text-xs p-1 rounded ${getRarityColor(skin.rarity)}`}>
                          {skin.name}
                        </div>
                      ))}
                      {caseType.skins.length > 3 && (
                        <div className="text-xs text-gray-400">+{caseType.skins.length - 3} more items</div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => openCase(caseType)}
                    disabled={balance < caseType.price || isOpening}
                    className={`gaming-button w-full ${
                      balance < caseType.price || isOpening ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <GiftIcon className="w-5 h-5 mr-2 inline" />
                    Open Case
                  </button>
                </div>
              ))}
            </div>

            {/* How it Works */}
            <div className="gaming-card p-6">
              <h3 className="text-2xl font-bold text-white mb-4">🎯 How Case Opening Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-accent-primary mb-2">Rarity System</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">Covert (Red)</span>
                      <span className="text-gray-400">0.26%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-400">Classified (Pink)</span>
                      <span className="text-gray-400">1.6%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400">Restricted (Purple)</span>
                      <span className="text-gray-400">3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400">Mil-Spec (Blue)</span>
                      <span className="text-gray-400">15.98%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-accent-primary mb-2">Fair System</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>• Provably fair random generation</div>
                    <div>• Transparent drop rates</div>
                    <div>• Instant skin credit to balance</div>
                    <div>• No hidden algorithms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Drops */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎉 Recent Drops</h3>
              <div className="space-y-3">
                {recentDrops.map((drop, index) => (
                  <div key={index} className="p-3 bg-gaming-hover rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{drop.avatar}</span>
                      <span className="font-semibold text-white text-sm">{drop.user}</span>
                    </div>
                    <div className="text-xs text-gray-300 mb-1">{drop.item}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-accent-success font-semibold text-sm">
                        ${drop.value.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">{drop.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Bonus */}
            <div className="gaming-card p-6 text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-bold text-white mb-2">Daily Bonus</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get a free case every 24 hours!
              </p>
              <button className="gaming-button w-full">
                <TrophyIcon className="w-5 h-5 mr-2 inline" />
                Claim Bonus
              </button>
            </div>

            {/* Statistics */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Your Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cases Opened:</span>
                  <span className="text-white">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Drop:</span>
                  <span className="text-accent-success">$1,890.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Spent:</span>
                  <span className="text-accent-warning">$456.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Won:</span>
                  <span className="text-accent-success">$789.45</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-400">Profit:</span>
                  <span className="text-green-400">+$333.15</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Modal */}
        {isOpening && selectedCase && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gaming-card border border-gaming-border rounded-lg p-8 max-w-md w-full text-center">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-4">Opening {selectedCase.name}</h3>
              
              {openingAnimation === 'opening' && (
                <div className="mb-6">
                  <div className="text-8xl animate-bounce mb-4">{selectedCase.image}</div>
                  <div className="text-lg text-accent-primary animate-pulse">Opening case...</div>
                  <div className="mt-4">
                    <div className="w-full bg-gaming-dark rounded-full h-2">
                      <div className="bg-accent-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {openingAnimation === 'opened' && revealedSkin && (
                <div className="animate-bounce-in">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className={`p-4 rounded-lg border-2 mb-4 ${getRarityColor(revealedSkin.rarity)}`}>
                    <div className="text-xl font-bold mb-2">{revealedSkin.name}</div>
                    <div className="text-lg font-semibold">${revealedSkin.value.toFixed(2)}</div>
                    <div className="text-sm opacity-75">{revealedSkin.rarity}</div>
                  </div>
                  <div className="text-accent-success font-bold text-lg">
                    Added to your balance!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CaseOpeningPage 