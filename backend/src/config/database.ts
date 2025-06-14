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

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'cs_gambling',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cs_gambling_db',
  synchronize: process.env.NODE_ENV !== 'production', // Only sync in development
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
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
})

// Redis configuration
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
}

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connection established successfully')
    
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      await AppDataSource.runMigrations()
      console.log('✅ Database migrations completed')
    }
    
    return AppDataSource
  } catch (error) {
    console.error('❌ Error during database initialization:', error)
    throw error
  }
}

export default AppDataSource 