'use client'

import React, { useState, useEffect } from 'react'
import { ArrowTrendingUpIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/outline'

const CrashPage = () => {
  const [betAmount, setBetAmount] = useState('')
  const [autoCashout, setAutoCashout] = useState('')
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00)
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting')
  const [isPlaying, setIsPlaying] = useState(false)

  // Simulate game progression
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === 'running') {
      interval = setInterval(() => {
        setCurrentMultiplier(prev => {
          const newMultiplier = prev + 0.01
          // Random crash between 1.1x and 10x for demo
          if (Math.random() < 0.02) {
            setGameState('crashed')
            setTimeout(() => {
              setGameState('waiting')
              setCurrentMultiplier(1.00)
              setIsPlaying(false)
            }, 3000)
          }
          return Math.min(newMultiplier, 50)
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [gameState])

  const activePlayers = [
    { user: 'Player1', bet: '$25.50', multiplier: '2.45x', avatar: '🎮', cashed: true },
    { user: 'CSGOPro', bet: '$89.00', multiplier: 'Flying...', avatar: '⚡', cashed: false },
    { user: 'SkinTrader', bet: '$45.75', multiplier: '1.89x', avatar: '💎', cashed: true },
    { user: 'GamerX', bet: '$156.00', multiplier: 'Flying...', avatar: '🔥', cashed: false },
    { user: 'TradeKing', bet: '$78.25', multiplier: 'Flying...', avatar: '👑', cashed: false },
  ]

  const gameHistory = [
    { round: 'R#1247', multiplier: '3.45x', time: '30s ago' },
    { round: 'R#1246', multiplier: '1.23x', time: '1m ago' },
    { round: 'R#1245', multiplier: '8.91x', time: '2m ago' },
    { round: 'R#1244', multiplier: '2.67x', time: '3m ago' },
    { round: 'R#1243', multiplier: '1.45x', time: '4m ago' },
  ]

  const startGame = () => {
    if (gameState === 'waiting') {
      setGameState('running')
      setIsPlaying(true)
    }
  }

  const cashOut = () => {
    if (gameState === 'running' && isPlaying) {
      setIsPlaying(false)
      // Calculate winnings here
    }
  }

  const getMultiplierColor = () => {
    if (currentMultiplier < 2) return 'text-green-400'
    if (currentMultiplier < 5) return 'text-yellow-400'
    if (currentMultiplier < 10) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📈 <span className="neon-text">Crash</span>
          </h1>
          <p className="text-xl text-gray-300">
            Watch the multiplier rise and cash out before it crashes!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Display */}
            <div className="gaming-card p-6">
              <div className="text-center mb-6">
                <div className={`text-8xl font-bold mb-4 ${getMultiplierColor()} ${
                  gameState === 'running' ? 'animate-pulse' : ''
                }`}>
                  {currentMultiplier.toFixed(2)}x
                </div>
                
                {gameState === 'waiting' && (
                  <div className="text-2xl text-gray-400 mb-4">
                    Waiting for next round...
                  </div>
                )}
                
                {gameState === 'running' && (
                  <div className="text-2xl text-accent-primary mb-4">
                    🚀 Flying!
                  </div>
                )}
                
                {gameState === 'crashed' && (
                  <div className="text-4xl text-red-500 animate-bounce mb-4">
                    💥 CRASHED!
                  </div>
                )}
              </div>

              {/* Game Graph */}
              <div className="bg-gaming-darker p-6 rounded-lg mb-6">
                <div className="h-48 flex items-end justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    {gameState === 'waiting' && '📊 Graph will appear during game'}
                    {gameState === 'running' && (
                      <div className="w-full h-full relative">
                        <div 
                          className="absolute bottom-0 left-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-t"
                          style={{ 
                            width: `${Math.min(currentMultiplier * 10, 100)}%`, 
                            height: `${Math.min(currentMultiplier * 20, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                    {gameState === 'crashed' && '💥 Game Over'}
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      disabled={gameState === 'running'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Auto Cash Out (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2.00"
                      value={autoCashout}
                      onChange={(e) => setAutoCashout(e.target.value)}
                      className="gaming-input w-full"
                      disabled={gameState === 'running'}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  {gameState === 'waiting' && (
                    <button 
                      onClick={startGame}
                      className={`gaming-button py-4 text-lg ${
                        !betAmount ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={!betAmount}
                    >
                      <ArrowTrendingUpIcon className="w-6 h-6 mr-2 inline" />
                      Place Bet
                    </button>
                  )}
                  
                  {gameState === 'running' && isPlaying && (
                    <button 
                      onClick={cashOut}
                      className="bg-accent-success hover:bg-accent-success/80 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105"
                    >
                      <BoltIcon className="w-6 h-6 mr-2 inline" />
                      Cash Out ({currentMultiplier.toFixed(2)}x)
                    </button>
                  )}
                  
                  {gameState === 'running' && !isPlaying && (
                    <div className="text-center text-gray-400 py-4">
                      You're not playing this round
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Players */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Current Players
              </h3>
              <div className="space-y-3">
                {activePlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gaming-hover rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{player.avatar}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{player.user}</div>
                        <div className="text-xs text-gray-400">{player.bet}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      player.cashed ? 'text-accent-success' : 'text-accent-warning'
                    }`}>
                      {player.multiplier}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game History */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Crashes</h3>
              <div className="space-y-2">
                {gameHistory.map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gaming-hover rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        parseFloat(game.multiplier) < 2 ? 'bg-red-600' : 
                        parseFloat(game.multiplier) < 5 ? 'bg-yellow-600' : 'bg-green-600'
                      } text-white`}>
                        {game.multiplier}
                      </div>
                      <span className="text-gray-400 text-sm">{game.time}</span>
                    </div>
                    <span className="text-white text-sm">{game.round}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Info */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Round:</span>
                  <span className="text-accent-primary font-semibold">R#1248</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Bet:</span>
                  <span className="text-accent-success font-semibold">$1,247.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">House Edge:</span>
                  <span className="text-white">1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Bet:</span>
                  <span className="text-white">$1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Bet:</span>
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

export default CrashPage 