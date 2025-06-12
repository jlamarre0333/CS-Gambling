'use client'

import React, { useState } from 'react'
import { UserIcon, TrophyIcon, ChartBarIcon, CogIcon, CalendarIcon, ClockIcon, CubeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'statistics' | 'settings'>('overview')

  const userProfile = {
    username: 'SkinMaster2024',
    avatar: '👑',
    level: 47,
    xp: 18750,
    xpToNext: 21000,
    joinDate: 'January 2023',
    totalGames: 2847,
    totalWagered: 89450.75,
    totalWon: 156782.30,
    profit: 67331.55,
    winRate: 68.5,
    longestWinStreak: 23,
    favoriteGame: 'Jackpot',
    country: 'United States',
    steamId: '76561198123456789'
  }

  const achievements = [
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      icon: '🏆',
      unlocked: true,
      date: new Date('2023-01-15'),
      rarity: 'Common'
    },
    {
      id: 'high_roller',
      name: 'High Roller',
      description: 'Win $10,000+ in a single game',
      icon: '💎',
      unlocked: true,
      date: new Date('2023-03-22'),
      rarity: 'Legendary'
    },
    {
      id: 'jackpot_master',
      name: 'Jackpot Master',
      description: 'Win 100 jackpot games',
      icon: '👑',
      unlocked: true,
      date: new Date('2023-06-10'),
      rarity: 'Epic'
    },
    {
      id: 'crash_expert',
      name: 'Crash Expert',
      description: 'Cash out at 10x+ multiplier 50 times',
      icon: '🚀',
      unlocked: true,
      date: new Date('2023-07-08'),
      rarity: 'Rare'
    },
    {
      id: 'skin_collector',
      name: 'Skin Collector',
      description: 'Own 500+ different skins',
      icon: '🎒',
      unlocked: false,
      progress: 347,
      target: 500,
      rarity: 'Epic'
    },
    {
      id: 'millionaire',
      name: 'Millionaire',
      description: 'Accumulate $1,000,000 in total winnings',
      icon: '💰',
      unlocked: false,
      progress: 156782.30,
      target: 1000000,
      rarity: 'Legendary'
    },
    {
      id: 'loyal_player',
      name: 'Loyal Player',
      description: 'Play for 365 consecutive days',
      icon: '🌟',
      unlocked: false,
      progress: 128,
      target: 365,
      rarity: 'Epic'
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Send 1000 chat messages',
      icon: '💬',
      unlocked: true,
      date: new Date('2023-05-15'),
      rarity: 'Common'
    }
  ]

  const gameStats = [
    {
      game: 'Jackpot',
      played: 856,
      won: 234,
      winRate: 27.3,
      totalWagered: 34567.80,
      totalWon: 67892.45,
      profit: 33324.65,
      biggestWin: 15670.80
    },
    {
      game: 'Crash',
      played: 1245,
      won: 789,
      winRate: 63.4,
      totalWagered: 23456.90,
      totalWon: 35678.20,
      profit: 12221.30,
      biggestWin: 4567.90
    },
    {
      game: 'Roulette',
      played: 534,
      won: 267,
      winRate: 50.0,
      totalWagered: 18765.40,
      totalWon: 31245.60,
      profit: 12480.20,
      biggestWin: 8934.50
    },
    {
      game: 'Coin Flip',
      played: 212,
      won: 156,
      winRate: 73.6,
      totalWagered: 12660.65,
      totalWon: 21966.05,
      profit: 9305.40,
      biggestWin: 3456.80
    }
  ]

  const recentActivity = [
    { action: 'Won Jackpot', amount: 2456.80, game: 'Jackpot', time: '2 hours ago', type: 'win' },
    { action: 'Deposited skins', amount: 567.30, game: 'Deposit', time: '4 hours ago', type: 'deposit' },
    { action: 'Lost on Crash', amount: -234.50, game: 'Crash', time: '6 hours ago', type: 'loss' },
    { action: 'Won Roulette', amount: 890.40, game: 'Roulette', time: '1 day ago', type: 'win' },
    { action: 'Achievement Unlocked', amount: 0, game: 'Crash Expert', time: '2 days ago', type: 'achievement' }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-red-500 bg-red-500/20 text-red-400'
      case 'Epic': return 'border-purple-500 bg-purple-500/20 text-purple-400'
      case 'Rare': return 'border-blue-500 bg-blue-500/20 text-blue-400'
      case 'Common': return 'border-gray-500 bg-gray-500/20 text-gray-400'
      default: return 'border-gray-500 bg-gray-500/20 text-gray-400'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'win': return '🎉'
      case 'loss': return '😞'
      case 'deposit': return '📥'
      case 'achievement': return '🏆'
      default: return '🎮'
    }
  }

  const getXPPercentage = () => {
    return (userProfile.xp / userProfile.xpToNext) * 100
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="gaming-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="text-6xl">{userProfile.avatar}</div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{userProfile.username}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400 mb-4">
                <span>Level {userProfile.level}</span>
                <span>•</span>
                <span>Joined {userProfile.joinDate}</span>
                <span>•</span>
                <span>{userProfile.country}</span>
              </div>
              
              {/* XP Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Experience</span>
                  <span>{userProfile.xp.toLocaleString()} / {userProfile.xpToNext.toLocaleString()} XP</span>
                </div>
                <div className="w-full bg-gaming-dark rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getXPPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-accent-success">
                    <AnimatedCounter from={0} to={userProfile.totalGames} duration={2000} />
                  </div>
                  <div className="text-xs text-gray-400">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-accent-warning">
                    <AnimatedCounter from={0} to={userProfile.winRate} duration={2000} decimals={1} suffix="%" />
                  </div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">
                    $<AnimatedCounter from={0} to={userProfile.profit} duration={2000} decimals={2} />
                  </div>
                  <div className="text-xs text-gray-400">Total Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-accent-primary">
                    <AnimatedCounter from={0} to={userProfile.longestWinStreak} duration={2000} />
                  </div>
                  <div className="text-xs text-gray-400">Best Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: UserIcon },
              { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
              { id: 'statistics', label: 'Statistics', icon: ChartBarIcon },
              { id: 'settings', label: 'Settings', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-accent-primary text-gaming-dark shadow-neon'
                    : 'bg-gaming-card text-gray-300 hover:bg-gaming-hover border border-gaming-border'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="gaming-card p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gaming-hover rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div>
                          <div className="font-semibold text-white">{activity.action}</div>
                          <div className="text-sm text-gray-400">{activity.game} • {activity.time}</div>
                        </div>
                      </div>
                      {activity.amount !== 0 && (
                        <div className={`font-semibold ${
                          activity.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-6">
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Wagered:</span>
                    <span className="text-white">${userProfile.totalWagered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Won:</span>
                    <span className="text-white">${userProfile.totalWon.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favorite Game:</span>
                    <span className="text-white">{userProfile.favoriteGame}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Steam ID:</span>
                    <span className="text-accent-primary text-xs">{userProfile.steamId}</span>
                  </div>
                </div>
              </div>

              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Next Goals</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Level {userProfile.level + 1}</span>
                      <span className="text-white">{((userProfile.xpToNext - userProfile.xp)).toLocaleString()} XP</span>
                    </div>
                    <div className="w-full bg-gaming-dark rounded-full h-2">
                      <div 
                        className="bg-accent-primary h-2 rounded-full"
                        style={{ width: `${getXPPercentage()}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Keep playing to unlock new features and rewards!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-6 rounded-lg border-2 transition-all ${
                  achievement.unlocked 
                    ? `${getRarityColor(achievement.rarity)} shadow-neon` 
                    : 'border-gray-600 bg-gray-600/10 opacity-75'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{achievement.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
                  
                  {achievement.unlocked ? (
                    <div className="text-green-400 text-sm">
                      ✅ Unlocked {achievement.date?.toLocaleDateString()}
                    </div>
                  ) : (
                    <div>
                      {achievement.progress !== undefined && achievement.target && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gaming-dark rounded-full h-2">
                            <div 
                              className="bg-accent-primary h-2 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="text-gray-500 text-sm">🔒 Locked</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="space-y-8">
            {/* Game Statistics */}
            <div className="gaming-card p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Game Statistics</h3>
              <div className="space-y-6">
                {gameStats.map((stat, index) => (
                  <div key={index} className="p-4 bg-gaming-hover rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
                      <div className="md:col-span-1">
                        <div className="font-bold text-white text-lg">{stat.game}</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className="text-white font-semibold">{stat.played}</div>
                        <div className="text-xs text-gray-400">Played</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className="text-green-400 font-semibold">{stat.won}</div>
                        <div className="text-xs text-gray-400">Won</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className="text-accent-primary font-semibold">{stat.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className="text-accent-warning font-semibold">${stat.totalWagered.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">Wagered</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className="text-accent-success font-semibold">${stat.totalWon.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">Won</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className={`font-semibold ${stat.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.profit > 0 ? '+' : ''}${stat.profit.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">Profit</div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <div className="text-yellow-400 font-semibold">${stat.biggestWin.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">Best Win</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="gaming-card p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={userProfile.username}
                    className="gaming-input w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Steam Trade URL</label>
                  <input 
                    type="text" 
                    placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                    className="gaming-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Notifications</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-300">Win notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-gray-300">Promotional offers</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-gray-300">Weekly summaries</span>
                    </label>
                  </div>
                </div>
                <button className="gaming-button w-full">
                  Save Settings
                </button>
              </div>
            </div>

            <div className="gaming-card p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Security</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-400">
                    <span>✅</span>
                    <span className="font-semibold">Steam Account Verified</span>
                  </div>
                </div>
                <div className="p-4 bg-gaming-hover rounded-lg">
                  <div className="text-white font-semibold mb-2">Two-Factor Authentication</div>
                  <div className="text-gray-400 text-sm mb-3">
                    Add an extra layer of security to your account
                  </div>
                  <button className="gaming-button-secondary">
                    Enable 2FA
                  </button>
                </div>
                <div className="p-4 bg-gaming-hover rounded-lg">
                  <div className="text-white font-semibold mb-2">Session Management</div>
                  <div className="text-gray-400 text-sm mb-3">
                    View and manage your active sessions
                  </div>
                  <button className="gaming-button-secondary">
                    View Sessions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage 