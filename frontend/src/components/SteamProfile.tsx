'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  CalendarIcon,
  GlobeAltIcon,
  TrophyIcon,
  StarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { EnhancedCard } from './ui/EnhancedCard'
import LoadingSpinner from './ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useMobile } from '@/hooks/useMobile'
import { useTheme } from '@/contexts/ThemeContext'
import SteamInventory from './SteamInventory'

interface SteamProfileData {
  steamId: string
  username: string
  avatar: string
  profileUrl: string
  countryCode?: string
  stateCode?: string
  cityId?: number
  timeCreated?: number
  lastLogoff?: number
  profileState: number
  visibility: number
}

interface UserStats {
  totalWagered: number
  totalWon: number
  totalLost: number
  gamesPlayed: number
  biggestWin: number
  winRate: number
  favoriteGame: string
  level: number
  experience: number
  nextLevelExp: number
}

const SteamProfile: React.FC = () => {
  const { user } = useAuth()
  const { hapticFeedback, isMobile, screenSize, optimizeTouch } = useMobile()
  const { isDark } = useTheme()
  const [profileData, setProfileData] = useState<SteamProfileData | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.steamId) {
      fetchProfileData()
      fetchUserStats()
    }
  }, [user])

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/steam-auth/steam-profile/${user?.steamId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data.profile)
      }
    } catch (err) {
      setError('Failed to load profile data')
    }
  }

  const fetchUserStats = async () => {
    try {
      // Mock user stats - in real app, fetch from your database
      const mockStats: UserStats = {
        totalWagered: Math.random() * 10000 + 1000,
        totalWon: Math.random() * 8000 + 500,
        totalLost: Math.random() * 5000 + 200,
        gamesPlayed: Math.floor(Math.random() * 500) + 50,
        biggestWin: Math.random() * 2000 + 100,
        winRate: Math.random() * 40 + 45, // 45-85%
        favoriteGame: ['Coinflip', 'Crash', 'Jackpot', 'Roulette', 'Blackjack'][Math.floor(Math.random() * 5)],
        level: Math.floor(Math.random() * 50) + 1,
        experience: Math.floor(Math.random() * 1000),
        nextLevelExp: 1000
      }
      
      setUserStats(mockStats)
    } catch (err) {
      console.error('Failed to load user stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCountryFlag = (countryCode: string) => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`
  }

  const getProfileVisibility = (visibility: number) => {
    switch (visibility) {
      case 1: return 'Private'
      case 2: return 'Friends Only'
      case 3: return 'Public'
      default: return 'Unknown'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getProgressPercentage = () => {
    if (!userStats) return 0
    return (userStats.experience / userStats.nextLevelExp) * 100
  }

  if (loading) {
    return (
      <EnhancedCard className="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 mt-4">Loading profile...</p>
      </EnhancedCard>
    )
  }

  if (error || !user) {
    return (
      <EnhancedCard className="p-8 text-center">
        <div className="text-red-400">
          <UserIcon className="w-12 h-12 mx-auto mb-2" />
          <p>{error || 'No user data available'}</p>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <EnhancedCard variant="premium" className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => hapticFeedback('light')}
            style={{ 
              cursor: 'pointer',
              minWidth: isMobile ? '96px' : '96px',
              minHeight: isMobile ? '96px' : '96px'
            }}
          >
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className={`
                ${isMobile ? 'w-28 h-28' : 'w-24 h-24'} 
                rounded-full border-4 border-orange-500/50 
                ${isDark ? 'shadow-lg shadow-orange-500/20' : 'shadow-lg shadow-orange-500/30'}
              `}
            />
            <div className={`
              absolute -bottom-2 -right-2 
              ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} 
              bg-green-500 rounded-full border-2 
              ${isDark ? 'border-gray-900' : 'border-white'} 
              flex items-center justify-center
            `}>
              <div className={`
                ${isMobile ? 'w-4 h-4' : 'w-3 h-3'} 
                bg-white rounded-full
              `}></div>
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-white">{user.username}</h1>
              {user.isVip && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 rounded-full">
                  <StarIcon className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">VIP</span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Steam ID: {user.steamId}</span>
              </div>
              
              {profileData?.countryCode && (
                <div className="flex items-center space-x-2">
                  <img
                    src={getCountryFlag(profileData.countryCode)}
                    alt={profileData.countryCode}
                    className="w-4 h-3"
                  />
                  <span>{profileData.countryCode.toUpperCase()}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Member since {user.memberSince?.toLocaleDateString() || 'N/A'}</span>
              </div>
            </div>

            {profileData && (
              <div className="mt-3 flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 text-sm text-gray-500">
                <span>Profile: {getProfileVisibility(profileData.visibility)}</span>
                {profileData.timeCreated && (
                  <span>Steam since: {formatDate(profileData.timeCreated)}</span>
                )}
                {profileData.lastLogoff && (
                  <span>Last seen: {formatDate(profileData.lastLogoff)}</span>
                )}
              </div>
            )}
          </div>

          {/* Balance */}
          <motion.div 
            className="text-center"
            whileTap={{ scale: 0.98 }}
            onClick={() => hapticFeedback('light')}
            style={{ cursor: 'pointer' }}
          >
            <div className={`
              ${isMobile ? 'text-4xl' : 'text-3xl'} 
              font-bold text-green-400 
              ${isDark ? '' : 'drop-shadow-sm'}
            `}>
              ${(user.balance ?? 0).toFixed(2)}
            </div>
            <div className={`
              ${isDark ? 'text-gray-400' : 'text-gray-600'} 
              ${isMobile ? 'text-base' : 'text-sm'}
            `}>
              Current Balance
            </div>
          </motion.div>
        </div>
      </EnhancedCard>

      {/* Level Progress */}
      {userStats && (
        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              <span>Level {userStats.level}</span>
            </h3>
            <div className="text-gray-400 text-sm">
              {userStats.experience} / {userStats.nextLevelExp} XP
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="text-center text-gray-400 text-sm">
            {userStats.nextLevelExp - userStats.experience} XP to next level
          </div>
        </EnhancedCard>
      )}

      {/* Stats Grid */}
      {userStats && (
        <div className={`
          grid gap-4 
          ${screenSize.isSmall ? 'grid-cols-1' : screenSize.isMedium ? 'grid-cols-2' : 'grid-cols-4'}
          ${isMobile ? 'gap-4' : 'gap-6'}
        `}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => hapticFeedback('light')}
          >
            <EnhancedCard variant="stats" className={`
              ${isMobile ? 'p-4' : 'p-6'} 
              text-center cursor-pointer transition-all duration-200
              ${isDark ? 'hover:bg-gray-800/60' : 'hover:bg-white/60'}
            `}>
              <CurrencyDollarIcon className={`
                ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} 
                text-green-400 mx-auto mb-2
              `} />
              <div className={`
                ${isMobile ? 'text-3xl' : 'text-2xl'} 
                font-bold 
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                ${userStats.totalWagered.toFixed(0)}
              </div>
              <div className={`
                ${isDark ? 'text-gray-400' : 'text-gray-600'} 
                ${isMobile ? 'text-base' : 'text-sm'}
              `}>
                Total Wagered
              </div>
            </EnhancedCard>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => hapticFeedback('light')}
          >
            <EnhancedCard variant="stats" className={`
              ${isMobile ? 'p-4' : 'p-6'} 
              text-center cursor-pointer transition-all duration-200
              ${isDark ? 'hover:bg-gray-800/60' : 'hover:bg-white/60'}
            `}>
              <TrophyIcon className={`
                ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} 
                text-yellow-400 mx-auto mb-2
              `} />
              <div className={`
                ${isMobile ? 'text-3xl' : 'text-2xl'} 
                font-bold 
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                ${userStats.totalWon.toFixed(0)}
              </div>
              <div className={`
                ${isDark ? 'text-gray-400' : 'text-gray-600'} 
                ${isMobile ? 'text-base' : 'text-sm'}
              `}>
                Total Won
              </div>
            </EnhancedCard>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => hapticFeedback('light')}
          >
            <EnhancedCard variant="stats" className={`
              ${isMobile ? 'p-4' : 'p-6'} 
              text-center cursor-pointer transition-all duration-200
              ${isDark ? 'hover:bg-gray-800/60' : 'hover:bg-white/60'}
            `}>
              <ChartBarIcon className={`
                ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} 
                text-blue-400 mx-auto mb-2
              `} />
              <div className={`
                ${isMobile ? 'text-3xl' : 'text-2xl'} 
                font-bold 
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                {userStats.winRate.toFixed(1)}%
              </div>
              <div className={`
                ${isDark ? 'text-gray-400' : 'text-gray-600'} 
                ${isMobile ? 'text-base' : 'text-sm'}
              `}>
                Win Rate
              </div>
            </EnhancedCard>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => hapticFeedback('light')}
          >
            <EnhancedCard variant="stats" className={`
              ${isMobile ? 'p-4' : 'p-6'} 
              text-center cursor-pointer transition-all duration-200
              ${isDark ? 'hover:bg-gray-800/60' : 'hover:bg-white/60'}
            `}>
              <FireIcon className={`
                ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} 
                text-orange-400 mx-auto mb-2
              `} />
              <div className={`
                ${isMobile ? 'text-3xl' : 'text-2xl'} 
                font-bold 
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                {userStats.gamesPlayed}
              </div>
              <div className={`
                ${isDark ? 'text-gray-400' : 'text-gray-600'} 
                ${isMobile ? 'text-base' : 'text-sm'}
              `}>
                Games Played
              </div>
            </EnhancedCard>
          </motion.div>
        </div>
      )}

      {/* Additional Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Game Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Biggest Win:</span>
                <span className="text-green-400 font-semibold">${userStats.biggestWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Lost:</span>
                <span className="text-red-400 font-semibold">${userStats.totalLost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Favorite Game:</span>
                <span className="text-white font-semibold">{userStats.favoriteGame}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit/Loss:</span>
                <span className={`font-semibold ${
                  userStats.totalWon - userStats.totalLost > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(userStats.totalWon - userStats.totalLost).toFixed(2)}
                </span>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Type:</span>
                <span className="text-white font-semibold">{user.isVip ? 'VIP Member' : 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-white font-semibold capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-white font-semibold">{user.lastLoginAt?.toLocaleDateString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-semibold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </span>
              </div>
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Steam Inventory Section */}
      <div className="mt-8">
        <SteamInventory />
      </div>
    </div>
  )
}

export default SteamProfile 