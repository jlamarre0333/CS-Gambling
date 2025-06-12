// Achievement and Progression System Types

export type AchievementCategory = 
  | 'gambling' 
  | 'social' 
  | 'collection' 
  | 'streak' 
  | 'milestone' 
  | 'special'

export type AchievementDifficulty = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'lifetime'

export type GameType = 'roulette' | 'coinflip' | 'crash' | 'jackpot' | 'cases' | 'all'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  difficulty: AchievementDifficulty
  icon: string
  points: number
  requirements: AchievementRequirement[]
  rewards: Reward[]
  isHidden: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress: number
}

export interface AchievementRequirement {
  type: 'games_played' | 'games_won' | 'streak' | 'amount_wagered' | 'amount_won' | 'login_days' | 'referrals' | 'specific_game'
  gameType?: GameType
  value: number
  operator: 'gte' | 'lte' | 'eq'
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: ChallengeType
  gameType: GameType
  difficulty: AchievementDifficulty
  icon: string
  requirements: AchievementRequirement[]
  rewards: Reward[]
  startDate: Date
  endDate: Date
  progress: number
  maxProgress: number
  isCompleted: boolean
  isActive: boolean
  participants: number
}

export interface Reward {
  type: 'xp' | 'coins' | 'badge' | 'title' | 'skin' | 'case' | 'multiplier'
  value: number | string
  duration?: number // for temporary rewards like multipliers
  description: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementDifficulty
  category: AchievementCategory
  unlockedAt?: Date
  isEquipped: boolean
}

export interface PlayerLevel {
  level: number
  xp: number
  xpToNext: number
  totalXp: number
  title: string
  benefits: string[]
}

export interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  totalWagered: number
  totalWon: number
  biggestWin: number
  currentStreak: number
  longestStreak: number
  loginDays: number
  referrals: number
  favoriteGame: GameType
  timePlayedMinutes: number
  achievementsUnlocked: number
  badgesCollected: number
}

export interface ProgressData {
  level: PlayerLevel
  stats: PlayerStats
  achievements: Achievement[]
  challenges: Challenge[]
  badges: Badge[]
  recentActivity: ActivityEntry[]
  weeklyProgress: WeeklyProgress
  leaderboardRank: number
}

export interface ActivityEntry {
  id: string
  type: 'achievement' | 'challenge' | 'level_up' | 'badge' | 'win' | 'loss'
  title: string
  description: string
  icon: string
  timestamp: Date
  gameType?: GameType
  value?: number
}

export interface WeeklyProgress {
  xpGained: number
  gamesPlayed: number
  challengesCompleted: number
  achievementsUnlocked: number
  totalRewards: number
  streakDays: number
}

export interface LevelBenefits {
  [level: number]: {
    title: string
    benefits: string[]
    xpRequired: number
    rewards: Reward[]
  }
}

// Sample data interfaces for the achievement system
export interface AchievementPreset {
  gambling: Achievement[]
  social: Achievement[]
  collection: Achievement[]
  streak: Achievement[]
  milestone: Achievement[]
  special: Achievement[]
}

export interface ChallengePreset {
  daily: Omit<Challenge, 'id' | 'startDate' | 'endDate' | 'progress' | 'isCompleted' | 'isActive' | 'participants'>[]
  weekly: Omit<Challenge, 'id' | 'startDate' | 'endDate' | 'progress' | 'isCompleted' | 'isActive' | 'participants'>[]
  monthly: Omit<Challenge, 'id' | 'startDate' | 'endDate' | 'progress' | 'isCompleted' | 'isActive' | 'participants'>[]
} 