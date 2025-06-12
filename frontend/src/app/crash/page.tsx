'use client'

import React, { useState, useEffect } from 'react'
import { ArrowTrendingUpIcon, BoltIcon, ClockIcon, CubeIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api'

const CrashPage = () => {
  const { gameActions } = useSound()
  const { user, updateUser } = useUser()
  const [betAmount, setBetAmount] = useState(10)
  const [autoCashout, setAutoCashout] = useState('')
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00)
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting')
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameHistory, setGameHistory] = useState<Array<{round: string, multiplier: number, time: string}>>([])
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
        // Convert to crash history format
        const crashGames = response.games
          .filter((game: any) => game.gameType === 'crash')
          .slice(0, 10)
          .map((game: any) => ({
            round: `R#${game.id.slice(-4)}`,
            multiplier: game.multiplier || 0,
            time: getTimeAgo(game.timestamp)
          }))
        setGameHistory(crashGames)
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

  // Simulate game progression
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === 'running') {
      interval = setInterval(() => {
        setCurrentMultiplier(prev => {
          const increment = 0.01 + (Math.random() * 0.02)
          const newMultiplier = prev + increment
          
          // Dynamic crash probability
          const crashChance = Math.min(0.005 + (newMultiplier - 1) * 0.002, 0.05)
          
          if (Math.random() < crashChance) {
            setGameState('crashed')
            gameActions.crashExplosion()
            
            // Add to history
            setGameHistory(prev => [
              { round: `R#${Date.now()}`, multiplier: newMultiplier, time: 'Just now' },
              ...prev.slice(0, 9)
            ])
            
            setTimeout(() => {
              setGameState('waiting')
              setCurrentMultiplier(1.00)
              setIsPlaying(false)
              setCurrentGameId(null)
            }, 3000)
          }
          
          // Auto-cashout logic
          if (autoCashout && parseFloat(autoCashout) <= newMultiplier && isPlaying) {
            cashOut()
          }
          
          return Math.min(newMultiplier, 100)
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [gameState, autoCashout, isPlaying, gameActions])

  const startGame = async () => {
    if (gameState !== 'waiting' || !user || betAmount <= 0 || betAmount > user.balance) {
      return
    }

    setIsLoading(true)
    try {
      // Place bet on backend
      const response = await api.placeBet(user.id, 'crash', betAmount)
      if (response.success) {
        setCurrentGameId(response.game.id)
        updateUser(response.user) // Update user balance
        gameActions.placeBet()
        gameActions.crashTakeoff()
        setGameState('running')
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error starting game:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cashOut = async () => {
    if (gameState !== 'running' || !isPlaying || !currentGameId || !user) {
      return
    }

    setIsLoading(true)
    try {
      // Cash out with current multiplier
      const response = await api.placeBet(user.id, 'crash', betAmount, {
        multiplier: currentMultiplier
      })
      
      if (response.success) {
        const winnings = betAmount * currentMultiplier
        updateUser(response.user) // Update user balance
        
        if (winnings > 200) {
          gameActions.winBig()
        } else {
          gameActions.winSmall()
        }
        
        setIsPlaying(false)
        setCurrentGameId(null)
        
        // Reload game history
        loadGameHistory()
      }
    } catch (error) {
      console.error('Error cashing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick bet amount buttons
  const quickAmounts = [5, 10, 25, 50, 100]
  const quickMultipliers = [1.2, 1.5, 2.0, 3.0, 5.0, 10.0]

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to play Crash</h2>
          <p className="text-gray-400">You need to be logged in to place bets and track your progress.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Crash Game
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Watch the multiplier rise and cash out before it crashes!
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats */}
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
                    {user.stats.totalGames > 0 ? (user.stats.totalWon / user.stats.totalWagered * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Profit Rate</div>
                </div>
                <div className="gaming-card p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">${user.stats.totalWagered.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">Total Wagered</div>
                </div>
              </motion.div>
            )}

            {/* Game Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gaming-card p-8 relative overflow-hidden"
            >
              <div className="relative z-10 text-center mb-8">
                <motion.div
                  animate={{ 
                    scale: gameState === 'running' ? [1, 1.05, 1] : 1
                  }}
                  transition={{ duration: 0.5, repeat: gameState === 'running' ? Infinity : 0 }}
                  className={`text-6xl md:text-8xl font-bold mb-4 ${
                    gameState === 'crashed' ? 'text-red-500' : 
                    gameState === 'waiting' ? 'text-gray-400' : 'text-orange-400'
                  }`}
                >
                  {gameState === 'waiting' ? 'Waiting...' : `${currentMultiplier.toFixed(2)}x`}
                </motion.div>

                <div className={`text-xl font-medium ${
                  gameState === 'crashed' ? 'text-red-400' : 
                  gameState === 'waiting' ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {gameState === 'crashed' && 'CRASHED!'}
                  {gameState === 'waiting' && 'Ready to bet...'}
                  {gameState === 'running' && (isPlaying ? 'You are flying!' : 'Game in progress...')}
                </div>

                {gameState === 'running' && (
                  <div className="mt-6 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentMultiplier - 1) * 10, 100)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Betting Controls */}
            <div className="gaming-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Place Your Bet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                      min="1"
                      max={user.balance}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:border-orange-500"
                      disabled={gameState !== 'waiting' || isLoading}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        disabled={amount > user.balance || gameState !== 'waiting'}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          betAmount === amount
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Auto Cash Out</label>
                  <input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(e.target.value)}
                    placeholder="2.00"
                    min="1.1"
                    max="100"
                    step="0.1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-500"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickMultipliers.map((multiplier) => (
                      <button
                        key={multiplier}
                        onClick={() => setAutoCashout(multiplier.toString())}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          autoCashout === multiplier.toString()
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {multiplier}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {betAmount > user.balance && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-sm text-red-400">
                    ⚠️ Insufficient balance. Your balance is ${user.balance.toFixed(2)}
                  </div>
                </div>
              )}

              {betAmount > 0 && betAmount <= user.balance && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-sm text-blue-400">
                    💰 Potential winnings at 2x: ${(betAmount * 2).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Game Controls */}
            <div className="flex gap-4">
              {!isPlaying ? (
                <button
                  onClick={startGame}
                  disabled={gameState !== 'waiting' || betAmount <= 0 || betAmount > user.balance || isLoading}
                  className="flex-1 gaming-button text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '🔄 Placing Bet...' : 
                   gameState === 'waiting' ? 
                    (betAmount > 0 && betAmount <= user.balance ? `🚀 Start Game ($${betAmount})` : 'Set Valid Bet Amount') :
                    'Game in Progress'
                  }
                </button>
              ) : (
                <button
                  onClick={cashOut}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? '🔄 Cashing Out...' : `💰 Cash Out at ${currentMultiplier.toFixed(2)}x`}
                  <div className="text-sm opacity-75">
                    Win: ${(betAmount * currentMultiplier).toFixed(2)}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="gaming-card p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                Recent Crashes
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {gameHistory.length > 0 ? gameHistory.map((game, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-white">{game.round}</div>
                      <div className="text-xs text-gray-400">{game.time}</div>
                    </div>
                    <div className={`font-bold ${
                      game.multiplier < 2 ? 'text-red-400' :
                      game.multiplier < 5 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {game.multiplier.toFixed(2)}x
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 py-8">
                    <CubeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No crash history yet</p>
                    <p className="text-sm">Start playing to see your results!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrashPage
