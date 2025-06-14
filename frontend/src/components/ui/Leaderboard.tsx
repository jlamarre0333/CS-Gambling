'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrophyIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { EnhancedCard } from './EnhancedCard'
import { api } from '@/lib/api'

interface LeaderboardEntry {
  username: string
  totalWon: number
  gamesPlayed: number
  winRate: string
}

interface LeaderboardProps {
  className?: string
  maxEntries?: number
  refreshInterval?: number
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  className = '', 
  maxEntries = 10,
  refreshInterval = 10000 
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      const response = await api.getLeaderboard()
      if (response.success && response.data) {
        setLeaderboard(response.data.leaderboard.slice(0, maxEntries))
        setError(null)
      }
    } catch (err) {
      setError('Failed to load leaderboard')
      console.error('Error fetching leaderboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, maxEntries])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <EnhancedCard variant="default" className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </EnhancedCard>
    )
  }

  if (error) {
    return (
      <EnhancedCard variant="default" className={`p-6 ${className}`}>
        <div className="text-center text-red-400">
          <TrophyIcon className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <EnhancedCard variant="premium" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
          Leaderboard
        </h3>
        <div className="flex items-center text-sm text-gray-400">
          <ChartBarIcon className="w-4 h-4 mr-1" />
          Top Players
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            return (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  rounded-lg p-4 border transition-all duration-200 hover:scale-[1.02]
                  ${rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl font-bold ${getRankColor(rank)}`}>
                      {getRankIcon(rank)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-white">{entry.username}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {entry.gamesPlayed} games • {entry.winRate}% win rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-green-400 text-lg">
                      ${entry.totalWon.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Total Won
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {leaderboard.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p>No players yet</p>
            <p className="text-sm">Start playing to claim the top spot!</p>
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}

export default Leaderboard 