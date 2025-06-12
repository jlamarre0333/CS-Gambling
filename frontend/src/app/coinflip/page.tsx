'use client'

import React, { useState } from 'react'
import { UserIcon, ClockIcon, FireIcon, CubeIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'

const CoinFlipPage = () => {
  const { gameActions } = useSound()
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null)
  const [selectedSkins, setSelectedSkins] = useState<string[]>([])

  const activeBattles = [
    {
      id: 1,
      creator: 'SkinMaster',
      totalValue: '$245.50',
      side: 'heads',
      avatar: '🎮',
      skins: ['AK-47 Redline', 'AWP Lightning Strike', 'Glock Fade'],
      status: 'waiting'
    },
    {
      id: 2,
      creator: 'CSGOPro',
      totalValue: '$1,230.00',
      side: 'tails',
      avatar: '⚡',
      skins: ['Dragon Lore AWP', 'Karambit Doppler', 'M4A4 Howl', 'Desert Eagle Blaze', 'AK-47 Fire Serpent'],
      status: 'waiting'
    },
    {
      id: 3,
      creator: 'TradeKing',
      totalValue: '$478.25',
      side: 'heads',
      avatar: '💎',
      skins: ['Butterfly Knife', 'USP-S Kill Confirmed'],
      status: 'in_progress',
      opponent: 'SkinCollector'
    }
  ]

  const recentBattles = [
    { 
      id: 1, 
      winner: 'Player1', 
      loser: 'Player2', 
      totalValue: '$189.50', 
      result: 'heads', 
      time: '2 min ago',
      winnerSkins: ['AK-47 Redline', 'AWP Lightning Strike'],
      loserSkins: ['Glock Fade', 'Desert Eagle Blaze']
    },
    { 
      id: 2, 
      winner: 'CSGOKing', 
      loser: 'SkinTrader', 
      totalValue: '$756.00', 
      result: 'tails', 
      time: '5 min ago',
      winnerSkins: ['Dragon Lore AWP'],
      loserSkins: ['Karambit Doppler', 'M4A4 Howl']
    },
    { 
      id: 3, 
      winner: 'ProGamer', 
      loser: 'CasualPlayer', 
      totalValue: '$267.25', 
      result: 'heads', 
      time: '8 min ago',
      winnerSkins: ['Butterfly Knife'],
      loserSkins: ['AK-47 Fire Serpent', 'USP-S Kill Confirmed']
    },
  ]

  const userSkins = [
    { name: 'AK-47 Redline', value: 45.50, condition: 'Field-Tested' },
    { name: 'AWP Dragon Lore', value: 2450.00, condition: 'Battle-Scarred' },
    { name: 'Glock-18 Fade', value: 125.75, condition: 'Factory New' },
    { name: 'Desert Eagle Blaze', value: 89.30, condition: 'Minimal Wear' },
    { name: 'M4A1-S Hot Rod', value: 156.80, condition: 'Factory New' },
    { name: 'Karambit Doppler', value: 750.00, condition: 'Factory New' },
    { name: 'AWP Lightning Strike', value: 123.45, condition: 'Minimal Wear' },
  ]

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

  const toggleSkinSelection = (skinName: string) => {
    gameActions.buttonClick()
    setSelectedSkins(prev => 
      prev.includes(skinName) 
        ? prev.filter(s => s !== skinName)
        : [...prev, skinName]
    )
  }

  const getTotalSelectedValue = () => {
    return selectedSkins.reduce((total, skinName) => {
      const skin = userSkins.find(s => s.name === skinName)
      return total + (skin?.value || 0)
    }, 0)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🪙 <span className="neon-text">Coin Flip</span>
          </h1>
          <p className="text-xl text-gray-300">
            Head-to-head battles with your CS2 skins
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Battle */}
            <div className="gaming-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Create Battle</h2>
              
              {/* Coin Selection */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => {
                    gameActions.coinFlip()
                    setSelectedSide('heads')
                  }}
                  className={`
                    p-8 rounded-lg border-2 transition-all duration-300 group
                    ${selectedSide === 'heads' 
                      ? 'border-accent-primary bg-accent-primary/10 shadow-neon' 
                      : 'border-gaming-border bg-gaming-hover hover:border-accent-primary/50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:animate-bounce">🟡</div>
                    <div className="text-2xl font-bold text-white mb-2">HEADS</div>
                    <div className="text-accent-primary font-semibold">50% Chance</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    gameActions.coinFlip()
                    setSelectedSide('tails')
                  }}
                  className={`
                    p-8 rounded-lg border-2 transition-all duration-300 group
                    ${selectedSide === 'tails' 
                      ? 'border-accent-primary bg-accent-primary/10 shadow-neon' 
                      : 'border-gaming-border bg-gaming-hover hover:border-accent-primary/50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:animate-bounce">⚪</div>
                    <div className="text-2xl font-bold text-white mb-2">TAILS</div>
                    <div className="text-accent-primary font-semibold">50% Chance</div>
                  </div>
                </button>
              </div>

              {/* Skin Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Skins to Bet ({selectedSkins.length} selected)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {userSkins.map((skin, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSkinSelection(skin.name)}
                        className={`
                          p-3 rounded-lg border transition-all text-left
                          ${selectedSkins.includes(skin.name)
                            ? 'border-accent-primary bg-accent-primary/10' 
                            : 'border-gray-600 bg-gaming-darker hover:bg-gaming-hover'
                          }
                        `}
                      >
                        <div className="font-semibold text-white text-sm">{skin.name}</div>
                        <div className={`text-xs ${getConditionColor(skin.condition)}`}>
                          {skin.condition}
                        </div>
                        <div className="text-accent-success font-semibold text-sm">
                          ${skin.value.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Value Display */}
                {selectedSkins.length > 0 && (
                  <div className="bg-gaming-darker p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Battle Value:</span>
                      <span className="text-accent-success font-bold text-lg">
                        ${getTotalSelectedValue().toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedSkins.length} skin{selectedSkins.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                )}
                
                <button 
                  className={`gaming-button w-full py-4 text-lg ${
                    !selectedSide || selectedSkins.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedSide || selectedSkins.length === 0}
                >
                  <FireIcon className="w-6 h-6 mr-2 inline" />
                  Create Battle ({selectedSide || 'Select Side'}) - ${getTotalSelectedValue().toFixed(2)}
                </button>
              </div>
            </div>

            {/* Active Battles */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Active Battles</h3>
              <div className="space-y-4">
                {activeBattles.map((battle) => (
                  <div key={battle.id} className="bg-gaming-hover p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{battle.avatar}</span>
                        <div>
                          <div className="font-bold text-white">{battle.creator}</div>
                          <div className="text-sm text-gray-400">
                            {battle.skins.length} skin{battle.skins.length !== 1 ? 's' : ''} • {battle.side.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-accent-success font-bold text-lg">
                          {battle.totalValue}
                        </div>
                        {battle.status === 'waiting' ? (
                          <button className="gaming-button-secondary text-sm mt-2">
                            Join Battle
                          </button>
                        ) : (
                          <div className="flex items-center text-accent-warning text-sm mt-2">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            vs {battle.opponent}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Battle Skins Preview */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-xs text-gray-500 mb-1">Skins in battle:</div>
                      <div className="flex flex-wrap gap-1">
                        {battle.skins.slice(0, 3).map((skin, idx) => (
                          <span key={idx} className="text-xs bg-gaming-dark/50 px-2 py-1 rounded text-gray-300">
                            {skin}
                          </span>
                        ))}
                        {battle.skins.length > 3 && (
                          <span className="text-xs text-gray-400">+{battle.skins.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Game Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Battles:</span>
                  <span className="text-accent-primary font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pot Value:</span>
                  <span className="text-accent-success font-semibold">$3,247.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skins in Play:</span>
                  <span className="text-white">47 items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players Online:</span>
                  <span className="text-white">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Bet Value:</span>
                  <span className="text-white">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Bet Value:</span>
                  <span className="text-white">$2,500.00</span>
                </div>
              </div>
            </div>

            {/* Recent Battles */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Battles</h3>
              <div className="space-y-3">
                {recentBattles.map((battle) => (
                  <div key={battle.id} className="p-3 bg-gaming-hover rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          battle.result === 'heads' ? 'bg-yellow-500 text-yellow-900' : 'bg-gray-300 text-gray-800'
                        }`}>
                          {battle.result === 'heads' ? 'H' : 'T'}
                        </div>
                        <span className="text-accent-success text-sm font-semibold">
                          {battle.winner}
                        </span>
                      </div>
                      <span className="text-accent-success font-semibold text-sm">
                        {battle.totalValue}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      vs {battle.loser} • {battle.time}
                    </div>
                    <div className="text-xs text-gray-500">
                      Won: {battle.winnerSkins.slice(0, 2).join(', ')}
                      {battle.winnerSkins.length > 2 && ` +${battle.winnerSkins.length - 2} more`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Play */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">1.</span>
                  <span>Choose heads or tails</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">2.</span>
                  <span>Select CS2 skins to bet</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">3.</span>
                  <span>Create battle or join existing one</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">4.</span>
                  <span>Watch the coin flip and collect all skins!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinFlipPage 