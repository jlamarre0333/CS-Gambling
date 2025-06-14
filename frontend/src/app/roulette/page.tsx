'use client'

import React, { useState, useEffect } from 'react'
import { useGuest } from '@/contexts/GuestContext'
import { api } from '@/lib/api'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LiveGameFeed from '@/components/ui/LiveGameFeed'
import Leaderboard from '@/components/ui/Leaderboard'
import { useToast } from '@/components/ui/Toast'

export default function RoulettePage() {
  const { guestUser: user, syncWithBackend } = useGuest()
  const { showToast, ToastComponent } = useToast()
  const [selectedBet, setSelectedBet] = useState<string | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameResult, setGameResult] = useState<{number: number, color: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const betOptions = [
    { type: 'red', label: 'Red', multiplier: '2x', color: 'bg-red-600', emoji: '🔴' },
    { type: 'black', label: 'Black', multiplier: '2x', color: 'bg-gray-800', emoji: '⚫' },
    { type: 'green', label: 'Green', multiplier: '14x', color: 'bg-green-600', emoji: '🟢' }
  ]

  const placeBet = async () => {
    if (!selectedBet || !user?.backendId || betAmount <= 0 || betAmount > user.balance || isSpinning) {
      return
    }
    
    setIsLoading(true)
    setIsSpinning(true)
    
    try {
      setTimeout(async () => {
        try {
          const response = await api.playRoulette(user.backendId!, betAmount, selectedBet as 'red' | 'black' | 'green')
          
          if (response.success && response.data) {
            const spinResult = response.data.game.result
            setGameResult(spinResult)
            await syncWithBackend()
            
            // Show result toast
            const won = selectedBet === spinResult.color
            showToast(
              won ? 'success' : 'error',
              won ? `🎉 You won $${betAmount * (selectedBet === 'green' ? 14 : 2)}!` : `💔 You lost $${betAmount}`
            )
            
            setTimeout(() => {
              setIsSpinning(false)
              setGameResult(null)
              setSelectedBet(null)
            }, 3000)
          }
        } catch (error) {
          console.error('Error placing bet:', error)
          setIsSpinning(false)
          showToast('error', 'Failed to place bet. Please try again.')
        }
      }, 2000)
    } catch (error) {
      console.error('Error spinning wheel:', error)
      setIsSpinning(false)
      showToast('error', 'Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Allow spectating without login - only restrict betting

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            🎯 CS2 Skin Roulette
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Bet your CS2 skins on Red, Black, or Green!
          </p>
          {user && (
            <EnhancedCard variant="stats" className="inline-block">
              <div className="px-6 py-3">
                <div className="text-xl font-semibold">Balance: ${user.balance.toFixed(2)}</div>
              </div>
            </EnhancedCard>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roulette Wheel */}
          <div className="flex flex-col items-center">
            <EnhancedCard variant="game" className="w-full max-w-md">
              <div className="p-8 text-center">
                <div className={`w-64 h-64 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-4 border-yellow-500 flex items-center justify-center relative overflow-hidden ${isSpinning ? 'animate-spin' : ''}`}>
                  {/* Wheel segments background */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-600 via-black to-green-600 opacity-20"></div>
                  
                  {gameResult ? (
                    <div className="text-center z-10">
                      <div className="text-4xl font-bold">{gameResult.number}</div>
                      <div className="text-lg capitalize">{gameResult.color}</div>
                      <div className="text-2xl mt-2">
                        {gameResult.color === 'red' ? '🔴' : gameResult.color === 'black' ? '⚫' : '🟢'}
                      </div>
                    </div>
                  ) : isSpinning ? (
                    <div className="text-center z-10">
                      <LoadingSpinner variant="casino" size="lg" />
                      <div className="text-lg mt-2">Spinning...</div>
                    </div>
                  ) : (
                    <div className="text-center z-10">
                      <div className="text-4xl mb-2">🎡</div>
                      <div className="text-lg">Ready to spin!</div>
                    </div>
                  )}
                </div>

                {/* Result Display */}
                {gameResult && selectedBet && (
                  <div className="mt-6">
                    <div className={`text-2xl font-bold ${selectedBet === gameResult.color ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedBet === gameResult.color ? '🎉 YOU WON!' : '💔 YOU LOST!'}
                    </div>
                  </div>
                )}
              </div>
            </EnhancedCard>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6 lg:col-span-1">
            {/* Betting Options */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center">Choose Your Bet</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {betOptions.map((option) => (
                  <EnhancedButton
                    key={option.type}
                    variant={selectedBet === option.type ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => setSelectedBet(option.type)}
                    disabled={isSpinning}
                    className="h-20 flex flex-col items-center justify-center space-y-1"
                  >
                    <div className="text-2xl">{option.emoji}</div>
                    <div className="font-bold">{option.label}</div>
                    <div className="text-sm opacity-80">{option.multiplier}</div>
                  </EnhancedButton>
                ))}
              </div>
            </EnhancedCard>

            {/* Betting Controls or Spectate Mode */}
            {user ? (
              <>
                {/* Bet Amount */}
                <EnhancedCard variant="default" className="p-6">
                  <h3 className="text-xl font-bold mb-4">Bet Amount</h3>
                  <EnhancedInput
                    type="number"
                    value={betAmount.toString()}
                    onChange={(value) => setBetAmount(Math.max(0, Number(value)))}
                    disabled={isSpinning}
                    placeholder="Enter bet amount"
                    className="w-full"
                  />
                  
                  {/* Quick bet buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[10, 25, 50, 100].map((amount) => (
                      <EnhancedButton
                        key={amount}
                        variant="ghost"
                        size="sm"
                        onClick={() => setBetAmount(Math.min(amount, user.balance))}
                        disabled={isSpinning || amount > user.balance}
                      >
                        ${amount}
                      </EnhancedButton>
                    ))}
                  </div>
                </EnhancedCard>

                {/* Spin Button */}
                <EnhancedButton
                  variant="primary"
                  size="xl"
                  onClick={placeBet}
                  disabled={!selectedBet || betAmount <= 0 || betAmount > user.balance || isSpinning || isLoading}
                  loading={isLoading || isSpinning}
                  className="w-full h-16 text-xl font-bold"
                >
                  {isLoading ? '🔄 Placing Bet...' : 
                   isSpinning ? '🎡 Spinning...' :
                   selectedBet && betAmount > 0 && betAmount <= user.balance ? 
                     `🚀 Spin ${selectedBet.toUpperCase()} ($${betAmount})` : 
                     'Select Bet and Amount'
                  }
                </EnhancedButton>
              </>
            ) : (
              <EnhancedCard variant="default" className="p-6 text-center">
                <div className="text-4xl mb-4">👀</div>
                <h3 className="text-xl font-bold mb-2">Spectate Mode</h3>
                <p className="text-gray-400 mb-4">
                  You're watching the roulette! Login to bet with your CS2 skins.
                </p>
                <EnhancedButton 
                  variant="primary" 
                  size="lg"
                  onClick={() => { window.location.href = '/test-backend' }}
                  className="w-full"
                >
                  🔑 Login to Play Roulette
                </EnhancedButton>
              </EnhancedCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Game Feed */}
            <LiveGameFeed maxItems={6} />

            {/* Leaderboard */}
            <Leaderboard maxEntries={5} />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
} 