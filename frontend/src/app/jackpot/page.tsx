'use client'

import React, { useState, useEffect, memo, useCallback } from 'react'
import { TrophyIcon, UserIcon, ClockIcon, CubeIcon, FireIcon } from '@heroicons/react/24/outline'
import { SkeletonGameTile, SkeletonCard, LoadingButton, Spinner } from '@/components/ui/LoadingStates'
import { useToast, createJackpotNotification, createNewRoundNotification, createBigWinNotification } from '@/components/ui/ToastNotifications'
import { useSound } from '@/hooks/useSound'

const JackpotPage = memo(() => {
  const { addNotification } = useToast()
  const { gameActions } = useSound()
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [selectedSkins, setSelectedSkins] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(45)
  const [totalPotValue, setTotalPotValue] = useState(4750.80)
  const [isCountingDown, setIsCountingDown] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoJoin, setAutoJoin] = useState(false)
  const [participantCount, setParticipantCount] = useState(3)
  const [roundNumber, setRoundNumber] = useState(2847)
  const [recentDrops, setRecentDrops] = useState<any[]>([])
  const [showWinnerModal, setShowWinnerModal] = useState(false)

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
        
        // Add winner notification
        addNotification(createJackpotNotification(
          gameWinner.user,
          totalPotValue,
          roundNumber,
          gameWinner.avatar
        ))
        
        // Show big win notification if prize is large
        if (totalPotValue > 1000) {
          addNotification(createBigWinNotification(
            gameWinner.user,
            totalPotValue,
            'Jackpot',
            gameWinner.avatar
          ))
        }
        
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
          
          // New round notification
          addNotification(createNewRoundNotification(
            'Jackpot',
            roundNumber + 1,
            Math.random() * 1000 + 200
          ))
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
        
        // Player joined notification
        addNotification({
          type: 'info',
          title: 'Player Joined! 👋',
          message: `${randomName} joined with ${Math.floor(Math.random() * 5 + 1)} skins`,
          avatar: '🎮',
          amount: joinValue,
          duration: 3000,
          metadata: {
            game: 'Jackpot',
            user: randomName,
            round: roundNumber,
            timestamp: new Date()
          }
        })
      }
      
      // Simulate pot value fluctuations
      if (Math.random() > 0.7) {
        setTotalPotValue(prev => prev + Math.random() * 100 + 10)
      }
    }, 3000 + Math.random() * 4000)
    
    return () => clearInterval(interval)
  }, [isCountingDown, isSpinning, participantCount])

  const recentWinners = [
    { winner: 'SkinCollector', prize: '$3,245.75', skins: 12, time: '2 min ago', avatar: '🏆' },
    { winner: 'ProGamer', prize: '$1,890.25', skins: 8, time: '15 min ago', avatar: '🎮' },
    { winner: 'TradeExpert', prize: '$5,670.80', skins: 21, time: '32 min ago', avatar: '💰' },
    { winner: 'CSGOKing', prize: '$2,156.45', skins: 15, time: '1 hr ago', avatar: '👑' },
  ]

  const userSkins = [
    { name: 'AK-47 Redline', value: 45.50, condition: 'Field-Tested', rarity: 'Classified' },
    { name: 'AWP Dragon Lore', value: 2450.00, condition: 'Battle-Scarred', rarity: 'Covert' },
    { name: 'Glock-18 Fade', value: 125.75, condition: 'Factory New', rarity: 'Restricted' },
    { name: 'Desert Eagle Blaze', value: 89.30, condition: 'Minimal Wear', rarity: 'Restricted' },
    { name: 'M4A1-S Hot Rod', value: 156.80, condition: 'Factory New', rarity: 'Classified' },
    { name: 'Karambit Doppler', value: 750.00, condition: 'Factory New', rarity: 'Covert' },
    { name: 'USP-S Kill Confirmed', value: 234.50, condition: 'Minimal Wear', rarity: 'Covert' },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Covert': return 'border-red-500 bg-red-500/10'
      case 'Classified': return 'border-pink-500 bg-pink-500/10'
      case 'Restricted': return 'border-purple-500 bg-purple-500/10'
      case 'Mil-Spec': return 'border-blue-500 bg-blue-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Factory New': return 'text-blue-400'
      case 'Minimal Wear': return 'text-green-400'
      case 'Field-Tested': return 'text-yellow-400'
      case 'Well-Worn': return 'text-orange-400'
      case 'Battle-Scarred': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const toggleSkinSelection = useCallback((skinName: string) => {
    // Play button click sound
    gameActions.buttonClick()
    
    setSelectedSkins(prev => 
      prev.includes(skinName) 
        ? prev.filter(s => s !== skinName)
        : [...prev, skinName]
    )
  }, [gameActions])

  const getTotalSelectedValue = useCallback(() => {
    return selectedSkins.reduce((total, skinName) => {
      const skin = userSkins.find(s => s.name === skinName)
      return total + (skin?.value || 0)
    }, 0)
  }, [selectedSkins])

  const handleJoinJackpot = useCallback(async () => {
    if (selectedSkins.length === 0 || timeLeft <= 5) return
    
    setIsJoining(true)
    
    // Play bet place sound
    gameActions.placeBet()
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Play success sound
    gameActions.winSmall()
    
    // Success notification
    addNotification({
      type: 'success',
      title: 'Successfully Joined! ✅',
      message: `You entered ${selectedSkins.length} skins worth $${getTotalSelectedValue().toFixed(2)}`,
      avatar: '🏆',
      amount: getTotalSelectedValue(),
      duration: 5000,
      metadata: {
        game: 'Jackpot',
        round: roundNumber,
        timestamp: new Date()
      }
    })
    
    // Reset after joining
    setSelectedSkins([])
    setIsJoining(false)
  }, [selectedSkins, timeLeft, gameActions])

  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-12 bg-gaming-darker rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gaming-darker rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <SkeletonGameTile />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            💎 <span className="neon-text">Jackpot</span>
          </h1>
          <p className="text-xl text-gray-300">
            Community pot - Winner takes all CS2 skins!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Jackpot Display */}
            <div className="gaming-card p-8 text-center">
              <div className="mb-6">
                <div className="text-6xl font-bold text-accent-success mb-2 animate-pulse">
                  ${totalPotValue.toFixed(2)}
                </div>
                <div className="text-xl text-gray-400">Total Jackpot</div>
              </div>

              {/* Timer */}
              <div className="mb-8">
                <div className={`text-4xl font-mono font-bold mb-2 ${
                  timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-accent-primary'
                }`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-gray-400">Time until draw</div>
              </div>

              {/* Enhanced Winner Wheel */}
              <div className="relative mb-8">
                {/* Spinning Status */}
                {isSpinning && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-accent-primary text-gaming-dark px-6 py-2 rounded-full font-bold animate-pulse">
                      🎰 SPINNING...
                    </div>
                  </div>
                )}
                
                {/* Winner Announcement */}
                {winner && !isSpinning && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-accent-success text-white px-6 py-2 rounded-full font-bold animate-bounce">
                      🏆 {winner} WINS!
                    </div>
                  </div>
                )}

                <div className="w-80 h-80 mx-auto bg-gaming-darker rounded-full border-4 border-accent-primary shadow-neon relative overflow-hidden">
                  {/* Wheel segments */}
                  <div 
                    className={`absolute inset-0 rounded-full transition-transform ${
                      isSpinning ? 'duration-[6000ms] ease-out' : 'duration-1000'
                    }`}
                    style={{ 
                      transform: `rotate(${wheelRotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    {participants.map((participant, index) => {
                      const startAngle = participants.slice(0, index).reduce((sum, p) => sum + (p.winChance / 100) * 360, 0)
                      
                      return (
                        <div
                          key={participant.user}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(from ${startAngle}deg, ${participant.color} 0deg, ${participant.color} ${participant.winChance * 3.6}deg, transparent ${participant.winChance * 3.6}deg)`,
                          }}
                        />
                      )
                    })}
                    
                    {/* User avatars on wheel */}
                    {participants.map((participant, index) => {
                      const angle = participants.slice(0, index).reduce((sum, p) => sum + (p.winChance / 100) * 360, 0) + (participant.winChance / 100) * 180
                      const radius = 120
                      const x = Math.cos((angle - 90) * Math.PI / 180) * radius
                      const y = Math.sin((angle - 90) * Math.PI / 180) * radius
                      
                      return (
                        <div
                          key={`avatar-${participant.user}`}
                          className="absolute w-12 h-12 bg-gaming-dark rounded-full flex items-center justify-center border-2 border-white text-2xl"
                          style={{
                            left: `calc(50% + ${x}px - 24px)`,
                            top: `calc(50% + ${y}px - 24px)`,
                            transform: `rotate(${-wheelRotation}deg)` // Counter-rotate avatars
                          }}
                        >
                          {participant.avatar}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Center hub */}
                  <div className="absolute inset-8 bg-gaming-dark rounded-full flex items-center justify-center border-4 border-accent-primary">
                    <TrophyIcon className={`w-16 h-16 text-accent-primary ${isSpinning ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  {/* Enhanced Pointer */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-transparent border-b-accent-primary drop-shadow-lg"></div>
                    <div className="w-4 h-4 bg-accent-primary rounded-full -mt-1 mx-auto border-2 border-white"></div>
                  </div>
                  
                  {/* Glow effect when spinning */}
                  {isSpinning && (
                    <div className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-20"></div>
                  )}
                </div>
                
                {/* Wheel controls */}
                <div className="flex justify-center mt-4 space-x-4">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      soundEnabled 
                        ? 'bg-accent-primary text-gaming-dark' 
                        : 'bg-gaming-card border border-gaming-border text-gray-400'
                    }`}
                  >
                    {soundEnabled ? '🔊' : '🔇'} Sound
                  </button>
                  <button
                    onClick={() => setAutoJoin(!autoJoin)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      autoJoin 
                        ? 'bg-accent-primary text-gaming-dark' 
                        : 'bg-gaming-card border border-gaming-border text-gray-400'
                    }`}
                  >
                    ⚡ Auto Join
                  </button>
                </div>
              </div>

              {/* Current Round Info */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{participantCount}</div>
                  <div className="text-sm text-gray-400">Players</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {participants.reduce((sum, p) => sum + p.skins.length, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Skins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">R#{roundNumber}</div>
                  <div className="text-sm text-gray-400">Round</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    isSpinning ? 'text-accent-primary animate-pulse' : 
                    timeLeft <= 10 ? 'text-red-400' : 'text-accent-success'
                  }`}>
                    {isSpinning ? '🎰' : timeLeft <= 0 ? '⏰' : '✅'}
                  </div>
                  <div className="text-sm text-gray-400">Status</div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Current Participants</h3>
              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div key={participant.user} className="bg-gaming-hover p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{participant.avatar}</span>
                        <div>
                          <div className="font-bold text-white">{participant.user}</div>
                          <div className="text-sm text-gray-400">
                            {participant.skins.length} skins • ${participant.totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-2xl font-bold mb-1"
                          style={{ color: participant.color }}
                        >
                          {participant.winChance.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">Win Chance</div>
                      </div>
                    </div>
                    
                    {/* Win Chance Bar */}
                    <div className="w-full bg-gaming-dark rounded-full h-2 mb-3">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${participant.winChance}%`,
                          backgroundColor: participant.color 
                        }}
                      />
                    </div>

                    {/* Participant Skins */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-xs text-gray-500 mb-1">Skins contributed:</div>
                      <div className="flex flex-wrap gap-1">
                        {participant.skins.slice(0, 3).map((skin, idx) => (
                          <span key={idx} className="text-xs bg-gaming-dark/50 px-2 py-1 rounded text-gray-300">
                            {skin}
                          </span>
                        ))}
                        {participant.skins.length > 3 && (
                          <span className="text-xs text-gray-400">+{participant.skins.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Join Jackpot Section */}
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Join This Round</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    {selectedSkins.length}/{userSkins.length} selected
                  </span>
                  {selectedSkins.length > 0 && (
                    <button
                      onClick={() => setSelectedSkins([])}
                      className="text-xs text-accent-primary hover:text-accent-secondary"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Quick selection buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => {
                    const highValue = userSkins.filter(s => s.value > 500).map(s => s.name)
                    setSelectedSkins(highValue)
                  }}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30"
                >
                  🔥 High Value ($500+)
                </button>
                <button
                  onClick={() => {
                    const medValue = userSkins.filter(s => s.value >= 100 && s.value <= 500).map(s => s.name)
                    setSelectedSkins(medValue)
                  }}
                  className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30"
                >
                  💎 Mid Tier ($100-500)
                </button>
                <button
                  onClick={() => {
                    const lowValue = userSkins.filter(s => s.value < 100).map(s => s.name)
                    setSelectedSkins(lowValue)
                  }}
                  className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30"
                >
                  ⚡ Budget (&lt;$100)
                </button>
              </div>
              
              {/* Enhanced skin grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-80 overflow-y-auto custom-scrollbar">
                {userSkins
                  .sort((a, b) => b.value - a.value) // Sort by value descending
                  .map((skin, index) => (
                  <button
                    key={index}
                    onClick={() => toggleSkinSelection(skin.name)}
                    disabled={timeLeft <= 5 || isSpinning}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left relative group
                      ${selectedSkins.includes(skin.name)
                        ? 'border-accent-primary bg-accent-primary/20 scale-105' 
                        : `${getRarityColor(skin.rarity)} hover:bg-opacity-30 hover:scale-105`
                      }
                      ${(timeLeft <= 5 || isSpinning) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neon'}
                    `}
                  >
                    {selectedSkins.includes(skin.name) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                    
                    <div className="font-semibold text-white text-sm mb-1">{skin.name}</div>
                    <div className={`text-xs mb-2 ${getConditionColor(skin.condition)}`}>
                      {skin.condition} • {skin.rarity}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-accent-success font-bold text-lg">
                        ${skin.value.toFixed(2)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {selectedSkins.includes(skin.name) ? '✓' : '+'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Enhanced selection summary */}
              {selectedSkins.length > 0 && (
                <div className="bg-gaming-darker p-4 rounded-lg mb-4 border border-accent-primary/30">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Value:</span>
                      <span className="text-accent-success font-bold text-xl">
                        ${getTotalSelectedValue().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Win Chance:</span>
                      <span className="text-accent-primary font-bold text-xl">
                        {((getTotalSelectedValue() / (totalPotValue + getTotalSelectedValue())) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Win chance visualization */}
                  <div className="w-full bg-gaming-dark rounded-full h-3 mb-2">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((getTotalSelectedValue() / (totalPotValue + getTotalSelectedValue())) * 100), 100)}%`
                      }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {getTotalSelectedValue() > totalPotValue * 0.5 ? 
                      "🔥 High chance of winning!" : 
                      getTotalSelectedValue() > totalPotValue * 0.2 ? 
                      "💪 Good shot at victory!" : 
                      "🎲 Taking a chance!"
                    }
                  </div>
                </div>
              )}

              <LoadingButton
                onClick={handleJoinJackpot}
                isLoading={isJoining}
                className={`w-full py-4 text-lg ${
                  selectedSkins.length === 0 || timeLeft <= 5 || isSpinning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selectedSkins.length === 0 || timeLeft <= 5 || isSpinning}
              >
                <CubeIcon className="w-6 h-6 mr-2 inline" />
                {isJoining ? 'Joining Jackpot...' : 
                 isSpinning ? 'Round in Progress' :
                 timeLeft <= 5 ? 'Betting Closed' :
                 `Join Jackpot (${selectedSkins.length} skins)`}
              </LoadingButton>
              
              {timeLeft <= 5 && (
                <div className="text-center text-red-400 text-sm mt-2">
                  <FireIcon className="w-4 h-4 inline mr-1" />
                  Betting closed - Drawing soon!
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Winners */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Winners</h3>
              <div className="space-y-3">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="p-3 bg-gaming-hover rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{winner.avatar}</span>
                        <div>
                          <div className="font-semibold text-white text-sm">{winner.winner}</div>
                          <div className="text-xs text-gray-400">{winner.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent-success font-semibold text-sm">{winner.prize}</div>
                        <div className="text-xs text-gray-400">{winner.skins} skins</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Rules */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">How Jackpot Works</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">1.</span>
                  <span>Players deposit CS2 skins into the pot</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">2.</span>
                  <span>Win chance = your skins value / total pot value</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">3.</span>
                  <span>When timer ends, winner is drawn randomly</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-accent-primary font-bold">4.</span>
                  <span>Winner gets ALL skins in the pot!</span>
                </div>
              </div>
            </div>

            {/* Jackpot Stats */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Pot:</span>
                  <span className="text-white">$2,847.60</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Biggest Win Today:</span>
                  <span className="text-accent-success font-semibold">$8,450.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Today:</span>
                  <span className="text-white">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Players:</span>
                  <span className="text-white">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Celebration Modal */}
        {showWinnerModal && winner && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gaming-card border border-accent-primary rounded-lg p-8 max-w-md w-full mx-4 text-center animate-bounce-in">
              <div className="text-6xl mb-4">🎉</div>
              
              <h2 className="text-3xl font-bold text-accent-primary mb-2">
                JACKPOT WINNER!
              </h2>
              
              <div className="text-6xl mb-4">
                {participants.find(p => p.user === winner)?.avatar || '🏆'}
              </div>
              
              <div className="text-2xl font-bold text-white mb-2">
                {winner}
              </div>
              
              <div className="text-accent-success text-xl font-semibold mb-4">
                Won ${totalPotValue.toFixed(2)}
              </div>
              
              <div className="bg-gaming-darker rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-400 mb-2">Prize Breakdown:</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-white font-semibold">{participants.reduce((sum, p) => sum + p.skins.length, 0)}</div>
                    <div className="text-gray-400">Total Skins</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{participantCount}</div>
                    <div className="text-gray-400">Players Beat</div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="flex-1 gaming-button-secondary py-3"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowWinnerModal(false)
                    // Navigate to next round or restart
                  }}
                  className="flex-1 gaming-button py-3"
                >
                  Next Round
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Round #{roundNumber} • {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Recent Drops Sidebar Update */}
        {recentDrops.length > 0 && (
          <div className="fixed top-4 right-4 z-40 w-80 max-h-96 overflow-y-auto">
            <div className="bg-gaming-card border border-gaming-border rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                🔥 Recent Big Wins
              </h3>
              <div className="space-y-2">
                {recentDrops.slice(0, 5).map((drop, index) => (
                  <div key={index} className="bg-gaming-hover p-3 rounded-lg animate-slide-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{drop.avatar}</span>
                        <div>
                          <div className="font-semibold text-white text-sm">{drop.winner}</div>
                          <div className="text-xs text-gray-400">
                            {drop.skins} skins • {Math.floor((Date.now() - drop.timestamp.getTime()) / 1000)}s ago
                          </div>
                        </div>
                      </div>
                      <div className="text-accent-success font-bold text-sm">
                        ${drop.prize.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default JackpotPage 