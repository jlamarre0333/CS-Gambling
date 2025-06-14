'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClockIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline'
import { EnhancedCard } from './EnhancedCard'
import { api } from '@/lib/api'

interface GameFeedItem {
  id: string
  gameType: 'coinflip' | 'crash' | 'jackpot' | 'roulette'
  player: string
  betAmount: number
  winAmount: number
  won: boolean
  timestamp: string
}

interface LiveGameFeedProps {
  className?: string
  maxItems?: number
  refreshInterval?: number
}

const LiveGameFeed: React.FC<LiveGameFeedProps> = ({ 
  className = '', 
  maxItems = 10,
  refreshInterval = 5000 
}) => {
  const [games, setGames] = useState<GameFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentGames = async () => {
    try {
      const response = await api.getRecentGames()
      if (response.success && response.data) {
        setGames(response.data.games.slice(0, maxItems))
        setError(null)
      }
    } catch (err) {
      setError('Failed to load game feed')
      console.error('Error fetching recent games:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentGames()
    const interval = setInterval(fetchRecentGames, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, maxItems])

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'coinflip': return '🪙'
      case 'crash': return '🚀'
      case 'jackpot': return '🎰'
      case 'roulette': return '🎡'
      default: return '🎮'
    }
  }

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'coinflip': return 'text-yellow-400'
      case 'crash': return 'text-orange-400'
      case 'jackpot': return 'text-purple-400'
      case 'roulette': return 'text-red-400'
      default: return 'text-blue-400'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const gameTime = new Date(timestamp)
    const diffMs = now.getTime() - gameTime.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    
    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  if (isLoading) {
    return (
      <EnhancedCard variant="default" className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </EnhancedCard>
    )
  }

  if (error) {
    return (
      <EnhancedCard variant="default" className={`p-6 ${className}`}>
        <div className="text-center text-red-400">
          <FireIcon className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <EnhancedCard variant="default" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <FireIcon className="w-6 h-6 mr-2 text-orange-500" />
          Live Game Feed
        </h3>
        <div className="flex items-center text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getGameIcon(game.gameType)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{game.player}</span>
                      <span className={`text-sm capitalize ${getGameColor(game.gameType)}`}>
                        {game.gameType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTimeAgo(game.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Bet: ${game.betAmount.toFixed(2)}
                  </div>
                  <div className={`font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                    {game.won ? (
                      <span className="flex items-center">
                        <TrophyIcon className="w-4 h-4 mr-1" />
                        +${game.winAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span>-${game.betAmount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {games.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🎮</div>
            <p>No recent games</p>
            <p className="text-sm">Be the first to play!</p>
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}

export default LiveGameFeed 