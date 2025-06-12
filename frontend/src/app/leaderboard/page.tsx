'use client'

import React, { useState, useEffect, memo, useCallback } from 'react'
import { TrophyIcon, UserIcon, CubeIcon, CalendarIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { SkeletonLeaderboard, LoadingButton, Spinner } from '@/components/ui/LoadingStates'

const LeaderboardPage = memo(() => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all-time' | 'monthly' | 'weekly' | 'daily'>('all-time')
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({})

  const leaderboardData = {
    'all-time': [
      { 
        rank: 1, 
        user: 'SkinMaster', 
        avatar: '👑', 
        totalWagered: 89450.75, 
        totalWon: 156782.30, 
        gamesPlayed: 2847, 
        winRate: 68.5,
        biggestWin: 15670.80,
        favoriteGame: 'Jackpot',
        level: 47,
        joined: 'Jan 2023'
      },
      { 
        rank: 2, 
        user: 'CSGOPro', 
        avatar: '⚡', 
        totalWagered: 67820.40, 
        totalWon: 125440.90, 
        gamesPlayed: 1956, 
        winRate: 71.2,
        biggestWin: 8950.25,
        favoriteGame: 'Crash',
        level: 42,
        joined: 'Mar 2023'
      },
      { 
        rank: 3, 
        user: 'TradeKing', 
        avatar: '💎', 
        totalWagered: 45670.80, 
        totalWon: 89320.45, 
        gamesPlayed: 1432, 
        winRate: 65.8,
        biggestWin: 12340.50,
        favoriteGame: 'Roulette',
        level: 38,
        joined: 'Feb 2023'
      },
      { 
        rank: 4, 
        user: 'SkinCollector', 
        avatar: '🏆', 
        totalWagered: 38920.15, 
        totalWon: 67890.30, 
        gamesPlayed: 1108, 
        winRate: 59.4,
        biggestWin: 7890.25,
        favoriteGame: 'Coin Flip',
        level: 35,
        joined: 'Apr 2023'
      },
      { 
        rank: 5, 
        user: 'ProGamer', 
        avatar: '🎮', 
        totalWagered: 34560.90, 
        totalWon: 58760.40, 
        gamesPlayed: 956, 
        winRate: 72.1,
        biggestWin: 5670.80,
        favoriteGame: 'Crash',
        level: 31,
        joined: 'May 2023'
      },
      { 
        rank: 6, 
        user: 'TradeExpert', 
        avatar: '💰', 
        totalWagered: 29870.45, 
        totalWon: 51230.60, 
        gamesPlayed: 834, 
        winRate: 67.9,
        biggestWin: 4560.30,
        favoriteGame: 'Jackpot',
        level: 28,
        joined: 'Jun 2023'
      },
      { 
        rank: 7, 
        user: 'CSGOKing', 
        avatar: '🔥', 
        totalWagered: 25670.80, 
        totalWon: 45890.20, 
        gamesPlayed: 723, 
        winRate: 63.2,
        biggestWin: 3450.90,
        favoriteGame: 'Roulette',
        level: 25,
        joined: 'Jul 2023'
      },
      { 
        rank: 8, 
        user: 'SkinTrader', 
        avatar: '⭐', 
        totalWagered: 22340.50, 
        totalWon: 39870.15, 
        gamesPlayed: 645, 
        winRate: 69.8,
        biggestWin: 2890.70,
        favoriteGame: 'Coin Flip',
        level: 22,
        joined: 'Aug 2023'
      },
      { 
        rank: 9, 
        user: 'GamerX', 
        avatar: '🚀', 
        totalWagered: 19560.30, 
        totalWon: 34560.80, 
        gamesPlayed: 567, 
        winRate: 64.5,
        biggestWin: 2340.60,
        favoriteGame: 'Crash',
        level: 19,
        joined: 'Sep 2023'
      },
      { 
        rank: 10, 
        user: 'SkinLord', 
        avatar: '🎯', 
        totalWagered: 17890.70, 
        totalWon: 31240.90, 
        gamesPlayed: 489, 
        winRate: 61.3,
        biggestWin: 1890.40,
        favoriteGame: 'Jackpot',
        level: 16,
        joined: 'Oct 2023'
      }
    ],
    'monthly': [
      { 
        rank: 1, 
        user: 'SkinMaster', 
        avatar: '👑', 
        totalWagered: 8945.75, 
        totalWon: 15678.30, 
        gamesPlayed: 284, 
        winRate: 72.5,
        biggestWin: 2567.80,
        favoriteGame: 'Jackpot',
        level: 47,
        joined: 'Jan 2023'
      },
      { 
        rank: 2, 
        user: 'CSGOPro', 
        avatar: '⚡', 
        totalWagered: 6782.40, 
        totalWon: 12544.90, 
        gamesPlayed: 195, 
        winRate: 74.2,
        biggestWin: 1895.25,
        favoriteGame: 'Crash',
        level: 42,
        joined: 'Mar 2023'
      },
      { 
        rank: 3, 
        user: 'TradeKing', 
        avatar: '💎', 
        totalWagered: 4567.80, 
        totalWon: 8932.45, 
        gamesPlayed: 143, 
        winRate: 68.8,
        biggestWin: 1234.50,
        favoriteGame: 'Roulette',
        level: 38,
        joined: 'Feb 2023'
      }
    ],
    'weekly': [
      { 
        rank: 1, 
        user: 'CSGOPro', 
        avatar: '⚡', 
        totalWagered: 1782.40, 
        totalWon: 3244.90, 
        gamesPlayed: 45, 
        winRate: 78.2,
        biggestWin: 589.25,
        favoriteGame: 'Crash',
        level: 42,
        joined: 'Mar 2023'
      },
      { 
        rank: 2, 
        user: 'SkinMaster', 
        avatar: '👑', 
        totalWagered: 1645.75, 
        totalWon: 2978.30, 
        gamesPlayed: 38, 
        winRate: 75.5,
        biggestWin: 567.80,
        favoriteGame: 'Jackpot',
        level: 47,
        joined: 'Jan 2023'
      },
      { 
        rank: 3, 
        user: 'ProGamer', 
        avatar: '🎮', 
        totalWagered: 1234.80, 
        totalWon: 2456.45, 
        gamesPlayed: 32, 
        winRate: 81.1,
        biggestWin: 434.50,
        favoriteGame: 'Crash',
        level: 31,
        joined: 'May 2023'
      }
    ],
    'daily': [
      { 
        rank: 1, 
        user: 'ProGamer', 
        avatar: '🎮', 
        totalWagered: 234.80, 
        totalWon: 567.45, 
        gamesPlayed: 12, 
        winRate: 83.3,
        biggestWin: 134.50,
        favoriteGame: 'Crash',
        level: 31,
        joined: 'May 2023'
      },
      { 
        rank: 2, 
        user: 'SkinMaster', 
        avatar: '👑', 
        totalWagered: 198.75, 
        totalWon: 445.30, 
        gamesPlayed: 9, 
        winRate: 77.8,
        biggestWin: 89.80,
        favoriteGame: 'Jackpot',
        level: 47,
        joined: 'Jan 2023'
      },
      { 
        rank: 3, 
        user: 'CSGOPro', 
        avatar: '⚡', 
        totalWagered: 167.40, 
        totalWon: 378.90, 
        gamesPlayed: 8, 
        winRate: 87.5,
        biggestWin: 78.25,
        favoriteGame: 'Crash',
        level: 42,
        joined: 'Mar 2023'
      }
    ]
  }

  const currentData = leaderboardData[activeTab]

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Animate values when tab changes
  useEffect(() => {
    if (isLoading) return
    
    const newAnimatedValues: {[key: string]: number} = {}
    currentData.forEach((player) => {
      newAnimatedValues[`${player.user}_wagered`] = 0
      newAnimatedValues[`${player.user}_won`] = 0
    })
    setAnimatedValues(newAnimatedValues)

    const timer = setTimeout(() => {
      const finalAnimatedValues: {[key: string]: number} = {}
      currentData.forEach((player) => {
        finalAnimatedValues[`${player.user}_wagered`] = player.totalWagered
        finalAnimatedValues[`${player.user}_won`] = player.totalWon
      })
      setAnimatedValues(finalAnimatedValues)
    }, 100)

    return () => clearTimeout(timer)
  }, [activeTab, currentData, isLoading])

  const handleTabChange = useCallback((tab: 'all-time' | 'monthly' | 'weekly' | 'daily') => {
    setActiveTab(tab)
  }, [])

  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-12 bg-gaming-darker rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gaming-darker rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="mb-8">
            <div className="h-12 bg-gaming-darker rounded w-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <SkeletonLeaderboard />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gaming-darker rounded animate-pulse"></div>
              <div className="h-64 bg-gaming-darker rounded animate-pulse"></div>
              <div className="h-32 bg-gaming-darker rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getLevelColor = (level: number) => {
    if (level >= 40) return 'text-red-400'
    if (level >= 30) return 'text-purple-400'
    if (level >= 20) return 'text-blue-400'
    if (level >= 10) return 'text-green-400'
    return 'text-gray-400'
  }

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'all-time': return 'All Time'
      case 'monthly': return 'This Month'
      case 'weekly': return 'This Week'
      case 'daily': return 'Today'
      default: return tab
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏆 <span className="neon-text">Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-300">
            Top CS2 skin gamblers and their achievements
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {(['all-time', 'monthly', 'weekly', 'daily'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-accent-primary text-gaming-dark shadow-neon'
                    : 'bg-gaming-card text-gray-300 hover:bg-gaming-hover border border-gaming-border'
                }`}
              >
                <CalendarIcon className="w-5 h-5 inline mr-2" />
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            <div className="gaming-card p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrophyIcon className="w-7 h-7 mr-3 text-accent-primary" />
                {getTabLabel(activeTab)} Champions
              </h3>
              
              <div className="space-y-4">
                {currentData.map((player, index) => (
                  <div 
                    key={player.user}
                    className={`p-6 rounded-lg border transition-all duration-500 ${
                      player.rank <= 3 
                        ? 'bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border-accent-primary shadow-neon' 
                        : 'bg-gaming-hover border-gaming-border hover:border-accent-primary/50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Rank and User Info */}
                      <div className="md:col-span-4 flex items-center space-x-4">
                        <div className={`text-3xl font-bold ${
                          player.rank <= 3 ? 'text-accent-primary' : 'text-gray-400'
                        }`}>
                          {getRankMedal(player.rank)}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-4xl">{player.avatar}</span>
                          <div>
                            <div className="font-bold text-white text-lg">{player.user}</div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className={`font-semibold ${getLevelColor(player.level)}`}>
                                Lv.{player.level}
                              </span>
                              <span className="text-gray-400">• {player.joined}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Total Wagered</div>
                          <div className="font-bold text-accent-warning">
                            ${(animatedValues[`${player.user}_wagered`] || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Total Won</div>
                          <div className="font-bold text-accent-success">
                            ${(animatedValues[`${player.user}_won`] || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Games</div>
                          <div className="font-bold text-white">{player.gamesPlayed.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                          <div className={`font-bold ${
                            player.winRate >= 70 ? 'text-green-400' : 
                            player.winRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {player.winRate}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Biggest Win: </span>
                        <span className="text-accent-success font-semibold">${player.biggestWin.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Favorite Game: </span>
                        <span className="text-white font-semibold">{player.favoriteGame}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Profit: </span>
                        <span className={`font-semibold ${
                          player.totalWon > player.totalWagered ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${(player.totalWon - player.totalWagered).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">🏆 Top 3</h3>
              <div className="space-y-4">
                {currentData.slice(0, 3).map((player) => (
                  <div key={player.user} className="flex items-center space-x-3 p-3 bg-gaming-hover rounded-lg">
                    <div className="text-2xl">{getRankMedal(player.rank)}</div>
                    <div className="text-2xl">{player.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{player.user}</div>
                      <div className="text-xs text-accent-success">${player.totalWon.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Players:</span>
                  <span className="text-white">15,249</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Today:</span>
                  <span className="text-accent-primary">1,834</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Wagered:</span>
                  <span className="text-accent-warning">$2.1M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Won:</span>
                  <span className="text-accent-success">$1.9M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Biggest Win Ever:</span>
                  <span className="text-red-400">$25,670.80</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎖️ Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gaming-hover rounded">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="text-white text-sm font-semibold">High Roller</div>
                    <div className="text-xs text-gray-400">Win $10K+ in one game</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gaming-hover rounded">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="text-white text-sm font-semibold">Hot Streak</div>
                    <div className="text-xs text-gray-400">Win 10 games in a row</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gaming-hover rounded">
                  <span className="text-2xl">💎</span>
                  <div>
                    <div className="text-white text-sm font-semibold">Skin Collector</div>
                    <div className="text-xs text-gray-400">Own 100+ skins</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gaming-hover rounded">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="text-white text-sm font-semibold">Speed Demon</div>
                    <div className="text-xs text-gray-400">Play 1000+ games</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Competition */}
            <div className="gaming-card p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Join the Competition!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Start gambling with CS2 skins to climb the leaderboard and earn exclusive rewards.
              </p>
              <button className="gaming-button w-full">
                <CubeIcon className="w-5 h-5 mr-2 inline" />
                Start Playing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default LeaderboardPage 