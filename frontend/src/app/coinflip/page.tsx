'use client'

import React, { useState, useEffect } from 'react'
import { UserIcon, ClockIcon, FireIcon, CubeIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
      }) as any
      
      if (response.success) {
        const gameResult = response.game.result === 'win' ? selectedSide : (selectedSide === 'heads' ? 'tails' : 'heads')
        setResult(gameResult)
        updateUser(response.user)
        
        const won = response.game.result === 'win'
        setShowToast({
          type: won ? 'success' : 'error',
          message: won ? `🎉 You won $${betAmount * 2}!` : `💔 You lost $${betAmount}`
        })
        
        if (won) {
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
      setShowToast({
        type: 'error',
        message: 'Failed to flip coin. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const quickAmounts = [5, 10, 25, 50, 100]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-4">
        <EnhancedCard variant="glow" className="text-center max-w-md w-full">
          <div className="p-8">
            <div className="text-6xl mb-4">🪙</div>
            <h2 className="text-2xl font-bold mb-4">Please log in to play Coinflip</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🪙 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Coin Flip</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Choose heads or tails and double your money!
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
            {/* Coin Flip Game */}
            <EnhancedCard variant="game" className="p-8">
              <div className="text-center">
                {/* Coin Animation */}
                <div className="mb-8">
                  <motion.div
                    className={`w-32 h-32 mx-auto rounded-full border-4 border-yellow-500 flex items-center justify-center text-4xl font-bold ${
                      isFlipping ? 'animate-spin' : ''
                    } ${result === 'heads' ? 'bg-yellow-500 text-black' : result === 'tails' ? 'bg-gray-700 text-white' : 'bg-gradient-to-br from-yellow-500 to-gray-700'}`}
                    animate={isFlipping ? { rotateY: 360 } : {}}
                    transition={{ duration: 0.5, repeat: isFlipping ? Infinity : 0 }}
                  >
                    {isFlipping ? (
                      <LoadingSpinner variant="casino" size="lg" />
                    ) : result ? (
                      result === 'heads' ? '👑' : '🦅'
                    ) : (
                      '🪙'
                    )}
                  </motion.div>
                  
                  {showResult && result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4"
                    >
                      <div className={`text-2xl font-bold ${selectedSide === result ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedSide === result ? '🎉 YOU WON!' : '💔 YOU LOST!'}
                      </div>
                      <div className="text-lg text-gray-300 mt-2">
                        Result: {result.toUpperCase()}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Side Selection */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Choose Your Side</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <EnhancedButton
                      variant={selectedSide === 'heads' ? 'primary' : 'secondary'}
                      size="lg"
                      onClick={() => setSelectedSide('heads')}
                      disabled={isFlipping}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <div className="text-2xl mb-1">👑</div>
                      <div className="font-bold">HEADS</div>
                      <div className="text-sm opacity-80">2x Payout</div>
                    </EnhancedButton>
                    
                    <EnhancedButton
                      variant={selectedSide === 'tails' ? 'primary' : 'secondary'}
                      size="lg"
                      onClick={() => setSelectedSide('tails')}
                      disabled={isFlipping}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <div className="text-2xl mb-1">🦅</div>
                      <div className="font-bold">TAILS</div>
                      <div className="text-sm opacity-80">2x Payout</div>
                    </EnhancedButton>
                  </div>
                </div>

                {/* Bet Amount */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Bet Amount</h3>
                  <EnhancedInput
                    type="number"
                    value={betAmount.toString()}
                    onChange={(value) => setBetAmount(Math.max(0, Number(value)))}
                    disabled={isFlipping}
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
                        disabled={isFlipping || amount > user.balance}
                      >
                        ${amount}
                      </EnhancedButton>
                    ))}
                  </div>
                </div>

                {/* Flip Button */}
                <EnhancedButton
                  variant="primary"
                  size="xl"
                  onClick={flipCoin}
                  disabled={!selectedSide || !user || betAmount <= 0 || betAmount > user.balance || isFlipping || isLoading}
                  loading={isLoading || isFlipping}
                  className="w-full h-16 text-xl font-bold"
                >
                  {isLoading ? '🔄 Placing Bet...' : 
                   isFlipping ? '🪙 Flipping...' :
                   selectedSide && betAmount > 0 && betAmount <= user.balance ? 
                     `🚀 Flip ${selectedSide.toUpperCase()} ($${betAmount})` : 
                     'Select Side and Amount'
                  }
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Battles */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-orange-500" />
                Active Battles
              </h3>
              <div className="space-y-3">
                {activeBattles.map((battle) => (
                  <div key={battle.id} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{battle.avatar}</span>
                        <span className="font-semibold">{battle.creator}</span>
                      </div>
                      <span className="text-green-400 font-bold">{battle.totalValue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Side: {battle.side}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        battle.status === 'waiting' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {battle.status === 'waiting' ? 'Waiting' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedCard>

            {/* Recent Games */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-blue-500" />
                Recent Games
              </h3>
              <div className="space-y-2">
                {gameHistory.length > 0 ? (
                  gameHistory.map((game) => (
                    <div key={game.id} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{game.playerChoice === 'heads' ? '👑' : '🦅'}</span>
                        <div>
                          <div className="text-sm font-semibold">${game.betAmount}</div>
                          <div className="text-xs text-gray-400">{game.time}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                        {game.result === 'win' ? `+$${game.winAmount}` : `-$${game.betAmount}`}
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

export default CoinFlipPage 