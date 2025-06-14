'use client'

import React, { useState, useEffect, memo, useCallback } from 'react'
import { TrophyIcon, UserIcon, ClockIcon, CubeIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LiveGameFeed from '@/components/ui/LiveGameFeed'
import Leaderboard from '@/components/ui/Leaderboard'
import { useToast } from '@/components/ui/Toast'
import SteamInventory from '@/components/SteamInventory'

interface JackpotParticipant {
  user: string
  avatar: string
  steamId: string
  skins: Array<{
    id: string
    name: string
    price: number
    icon_url: string
  }>
  totalValue: number
  winChance: number
  color: string
}

interface InventoryItem {
  id: string
  name: string
  market_name: string
  icon_url: string
  rarity: string
  type: string
  price: number
  tradable: boolean
  marketable: boolean
}

const JackpotPage = memo(() => {
  const { gameActions } = useSound()
  const { user, isAuthenticated } = useAuth()
  const { showToast, ToastComponent } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [selectedSkins, setSelectedSkins] = useState<InventoryItem[]>([])
  const [timeLeft, setTimeLeft] = useState(45)
  const [totalPotValue, setTotalPotValue] = useState(0)
  const [isCountingDown, setIsCountingDown] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [roundNumber, setRoundNumber] = useState(2847)
  const [recentDrops, setRecentDrops] = useState<any[]>([])
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [showInventory, setShowInventory] = useState(false)
  const [userBalance, setUserBalance] = useState(1250.75)
  const [participants, setParticipants] = useState<JackpotParticipant[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loadingInventory, setLoadingInventory] = useState(false)

  // Fetch user's inventory when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.steamId) {
      fetchUserInventory()
    }
  }, [isAuthenticated, user])

  const fetchUserInventory = async () => {
    if (!user?.steamId) return
    
    setLoadingInventory(true)
    try {
      const response = await fetch(`http://localhost:3001/api/steam-auth/inventory/${user.steamId}`, {
        credentials: 'include'
      })

      const data = await response.json()
      
      if (response.ok && data.success && data.items) {
        const transformedItems: InventoryItem[] = data.items.map((item: any) => ({
          id: item.id.toString(),
          name: item.name || `CS2 Item ${item.id}`,
          market_name: item.name || `CS2 Item ${item.id}`,
          icon_url: item.icon_url || '',
          rarity: item.rarity || 'Consumer Grade',
          type: item.type || 'Unknown',
          price: (item.price || 0) / 100, // Convert cents to dollars
          tradable: item.tradable !== false,
          marketable: item.marketable !== false
        }))
        
        setInventory(transformedItems)
        console.log('✅ Inventory loaded:', transformedItems.length, 'items')
      }
    } catch (error) {
      console.error('❌ Failed to fetch inventory:', error)
      showToast('error', 'Failed to load your inventory')
    } finally {
      setLoadingInventory(false)
    }
  }

  // Calculate win chances based on participant values
  const calculateWinChances = (participants: JackpotParticipant[]) => {
    const totalValue = participants.reduce((sum, p) => sum + p.totalValue, 0)
    return participants.map(p => ({
      ...p,
      winChance: totalValue > 0 ? (p.totalValue / totalValue) * 100 : 0
    }))
  }

  // Generate colors for participants
  const generateParticipantColor = (index: number) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
    return colors[index % colors.length]
  }

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Initialize with some demo participants
      const demoParticipants: JackpotParticipant[] = [
        {
          user: 'SkinMaster',
          avatar: '👑',
          steamId: 'demo1',
          skins: [
            { id: '1', name: 'AWP Dragon Lore', price: 2450.00, icon_url: '' },
          ],
          totalValue: 2450.00,
          winChance: 0,
          color: generateParticipantColor(0)
        },
        {
          user: 'CSGOPro',
          avatar: '⚡',
          steamId: 'demo2',
          skins: [
            { id: '2', name: 'M4A4 Howl', price: 1890.50, icon_url: '' },
          ],
          totalValue: 1890.50,
          winChance: 0,
          color: generateParticipantColor(1)
        }
      ]
      
      const updatedParticipants = calculateWinChances(demoParticipants)
      setParticipants(updatedParticipants)
      setTotalPotValue(updatedParticipants.reduce((sum, p) => sum + p.totalValue, 0))
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Advanced countdown timer with wheel spinning
  useEffect(() => {
    if (isCountingDown && timeLeft > 0 && !isSpinning) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSpinning && participants.length > 0) {
      setIsCountingDown(false)
      setIsSpinning(true)
      
      // Start wheel spinning sound
      gameActions.wheelSpin()
      
      // Enhanced carnival wheel spinning with realistic physics
      const spinDuration = 5000 + Math.random() * 2000 // 5-7 seconds for dramatic effect
      const baseRotations = 8 + Math.random() * 4 // 8-12 full rotations for carnival feel
      
      // Calculate winner based on probability first
      const random = Math.random() * 100
      let cumulativeChance = 0
      let winnerIndex = 0
      
      for (let i = 0; i < participants.length; i++) {
        cumulativeChance += participants[i].winChance
        if (random <= cumulativeChance) {
          winnerIndex = i
          break
        }
      }
      
      // Calculate precise landing position for carnival wheel
      const winnerStartAngle = participants.slice(0, winnerIndex).reduce((sum, p) => sum + (p.winChance / 100) * 360, 0)
      const winnerEndAngle = winnerStartAngle + (participants[winnerIndex].winChance / 100) * 360
      const winnerMidAngle = (winnerStartAngle + winnerEndAngle) / 2
      
      // Calculate final rotation - pointer is at top (0 degrees), so we need to rotate the wheel
      // so the winner segment is under the pointer
      const targetAngle = 360 - winnerMidAngle + (Math.random() * 15 - 7.5) // Small randomness within winner segment
      const finalRotation = baseRotations * 360 + targetAngle
      
      // Start the wheel spinning with a slight delay for dramatic effect
      setTimeout(() => {
        setWheelRotation(finalRotation)
      }, 200)
      
      // Determine winner after spin
      setTimeout(() => {
        gameActions.wheelStop()
        
        const gameWinner = participants[winnerIndex]
        setWinner(gameWinner.user)
        setShowWinnerModal(true)
        
        setTimeout(() => {
          gameActions.winJackpot()
        }, 500)
        
        showToast('success', `🎉 ${gameWinner.user} won the jackpot! $${totalPotValue.toFixed(2)}`)
        
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
          setRoundNumber(prev => prev + 1)
          setWheelRotation(0)
          setIsCountingDown(true)
          setSelectedSkins([]) // Clear user selections
          
          // Reset participants but keep user if they joined
          const userParticipant = participants.find(p => p.steamId === user?.steamId)
          if (userParticipant) {
            const newParticipants = [userParticipant]
            const updated = calculateWinChances(newParticipants)
            setParticipants(updated)
            setTotalPotValue(updated.reduce((sum, p) => sum + p.totalValue, 0))
          } else {
            setParticipants([])
            setTotalPotValue(0)
          }
        }, 8000)
      }, spinDuration)
    }
  }, [timeLeft, isCountingDown, isSpinning, participants, totalPotValue, user])

  const joinJackpot = async () => {
    if (!isAuthenticated || betAmount <= 0 || betAmount > userBalance || isJoining) {
      if (!isAuthenticated) {
        showToast('error', 'Please login with Steam to join the jackpot!')
        return
      }
      if (betAmount <= 0) {
        showToast('error', 'Please enter a valid bet amount!')
        return
      }
      if (betAmount > userBalance) {
        showToast('error', 'Insufficient balance!')
        return
      }
      return
    }

    setIsJoining(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create user participant
      const userParticipant: JackpotParticipant = {
        user: user?.username || 'You',
        avatar: '🎮',
        steamId: user?.steamId || '',
        skins: [{ id: 'balance', name: `Balance Bet ($${betAmount})`, price: betAmount, icon_url: '' }],
        totalValue: betAmount,
        winChance: 0,
        color: generateParticipantColor(participants.length)
      }
      
      const newParticipants = [...participants, userParticipant]
      const updatedParticipants = calculateWinChances(newParticipants)
      
      setParticipants(updatedParticipants)
      setTotalPotValue(prev => prev + betAmount)
      setUserBalance(prev => prev - betAmount)
      
      showToast('success', `🎰 Joined jackpot with $${betAmount}!`)
      gameActions.placeBet()
    } catch (error) {
      console.error('Error joining jackpot:', error)
      showToast('error', 'Failed to join jackpot. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const joinWithSkins = () => {
    if (!isAuthenticated) {
      showToast('error', 'Please login with Steam to use your skins!')
      return
    }
    setShowInventory(true)
  }

  const handleSkinSelection = (selectedItems: InventoryItem[]) => {
    setSelectedSkins(selectedItems)
  }

  const depositSelectedSkins = async () => {
    if (selectedSkins.length === 0) {
      showToast('error', 'Please select at least one skin to deposit!')
      return
    }

    setIsJoining(true)
    try {
      // Simulate API call for skin deposit
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const totalValue = selectedSkins.reduce((sum, skin) => sum + skin.price, 0)
      
      // Create user participant with selected skins
      const userParticipant: JackpotParticipant = {
        user: user?.username || 'You',
        avatar: '🎮',
        steamId: user?.steamId || '',
        skins: selectedSkins.map(skin => ({
          id: skin.id,
          name: skin.name,
          price: skin.price,
          icon_url: skin.icon_url
        })),
        totalValue: totalValue,
        winChance: 0,
        color: generateParticipantColor(participants.length)
      }
      
      const newParticipants = [...participants, userParticipant]
      const updatedParticipants = calculateWinChances(newParticipants)
      
      setParticipants(updatedParticipants)
      setTotalPotValue(prev => prev + totalValue)
      
      // Remove deposited skins from inventory
      setInventory(prev => prev.filter(item => !selectedSkins.some(selected => selected.id === item.id)))
      setSelectedSkins([])
      setShowInventory(false)
      
      showToast('success', `🎰 Deposited ${selectedSkins.length} skins worth $${totalValue.toFixed(2)}!`)
      gameActions.placeBet()
    } catch (error) {
      console.error('Error depositing skins:', error)
      showToast('error', 'Failed to deposit skins. Please try again.')
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
            🎰 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">CS2 Skin Jackpot</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Deposit your CS2 skins and winner takes the entire pot!
          </p>
          
          {/* Live Stats Banner */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Current Pot</div>
                <div className="text-2xl font-bold text-yellow-400">${totalPotValue.toFixed(2)}</div>
              </div>
            </EnhancedCard>
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Players</div>
                <div className="text-2xl font-bold text-blue-400">{participants.length}</div>
              </div>
            </EnhancedCard>
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Time Left</div>
                <div className="text-2xl font-bold text-red-400">{timeLeft}s</div>
              </div>
            </EnhancedCard>
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Round</div>
                <div className="text-2xl font-bold text-purple-400">#{roundNumber}</div>
              </div>
            </EnhancedCard>
          </div>

          {/* User Stats - Only show if logged in */}
          {isAuthenticated && user && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <EnhancedCard variant="stats" className="px-6 py-3">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-xl font-bold text-green-400">${userBalance.toFixed(2)}</div>
                </div>
              </EnhancedCard>
              <EnhancedCard variant="stats" className="px-6 py-3">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Profile</div>
                  <div className="text-xl font-bold text-blue-400">{user.username}</div>
                </div>
              </EnhancedCard>
              <EnhancedCard variant="stats" className="px-6 py-3">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Inventory</div>
                  <div className="text-xl font-bold text-purple-400">{inventory.length} items</div>
                </div>
              </EnhancedCard>
            </div>
          )}
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
                    {participants.length} players • {timeLeft}s remaining
                  </div>
                </div>

                {/* Enhanced Jackpot Wheel - Carnival Style */}
                <div className="mb-8">
                  <div className="relative w-[500px] h-[500px] mx-auto">
                    {/* Outer carnival frame with lights */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 p-4 shadow-2xl">
                      {/* Animated lights around the frame */}
                      <div className="absolute inset-0 rounded-full">
                        {Array.from({ length: 32 }, (_, i) => {
                          const angle = (i * 11.25) - 90
                          const x = 50 + 48 * Math.cos(angle * Math.PI / 180)
                          const y = 50 + 48 * Math.sin(angle * Math.PI / 180)
                          return (
                            <div
                              key={i}
                              className={`absolute w-3 h-3 rounded-full ${
                                i % 2 === 0 ? 'bg-yellow-300' : 'bg-white'
                              } animate-pulse shadow-lg`}
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          )
                        })}
                      </div>
                      
                      {/* Inner wheel container */}
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-8 border-gray-700 shadow-inner relative overflow-hidden">
                        
                        {/* Main spinning wheel */}
                        <motion.div
                          className="absolute inset-2 rounded-full relative overflow-hidden"
                          animate={{ rotate: wheelRotation }}
                          transition={{ 
                            duration: isSpinning ? 4 : 0, 
                            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear" 
                          }}
                        >
                          {/* Wheel segments */}
                          {participants.length > 0 ? (
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                              {participants.map((participant, index) => {
                                const totalAngle = 360
                                const startAngle = participants.slice(0, index).reduce((sum, p) => sum + (p.winChance / 100) * totalAngle, 0)
                                const segmentAngle = (participant.winChance / 100) * totalAngle
                                const endAngle = startAngle + segmentAngle
                                
                                // Calculate path for segment
                                const centerX = 200
                                const centerY = 200
                                const outerRadius = 190
                                const innerRadius = 40
                                
                                const startAngleRad = (startAngle - 90) * Math.PI / 180
                                const endAngleRad = (endAngle - 90) * Math.PI / 180
                                
                                // Outer arc points
                                const x1 = centerX + outerRadius * Math.cos(startAngleRad)
                                const y1 = centerY + outerRadius * Math.sin(startAngleRad)
                                const x2 = centerX + outerRadius * Math.cos(endAngleRad)
                                const y2 = centerY + outerRadius * Math.sin(endAngleRad)
                                
                                // Inner arc points
                                const x3 = centerX + innerRadius * Math.cos(endAngleRad)
                                const y3 = centerY + innerRadius * Math.sin(endAngleRad)
                                const x4 = centerX + innerRadius * Math.cos(startAngleRad)
                                const y4 = centerY + innerRadius * Math.sin(startAngleRad)
                                
                                const largeArcFlag = segmentAngle > 180 ? 1 : 0
                                
                                const pathData = [
                                  `M ${x1} ${y1}`,
                                  `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                  `L ${x3} ${y3}`,
                                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                                  'Z'
                                ].join(' ')
                                
                                // Calculate text position
                                const midAngle = startAngle + segmentAngle / 2
                                const textRadius = (outerRadius + innerRadius) / 2
                                const textAngleRad = (midAngle - 90) * Math.PI / 180
                                const textX = centerX + textRadius * Math.cos(textAngleRad)
                                const textY = centerY + textRadius * Math.sin(textAngleRad)
                                
                                // Generate vibrant colors for carnival feel
                                const colors = [
                                  '#ef4444', '#f97316', '#eab308', '#22c55e', 
                                  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
                                  '#f59e0b', '#10b981', '#6366f1', '#f43f5e'
                                ]
                                const segmentColor = colors[index % colors.length]
                                
                                return (
                                  <g key={participant.steamId}>
                                    {/* Main segment */}
                                    <path
                                      d={pathData}
                                      fill={segmentColor}
                                      stroke="#1f2937"
                                      strokeWidth="3"
                                      className="transition-all duration-300"
                                    />
                                    
                                    {/* Segment highlight/shine effect */}
                                    <path
                                      d={pathData}
                                      fill="url(#segmentShine)"
                                      opacity="0.3"
                                    />
                                    
                                    {/* Segment border lines */}
                                    <line
                                      x1={x1}
                                      y1={y1}
                                      x2={x4}
                                      y2={y4}
                                      stroke="#1f2937"
                                      strokeWidth="4"
                                    />
                                    <line
                                      x1={x2}
                                      y1={y2}
                                      x2={x3}
                                      y2={y3}
                                      stroke="#1f2937"
                                      strokeWidth="4"
                                    />
                                    
                                    {/* Player info on segment */}
                                    {segmentAngle > 15 && ( // Only show text if segment is large enough
                                      <g transform={`rotate(${midAngle}, ${textX}, ${textY})`}>
                                        {/* Background for text readability */}
                                        <rect
                                          x={textX - 35}
                                          y={textY - 25}
                                          width="70"
                                          height="50"
                                          fill="rgba(0,0,0,0.7)"
                                          rx="8"
                                          stroke="#ffffff"
                                          strokeWidth="2"
                                        />
                                        
                                        {/* Player avatar/emoji */}
                                        <text
                                          x={textX}
                                          y={textY - 8}
                                          textAnchor="middle"
                                          className="fill-white font-bold drop-shadow-lg"
                                          style={{ fontSize: segmentAngle > 45 ? '20px' : '16px' }}
                                        >
                                          {participant.avatar}
                                        </text>
                                        
                                        {/* Player name */}
                                        <text
                                          x={textX}
                                          y={textY + 6}
                                          textAnchor="middle"
                                          className="fill-white font-bold drop-shadow-lg"
                                          style={{ fontSize: segmentAngle > 45 ? '12px' : '10px' }}
                                        >
                                          {participant.user.length > 10 ? participant.user.substring(0, 10) + '...' : participant.user}
                                        </text>
                                        
                                        {/* Win percentage - prominent display */}
                                        <text
                                          x={textX}
                                          y={textY + 20}
                                          textAnchor="middle"
                                          className="fill-yellow-300 font-black drop-shadow-lg"
                                          style={{ fontSize: segmentAngle > 45 ? '16px' : '14px' }}
                                        >
                                          {participant.winChance.toFixed(1)}%
                                        </text>
                                      </g>
                                    )}
                                  </g>
                                )
                              })}
                              
                              {/* Gradient definitions */}
                              <defs>
                                <linearGradient id="segmentShine" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                </linearGradient>
                                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#fbbf24" />
                                  <stop offset="50%" stopColor="#f59e0b" />
                                  <stop offset="100%" stopColor="#d97706" />
                                </radialGradient>
                              </defs>
                            </svg>
                          ) : (
                            // Empty wheel state with carnival pattern
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-8xl mb-4 animate-bounce">🎪</div>
                                <div className="text-2xl font-bold text-yellow-400">Waiting for Players</div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                        
                        {/* Center hub */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl z-10">
                            {isSpinning ? (
                              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : participants.length === 0 ? (
                              <div className="text-3xl">🎰</div>
                            ) : (
                              <div className="text-4xl animate-pulse">💎</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced carnival-style pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-30">
                      <div className="relative">
                        {/* Pointer base/mount */}
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-2xl mb-2"></div>
                        
                        {/* Main pointer arrow */}
                        <div className="relative">
                          <div className="w-0 h-0 border-l-6 border-r-6 border-t-20 border-l-transparent border-r-transparent border-t-red-500 drop-shadow-2xl"></div>
                          {/* Pointer highlight */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-16 border-l-transparent border-r-transparent border-t-red-400"></div>
                          {/* Pointer shadow */}
                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-20 border-l-transparent border-r-transparent border-t-black opacity-30 blur-sm"></div>
                        </div>
                        
                        {/* Pointer glow effect */}
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-red-400 opacity-50 blur-lg rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Carnival decorative elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner decorations */}
                      <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</div>
                      <div className="absolute top-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎪</div>
                      <div className="absolute bottom-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🎯</div>
                      <div className="absolute bottom-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🎊</div>
                    </div>
                  </div>
                  
                  {winner && showWinnerModal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="mt-8 p-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl border-4 border-white shadow-2xl"
                    >
                      <div className="text-center text-white">
                        <div className="text-6xl font-black mb-4 animate-pulse drop-shadow-lg">
                          🎉 WINNER! 🎉
                        </div>
                        <div className="text-4xl font-bold mb-2 drop-shadow-lg">
                          {winner}
                        </div>
                        <div className="text-3xl font-bold mb-2 drop-shadow-lg">
                          Wins ${totalPotValue.toFixed(2)}!
                        </div>
                        <div className="text-xl opacity-90">
                          🏆 Congratulations on your victory! 🏆
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Join Controls */}
                {!isSpinning && isCountingDown && (
                  <div className="space-y-6">
                    {isAuthenticated ? (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Join the Jackpot</h3>
                        
                        {/* Join with Skins Button */}
                        <div className="mb-6">
                          <EnhancedButton
                            variant="primary"
                            size="xl"
                            onClick={joinWithSkins}
                            disabled={isJoining || loadingInventory}
                            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 mb-4"
                          >
                            <CubeIcon className="w-6 h-6 mr-2" />
                            {loadingInventory ? 'Loading Inventory...' : '🎒 Join with CS2 Skins'}
                            <SparklesIcon className="w-6 h-6 ml-2" />
                          </EnhancedButton>
                          <p className="text-sm text-gray-400">
                            Use your real CS2 skins from your Steam inventory ({inventory.length} items available)
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                          <div className="flex-1 border-t border-gray-600"></div>
                          <span className="px-4 text-gray-400">OR</span>
                          <div className="flex-1 border-t border-gray-600"></div>
                        </div>

                        {/* Join with Balance */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 text-gray-300">Join with Balance</h4>
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
                                onClick={() => setBetAmount(Math.min(amount, userBalance))}
                                disabled={isJoining || amount > userBalance}
                              >
                                ${amount}
                              </EnhancedButton>
                            ))}
                          </div>
                          
                          <EnhancedButton
                            variant="secondary"
                            size="xl"
                            onClick={joinJackpot}
                            disabled={betAmount <= 0 || betAmount > userBalance || isJoining}
                            loading={isJoining}
                            className="w-full h-16 text-xl font-bold"
                          >
                            {isJoining ? '🎰 Joining...' : 
                             betAmount > 0 && betAmount <= userBalance ? 
                               `🎰 Join Jackpot ($${betAmount})` : 
                               'Enter Valid Bet Amount'
                            }
                          </EnhancedButton>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="text-4xl mb-4">👀</div>
                        <h3 className="text-xl font-bold mb-2">Spectate Mode</h3>
                        <p className="text-gray-400 mb-4">
                          You're watching the jackpot! Login with Steam to join with your CS2 skins.
                        </p>
                        <EnhancedButton 
                          variant="primary" 
                          size="lg"
                          onClick={() => { window.location.href = 'http://localhost:3001/api/steam-auth/login' }}
                          className="w-full"
                        >
                          🔑 Login with Steam to Join
                        </EnhancedButton>
                      </div>
                    )}
                  </div>
                )}

                {/* No participants message */}
                {participants.length === 0 && !isSpinning && (
                  <div className="mt-8 p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="text-3xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-2">Waiting for Players</h3>
                    <p className="text-gray-400">
                      Be the first to join this jackpot round! Deposit your skins or balance to start the game.
                    </p>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Participants */}
            {participants.length > 0 && (
              <EnhancedCard variant="default" className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2 text-blue-500" />
                  Current Players ({participants.length})
                </h3>
                <div className="space-y-4">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.steamId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{participant.avatar}</div>
                        <div>
                          <div className="font-semibold text-white">{participant.user}</div>
                          <div className="text-sm text-gray-400">
                            {participant.skins.length} items • ${participant.totalValue.toFixed(2)}
                          </div>
                          {participant.skins.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {participant.skins.slice(0, 3).map(skin => skin.name).join(', ')}
                              {participant.skins.length > 3 && ` +${participant.skins.length - 3} more`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: participant.color }}>
                          {participant.winChance.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">Win Chance</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </EnhancedCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Winners */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Recent Winners
              </h3>
              <div className="space-y-3">
                {recentWinners.map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{winner.avatar}</div>
                      <div>
                        <div className="font-medium text-white text-sm">{winner.winner}</div>
                        <div className="text-xs text-gray-400">{winner.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{winner.prize}</div>
                      <div className="text-xs text-gray-400">{winner.skins} skins</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </EnhancedCard>

            {/* Live Game Feed */}
            <LiveGameFeed />

            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </div>
      </div>

      {/* Enhanced Steam Inventory Modal */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Select CS2 Skins to Deposit</h2>
                  <p className="text-gray-400 mt-1">
                    {selectedSkins.length > 0 
                      ? `${selectedSkins.length} items selected • Total: $${selectedSkins.reduce((sum, skin) => sum + skin.price, 0).toFixed(2)}`
                      : 'Choose skins from your inventory to deposit into the jackpot'
                    }
                  </p>
                </div>
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInventory(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </EnhancedButton>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Inventory Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {inventory.map((item) => {
                    const isSelected = selectedSkins.some(selected => selected.id === item.id)
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-yellow-400 bg-yellow-400/10' 
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSkins(prev => prev.filter(s => s.id !== item.id))
                          } else {
                            setSelectedSkins(prev => [...prev, item])
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-black text-sm font-bold">✓</span>
                          </div>
                        )}
                        
                        <div className="aspect-square bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden">
                          {item.icon_url ? (
                            <img 
                              src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                const nextElement = target.nextElementSibling as HTMLElement
                                target.style.display = 'none'
                                if (nextElement) nextElement.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400" style={{ display: item.icon_url ? 'none' : 'flex' }}>
                            <CubeIcon className="w-8 h-8" />
                          </div>
                        </div>
                        
                        <div className="text-xs text-white font-medium mb-1 line-clamp-2">
                          {item.name}
                        </div>
                        <div className="text-xs text-green-400 font-bold">
                          ${item.price.toFixed(2)}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {inventory.length === 0 && (
                  <div className="text-center py-12">
                    <CubeIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Items Found</h3>
                    <p className="text-gray-500">
                      Your CS2 inventory appears to be empty or private. Make sure your Steam inventory is public.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-700 flex gap-4">
                <EnhancedButton
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowInventory(false)}
                  className="flex-1"
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton
                  variant="primary"
                  size="lg"
                  onClick={depositSelectedSkins}
                  disabled={selectedSkins.length === 0 || isJoining}
                  loading={isJoining}
                  className="flex-1"
                >
                  {isJoining 
                    ? 'Depositing...' 
                    : selectedSkins.length > 0 
                      ? `Deposit ${selectedSkins.length} Items ($${selectedSkins.reduce((sum, skin) => sum + skin.price, 0).toFixed(2)})` 
                      : 'Select Items to Deposit'
                  }
                </EnhancedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {ToastComponent}
    </div>
  )
})

JackpotPage.displayName = 'JackpotPage'

export default JackpotPage 