'use client'

import React, { useState, useEffect, memo, useCallback } from 'react'
import { TrophyIcon, UserIcon, ClockIcon, CubeIcon, FireIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const JackpotPage = memo(() => {
  const { gameActions } = useSound()
  const { user, updateUser } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [selectedSkins, setSelectedSkins] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(45)
  const [totalPotValue, setTotalPotValue] = useState(4750.80)
  const [isCountingDown, setIsCountingDown] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [participantCount, setParticipantCount] = useState(3)
  const [roundNumber, setRoundNumber] = useState(2847)
  const [recentDrops, setRecentDrops] = useState<any[]>([])
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [betAmount, setBetAmount] = useState(10)

  // Define participants data first
  const participants = [
    {
      user: 'SkinMaster',
      avatar: '👑',
      skins: ['AWP Dragon Lore', 'Karambit Doppler', 'AK-47 Fire Serpent'],
      totalValue: 2450.00,
      winChance: 51.6,
      color: '#ff6b6b'
    },
    {
      user: 'CSGOPro',
      avatar: '⚡',
      skins: ['M4A4 Howl', 'Desert Eagle Blaze', 'Glock Fade'],
      totalValue: 1890.50,
      winChance: 39.8,
      color: '#4ecdc4'
    },
    {
      user: 'TradeKing',
      avatar: '💎',
      skins: ['Butterfly Knife', 'AWP Lightning Strike'],
      totalValue: 410.30,
      winChance: 8.6,
      color: '#45b7d1'
    }
  ]

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Advanced countdown timer with wheel spinning
  useEffect(() => {
    if (isCountingDown && timeLeft > 0 && !isSpinning) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSpinning) {
      setIsCountingDown(false)
      setIsSpinning(true)
      
      // Start wheel spinning sound
      gameActions.wheelSpin()
      
      // Spin the wheel with realistic physics
      const spinDuration = 4000 + Math.random() * 2000 // 4-6 seconds
      const rotations = 5 + Math.random() * 3 // 5-8 full rotations
      const finalRotation = rotations * 360 + Math.random() * 360
      
      setWheelRotation(finalRotation)
      
      // Determine winner after spin
      setTimeout(() => {
        // Stop wheel spinning sound and play wheel stop sound
        gameActions.wheelStop()
        
        const winnerIndex = Math.floor(Math.random() * participants.length)
        const gameWinner = participants[winnerIndex]
        setWinner(gameWinner.user)
        setShowWinnerModal(true)
        
        // Play jackpot win sound after a brief delay
        setTimeout(() => {
          gameActions.winJackpot()
        }, 500)
        
        setShowToast({
          type: 'success',
          message: `🎉 ${gameWinner.user} won the jackpot! $${totalPotValue.toFixed(2)}`
        })
        
        // Add to recent drops
        setRecentDrops(prev => [{
          winner: gameWinner.user,
          avatar: gameWinner.avatar,
          prize: totalPotValue,
          skins: participants.reduce((sum, p) => sum + p.skins.length, 0),
          timestamp: new Date()
        }, ...prev.slice(0, 4)])
        
        // Reset for new round after celebration
        setTimeout(() => {
          setIsSpinning(false)
          setWinner(null)
          setShowWinnerModal(false)
          setTimeLeft(45 + Math.floor(Math.random() * 30)) // 45-75 seconds
          setTotalPotValue(Math.random() * 1000 + 200) // Random starting pot
          setParticipantCount(Math.floor(Math.random() * 8) + 2) // 2-10 participants
          setRoundNumber(prev => prev + 1)
          setWheelRotation(0)
          setIsCountingDown(true)
          setSelectedSkins([]) // Clear user selections
        }, 8000)
      }, spinDuration)
    }
  }, [timeLeft, isCountingDown, isSpinning, participants, totalPotValue])

  // Real-time participant updates
  useEffect(() => {
    if (!isCountingDown || isSpinning) return
    
    const interval = setInterval(() => {
      // Simulate new participants joining
      if (Math.random() > 0.85 && participantCount < 12) {
        const randomNames = ['SkinLord', 'TraderPro', 'CS2Master', 'CaseKing', 'DropHunter', 'SkinWizard']
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
        const joinValue = Math.random() * 500 + 50
        
        setParticipantCount(prev => prev + 1)
        setTotalPotValue(prev => prev + joinValue)
        
        setShowToast({
          type: 'success',
          message: `👋 ${randomName} joined with ${Math.floor(Math.random() * 5 + 1)} skins`
        })
      }
      
      // Simulate pot value fluctuations
      if (Math.random() > 0.7) {
        setTotalPotValue(prev => prev + Math.random() * 100 + 10)
      }
    }, 3000 + Math.random() * 4000)
    
    return () => clearInterval(interval)
  }, [isCountingDown, isSpinning, participantCount])

  const joinJackpot = async () => {
    if (!user || betAmount <= 0 || betAmount > user.balance || isJoining) {
      return
    }

    setIsJoining(true)
    try {
      const response = await api.placeBet(user.id, 'jackpot', betAmount) as any
      if (response.success) {
        updateUser(response.user)
        setTotalPotValue(prev => prev + betAmount)
        setParticipantCount(prev => prev + 1)
        
        setShowToast({
          type: 'success',
          message: `🎰 Joined jackpot with $${betAmount}!`
        })
        
        gameActions.placeBet()
      }
    } catch (error) {
      console.error('Error joining jackpot:', error)
      setShowToast({
        type: 'error',
        message: 'Failed to join jackpot. Please try again.'
      })
    } finally {
      setIsJoining(false)
    }
  }

  const recentWinners = [
    { winner: 'SkinCollector', prize: '$3,245.75', skins: 12, time: '2 min ago', avatar: '🏆' },
    { winner: 'ProGamer', prize: '$1,890.25', skins: 8, time: '15 min ago', avatar: '🎮' },
    { winner: 'TradeExpert', prize: '$5,670.80', skins: 21, time: '32 min ago', avatar: '💰' },
    { winner: 'CSGOKing', prize: '$2,156.45', skins: 15, time: '1 hr ago', avatar: '👑' },
  ]

  const quickAmounts = [5, 10, 25, 50, 100]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 text-white flex items-center justify-center p-4">
        <EnhancedCard variant="glow" className="text-center max-w-md w-full">
          <div className="p-8">
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-2xl font-bold mb-4">Please log in to play Jackpot</h2>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner variant="casino" size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🎰 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Jackpot</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Winner takes all! Join the pot and spin for glory!
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
            {/* Jackpot Wheel */}
            <EnhancedCard variant="premium" className="p-8">
              <div className="text-center">
                {/* Round Info */}
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Round #{roundNumber}</div>
                  <div className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2">
                    ${totalPotValue.toFixed(2)}
                  </div>
                  <div className="text-lg text-gray-300">
                    {participantCount} players • {timeLeft}s remaining
                  </div>
                </div>

                {/* Jackpot Wheel */}
                <div className="mb-8">
                  <div className="relative w-64 h-64 mx-auto">
                    <motion.div
                      className="w-full h-full rounded-full border-8 border-yellow-500 relative overflow-hidden"
                      animate={{ rotate: wheelRotation }}
                      transition={{ 
                        duration: isSpinning ? 4 : 0, 
                        ease: isSpinning ? "easeOut" : "linear" 
                      }}
                    >
                      {/* Wheel segments */}
                      {participants.map((participant, index) => {
                        const angle = (participant.winChance / 100) * 360
                        const rotation = participants.slice(0, index).reduce((sum, p) => sum + (p.winChance / 100) * 360, 0)
                        
                        return (
                          <div
                            key={participant.user}
                            className="absolute inset-0 flex items-center justify-center text-white font-bold"
                            style={{
                              background: `conic-gradient(from ${rotation}deg, ${participant.color} 0deg, ${participant.color} ${angle}deg, transparent ${angle}deg)`,
                              clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((rotation - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((rotation - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((rotation + angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((rotation + angle - 90) * Math.PI / 180)}%)`
                            }}
                          >
                            <div className="text-2xl">{participant.avatar}</div>
                          </div>
                        )
                      })}
                      
                      {/* Center circle */}
                      <div className="absolute inset-8 bg-gray-800 rounded-full flex items-center justify-center">
                        {isSpinning ? (
                          <LoadingSpinner variant="casino" size="lg" />
                        ) : (
                          <div className="text-4xl">🎰</div>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
                    </div>
                  </div>
                  
                  {winner && showWinnerModal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6"
                    >
                      <div className="text-3xl font-bold text-yellow-400 mb-2">
                        🎉 {winner} WINS!
                      </div>
                      <div className="text-xl text-gray-300">
                        Prize: ${totalPotValue.toFixed(2)}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Join Controls */}
                {!isSpinning && isCountingDown && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Join the Jackpot</h3>
                      <EnhancedInput
                        type="number"
                        value={betAmount.toString()}
                        onChange={(value) => setBetAmount(Math.max(0, Number(value)))}
                        disabled={isJoining}
                        placeholder="Enter bet amount"
                        className="w-full mb-4"
                      />
                      
                      {/* Quick bet buttons */}
                      <div className="grid grid-cols-5 gap-2 mb-6">
                        {quickAmounts.map((amount) => (
                          <EnhancedButton
                            key={amount}
                            variant="ghost"
                            size="sm"
                            onClick={() => setBetAmount(Math.min(amount, user.balance))}
                            disabled={isJoining || amount > user.balance}
                          >
                            ${amount}
                          </EnhancedButton>
                        ))}
                      </div>
                      
                      <EnhancedButton
                        variant="primary"
                        size="xl"
                        onClick={joinJackpot}
                        disabled={!user || betAmount <= 0 || betAmount > user.balance || isJoining}
                        loading={isJoining}
                        className="w-full h-16 text-xl font-bold"
                      >
                        {isJoining ? '🎰 Joining...' : 
                         betAmount > 0 && betAmount <= user.balance ? 
                           `🎰 Join Jackpot ($${betAmount})` : 
                           'Enter Valid Bet Amount'
                        }
                      </EnhancedButton>
                    </div>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Participants */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <UserIcon className="w-6 h-6 mr-2 text-blue-500" />
                Participants ({participantCount})
              </h3>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{participant.avatar}</span>
                        <div>
                          <div className="font-semibold">{participant.user}</div>
                          <div className="text-sm text-gray-400">{participant.skins.length} skins</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">${participant.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">{participant.winChance.toFixed(1)}% chance</div>
                      </div>
                    </div>
                    
                    {/* Win chance bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${participant.winChance}%`,
                          backgroundColor: participant.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <EnhancedCard variant="stats" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Game Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Round</span>
                  <span className="font-semibold">#{roundNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pot</span>
                  <span className="font-semibold text-yellow-400">${totalPotValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players</span>
                  <span className="font-semibold text-green-400">{participantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Left</span>
                  <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </EnhancedCard>

            {/* Recent Winners */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-orange-500" />
                Recent Winners
              </h3>
              <div className="space-y-2">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{winner.avatar}</span>
                      <div>
                        <div className="text-sm font-semibold">{winner.winner}</div>
                        <div className="text-xs text-gray-400">{winner.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-400">{winner.prize}</div>
                      <div className="text-xs text-gray-400">{winner.skins} skins</div>
                    </div>
                  </div>
                ))}
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
})

JackpotPage.displayName = 'JackpotPage'

export default JackpotPage 