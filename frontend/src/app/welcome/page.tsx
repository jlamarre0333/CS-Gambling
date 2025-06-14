'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import { useGuest } from '@/contexts/GuestContext'
import { 
  PlayIcon,
  UserIcon,
  CurrencyDollarIcon,
  StarIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function WelcomePage() {
  const [username, setUsername] = useState('')
  const { createGuestUser } = useGuest()
  const router = useRouter()

  const handleStartPlaying = async () => {
    await createGuestUser(username || undefined)
    router.push('/')
  }

  const games = [
    { name: 'Coin Flip', icon: CurrencyDollarIcon, description: '50/50 chance to double your skins' },
    { name: 'Jackpot', icon: TrophyIcon, description: 'Winner takes the entire pot' },
    { name: 'Crash', icon: ChartBarIcon, description: 'Cash out before the crash' },
    { name: 'Roulette', icon: StarIcon, description: 'Bet on Red, Black, or Green' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-8xl mb-6">🎮</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              CS2 Skins
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            The Ultimate CS2 Skin Betting Platform
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Instant Play</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>No Download</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Demo Mode</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <EnhancedCard variant="premium" className="p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-4">Start Playing Instantly</h2>
            <p className="text-gray-400 mb-6">
              Jump right in with $1,000 demo balance. No registration required!
            </p>
            
            <div className="max-w-md mx-auto space-y-4">
              <EnhancedInput
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="Enter your username (optional)"
                className="w-full"
              />
              
              <EnhancedButton
                variant="primary"
                size="xl"
                onClick={handleStartPlaying}
                className="w-full h-16 text-xl font-bold"
              >
                <PlayIcon className="w-6 h-6 mr-2" />
                Start Playing Now
              </EnhancedButton>
              
              <p className="text-xs text-gray-500">
                Your progress will be saved locally. Upgrade to Steam account later!
              </p>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Games Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Available Games</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <EnhancedCard variant="game" className="p-6 h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <game.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{game.name}</h4>
                      <p className="text-sm text-gray-400">{game.description}</p>
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <EnhancedCard variant="stats" className="p-6 text-center">
            <CurrencyDollarIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Demo Balance</h4>
            <p className="text-gray-400 text-sm">
              Start with $1,000 virtual balance to test all games
            </p>
          </EnhancedCard>

          <EnhancedCard variant="stats" className="p-6 text-center">
            <UserIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">No Registration</h4>
            <p className="text-gray-400 text-sm">
              Play instantly without creating an account
            </p>
          </EnhancedCard>

          <EnhancedCard variant="stats" className="p-6 text-center">
            <StarIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Upgrade Later</h4>
            <p className="text-gray-400 text-sm">
              Connect Steam account when ready for real skins
            </p>
          </EnhancedCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <p>🎮 CS2 Skins - The Future of Skin Betting</p>
        </motion.div>
      </div>
    </div>
  )
} 