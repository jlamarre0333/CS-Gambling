'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Achievement, 
  Challenge, 
  ProgressData, 
  PlayerLevel, 
  PlayerStats, 
  Badge, 
  ActivityEntry, 
  WeeklyProgress,
  Reward,
  AchievementCategory,
  ChallengeType,
  GameType
} from '@/types/achievements'
import { useSound } from '@/hooks/useSound'

// Sample achievement data
const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  // Gambling Achievements
  {
    id: 'first_bet',
    name: 'First Steps',
    description: 'Place your first bet',
    category: 'gambling',
    difficulty: 'bronze',
    icon: '🎲',
    points: 10,
    requirements: [{ type: 'games_played', value: 1, operator: 'gte' }],
    rewards: [{ type: 'xp', value: 50, description: '+50 XP' }],
    isHidden: false,
    maxProgress: 1
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Wager $1,000 in total',
    category: 'gambling',
    difficulty: 'gold',
    icon: '💰',
    points: 100,
    requirements: [{ type: 'amount_wagered', value: 1000, operator: 'gte' }],
    rewards: [
      { type: 'xp', value: 200, description: '+200 XP' },
      { type: 'badge', value: 'high_roller', description: 'High Roller Badge' }
    ],
    isHidden: false,
    maxProgress: 1000
  },
  {
    id: 'roulette_master',
    name: 'Roulette Master',
    description: 'Win 50 roulette games',
    category: 'gambling',
    difficulty: 'silver',
    icon: '🎯',
    points: 75,
    requirements: [{ type: 'games_won', gameType: 'roulette', value: 50, operator: 'gte' }],
    rewards: [
      { type: 'xp', value: 150, description: '+150 XP' },
      { type: 'title', value: 'Roulette Master', description: 'Roulette Master Title' }
    ],
    isHidden: false,
    maxProgress: 50
  },
  // Streak Achievements
  {
    id: 'lucky_streak',
    name: 'Lucky Streak',
    description: 'Win 5 games in a row',
    category: 'streak',
    difficulty: 'silver',
    icon: '🔥',
    points: 50,
    requirements: [{ type: 'streak', value: 5, operator: 'gte' }],
    rewards: [
      { type: 'xp', value: 100, description: '+100 XP' },
      { type: 'multiplier', value: 1.2, duration: 3600, description: '20% XP boost for 1 hour' }
    ],
    isHidden: false,
    maxProgress: 5
  },
  // Social Achievements
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Refer 10 friends',
    category: 'social',
    difficulty: 'gold',
    icon: '👥',
    points: 200,
    requirements: [{ type: 'referrals', value: 10, operator: 'gte' }],
    rewards: [
      { type: 'xp', value: 500, description: '+500 XP' },
      { type: 'coins', value: 1000, description: '1000 Coins' }
    ],
    isHidden: false,
    maxProgress: 10
  }
]

const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'daily_player',
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
    progress: 0,
    maxProgress: 5,
    isCompleted: false,
    isActive: true,
    participants: 1247
  },
  {
    id: 'crash_challenge',
    name: 'Crash Course',
    description: 'Cash out at 2x or higher 3 times in Crash',
    type: 'daily',
    gameType: 'crash',
    difficulty: 'silver',
    icon: '📈',
    requirements: [{ type: 'specific_game', gameType: 'crash', value: 3, operator: 'gte' }],
    rewards: [
      { type: 'xp', value: 150, description: '+150 XP' },
      { type: 'case', value: 'crash_case', description: 'Crash Case' }
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    progress: 0,
    maxProgress: 3,
    isCompleted: false,
    isActive: true,
    participants: 892
  }
]

const LEVEL_BENEFITS = {
  1: { title: 'Rookie', benefits: ['Basic betting'], xpRequired: 0, rewards: [] },
  5: { title: 'Player', benefits: ['Daily challenges', 'Achievement tracking'], xpRequired: 500, rewards: [{ type: 'coins', value: 100, description: '100 Coins' }] },
  10: { title: 'Veteran', benefits: ['Weekly challenges', '5% XP boost'], xpRequired: 1500, rewards: [{ type: 'badge', value: 'veteran', description: 'Veteran Badge' }] },
  15: { title: 'Expert', benefits: ['Monthly challenges', '10% XP boost'], xpRequired: 3000, rewards: [{ type: 'title', value: 'Expert', description: 'Expert Title' }] },
  25: { title: 'Master', benefits: ['Special events', '15% XP boost'], xpRequired: 6000, rewards: [{ type: 'skin', value: 'master_ak47', description: 'Master AK-47' }] },
  50: { title: 'Legend', benefits: ['VIP access', '25% XP boost'], xpRequired: 15000, rewards: [{ type: 'badge', value: 'legend', description: 'Legend Badge' }] }
}

export const useAchievements = () => {
  const { gameActions } = useSound()
  
  // State management
  const [progressData, setProgressData] = useState<ProgressData>({
    level: {
      level: 1,
      xp: 0,
      xpToNext: 100,
      totalXp: 0,
      title: 'Rookie',
      benefits: ['Basic betting']
    },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalWagered: 0,
      totalWon: 0,
      biggestWin: 0,
      currentStreak: 0,
      longestStreak: 0,
      loginDays: 1,
      referrals: 0,
      favoriteGame: 'roulette',
      timePlayedMinutes: 0,
      achievementsUnlocked: 0,
      badgesCollected: 0
    },
    achievements: [],
    challenges: [],
    badges: [],
    recentActivity: [],
    weeklyProgress: {
      xpGained: 0,
      gamesPlayed: 0,
      challengesCompleted: 0,
      achievementsUnlocked: 0,
      totalRewards: 0,
      streakDays: 1
    },
    leaderboardRank: 1247
  })

  // Calculate XP for next level
  const calculateXpForLevel = useCallback((level: number): number => {
    return level * 100 + Math.floor(level / 5) * 50
  }, [])

  // Award XP and handle level ups
  const awardXp = useCallback((amount: number, source: string) => {
    setProgressData(prev => {
      const newTotalXp = prev.level.totalXp + amount
      const newXp = prev.level.xp + amount
      let newLevel = prev.level.level
      let xpToNext = prev.level.xpToNext - amount

      // Check for level up
      while (xpToNext <= 0 && newLevel < 100) {
        newLevel++
        const nextLevelXp = calculateXpForLevel(newLevel)
        xpToNext += nextLevelXp
        
        // Play level up sound and show notification
        gameActions.winBig()
        
        // Add level up activity
        const levelUpActivity: ActivityEntry = {
          id: `level_up_${Date.now()}`,
          type: 'level_up',
          title: `Level Up!`,
          description: `Reached level ${newLevel}`,
          icon: '⭐',
          timestamp: new Date()
        }
        
        prev.recentActivity.unshift(levelUpActivity)
      }

      // Update level benefits
      const levelBenefit = LEVEL_BENEFITS[newLevel as keyof typeof LEVEL_BENEFITS]
      const benefits = levelBenefit ? levelBenefit.benefits : prev.level.benefits
      const title = levelBenefit ? levelBenefit.title : prev.level.title

      return {
        ...prev,
        level: {
          level: newLevel,
          xp: newXp,
          xpToNext: Math.max(0, xpToNext),
          totalXp: newTotalXp,
          title,
          benefits
        },
        weeklyProgress: {
          ...prev.weeklyProgress,
          xpGained: prev.weeklyProgress.xpGained + amount
        },
        recentActivity: prev.recentActivity.slice(0, 50) // Keep only recent 50 activities
      }
    })
  }, [calculateXpForLevel, gameActions])

  // Check and unlock achievements
  const checkAchievements = useCallback((stats: PlayerStats) => {
    setProgressData(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.unlockedAt) return achievement // Already unlocked

        // Check if requirements are met
        const requirementsMet = achievement.requirements.every(req => {
          let statValue = 0

          switch (req.type) {
            case 'games_played':
              statValue = req.gameType && req.gameType !== 'all' 
                ? stats.gamesPlayed // Would need game-specific stats
                : stats.gamesPlayed
              break
            case 'games_won':
              statValue = stats.gamesWon
              break
            case 'amount_wagered':
              statValue = stats.totalWagered
              break
            case 'amount_won':
              statValue = stats.totalWon
              break
            case 'streak':
              statValue = stats.currentStreak
              break
            case 'login_days':
              statValue = stats.loginDays
              break
            case 'referrals':
              statValue = stats.referrals
              break
            default:
              return false
          }

          switch (req.operator) {
            case 'gte': return statValue >= req.value
            case 'lte': return statValue <= req.value
            case 'eq': return statValue === req.value
            default: return false
          }
        })

        if (requirementsMet) {
          // Unlock achievement
          gameActions.winBig()
          
          // Add to recent activity
          const achievementActivity: ActivityEntry = {
            id: `achievement_${achievement.id}_${Date.now()}`,
            type: 'achievement',
            title: 'Achievement Unlocked!',
            description: achievement.name,
            icon: achievement.icon,
            timestamp: new Date()
          }
          
          prev.recentActivity.unshift(achievementActivity)

          // Award rewards
          achievement.rewards.forEach(reward => {
            if (reward.type === 'xp') {
              awardXp(reward.value as number, `Achievement: ${achievement.name}`)
            }
          })

          return {
            ...achievement,
            unlockedAt: new Date(),
            progress: achievement.maxProgress
          }
        }

        return achievement
      })

      return {
        ...prev,
        achievements: updatedAchievements,
        stats: {
          ...prev.stats,
          achievementsUnlocked: updatedAchievements.filter(a => a.unlockedAt).length
        }
      }
    })
  }, [awardXp, gameActions])

  // Update player stats (called after game events)
  const updateStats = useCallback((updates: Partial<PlayerStats>) => {
    setProgressData(prev => {
      const newStats = { ...prev.stats, ...updates }
      
      // Check achievements after stats update
      setTimeout(() => checkAchievements(newStats), 100)
      
      return {
        ...prev,
        stats: newStats
      }
    })
  }, [checkAchievements])

  // Update challenge progress
  const updateChallengeProgress = useCallback((challengeId: string, progress: number) => {
    setProgressData(prev => {
      const updatedChallenges = prev.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          const newProgress = Math.min(progress, challenge.maxProgress)
          const isCompleted = newProgress >= challenge.maxProgress

          if (isCompleted && !challenge.isCompleted) {
            gameActions.winSmall()
            
            // Add completion activity
            const completionActivity: ActivityEntry = {
              id: `challenge_${challengeId}_${Date.now()}`,
              type: 'challenge',
              title: 'Challenge Complete!',
              description: challenge.name,
              icon: challenge.icon,
              timestamp: new Date()
            }
            
            prev.recentActivity.unshift(completionActivity)

            // Award rewards
            challenge.rewards.forEach(reward => {
              if (reward.type === 'xp') {
                awardXp(reward.value as number, `Challenge: ${challenge.name}`)
              }
            })
          }

          return {
            ...challenge,
            progress: newProgress,
            isCompleted
          }
        }
        return challenge
      })

      return {
        ...prev,
        challenges: updatedChallenges,
        weeklyProgress: {
          ...prev.weeklyProgress,
          challengesCompleted: updatedChallenges.filter(c => c.isCompleted).length
        }
      }
    })
  }, [awardXp, gameActions])

  // Game event handlers
  const onGamePlayed = useCallback((gameType: GameType, wagered: number) => {
    updateStats({
      gamesPlayed: progressData.stats.gamesPlayed + 1,
      totalWagered: progressData.stats.totalWagered + wagered
    })
    
    // Update daily challenge progress
    updateChallengeProgress('daily_player', progressData.challenges.find(c => c.id === 'daily_player')?.progress + 1 || 1)
  }, [progressData.stats, progressData.challenges, updateStats, updateChallengeProgress])

  const onGameWon = useCallback((gameType: GameType, winAmount: number) => {
    const newStreak = progressData.stats.currentStreak + 1
    updateStats({
      gamesWon: progressData.stats.gamesWon + 1,
      totalWon: progressData.stats.totalWon + winAmount,
      biggestWin: Math.max(progressData.stats.biggestWin, winAmount),
      currentStreak: newStreak,
      longestStreak: Math.max(progressData.stats.longestStreak, newStreak)
    })
  }, [progressData.stats, updateStats])

  const onGameLost = useCallback(() => {
    updateStats({
      currentStreak: 0
    })
  }, [updateStats])

  // Computed values
  const unlockedAchievements = useMemo(() => 
    progressData.achievements.filter(a => a.unlockedAt), 
    [progressData.achievements]
  )

  const activeAchievements = useMemo(() => 
    progressData.achievements.filter(a => !a.unlockedAt && !a.isHidden), 
    [progressData.achievements]
  )

  const activeChallenges = useMemo(() => 
    progressData.challenges.filter(c => c.isActive && !c.isCompleted), 
    [progressData.challenges]
  )

  const completedChallenges = useMemo(() => 
    progressData.challenges.filter(c => c.isCompleted), 
    [progressData.challenges]
  )

  // Initialize with sample data
  useEffect(() => {
    // In a real app, this would load from an API/localStorage
    const savedProgress = localStorage.getItem('playerProgress')
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress))
      } catch (error) {
        console.error('Failed to load saved progress:', error)
      }
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('playerProgress', JSON.stringify(progressData))
  }, [progressData])

  return {
    // Data
    progressData,
    unlockedAchievements,
    activeAchievements,
    activeChallenges,
    completedChallenges,
    
    // Actions
    awardXp,
    updateStats,
    updateChallengeProgress,
    onGamePlayed,
    onGameWon,
    onGameLost,
    
    // Computed
    progressPercentage: (progressData.level.xp / (progressData.level.xp + progressData.level.xpToNext)) * 100,
    totalAchievements: progressData.achievements.length,
    totalChallenges: progressData.challenges.length
  }
} 