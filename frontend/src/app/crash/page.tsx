'use client'

import React, { useState, useEffect } from 'react'
import { ArrowTrendingUpIcon, BoltIcon, ClockIcon, CubeIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Load user's game history
  useEffect(() => {
    if (user) {
      loadGameHistory()
    }
  }, [user])

  const loadGameHistory = async () => {
    if (!user) return
    try {
      const response = await api.getGameHistory(user.id) as any
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
            
            setShowToast({
              type: 'error',
              message: `💥 Crashed at ${newMultiplier.toFixed(2)}x!`
            })
            
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
      const response = await api.placeBet(user.id, 'crash', betAmount) as any
      if (response.success) {
        setCurrentGameId(response.game.id)
        updateUser(response.user) // Update user balance
        gameActions.placeBet()
        gameActions.crashTakeoff()
        setGameState('running')
        setIsPlaying(true)
        
        setShowToast({
          type: 'success',
          message: `🚀 Game started! Bet: $${betAmount}`
        })
      }
    } catch (error) {
      console.error('Error starting game:', error)
      setShowToast({
        type: 'error',
        message: 'Failed to start game. Please try again.'
      })
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
      }) as any
      
      if (response.success) {
        const winnings = betAmount * currentMultiplier
        updateUser(response.user) // Update user balance
        
        setShowToast({
          type: 'success',
          message: `💰 Cashed out at ${currentMultiplier.toFixed(2)}x! Won $${winnings.toFixed(2)}`
        })
        
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
      setShowToast({
        type: 'error',
        message: 'Failed to cash out. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Quick bet amount buttons
  const quickAmounts = [5, 10, 25, 50, 100]
  const quickMultipliers = [1.2, 1.5, 2.0, 3.0, 5.0, 10.0]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white flex items-center justify-center p-4">
        <EnhancedCard variant="glow" className="text-center max-w-md w-full">
          <div className="p-8">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-4">Please log in to play Crash</h2>
            <p className="text-gray-400 mb-6">You need to be logged in to place bets and track your progress.</p>
            <EnhancedButton 
              variant="primary" 
              size="lg"
              onClick={() => { window.location.href = '/test-backend' }}
              className="w-full"
            >
              Go to Login Page
            </EnhancedButton>
          </div>
        </EnhancedCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🚀 <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Crash Game</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Watch the multiplier rise and cash out before it crashes!
          </p>
          
          {/* User Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-xl font-bold text-green-400">${user.balance.toFixed(2)}</div>
              </div>
            </EnhancedCard>
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Level</div>
                <div className="text-xl font-bold text-blue-400">{user.level}</div>
              </div>
            </EnhancedCard>
            {user.stats && (
              <>
                <EnhancedCard variant="stats" className="px-6 py-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-xl font-bold text-green-400">{user.stats.wins}/{user.stats.totalGames}</div>
                  </div>
                </EnhancedCard>
                <EnhancedCard variant="stats" className="px-6 py-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Total Won</div>
                    <div className="text-xl font-bold text-blue-400">${user.stats.totalWon.toFixed(0)}</div>
                  </div>
                </EnhancedCard>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crash Game Display */}
            <EnhancedCard variant="game" className="p-8">
              <div className="text-center">
                {/* Multiplier Display */}
                <div className="mb-8">
                  <motion.div
                    className={`text-8xl md:text-9xl font-bold mb-4 ${
                      gameState === 'crashed' ? 'text-red-500' : 
                      gameState === 'running' ? 'text-orange-400' : 'text-gray-400'
                    }`}
                    animate={gameState === 'running' ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: gameState === 'running' ? Infinity : 0 }}
                  >
                    {currentMultiplier.toFixed(2)}x
                  </motion.div>
                  
                  {gameState === 'crashed' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-3xl font-bold text-red-500 mb-4"
                    >
                      💥 CRASHED!
                    </motion.div>
                  )}
                  
                  {gameState === 'running' && (
                    <div className="text-xl text-orange-400 font-semibold">
                      🚀 Flying...
                    </div>
                  )}
                  
                  {gameState === 'waiting' && (
                    <div className="text-xl text-gray-400">
                      ⏳ Waiting for next round...
                    </div>
                  )}
                </div>

                {/* Game Controls */}
                <div className="space-y-6">
                  {/* Bet Amount */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Bet Amount</h3>
                    <EnhancedInput
                      type="number"
                      value={betAmount.toString()}
                      onChange={(value) => setBetAmount(Math.max(0, Number(value)))}
                      disabled={gameState !== 'waiting' || isLoading}
                      placeholder="Enter bet amount"
                      className="w-full mb-4"
                    />
                    
                    {/* Quick bet buttons */}
                    <div className="grid grid-cols-5 gap-2">
                      {quickAmounts.map((amount) => (
                        <EnhancedButton
                          key={amount}
                          variant="ghost"
                          size="sm"
                          onClick={() => setBetAmount(Math.min(amount, user.balance))}
                          disabled={gameState !== 'waiting' || isLoading || amount > user.balance}
                        >
                          ${amount}
                        </EnhancedButton>
                      ))}
                    </div>
                  </div>

                  {/* Auto Cashout */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Auto Cashout (Optional)</h3>
                    <EnhancedInput
                      type="number"
                      value={autoCashout}
                      onChange={(value) => setAutoCashout(value)}
                      disabled={gameState === 'running' || isLoading}
                      placeholder="e.g., 2.00"
                      className="w-full mb-4"
                    />
                    
                    {/* Quick multiplier buttons */}
                    <div className="grid grid-cols-6 gap-2">
                      {quickMultipliers.map((multiplier) => (
                        <EnhancedButton
                          key={multiplier}
                          variant="ghost"
                          size="sm"
                          onClick={() => setAutoCashout(multiplier.toString())}
                          disabled={gameState === 'running' || isLoading}
                        >
                          {multiplier}x
                        </EnhancedButton>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState === 'waiting' && (
                      <EnhancedButton
                        variant="primary"
                        size="xl"
                        onClick={startGame}
                        disabled={!user || betAmount <= 0 || betAmount > user.balance || isLoading}
                        loading={isLoading}
                        className="h-16 text-xl font-bold md:col-span-2"
                      >
                        {isLoading ? '🔄 Starting...' : 
                         betAmount > 0 && betAmount <= user.balance ? 
                           `🚀 Start Game ($${betAmount})` : 
                           'Enter Valid Bet Amount'
                        }
                      </EnhancedButton>
                    )}
                    
                    {gameState === 'running' && isPlaying && (
                      <EnhancedButton
                        variant="success"
                        size="xl"
                        onClick={cashOut}
                        disabled={isLoading}
                        loading={isLoading}
                        className="h-16 text-xl font-bold md:col-span-2"
                      >
                        {isLoading ? '💰 Cashing Out...' : 
                         `💰 Cash Out (${currentMultiplier.toFixed(2)}x = $${(betAmount * currentMultiplier).toFixed(2)})`
                        }
                      </EnhancedButton>
                    )}
                    
                    {gameState === 'running' && !isPlaying && (
                      <div className="md:col-span-2 text-center text-gray-400 py-8">
                        <div className="text-xl">🎮 Watching the game...</div>
                        <div className="text-sm mt-2">You're not playing this round</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <EnhancedCard variant="stats" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
                Game Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Round</span>
                  <span className="font-semibold">#{Date.now().toString().slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players</span>
                  <span className="font-semibold text-green-400">{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Bet</span>
                  <span className="font-semibold text-blue-400">${(Math.random() * 5000 + 1000).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-semibold ${
                    gameState === 'waiting' ? 'text-yellow-400' :
                    gameState === 'running' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {gameState === 'waiting' ? 'Waiting' :
                     gameState === 'running' ? 'Flying' : 'Crashed'}
                  </span>
                </div>
              </div>
            </EnhancedCard>

            {/* Recent Crashes */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-orange-500" />
                Recent Crashes
              </h3>
              <div className="space-y-2">
                {gameHistory.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🚀</span>
                        <div>
                          <div className="text-sm font-semibold">{game.round}</div>
                          <div className="text-xs text-gray-400">{game.time}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        game.multiplier >= 2 ? 'text-green-400' : 
                        game.multiplier >= 1.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {game.multiplier.toFixed(2)}x
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No recent games
                  </div>
                )}
              </div>
            </EnhancedCard>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          <div className="flex items-center justify-between">
            <span>{showToast.message}</span>
            <button 
              onClick={() => setShowToast(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrashPage
