'use client'

import React, { useState, useEffect } from 'react'
import { UserIcon, ClockIcon, FireIcon, CubeIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { useAuth } from '@/contexts/AuthContext'
import { useGuest } from '@/contexts/GuestContext'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const CoinFlipPage = () => {
  const { gameActions } = useSound()
  const { user } = useAuth()
  const { guestUser, updateBalance, addGameResult } = useGuest()
  
  // Use either authenticated user or guest user
  const currentUser = user || guestUser
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Load mock game history
  useEffect(() => {
    loadGameHistory()
  }, [])

  const loadGameHistory = async () => {
    try {
      const response = await api.getRecentGames()
      if (response.success && response.data) {
        const coinflipGames = response.data.games
          .filter((game: any) => game.gameType === 'coinflip')
          .slice(0, 10)
          .map((game: any) => ({
            id: game.id,
            result: game.won ? 'win' : 'loss',
            betAmount: game.betAmount,
            winAmount: game.winAmount,
            time: getTimeAgo(new Date(game.timestamp)),
            playerChoice: Math.random() > 0.5 ? 'heads' : 'tails'
          }))
        setGameHistory(coinflipGames)
      }
    } catch (error) {
      console.error('Error loading game history:', error)
    }
  }

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
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
    if (!selectedSide || !currentUser || betAmount <= 0 || betAmount > (currentUser.balance || 0)) {
      return
    }

    // Ensure guest user has backend ID
    if (guestUser && !guestUser.backendId) {
      setShowToast({
        type: 'error',
        message: 'Please refresh the page to connect to the server.'
      })
      return
    }

    setIsLoading(true)
    setIsFlipping(true)
    setShowResult(false)

    try {
      gameActions.coinFlip()
      
      // Get user ID for API call
      const userId = guestUser?.backendId || user?.steamId
      if (!userId) {
        throw new Error('No user ID available')
      }
      
      // Use real API for game logic
      const response = await api.playCoinflip(userId, betAmount, selectedSide)
      
      if (response.success && response.data) {
        const { game, user: updatedUser, winAmount, lossAmount } = response.data
        const coinResult = game.result.outcome
        const won = game.result.won
        
        setResult(coinResult)
        
        // Update local user state
        if (guestUser) {
          addGameResult(winAmount, lossAmount)
        }
        
        setShowToast({
          type: won ? 'success' : 'error',
          message: won ? `🎉 You won $${winAmount.toFixed(2)}!` : `💔 You lost $${lossAmount.toFixed(2)}`
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
      } else {
        throw new Error(response.error || 'Game failed')
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

  const { createGuestUser } = useGuest()

  // Show login prompt for non-users
  const LoginPrompt = () => (
    <EnhancedCard className="p-8 text-center mb-8">
      <h3 className="text-2xl font-bold mb-4">Ready to Play?</h3>
      <p className="text-gray-400 mb-6">
        Start playing instantly with $1000 demo balance, or login with Steam for real skin betting!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <EnhancedButton
          variant="primary"
          size="lg"
          onClick={() => createGuestUser()}
        >
          🎮 Play as Guest ($1000 Demo)
        </EnhancedButton>
        <EnhancedButton
          variant="secondary"
          size="lg"
          onClick={() => { window.location.href = '/login' }}
        >
          🔗 Login with Steam
        </EnhancedButton>
      </div>
    </EnhancedCard>
  )

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
            🪙 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">CS2 Skin Coinflip</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Choose heads or tails and double your CS2 skins!
          </p>
          
          {/* User Stats - Only show if logged in */}
          {currentUser && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <EnhancedCard variant="stats" className="px-6 py-3">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-xl font-bold text-green-400">${(currentUser.balance || 0).toFixed(2)}</div>
                  {guestUser && <div className="text-xs text-yellow-400">Demo Mode</div>}
                </div>
              </EnhancedCard>
              <EnhancedCard variant="stats" className="px-6 py-3">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Games Played</div>
                  <div className="text-xl font-bold text-blue-400">{guestUser?.gamesPlayed || 0}</div>
                </div>
              </EnhancedCard>
              {guestUser && (
                <>
                  <EnhancedCard variant="stats" className="px-6 py-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Total Won</div>
                      <div className="text-xl font-bold text-green-400">${guestUser.totalWon.toFixed(2)}</div>
                    </div>
                  </EnhancedCard>
                  <EnhancedCard variant="stats" className="px-6 py-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Total Lost</div>
                      <div className="text-xl font-bold text-red-400">${guestUser.totalLost.toFixed(2)}</div>
                    </div>
                  </EnhancedCard>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Show login prompt if no user */}
        {!currentUser && <LoginPrompt />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* Coin Flip Game */}
            <EnhancedCard variant="game" className="p-8 mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-8">Flip the Coin</h2>
                
                {/* Coin Animation */}
                <div className="mb-8">
                  <motion.div
                    className={`w-32 h-32 mx-auto rounded-full border-4 border-yellow-400 flex items-center justify-center text-6xl ${
                      isFlipping ? 'animate-spin' : ''
                    }`}
                    animate={isFlipping ? { rotateY: 1800 } : {}}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    {showResult ? (result === 'heads' ? '👑' : '🔥') : '🪙'}
                  </motion.div>
                  
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4"
                    >
                      <div className={`text-2xl font-bold ${
                        result === selectedSide ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result === 'heads' ? 'HEADS' : 'TAILS'}
                      </div>
                      <div className={`text-lg ${
                        result === selectedSide ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result === selectedSide ? 'YOU WIN!' : 'YOU LOSE!'}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Side Selection */}
                <div className="flex justify-center gap-4 mb-8">
                  <EnhancedButton
                    variant={selectedSide === 'heads' ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => setSelectedSide('heads')}
                    disabled={isFlipping || !currentUser}
                    className="flex-1 max-w-xs"
                  >
                    👑 HEADS
                  </EnhancedButton>
                  <EnhancedButton
                    variant={selectedSide === 'tails' ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => setSelectedSide('tails')}
                    disabled={isFlipping || !currentUser}
                    className="flex-1 max-w-xs"
                  >
                    🔥 TAILS
                  </EnhancedButton>
                </div>

                {/* Bet Amount */}
                {currentUser && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-2">Bet Amount</label>
                    <EnhancedInput
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      min={1}
                      max={currentUser.balance}
                      disabled={isFlipping}
                      className="w-full max-w-xs mx-auto"
                    />
                    
                    {/* Quick Amount Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {quickAmounts.map(amount => (
                        <EnhancedButton
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          disabled={isFlipping || amount > currentUser.balance}
                        >
                          ${amount}
                        </EnhancedButton>
                      ))}
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(Math.floor(currentUser.balance / 2))}
                        disabled={isFlipping || currentUser.balance < 2}
                      >
                        Half
                      </EnhancedButton>
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(currentUser.balance)}
                        disabled={isFlipping || currentUser.balance < 1}
                      >
                        Max
                      </EnhancedButton>
                    </div>
                  </div>
                )}

                {/* Flip Button */}
                <EnhancedButton
                  variant="primary"
                  size="xl"
                  onClick={flipCoin}
                  disabled={!selectedSide || !currentUser || betAmount <= 0 || betAmount > (currentUser?.balance || 0) || isFlipping}
                  className="w-full max-w-md"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `🎲 FLIP FOR $${betAmount.toFixed(2)}`
                  )}
                </EnhancedButton>

                {/* Potential Win */}
                {currentUser && betAmount > 0 && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-400">Potential Win</div>
                    <div className="text-xl font-bold text-green-400">
                      ${(betAmount * 1.98).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Active Battles */}
            <EnhancedCard className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-orange-400" />
                Active Battles
              </h3>
              <div className="space-y-3">
                {activeBattles.map(battle => (
                  <div key={battle.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{battle.avatar}</div>
                      <div>
                        <div className="font-semibold">{battle.creator}</div>
                        <div className="text-sm text-gray-400">
                          {battle.side.toUpperCase()} • {battle.totalValue}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {battle.status === 'waiting' && (
                        <EnhancedButton variant="primary" size="sm" disabled={!currentUser}>
                          Join Battle
                        </EnhancedButton>
                      )}
                      {battle.status === 'in_progress' && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-yellow-400">VS {battle.opponent}</span>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Games */}
            <EnhancedCard className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-blue-400" />
                Recent Games
              </h3>
              <div className="space-y-3">
                {gameHistory.length > 0 ? (
                  gameHistory.map(game => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">
                          {game.playerChoice === 'heads' ? '👑' : '🔥'}
                        </div>
                        <div>
                          <div className={`font-semibold ${
                            game.result === 'win' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${game.betAmount}
                          </div>
                          <div className="text-xs text-gray-400">{game.time}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        game.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.result === 'win' ? `+$${game.winAmount.toFixed(2)}` : `-$${game.betAmount}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <CubeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No games played yet</p>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Game Rules */}
            <EnhancedCard className="p-6">
              <h3 className="text-xl font-bold mb-4">How to Play</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400">1.</span>
                  <span>Choose heads (👑) or tails (🔥)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400">2.</span>
                  <span>Set your bet amount</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400">3.</span>
                  <span>Click flip and watch the coin</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400">4.</span>
                  <span>Win 1.98x your bet if you guess correctly!</span>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          onAnimationComplete={() => {
            setTimeout(() => setShowToast(null), 3000)
          }}
        >
          {showToast.message}
        </motion.div>
      )}
    </div>
  )
}

export default CoinFlipPage 