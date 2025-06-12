'use client'

import React, { useState } from 'react'
import { UserIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

const CoinFlipPage = () => {
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null)
  const [betAmount, setBetAmount] = useState('')

  const activeBattles = [
    {
      id: 1,
      creator: 'SkinMaster',
      amount: '$45.50',
      side: 'heads',
      avatar: '🎮',
      skins: 3,
      status: 'waiting'
    },
    {
      id: 2,
      creator: 'CSGOPro',
      amount: '$123.00',
      side: 'tails',
      avatar: '⚡',
      skins: 5,
      status: 'waiting'
    },
    {
      id: 3,
      creator: 'TradeKing',
      amount: '$78.25',
      side: 'heads',
      avatar: '💎',
      skins: 2,
      status: 'in_progress'
    }
  ]

  const recentBattles = [
    { id: 1, winner: 'Player1', loser: 'Player2', amount: '$89.50', result: 'heads', time: '2 min ago' },
    { id: 2, winner: 'CSGOKing', loser: 'SkinTrader', amount: '$156.00', result: 'tails', time: '5 min ago' },
    { id: 3, winner: 'ProGamer', loser: 'CasualPlayer', amount: '$67.25', result: 'heads', time: '8 min ago' },
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🪙 <span className="neon-text">Coin Flip</span>
          </h1>
          <p className="text-xl text-gray-300">
            Head-to-head battles with your CS:GO skins
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
                  onClick={() => setSelectedSide('heads')}
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
                  onClick={() => setSelectedSide('tails')}
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

              {/* Bet Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bet Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter bet amount ($)"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="gaming-input w-full"
                  />
                </div>
                
                <button 
                  className={`gaming-button w-full py-4 text-lg ${
                    !selectedSide || !betAmount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedSide || !betAmount}
                >
                  <FireIcon className="w-6 h-6 mr-2 inline" />
                  Create Battle ({selectedSide || 'Select Side'})
                </button>
              </div>
            </div>

            {/* Active Battles */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Active Battles</h3>
              <div className="space-y-4">
                {activeBattles.map((battle) => (
                  <div key={battle.id} className="bg-gaming-hover p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{battle.avatar}</span>
                        <div>
                          <div className="font-bold text-white">{battle.creator}</div>
                          <div className="text-sm text-gray-400">
                            {battle.skins} skins • {battle.side.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-accent-success font-bold text-lg">
                          {battle.amount}
                        </div>
                        {battle.status === 'waiting' ? (
                          <button className="gaming-button-secondary text-sm mt-2">
                            Join Battle
                          </button>
                        ) : (
                          <div className="flex items-center text-accent-warning text-sm mt-2">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            In Progress
                          </div>
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
                  <span className="text-gray-400">Total Pot:</span>
                  <span className="text-accent-success font-semibold">$3,247.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players Online:</span>
                  <span className="text-white">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Bet:</span>
                  <span className="text-white">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Bet:</span>
                  <span className="text-white">$500.00</span>
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
                        {battle.amount}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      vs {battle.loser} • {battle.time}
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
                  <span>Set your bet amount</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">3.</span>
                  <span>Create battle or join existing one</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">4.</span>
                  <span>Watch the coin flip and collect winnings!</span>
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