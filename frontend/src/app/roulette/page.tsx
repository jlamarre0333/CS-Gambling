'use client'

import React, { useState, memo, useEffect } from 'react'
import { ArrowPathIcon, FireIcon, ClockIcon, CubeIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api'
import { useGameTouchGestures } from '@/hooks/useTouchGestures'
import { 
  MobileGameContainer, 
  TouchButton, 
  SwipeableSkinSelector, 
  MobileGameControls,
  MobileModal 
} from '@/components/ui/MobileOptimized'

const RoulettePage = memo(() => {
  const { gameActions } = useSound()
  const { user, updateUser } = useUser()
  const [selectedBet, setSelectedBet] = useState<string | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameResult, setGameResult] = useState<{number: number, color: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [showResult, setShowResult] = useState(false)
  const { gestureState, createSpinGesture } = useGameTouchGestures()

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
        const rouletteGames = response.games
          .filter((game: any) => game.gameType === 'roulette')
          .slice(0, 10)
          .map((game: any) => ({
            id: game.id,
            result: game.result,
            betAmount: game.betAmount,
            winAmount: game.winAmount,
            time: getTimeAgo(game.timestamp),
            playerBet: game.gameData?.betType || 'red',
            spinResult: game.gameData?.spinResult
          }))
        setGameHistory(rouletteGames)
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

  // Roulette wheel setup
  const rouletteNumbers = [
    // Green (0)
    { number: 0, color: 'green' },
    // Red numbers
    { number: 1, color: 'red' }, { number: 3, color: 'red' }, { number: 5, color: 'red' },
    { number: 7, color: 'red' }, { number: 9, color: 'red' }, { number: 12, color: 'red' },
    { number: 14, color: 'red' }, { number: 16, color: 'red' }, { number: 18, color: 'red' },
    { number: 19, color: 'red' }, { number: 21, color: 'red' }, { number: 23, color: 'red' },
    { number: 25, color: 'red' }, { number: 27, color: 'red' }, { number: 30, color: 'red' },
    { number: 32, color: 'red' }, { number: 34, color: 'red' }, { number: 36, color: 'red' },
    // Black numbers
    { number: 2, color: 'black' }, { number: 4, color: 'black' }, { number: 6, color: 'black' },
    { number: 8, color: 'black' }, { number: 10, color: 'black' }, { number: 11, color: 'black' },
    { number: 13, color: 'black' }, { number: 15, color: 'black' }, { number: 17, color: 'black' },
    { number: 20, color: 'black' }, { number: 22, color: 'black' }, { number: 24, color: 'black' },
    { number: 26, color: 'black' }, { number: 28, color: 'black' }, { number: 29, color: 'black' },
    { number: 31, color: 'black' }, { number: 33, color: 'black' }, { number: 35, color: 'black' }
  ]

  const betOptions = [
    { type: 'red', label: 'Red', multiplier: '2x', color: 'bg-red-600' },
    { type: 'black', label: 'Black', multiplier: '2x', color: 'bg-gray-800' },
    { type: 'green', label: 'Green', multiplier: '14x', color: 'bg-green-600' }
  ]

  const quickAmounts = [5, 10, 25, 50, 100]

  const placeBet = async () => {
    if (!selectedBet || !user || betAmount <= 0 || betAmount > user.balance || isSpinning) {
      return
    }
    
    setIsLoading(true)
    setIsSpinning(true)
    setShowResult(false)
    
    try {
      gameActions.placeBet()
      gameActions.wheelSpin()
      
      // Simulate spin duration (3-5 seconds)
      const spinDuration = 3000 + Math.random() * 2000
      
      setTimeout(async () => {
        try {
          // Place bet on backend
          const response = await api.placeBet(user.id, 'roulette', betAmount, {
            betType: selectedBet
          }) as any
          
          if (response.success) {
            const spinResult = response.game.gameData.spinResult
            setGameResult(spinResult)
            updateUser(response.user)
            
            gameActions.wheelStop()
            
            if (response.game.result === 'win') {
              if (response.game.winAmount > betAmount * 5) {
                gameActions.winBig()
              } else {
                gameActions.winSmall()
              }
            } else {
              gameActions.lose()
            }
            
            setShowResult(true)
            loadGameHistory()
            
            // Reset after showing result
            setTimeout(() => {
              setIsSpinning(false)
              setShowResult(false)
              setGameResult(null)
              setSelectedBet(null)
            }, 4000)
          }
        } catch (error) {
          console.error('Error placing bet:', error)
          setIsSpinning(false)
        }
      }, spinDuration)
    } catch (error) {
      console.error('Error spinning wheel:', error)
      setIsSpinning(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Touch gesture for spinning wheel
  const wheelGesture = createSpinGesture((velocity) => {
    if (!isSpinning && selectedBet && user) {
      placeBet()
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to play Roulette</h2>
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
    <MobileGameContainer 
      enableSwipeNavigation={true}
      onSwipeLeft={() => console.log('Navigate to next game')}
      onSwipeRight={() => console.log('Navigate to previous game')}
    >
      <div className="py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🎯 <span className="neon-text">Roulette</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              Classic casino roulette - choose red, black, or green!
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Stats */}
              {user.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="mobile-card p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{user.stats.wins}/{user.stats.totalGames}</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  <div className="mobile-card p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">${user.stats.totalWon.toFixed(0)}</div>
                    <div className="text-sm text-gray-400">Total Won</div>
                  </div>
                  <div className="mobile-card p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {user.stats.totalGames > 0 ? ((user.stats.wins / user.stats.totalGames) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-gray-400">Win Percentage</div>
                  </div>
                  <div className="mobile-card p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">${user.stats.totalWagered.toFixed(0)}</div>
                    <div className="text-sm text-gray-400">Total Wagered</div>
                  </div>
                </div>
              )}

              {/* Game Display */}
              <div className="mobile-card">
                <div className="text-center mb-6">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-4">
                    {showResult && gameResult ? 
                      `Result: ${gameResult.number} (${gameResult.color.toUpperCase()})` : 
                      'Place Your Bet'
                    }
                  </div>
                  
                  {gestureState.isSpinning && (
                    <div className="text-sm text-accent-primary mb-4">
                      🌀 Swipe detected - spinning!
                    </div>
                  )}
                </div>

                {/* Roulette Wheel */}
                <div className="relative mb-6">
                  <div 
                    ref={wheelGesture.ref as React.RefObject<HTMLDivElement>}
                    className={`w-64 h-64 sm:w-80 sm:h-80 mx-auto bg-gaming-darker rounded-full border-4 border-accent-primary shadow-neon relative overflow-hidden touch-none ${
                      isSpinning ? 'animate-spin' : ''
                    }`}
                  >
                    <div className="absolute inset-4 bg-gradient-gaming rounded-full flex items-center justify-center">
                      {showResult && gameResult ? (
                        <div className="text-center">
                          <div className="text-4xl sm:text-6xl font-bold text-accent-primary mb-2">
                            {gameResult.number}
                          </div>
                          <div className={`text-lg sm:text-xl font-semibold ${
                            gameResult.color === 'red' ? 'text-red-400' :
                            gameResult.color === 'black' ? 'text-gray-300' :
                            'text-green-400'
                          }`}>
                            {gameResult.color.toUpperCase()}
                          </div>
                        </div>
                      ) : isSpinning ? (
                        <div className="text-4xl sm:text-6xl font-bold text-accent-primary animate-pulse">
                          🎡
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl sm:text-6xl font-bold text-accent-primary animate-pulse">
                            ?
                          </div>
                          <div className="text-xs sm:text-sm text-gray-400 mt-2">
                            Swipe to spin
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Spinning indicator */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-accent-primary"></div>
                  </div>
                </div>

                {/* Win/Loss Result Display */}
                {showResult && gameResult && (
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold mb-2">
                      {selectedBet === gameResult.color ? (
                        <span className="text-green-400">🎉 YOU WON!</span>
                      ) : (
                        <span className="text-red-400">💔 YOU LOST!</span>
                      )}
                    </div>
                    {selectedBet === gameResult.color && (
                      <div className="text-lg text-green-400 font-bold">
                        Won: ${(betAmount * (gameResult.color === 'green' ? 14 : 2)).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {/* Betting Options - Mobile optimized */}
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Choose Your Bet:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {betOptions.map((option) => (
                      <TouchButton
                        key={option.type}
                        onClick={() => {
                          if (!isSpinning) {
                            gameActions.buttonClick()
                            setSelectedBet(option.type)
                          }
                        }}
                        disabled={isSpinning}
                        variant={selectedBet === option.type ? 'primary' : 'secondary'}
                        size="lg"
                        className={`
                          p-6 flex flex-col items-center space-y-2 
                          ${selectedBet === option.type ? 'ring-2 ring-accent-primary' : ''}
                        `}
                      >
                        <div className={`w-12 h-12 rounded-full ${option.color} mb-2`}></div>
                        <div className="text-lg font-bold text-white">{option.label}</div>
                        <div className="text-sm text-accent-primary font-semibold">{option.multiplier}</div>
                        <div className="text-xs text-gray-400">
                          {option.type === 'green' ? '1/37 chance' : '18/37 chance'}
                        </div>
                      </TouchButton>
                    ))}
                  </div>
                </div>

                {/* Bet Amount */}
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Bet Amount:</h3>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                      min="1"
                      max={user.balance}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:border-yellow-500"
                      disabled={isSpinning}
                    />
                  </div>
                  
                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        disabled={amount > user.balance || isSpinning}
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
                      disabled={isSpinning}
                      className="px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      Half
                    </button>
                    <button
                      onClick={() => setBetAmount(Math.floor(user.balance))}
                      disabled={isSpinning}
                      className="px-3 py-1 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Bet validation */}
                {betAmount > user.balance && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-sm text-red-400">
                      ⚠️ Insufficient balance. Your balance is ${user.balance.toFixed(2)}
                    </div>
                  </div>
                )}

                {betAmount > 0 && betAmount <= user.balance && selectedBet && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-sm text-green-400">
                      💰 Potential winnings: ${(betAmount * (selectedBet === 'green' ? 14 : 2)).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Spin Button */}
                <TouchButton
                  onClick={placeBet}
                  disabled={!selectedBet || !user || betAmount <= 0 || betAmount > user.balance || isSpinning || isLoading}
                  variant="primary"
                  size="lg"
                  className="w-full text-lg py-4"
                >
                  {isLoading ? '🔄 Placing Bet...' : 
                   isSpinning ? '🎡 Spinning...' :
                   selectedBet && betAmount > 0 && betAmount <= user.balance ? 
                     `🚀 Spin ${selectedBet.toUpperCase()} ($${betAmount})` : 
                     'Select Bet and Amount'
                  }
                </TouchButton>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Games */}
              <div className="mobile-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-400" />
                  Recent Games
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gameHistory.length > 0 ? gameHistory.map((game, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {game.playerBet.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">{game.time}</div>
                        {game.spinResult && (
                          <div className="text-xs text-gray-300">
                            Result: {game.spinResult.number} ({game.spinResult.color})
                          </div>
                        )}
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
                      <p className="text-sm">Start spinning to see your history!</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Bet Info */}
              {selectedBet && (
                <div className="mobile-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Current Bet:</h3>
                  <div className="p-3 bg-gaming-darker rounded-lg border border-accent-primary">
                    <div className="font-semibold text-white">{selectedBet.toUpperCase()}</div>
                    <div className="text-accent-success font-semibold">
                      {selectedBet === 'green' ? '14x payout' : '2x payout'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileGameContainer>
  )
})

RoulettePage.displayName = 'RoulettePage'

export default RoulettePage 