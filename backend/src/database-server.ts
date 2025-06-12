import express from 'express'
import cors from 'cors'
import { connectDatabase, disconnectDatabase, checkDatabaseHealth, UserService, GameService, TransactionService } from './lib/database'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: ['http://localhost:3002', 'http://localhost:3003'] }))
app.use(express.json())

// Database connection
let dbConnected = false

async function initializeDatabase() {
  dbConnected = await connectDatabase()
  if (!dbConnected) {
    console.log('⚠️  Running in fallback mode without database')
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = dbConnected ? await checkDatabaseHealth() : { status: 'disabled' }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development'
  })
})

// Enhanced User Management
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, steamId, avatar } = req.body
    
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database not available' })
    }
    
    // Check if user exists
    const existingUser = await UserService.findUserByUsername(username)
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    
    const user = await UserService.createUser({
      username,
      email,
      steamId,
      avatar
    })
    
    res.json({ success: true, user })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username } = req.body
    
    if (!dbConnected) {
      // Fallback to simple in-memory user
      const user = { id: '1', username, balance: 1000 }
      return res.json({ success: true, user })
    }
    
    let user = await UserService.findUserByUsername(username)
    
    // Auto-create user if doesn't exist (for demo)
    if (!user) {
      user = await UserService.createUser({ username })
    }
    
    res.json({ success: true, user })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Enhanced Game Endpoints
app.post('/api/games/bet', async (req, res) => {
  try {
    const { userId, betAmount, gameType, gameData } = req.body
    
    if (!dbConnected) {
      // Fallback to simple logic
      return res.json({
        success: true,
        game: { result: 'win', winAmount: betAmount * 2 },
        user: { balance: 1000 }
      })
    }
    
    const user = await UserService.findUserById(userId)
    if (!user || Number(user.balance) < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }
    
    // Process game logic (same as simple server)
    let result, winAmount, multiplier = 1.0
    let enhancedGameData = gameData || {}
    
    if (gameType === 'crash') {
      if (gameData?.multiplier) {
        multiplier = gameData.multiplier
        winAmount = betAmount * multiplier
        result = 'WIN'
      } else {
        winAmount = 0
        result = 'PLAYING'
      }
    } else if (gameType === 'roulette') {
      const betType = gameData?.betType || 'red'
      const spinResult = Math.floor(Math.random() * 37)
      
      let isWin = false
      if (betType === 'red' && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(spinResult)) {
        isWin = true
        multiplier = 2.0
      } else if (betType === 'black' && [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(spinResult)) {
        isWin = true
        multiplier = 2.0
      } else if (betType === 'green' && spinResult === 0) {
        isWin = true
        multiplier = 14.0
      }
      
      winAmount = isWin ? betAmount * multiplier : 0
      result = isWin ? 'WIN' : 'LOSS'
      enhancedGameData = { ...gameData, spinResult, winAmount }
    } else if (gameType === 'blackjack') {
      // Simplified blackjack logic
      const action = gameData?.action
      
      if (action === 'deal') {
        const playerCards = dealCards(2)
        const dealerCards = dealCards(2)
        const playerValue = calculateBlackjackValue(playerCards)
        
        if (playerValue === 21) {
          result = 'BLACKJACK'
          winAmount = betAmount * 2.5
          multiplier = 2.5
        } else {
          result = 'PLAYING'
          winAmount = 0
        }
        
        enhancedGameData = { playerCards, dealerCards, playerValue }
      }
    } else {
      // Default 50/50
      const isWin = Math.random() > 0.5
      multiplier = isWin ? 2.0 : 0
      winAmount = isWin ? betAmount * 2 : 0
      result = isWin ? 'WIN' : 'LOSS'
    }
    
    // Update user balance
    const balanceChange = winAmount - betAmount
    const updatedUser = await UserService.updateUserBalance(userId, balanceChange)
    
    // Create game record
    const game = await GameService.createGame({
      userId,
      gameType,
      betAmount,
      winAmount,
      multiplier,
      result,
      gameData: enhancedGameData
    })
    
    // Create transaction record
    await TransactionService.createTransaction({
      userId,
      type: winAmount > betAmount ? 'BET_WIN' : 'BET_LOSS',
      amount: Math.abs(balanceChange),
      description: `${gameType} game ${result}`,
      metadata: { gameId: game.id, gameType, betAmount, winAmount }
    })
    
    res.json({
      success: true,
      game: {
        id: game.id,
        result,
        winAmount,
        multiplier,
        gameData: enhancedGameData
      },
      user: updatedUser
    })
  } catch (error) {
    console.error('Betting error:', error)
    res.status(500).json({ error: 'Bet processing failed' })
  }
})

// Enhanced Game History
app.get('/api/games/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { gameType, limit } = req.query
    
    if (!dbConnected) {
      return res.json({ success: true, games: [] })
    }
    
    const games = await GameService.getUserGameHistory(
      userId, 
      gameType as string, 
      parseInt(limit as string) || 50
    )
    
    res.json({ success: true, games })
  } catch (error) {
    console.error('Game history error:', error)
    res.status(500).json({ error: 'Failed to get game history' })
  }
})

// User Profile with Enhanced Stats
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    if (!dbConnected) {
      return res.json({
        success: true,
        user: { id: userId, username: 'DemoUser', balance: 1000 },
        stats: { totalGames: 0, totalWins: 0 }
      })
    }
    
    const result = await UserService.getUserStats(userId)
    if (!result) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ success: true, user: result.user, stats: result.stats })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
})

// Enhanced Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ success: true, leaderboard: [] })
    }
    
    const leaderboard = await GameService.getLeaderboard()
    res.json({ success: true, leaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Failed to get leaderboard' })
  }
})

// Game Statistics Dashboard
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ success: true, stats: {} })
    }
    
    const stats = await GameService.getGameStats()
    res.json({ success: true, stats })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to get statistics' })
  }
})

// User Transactions
app.get('/api/user/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    if (!dbConnected) {
      return res.json({ success: true, transactions: [] })
    }
    
    const transactions = await TransactionService.getUserTransactions(userId)
    res.json({ success: true, transactions })
  } catch (error) {
    console.error('Transactions error:', error)
    res.status(500).json({ error: 'Failed to get transactions' })
  }
})

// Helper functions (same as before)
function dealCards(count: number) {
  const cards = []
  for (let i = 0; i < count; i++) {
    cards.push(dealCard())
  }
  return cards
}

function dealCard() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const suit = suits[Math.floor(Math.random() * suits.length)]
  const rank = ranks[Math.floor(Math.random() * ranks.length)]
  
  return { suit, rank }
}

function calculateBlackjackValue(cards: any[]) {
  let value = 0
  let aces = 0
  
  for (const card of cards) {
    if (card.rank === 'A') {
      aces++
      value += 11
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      value += 10
    } else {
      value += parseInt(card.rank)
    }
  }
  
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  
  return value
}

// Start server with database initialization
async function startServer() {
  await initializeDatabase()
  
  app.listen(PORT, () => {
    console.log('🚀 CS2 Gambling Backend Server (Database Enhanced) running on port', PORT)
    console.log('📊 Health check:', `http://localhost:${PORT}/health`)
    console.log('🎮 Frontend URL: http://localhost:3002')
    console.log('🗄️  Database:', dbConnected ? 'Connected' : 'Fallback mode')
  })
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully')
  if (dbConnected) {
    await disconnectDatabase()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully')
  if (dbConnected) {
    await disconnectDatabase()
  }
  process.exit(0)
})

startServer().catch(console.error) 