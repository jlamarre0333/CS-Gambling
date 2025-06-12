import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Simple in-memory storage for demo
const users = new Map()
const games = new Map()

// Middleware
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}))
app.use(express.json())

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
    database: 'In-memory',
    users: users.size,
    games: games.size
  })
})

// Demo login - creates a user in memory
app.post('/api/auth/demo-login', (req, res) => {
  try {
    const { username } = req.body
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    // Check if user exists
    let user = Array.from(users.values()).find(u => u.username === username)
    
    if (!user) {
      // Create new demo user
      user = {
        id: `user_${Date.now()}`,
        steamId: `demo_${Date.now()}`,
        username,
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        balance: 1000,
        level: 1,
        experience: 0,
        totalWagered: 0,
        totalWon: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        createdAt: new Date().toISOString()
      }
      
      users.set(user.id, user)
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
app.get('/api/user/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const user = users.get(userId)
    
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
      winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0,
      netProfit: user.totalWon - user.totalWagered
    })
  } catch (error) {
    console.error('❌ Profile error:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
})

// Place a bet
app.post('/api/games/bet', (req, res) => {
  try {
    const { userId, gameType, betAmount, gameData } = req.body
    
    if (!userId || !gameType || !betAmount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const user = users.get(userId)
    
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
    const game = {
      id: `game_${Date.now()}`,
      userId: user.id,
      type: gameType,
      betAmount,
      winAmount,
      multiplier,
      result: isWin ? 'win' : 'loss',
      gameData: gameData || {},
      timestamp: new Date().toISOString()
    }

    games.set(game.id, game)

    // Update user balance and statistics
    user.balance = user.balance - betAmount + winAmount
    user.gamesPlayed += 1
    user.totalWagered += betAmount
    user.totalWon += winAmount
    
    if (isWin) {
      user.wins += 1
      user.experience += Math.floor(betAmount / 10) + 50
    } else {
      user.losses += 1
      user.experience += Math.floor(betAmount / 20) + 10
    }

    // Level up logic
    const requiredExp = user.level * 1000
    if (user.experience >= requiredExp) {
      user.level += 1
      user.experience = user.experience - requiredExp
    }

    users.set(user.id, user)

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
app.get('/api/games/history/:userId', (req, res) => {
  try {
    const { userId } = req.params
    
    const userGames = Array.from(games.values())
      .filter(game => game.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)

    res.json(userGames.map(game => ({
      id: game.id,
      type: game.type,
      betAmount: game.betAmount,
      winAmount: game.winAmount,
      multiplier: game.multiplier,
      result: game.result,
      timestamp: game.timestamp
    })))
  } catch (error) {
    console.error('❌ History error:', error)
    res.status(500).json({ error: 'Failed to get game history' })
  }
})

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = Array.from(users.values())
      .sort((a, b) => b.totalWon - a.totalWon)
      .slice(0, 50)
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        totalWon: user.totalWon,
        gamesPlayed: user.gamesPlayed,
        winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0
      }))

    res.json(leaderboard)
  } catch (error) {
    console.error('❌ Leaderboard error:', error)
    res.status(500).json({ error: 'Failed to get leaderboard' })
  }
})

// Social features - mock data
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

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Express error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log('')
  console.log('🚀 CS2 Gambling Backend Server (Minimal Version) running on port', PORT)
  console.log('📊 Health check: http://localhost:' + PORT + '/health')
  console.log('🎮 Frontend URL: http://localhost:3002')
  console.log('💾 Database: In-memory (no setup required)')
  console.log('')
  console.log('🎯 Ready to use! Zero setup required.')
  console.log('')
})

export { app } 