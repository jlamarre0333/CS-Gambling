'use client'

import React, { useState, useEffect } from 'react'
import { UserIcon, ClockIcon, FireIcon, CubeIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'

const CoinFlipPage = () => {
  const { gameActions } = useSound()
  const { user, updateUser } = useUser()
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [showResult, setShowResult] = useState(false)

  // Load user's game history
  useEffect(() => {
    if (user) {
      loadGameHistory()
    }
  }, [user])

  const loadGameHistory = async () => {
    if (!user) return
    try {
      const response = await api.getGameHistory(user.id)
      if (response.success) {
        const coinflipGames = response.games
          .filter((game: any) => game.gameType === 'coinflip')
          .slice(0, 10)
          .map((game: any) => ({
            id: game.id,
            result: game.result,
            betAmount: game.betAmount,
            winAmount: game.winAmount,
            time: getTimeAgo(game.timestamp),
            playerChoice: game.gameData?.playerChoice || 'heads'
          }))
        setGameHistory(coinflipGames)
      }
    } catch (error) {
      console.error('Error loading game history:', error)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const gameTime = new Date(timestamp)
    const diffMs = now.getTime() - gameTime.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    
    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  const activeBattles = [
    {
      id: 1,
      creator: 'SkinMaster',
      totalValue: '$245.50',
      side: 'heads',
      avatar: '🎮',
      status: 'waiting'
    },
    {
      id: 2,
      creator: 'CSGOPro',
      totalValue: '$1,230.00',
      side: 'tails',
      avatar: '⚡',
      status: 'waiting'
    },
    {
      id: 3,
      creator: 'TradeKing',
      totalValue: '$478.25',
      side: 'heads',
      avatar: '💎',
      status: 'in_progress',
      opponent: 'SkinCollector'
    }
  ]

  const flipCoin = async () => {
    if (!selectedSide || !user || betAmount <= 0 || betAmount > user.balance) {
      return
    }

    setIsLoading(true)
    setIsFlipping(true)
    setShowResult(false)

    try {
      gameActions.coinFlip()
      
      // Simulate coin flip animation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Place bet on backend
      const response = await api.placeBet(user.id, 'coinflip', betAmount, {
        playerChoice: selectedSide
      })
      
      if (response.success) {
        const gameResult = response.game.result === 'win' ? selectedSide : (selectedSide === 'heads' ? 'tails' : 'heads')
        setResult(gameResult)
        updateUser(response.user)
        
        if (response.game.result === 'win') {
          gameActions.winBig()
        } else {
          gameActions.lose()
        }
        
        setShowResult(true)
        loadGameHistory()
        
        // Reset after showing result
        setTimeout(() => {
          setIsFlipping(false)
          setShowResult(false)
          setResult(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error flipping coin:', error)
      setIsFlipping(false)
    } finally {
      setIsLoading(false)
    }
  }

  const quickAmounts = [5, 10, 25, 50, 100]

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to play Coinflip</h2>
          <p className="text-gray-400">You need to be logged in to place bets and track your progress.</p>
          <div className="mt-6">
            <a href="/test-backend" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🪙 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Coin Flip</span>
          </h1>
          <p className="text-xl text-gray-300">
            Choose heads or tails and double your money!
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-xl font-bold text-green-400">${user.balance.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Level</div>
              <div className="text-xl font-bold text-blue-400">{user.level}</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats */}
            {user.stats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="gaming-card p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{user.stats.wins}/{user.stats.totalGames}</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="gaming-card p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">${user.stats.totalWon.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">Total Won</div>
                </div>
                <div className="gaming-card p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {user.stats.totalGames > 0 ? ((user.stats.wins / user.stats.totalGames) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Win Percentage</div>
                </div>
                <div className="gaming-card p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">${user.stats.totalWagered.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">Total Wagered</div>
                </div>
              </motion.div>
            )}

            {/* Coin Flip Game */}
            <div className="gaming-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Flip the Coin</h2>
              
              {/* Coin Animation */}
              <div className="text-center mb-8">
                <motion.div
                  animate={isFlipping ? { rotateY: [0, 180, 360, 540, 720] } : {}}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="inline-block text-8xl mb-4"
                >
                  {showResult ? (result === 'heads' ? '🟡' : '⚪') : '🪙'}
                </motion.div>
                
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold mb-2">
                      {result === selectedSide ? (
                        <span className="text-green-400">🎉 YOU WON!</span>
                      ) : (
                        <span className="text-red-400">💔 YOU LOST!</span>
                      )}
                    </div>
                    <div className="text-lg text-gray-300">
                      Result: {result?.toUpperCase()}
                    </div>
                    {result === selectedSide && (
                      <div className="text-lg text-green-400 font-bold">
                        Won: ${(betAmount * 2).toFixed(2)}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Coin Selection */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => {
                    if (!isFlipping) {
                      gameActions.buttonClick()
                      setSelectedSide('heads')
                    }
                  }}
                  disabled={isFlipping}
                  className={`
                    p-8 rounded-lg border-2 transition-all duration-300 group disabled:opacity-50
                    ${selectedSide === 'heads' 
                      ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20' 
                      : 'border-gray-600 bg-gray-800 hover:border-yellow-400/50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:animate-bounce">🟡</div>
                    <div className="text-2xl font-bold text-white mb-2">HEADS</div>
                    <div className="text-yellow-400 font-semibold">50% Chance</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!isFlipping) {
                      gameActions.buttonClick()
                      setSelectedSide('tails')
                    }
                  }}
                  disabled={isFlipping}
                  className={`
                    p-8 rounded-lg border-2 transition-all duration-300 group disabled:opacity-50
                    ${selectedSide === 'tails' 
                      ? 'border-gray-300 bg-gray-300/10 shadow-lg shadow-gray-300/20' 
                      : 'border-gray-600 bg-gray-800 hover:border-gray-300/50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:animate-bounce">⚪</div>
                    <div className="text-2xl font-bold text-white mb-2">TAILS</div>
                    <div className="text-gray-300 font-semibold">50% Chance</div>
                  </div>
                </button>
              </div>

              {/* Bet Amount */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    min="1"
                    max={user.balance}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:border-yellow-500"
                    disabled={isFlipping}
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={amount > user.balance || isFlipping}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        betAmount === amount
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    onClick={() => setBetAmount(Math.floor(user.balance / 2))}
                    disabled={isFlipping}
                    className="px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    Half
                  </button>
                  <button
                    onClick={() => setBetAmount(Math.floor(user.balance))}
                    disabled={isFlipping}
                    className="px-3 py-1 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Bet validation */}
              {betAmount > user.balance && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-sm text-red-400">
                    ⚠️ Insufficient balance. Your balance is ${user.balance.toFixed(2)}
                  </div>
                </div>
              )}

              {betAmount > 0 && betAmount <= user.balance && selectedSide && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-sm text-green-400">
                    💰 Potential winnings: ${(betAmount * 2).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Flip Button */}
              <button
                onClick={flipCoin}
                disabled={!selectedSide || betAmount <= 0 || betAmount > user.balance || isFlipping || isLoading}
                className="w-full gaming-button text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔄 Placing Bet...' : 
                 isFlipping ? '🪙 Flipping...' :
                 selectedSide && betAmount > 0 && betAmount <= user.balance ? 
                   `🚀 Flip ${selectedSide.toUpperCase()} ($${betAmount})` : 
                   'Select Side and Bet Amount'
                }
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Games */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="gaming-card p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                Recent Games
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {gameHistory.length > 0 ? gameHistory.map((game, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {game.playerChoice.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">{game.time}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${
                        game.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.result === 'win' ? '+' : '-'}${game.betAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        ${game.betAmount.toFixed(2)} bet
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 py-8">
                    <CubeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No games yet</p>
                    <p className="text-sm">Start flipping to see your history!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Active Battles */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="gaming-card p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-orange-400" />
                Active Battles
              </h3>
              <div className="space-y-3">
                {activeBattles.map((battle) => (
                  <div key={battle.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{battle.avatar}</span>
                        <span className="font-medium text-white">{battle.creator}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        battle.status === 'waiting' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {battle.status === 'waiting' ? 'Waiting' : 'In Progress'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        {battle.side.toUpperCase()} • {battle.totalValue}
                      </span>
                      {battle.status === 'waiting' && (
                        <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs">
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinFlipPage 