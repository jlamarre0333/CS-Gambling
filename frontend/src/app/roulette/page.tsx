'use client'

import React, { useState } from 'react'
import { ClockIcon, UserIcon, CubeIcon } from '@heroicons/react/24/outline'

const RoulettePage = () => {
  const [selectedBet, setSelectedBet] = useState<string | null>(null)
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null)
  
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    ...Array.from({ length: 14 }, (_, i) => ({ number: i + 1, color: 'red' })),
    ...Array.from({ length: 14 }, (_, i) => ({ number: i + 15, color: 'black' }))
  ]

  const recentGames = [
    { id: 1, result: 7, color: 'red', time: '2 min ago' },
    { id: 2, result: 23, color: 'black', time: '5 min ago' },
    { id: 3, result: 0, color: 'green', time: '8 min ago' },
    { id: 4, result: 12, color: 'red', time: '11 min ago' },
    { id: 5, result: 19, color: 'black', time: '14 min ago' },
  ]

  const currentBets = [
    { user: 'Player1', skin: 'AK-47 Redline', value: '$45.50', bet: 'Red', avatar: '🎮' },
    { user: 'CSGOPro', skin: 'AWP Lightning Strike', value: '$123.00', bet: 'Black', avatar: '⚡' },
    { user: 'SkinTrader', skin: 'Karambit Fade', value: '$780.25', bet: '0', avatar: '💎' },
    { user: 'GamerX', skin: 'M4A4 Howl', value: '$1,890.00', bet: 'Red', avatar: '🔥' },
  ]

  const userSkins = [
    { name: 'AK-47 Redline', value: 45.50, condition: 'Field-Tested' },
    { name: 'AWP Dragon Lore', value: 2450.00, condition: 'Battle-Scarred' },
    { name: 'Glock-18 Fade', value: 125.75, condition: 'Factory New' },
    { name: 'Desert Eagle Blaze', value: 89.30, condition: 'Minimal Wear' },
    { name: 'M4A1-S Hot Rod', value: 156.80, condition: 'Factory New' },
  ]

  const getBetColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-600'
      case 'black': return 'bg-gray-800'
      case 'green': return 'bg-green-600'
      default: return 'bg-gray-600'
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 <span className="neon-text">Roulette</span>
          </h1>
          <p className="text-xl text-gray-300">
            Classic casino roulette with CS2 skins
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Status */}
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Current Round</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-accent-primary">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span className="font-mono text-lg">00:15</span>
                  </div>
                  <div className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm font-semibold">
                    BETTING
                  </div>
                </div>
              </div>
              
              {/* Roulette Wheel */}
              <div className="relative">
                <div className="w-80 h-80 mx-auto bg-gaming-darker rounded-full border-4 border-accent-primary shadow-neon relative overflow-hidden">
                  <div className="absolute inset-4 bg-gradient-gaming rounded-full flex items-center justify-center">
                    <div className="text-6xl font-bold text-accent-primary animate-pulse">
                      ?
                    </div>
                  </div>
                  {/* Spinning indicator */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-accent-primary"></div>
                </div>
              </div>
            </div>

            {/* Betting Options */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>
              
              {/* Number Grid */}
              <div className="grid grid-cols-15 gap-1 mb-6">
                {rouletteNumbers.map((num) => (
                  <button
                    key={num.number}
                    onClick={() => setSelectedBet(num.number.toString())}
                    className={`
                      w-8 h-8 rounded text-white text-xs font-bold transition-all duration-200 
                      ${getBetColor(num.color)}
                      ${selectedBet === num.number.toString() ? 'ring-2 ring-accent-primary scale-110' : 'hover:scale-105'}
                    `}
                  >
                    {num.number}
                  </button>
                ))}
              </div>

              {/* Color Bets */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setSelectedBet('red')}
                  className={`
                    gaming-card p-4 bg-red-600/20 border-red-600 hover:bg-red-600/30 transition-all
                    ${selectedBet === 'red' ? 'ring-2 ring-accent-primary' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">RED</div>
                    <div className="text-sm text-gray-400">2x Payout</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedBet('black')}
                  className={`
                    gaming-card p-4 bg-gray-600/20 border-gray-600 hover:bg-gray-600/30 transition-all
                    ${selectedBet === 'black' ? 'ring-2 ring-accent-primary' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-300 mb-1">BLACK</div>
                    <div className="text-sm text-gray-400">2x Payout</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedBet('green')}
                  className={`
                    gaming-card p-4 bg-green-600/20 border-green-600 hover:bg-green-600/30 transition-all
                    ${selectedBet === 'green' ? 'ring-2 ring-accent-primary' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">GREEN</div>
                    <div className="text-sm text-gray-400">14x Payout</div>
                  </div>
                </button>
              </div>

              {/* Skin Selection */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-3">Select Skin to Bet</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {userSkins.map((skin, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSkin(skin.name)}
                      className={`
                        p-3 rounded-lg border transition-all text-left
                        ${selectedSkin === skin.name 
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

              {/* Place Bet Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {selectedBet && selectedSkin && (
                    <>Betting {selectedSkin} (${userSkins.find(s => s.name === selectedSkin)?.value.toFixed(2)}) on {selectedBet.toUpperCase()}</>
                  )}
                </div>
                <button 
                  className="gaming-button px-8"
                  disabled={!selectedBet || !selectedSkin}
                >
                  Place Bet
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bets */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Live Bets
              </h3>
              <div className="space-y-3">
                {currentBets.map((bet, index) => (
                  <div key={index} className="p-3 bg-gaming-hover rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{bet.avatar}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{bet.user}</div>
                        <div className="text-xs text-gray-400">betting on {bet.bet}</div>
                      </div>
                    </div>
                    <div className="ml-11">
                      <div className="text-sm text-gray-300 truncate">{bet.skin}</div>
                      <div className="text-accent-success font-semibold text-sm">{bet.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Results */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
              <div className="space-y-2">
                {recentGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-2 bg-gaming-hover rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${getBetColor(game.color)} flex items-center justify-center text-white font-bold text-sm`}>
                        {game.result}
                      </div>
                      <span className="text-gray-400 text-sm">{game.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Info */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pot Value:</span>
                  <span className="text-accent-success font-semibold">$2,457.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skins in Pot:</span>
                  <span className="text-white">18 items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white">234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">House Edge:</span>
                  <span className="text-white">2.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Bet Value:</span>
                  <span className="text-white">$1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Bet Value:</span>
                  <span className="text-white">$1,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoulettePage 