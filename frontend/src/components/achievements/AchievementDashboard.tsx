'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievements } from '@/hooks/useAchievements'
import { Achievement, Challenge, Badge, AchievementDifficulty } from '@/types/achievements'

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  count?: number
}

const TabButton = ({ active, onClick, icon, label, count }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200
      ${active 
        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
      }
    `}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
    {count !== undefined && (
      <span className={`
        text-xs px-2 py-1 rounded-full
        ${active ? 'bg-white/20' : 'bg-orange-500/20 text-orange-400'}
      `}>
        {count}
      </span>
    )}
  </button>
)

interface ProgressBarProps {
  progress: number
  max: number
  className?: string
  showText?: boolean
}

const ProgressBar = ({ progress, max, className = '', showText = true }: ProgressBarProps) => {
  const percentage = Math.min((progress / max) * 100, 100)
  
  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {progress} / {max}
        </div>
      )}
    </div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
}

const AchievementCard = ({ achievement, isUnlocked }: AchievementCardProps) => {
  const getDifficultyColor = (difficulty: AchievementDifficulty) => {
    switch (difficulty) {
      case 'bronze': return 'from-amber-600 to-amber-800'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'platinum': return 'from-blue-400 to-blue-600'
      case 'diamond': return 'from-cyan-400 to-cyan-600'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-6 rounded-xl border transition-all duration-300 hover:scale-105
        ${isUnlocked 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-orange-500/30 shadow-lg shadow-orange-500/10' 
          : 'bg-gray-800/50 border-gray-700 opacity-75'
        }
      `}
    >
      {/* Difficulty Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getDifficultyColor(achievement.difficulty)}`}>
        {achievement.difficulty.toUpperCase()}
      </div>

      {/* Icon */}
      <div className={`text-4xl mb-3 ${isUnlocked ? '' : 'grayscale'}`}>
        {achievement.icon}
      </div>

      {/* Content */}
      <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
        {achievement.name}
      </h3>
      
      <p className={`text-sm mb-4 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
        {achievement.description}
      </p>

      {/* Progress */}
      {!isUnlocked && achievement.progress !== undefined && (
        <div className="mb-4">
          <ProgressBar 
            progress={achievement.progress} 
            max={achievement.maxProgress}
            showText={false}
          />
          <div className="text-xs text-gray-400 mt-1">
            Progress: {achievement.progress} / {achievement.maxProgress}
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex flex-wrap gap-2">
        {achievement.rewards.map((reward, index) => (
          <span 
            key={index}
            className={`
              text-xs px-2 py-1 rounded-full border
              ${isUnlocked 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-gray-700/50 border-gray-600 text-gray-400'
              }
            `}
          >
            {reward.description}
          </span>
        ))}
      </div>

      {/* Points */}
      <div className={`absolute bottom-3 right-3 text-xs font-bold ${isUnlocked ? 'text-orange-400' : 'text-gray-500'}`}>
        {achievement.points} pts
      </div>

      {/* Unlocked Indicator */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="absolute top-3 left-3 text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}

interface ChallengeCardProps {
  challenge: Challenge
}

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const timeLeft = challenge.endDate.getTime() - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)))

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        p-6 rounded-xl border transition-all duration-300 hover:scale-105
        ${challenge.isCompleted 
          ? 'bg-gradient-to-br from-green-800/50 to-green-900/50 border-green-500/30' 
          : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{challenge.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{challenge.name}</h3>
            <p className="text-sm text-gray-300">{challenge.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wide">{challenge.type}</div>
          <div className="text-sm font-medium text-orange-400">{challenge.participants} players</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm font-medium text-white">
            {challenge.progress} / {challenge.maxProgress}
          </span>
        </div>
        <ProgressBar 
          progress={challenge.progress} 
          max={challenge.maxProgress}
          showText={false}
        />
      </div>

      {/* Time Left */}
      {!challenge.isCompleted && timeLeft > 0 && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Time Remaining</div>
          <div className="text-lg font-bold text-orange-400">
            {hoursLeft}h {minutesLeft}m
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex flex-wrap gap-2 mb-4">
        {challenge.rewards.map((reward, index) => (
          <span 
            key={index}
            className={`
              text-xs px-2 py-1 rounded-full border
              ${challenge.isCompleted 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              }
            `}
          >
            {reward.description}
          </span>
        ))}
      </div>

      {/* Status */}
      {challenge.isCompleted && (
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Completed!</span>
        </div>
      )}
    </motion.div>
  )
}

export const AchievementDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'badges'>('overview')

  // Sample data for demonstration
  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Place your first bet',
      category: 'gambling',
      icon: '🎲',
      difficulty: 'bronze',
      points: 10,
      rewards: [{ type: 'xp', value: 50, description: '+50 XP' }],
      isHidden: false,
      unlockedAt: new Date(),
      progress: 1,
      maxProgress: 1,
      requirements: [{ type: 'games_played', value: 1, operator: 'gte' }]
    },
    {
      id: '2', 
      name: 'High Roller',
      description: 'Wager $1,000 in total',
      category: 'gambling',
      icon: '💰',
      difficulty: 'gold',
      points: 100,
      rewards: [
        { type: 'xp', value: 200, description: '+200 XP' }, 
        { type: 'badge', value: 'high_roller', description: 'High Roller Badge' }
      ],
      isHidden: false,
      progress: 650,
      maxProgress: 1000,
      requirements: [{ type: 'amount_wagered', value: 1000, operator: 'gte' }]
    }
  ]

  const sampleChallenges: Challenge[] = [
    {
      id: '1',
      name: 'Daily Player',
      description: 'Play 5 games today',
      type: 'daily',
      gameType: 'all',
      difficulty: 'bronze',
      icon: '🎮',
      requirements: [{ type: 'games_played', value: 5, operator: 'gte' }],
      rewards: [
        { type: 'xp', value: 100, description: '+100 XP' }, 
        { type: 'coins', value: 50, description: '50 Coins' }
      ],
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 3,
      maxProgress: 5,
      isCompleted: false,
      isActive: true,
      participants: 1247
    }
  ]

  const unlockedAchievements = sampleAchievements.filter(a => a.unlockedAt)
  const activeAchievements = sampleAchievements.filter(a => !a.unlockedAt)
  const activeChallenges = sampleChallenges.filter(c => !c.isCompleted)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            Achievement Dashboard
          </h1>
          <p className="text-gray-400">Track your progress and unlock rewards</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 mb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Level 12 - Veteran Player
              </h2>
              <p className="text-orange-100 mb-4">
                1,750 / 2,000 XP
              </p>
              <ProgressBar 
                progress={1750} 
                max={2000}
                className="w-64"
                showText={false}
              />
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-2">#247</div>
              <div className="text-orange-100">Global Rank</div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon="📊"
            label="Overview"
          />
          <TabButton
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
            icon="🏆"
            label="Achievements"
            count={unlockedAchievements.length}
          />
          <TabButton
            active={activeTab === 'challenges'}
            onClick={() => setActiveTab('challenges')}
            icon="🎯"
            label="Challenges"
            count={activeChallenges.length}
          />
          <TabButton
            active={activeTab === 'badges'}
            onClick={() => setActiveTab('badges')}
            icon="🎖️"
            label="Badges"
            count={3}
          />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">247</div>
                  <div className="text-gray-300">Games Played</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">156</div>
                  <div className="text-gray-300">Games Won</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">2</div>
                  <div className="text-gray-300">Current Streak</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">$2,450</div>
                  <div className="text-gray-300">Total Won</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <span className="text-2xl">🎲</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">Achievement Unlocked!</div>
                      <div className="text-sm text-gray-400">First Steps</div>
                    </div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <span className="text-2xl">⭐</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">Level Up!</div>
                      <div className="text-sm text-gray-400">Reached level 12</div>
                    </div>
                    <div className="text-xs text-gray-500">Yesterday</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {unlockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-green-400 mb-6">Unlocked Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlockedAchievements.map((achievement) => (
                      <AchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                        isUnlocked={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeAchievements.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-orange-400 mb-6">In Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAchievements.map((achievement) => (
                      <AchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                        isUnlocked={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-6">Daily Challenges</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sampleChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🎖️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Badge Collection</h3>
              <p className="text-gray-400">Earn badges by completing achievements and challenges</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-2xl mx-auto">
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🎲</div>
                  <div className="font-bold text-white">First Timer</div>
                  <div className="text-sm text-gray-400">Placed first bet</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 text-center opacity-50">
                  <div className="text-4xl mb-2 grayscale">💰</div>
                  <div className="font-bold text-gray-400">High Roller</div>
                  <div className="text-sm text-gray-500">Coming soon...</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 text-center opacity-50">
                  <div className="text-4xl mb-2 grayscale">👑</div>
                  <div className="font-bold text-gray-400">VIP</div>
                  <div className="text-sm text-gray-500">Coming soon...</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 