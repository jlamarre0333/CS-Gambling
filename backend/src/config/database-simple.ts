import { DataSource } from 'typeorm'
import { User } from '../entities/User'
import { Game } from '../entities/Game'
import { Transaction } from '../entities/Transaction'
import { ChatMessage } from '../entities/ChatMessage'
import { Achievement } from '../entities/Achievement'
import { UserAchievement } from '../entities/UserAchievement'
// Tournament entity removed - not needed for CS2 skin betting
import { SkinItem } from '../entities/SkinItem'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

// SQLite database - no installation required!
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '../../database.sqlite'),
  synchronize: true, // Auto-create tables in development
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Game,
    Transaction,
    ChatMessage,
    Achievement,
    UserAchievement,
    SkinItem
  ],
})

// Simple in-memory cache instead of Redis for development
class SimpleCache {
  private cache: Map<string, { value: any; expiry?: number }> = new Map()

  set(key: string, value: any, ttlSeconds?: number) {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined
    this.cache.set(key, { value, expiry })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  del(key: string) {
    return this.cache.delete(key)
  }

  ping() {
    return Promise.resolve('PONG')
  }

  setex(key: string, seconds: number, value: any) {
    this.set(key, value, seconds)
  }

  lpush(key: string, value: string) {
    const list = this.get(key) || []
    list.unshift(value)
    this.set(key, list)
  }

  ltrim(key: string, start: number, stop: number) {
    const list = this.get(key) || []
    this.set(key, list.slice(start, stop + 1))
  }

  get status() {
    return 'ready'
  }

  disconnect() {
    this.cache.clear()
    return Promise.resolve()
  }
}

export const simpleCache = new SimpleCache()

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize()
    console.log('✅ SQLite database connection established successfully')
    console.log('📁 Database file:', path.join(__dirname, '../../database.sqlite'))
    
    // Seed some initial data if database is empty
    await seedInitialData()
    
    return AppDataSource
  } catch (error) {
    console.error('❌ Error during database initialization:', error)
    throw error
  }
}

// Seed some basic achievements and test data
async function seedInitialData() {
  const achievementRepo = AppDataSource.getRepository(Achievement)
  const existingAchievements = await achievementRepo.count()
  
  if (existingAchievements === 0) {
    console.log('🌱 Seeding initial achievements...')
    
    const achievements = [
      {
        key: 'first_win',
        name: 'First Victory',
        description: 'Win your first game',
        category: 'beginner',
        rarity: 'common',
        icon: '🏆',
        points: 100,
        rewardAmount: 10,
        requirements: { wins: 1 },
        isActive: true,
        isSecret: false
      },
      {
        key: 'high_roller',
        name: 'High Roller',
        description: 'Bet over $100 in a single game',
        category: 'high_roller',
        rarity: 'rare',
        icon: '💎',
        points: 500,
        rewardAmount: 50,
        requirements: { single_bet: 100 },
        isActive: true,
        isSecret: false
      },
      {
        key: 'lucky_streak',
        name: 'Lucky Streak',
        description: 'Win 5 games in a row',
        category: 'lucky_streaks',
        rarity: 'epic',
        icon: '🍀',
        points: 1000,
        rewardAmount: 100,
        requirements: { win_streak: 5 },
        isActive: true,
        isSecret: false
      }
    ]
    
    for (const ach of achievements) {
      const achievement = achievementRepo.create(ach as any)
      await achievementRepo.save(achievement)
    }
    
    console.log('✅ Initial achievements seeded')
  }
}

export default AppDataSource 