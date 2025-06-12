import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import { initializeDatabase, AppDataSource, simpleCache } from './config/database-simple'
import { User, UserRole, UserStatus } from './entities/User'
import { Game, GameType, GameStatus, GameResult } from './entities/Game'
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from './entities/Transaction'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: 'SQLite connected',
    cache: simpleCache.status
  })
})

// Simple user creation for testing
app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const { username } = req.body
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    const userRepository = AppDataSource.getRepository(User)
    
    // Check if user exists
    let user = await userRepository.findOne({ where: { username } })
    
    if (!user) {
      // Create new demo user
      user = userRepository.create({
        steamId: `demo_${Date.now()}`,
        username,
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        balance: 1000,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        preferences: { notifications: true },
        statistics: { wins: 0, losses: 0 }
      })
      
      await userRepository.save(user)
      console.log(`✅ Created demo user: ${username}`)
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        balance: user.balance,
        level: user.level,
        experience: user.experience
      }
    })
  } catch (error) {
    console.error('❌ Demo login error:', error)
    res.status(500).json({ error: 'Failed to create demo user' })
  }
})

// Get user profile
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const userRepository = AppDataSource.getRepository(User)
    
    const user = await userRepository.findOne({ where: { id: userId } })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      balance: user.balance,
      level: user.level,
      experience: user.experience,
      totalWagered: user.totalWagered,
      totalWon: user.totalWon,
      gamesPlayed: user.gamesPlayed,
      winRate: user.winRate,
      netProfit: user.netProfit
    })
  } catch (error) {
    console.error('❌ Profile error:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
})

// Place a bet
app.post('/api/games/bet', async (req, res) => {
  try {
    const { userId, gameType, betAmount, gameData } = req.body
    
    if (!userId || !gameType || !betAmount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const userRepository = AppDataSource.getRepository(User)
    const gameRepository = AppDataSource.getRepository(Game)
    
    const user = await userRepository.findOne({ where: { id: userId } })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // Simple game logic for demo
    const isWin = Math.random() > 0.5
    const multiplier = isWin ? Math.random() * 2 + 1 : 0
    const winAmount = isWin ? betAmount * multiplier : 0

    // Create game record
    const game = gameRepository.create({
      type: gameType as GameType,
      status: GameStatus.COMPLETED,
      betAmount,
      winAmount,
      multiplier,
      result: isWin ? GameResult.WIN : GameResult.LOSS,
      gameData: gameData || {},
      userId: user.id,
      startedAt: new Date(),
      completedAt: new Date()
    })

    await gameRepository.save(game)

    // Update user balance and statistics
    user.balance = user.balance - betAmount + winAmount
    user.gamesPlayed += 1
    user.totalWagered += betAmount
    user.totalWon += winAmount
    
    if (isWin) {
      user.statistics.wins = (user.statistics.wins || 0) + 1
      user.experience += Math.floor(betAmount / 10) + 50
    } else {
      user.statistics.losses = (user.statistics.losses || 0) + 1
      user.experience += Math.floor(betAmount / 20) + 10
    }

    // Level up logic
    const requiredExp = user.level * 1000
    if (user.experience >= requiredExp) {
      user.level += 1
      user.experience = user.experience - requiredExp
    }

    await userRepository.save(user)

    // Broadcast to WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
          type: 'game_result',
          data: {
            userId: user.id,
            username: user.username,
            gameType,
            betAmount,
            winAmount,
            multiplier,
            result: game.result,
            newBalance: user.balance
          }
        }))
      }
    })

    res.json({
      success: true,
      game: {
        id: game.id,
        type: game.type,
        betAmount: game.betAmount,
        winAmount: game.winAmount,
        multiplier: game.multiplier,
        result: game.result
      },
      user: {
        balance: user.balance,
        level: user.level,
        experience: user.experience
      }
    })
  } catch (error) {
    console.error('❌ Bet error:', error)
    res.status(500).json({ error: 'Failed to place bet' })
  }
})

// Get game history
app.get('/api/games/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const gameRepository = AppDataSource.getRepository(Game)
    
    const games = await gameRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50
    })

    res.json(games.map(game => ({
      id: game.id,
      type: game.type,
      betAmount: game.betAmount,
      winAmount: game.winAmount,
      multiplier: game.multiplier,
      result: game.result,
      timestamp: game.createdAt
    })))
  } catch (error) {
    console.error('❌ History error:', error)
    res.status(500).json({ error: 'Failed to get game history' })
  }
})

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User)
    
    const users = await userRepository.find({
      order: { totalWon: 'DESC' },
      take: 50
    })

    res.json(users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      totalWon: user.totalWon,
      gamesPlayed: user.gamesPlayed,
      winRate: user.winRate
    })))
  } catch (error) {
    console.error('❌ Leaderboard error:', error)
    res.status(500).json({ error: 'Failed to get leaderboard' })
  }
})

// Social features
app.get('/api/social/feed', (req, res) => {
  res.json([
    {
      id: '1',
      type: 'win',
      user: { username: 'PlayerOne', level: 24 },
      content: 'won $247 in Crash!',
      timestamp: new Date().toISOString(),
      likes: 12,
      comments: 3
    },
    {
      id: '2',
      type: 'level_up',
      user: { username: 'GamerPro', level: 15 },
      content: 'reached level 15!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      likes: 8,
      comments: 1
    }
  ])
})

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection')
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log('📨 WebSocket message:', data)
      
      // Echo back for now
      ws.send(JSON.stringify({
        type: 'echo',
        data: data
      }))
    } catch (error) {
      console.error('❌ WebSocket message error:', error)
    }
  })

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed')
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Express error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Starting CS2 Gambling Backend (Super Simple Version)...')
    
    // Initialize SQLite database
    await initializeDatabase()
    
    // Start server
    server.listen(PORT, () => {
      console.log('')
      console.log('🚀 CS2 Gambling Backend Server running on port', PORT)
      console.log('📊 Health check: http://localhost:' + PORT + '/health')
      console.log('🎮 Frontend URL: http://localhost:3002')
      console.log('💾 Database: SQLite (no setup required)')
      console.log('📦 Cache: In-memory (no Redis required)')
      console.log('')
      console.log('🎯 Ready to use! No external dependencies needed.')
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

startServer()

export { app, server, wss } 