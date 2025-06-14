import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import { AppDataSource } from './config/database-simple'
import { User } from './entities/User'
import { Game } from './entities/Game'
import { Transaction } from './entities/Transaction'
import inventoryRoutes from './routes/inventory'
import steamAuthRoutes from './routes/steamAuth'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const BACKUP_PORT = 3004
const wsPort = process.env.WS_PORT || 3002

// Middleware
app.use(cors({
  origin: 'http://localhost:3003',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// In-memory storage (replace with database later)
interface User {
  id: string
  username: string
  balance: number
  isGuest: boolean
  gamesPlayed: number
  totalWon: number
  totalLost: number
  createdAt: Date
}

interface GameResult {
  id: string
  userId: string
  gameType: 'coinflip' | 'crash' | 'jackpot' | 'roulette'
  betAmount: number
  winAmount: number
  result: any
  timestamp: Date
}

const users = new Map<string, User>()
const gameResults = new Map<string, GameResult>()

// Helper functions
const generateUserId = () => `user_${uuidv4()}`
const generateGameId = () => `game_${uuidv4()}`

// Game logic functions
const simulateCoinflip = (choice: 'heads' | 'tails') => {
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const won = result === choice
  return { outcome: result, won }
}

const simulateCrash = (cashOutAt?: number) => {
  // Generate crash point (weighted towards lower multipliers)
  const random = Math.random()
  let crashPoint: number
  
  if (random < 0.5) {
    crashPoint = 1 + Math.random() * 2 // 1.0x - 3.0x (50% chance)
  } else if (random < 0.8) {
    crashPoint = 3 + Math.random() * 7 // 3.0x - 10.0x (30% chance)
  } else {
    crashPoint = 10 + Math.random() * 40 // 10.0x - 50.0x (20% chance)
  }
  
  const targetCashOut = cashOutAt || (1.5 + Math.random() * 2)
  const won = crashPoint >= targetCashOut
  
  return {
    crashPoint: Number(crashPoint.toFixed(2)),
    cashOutAt: Number(targetCashOut.toFixed(2)),
    won
  }
}

const simulateRoulette = (betType: 'red' | 'black' | 'green') => {
  const random = Math.random()
  let result: { number: number; color: string }
  
  if (random < 0.0526) {
    result = { number: 0, color: 'green' }
  } else if (random < 0.5263) {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    result = { 
      number: redNumbers[Math.floor(Math.random() * redNumbers.length)], 
      color: 'red' 
    }
  } else {
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
    result = { 
      number: blackNumbers[Math.floor(Math.random() * blackNumbers.length)], 
      color: 'black' 
    }
  }
  
  const won = result.color === betType
  return { ...result, won }
}

const simulateJackpot = (betAmount: number) => {
  const participants = Math.floor(Math.random() * 8) + 2
  const totalPot = betAmount * participants
  const winChance = betAmount / totalPot
  const won = Math.random() < winChance
  
  return {
    won,
    totalPot,
    participants,
    winChance: (winChance * 100).toFixed(1) + '%'
  }
}

// Initialize WebSocket server
const wsServer = new WebSocketServer({ port: Number(wsPort) })

// WebSocket connection handling
wsServer.on('connection', (ws) => {
  console.log('Client connected')

  // Send current Jackpot state
  ws.send(JSON.stringify({
    type: 'jackpot:state',
    data: currentJackpotRound
  }))

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log('Received:', data)
      
      // Handle Jackpot game actions
      if (data.type === 'jackpot:join') {
        const entry = {
          userId: data.userId,
          username: data.username,
          avatar: data.avatar,
          betAmount: data.betAmount,
          tickets: Math.floor(data.betAmount * 100) // 1 ticket per $0.01
        }
        
        currentJackpotRound.entries.push(entry)
        currentJackpotRound.totalPot += data.betAmount

        // Broadcast updated state to all clients
        wsServer.clients.forEach(client => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
              type: 'jackpot:state',
              data: currentJackpotRound
            }))
          }
        })
      }
      
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

// Initialize database
AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized')
  })
  .catch((error) => {
    console.error('Error initializing database:', error)
  })

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CS2 Gambling Backend'
  })
})

// Auth endpoints
app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    // Create dummy user data
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      username: username,
      steamId: `steam_${username}`,
      avatar: `https://avatars.steamstatic.com/default_avatar.jpg`,
      balance: 1000, // Give users $1000 starting balance for demo
      role: username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    console.log(`🔐 Demo login: ${username} (${userData.role})`)

    res.json({
      success: true,
      user: userData,
      token: `demo_token_${userData.id}` // Dummy token
    })

  } catch (error) {
    console.error('Demo login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', (req, res) => {
  // For demo purposes, just return a success response
  // In a real app, you'd verify the token here
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  
  if (!token.startsWith('demo_token_')) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Extract user ID from token (demo only)
  const userId = token.replace('demo_token_', '')
  
  res.json({
    success: true,
    user: {
      id: userId,
      username: 'demo_user',
      role: 'USER',
      balance: 1000
    }
  })
})

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

// Steam integration routes
app.use('/api/inventory', inventoryRoutes)
app.use('/api/steam-auth', steamAuthRoutes)

// Jackpot game endpoints
app.get('/api/games/jackpot/current', (req, res) => {
  res.json(currentJackpotRound)
})

app.post('/api/games/jackpot/join', (req, res) => {
  const { userId, username, avatar, betAmount } = req.body

  if (!currentJackpotRound.isActive) {
    return res.status(400).json({ error: 'Round not active' })
  }

  const entry = {
    userId,
    username,
    avatar,
    betAmount,
    tickets: Math.floor(betAmount * 100) // 1 ticket per $0.01
  }

  currentJackpotRound.entries.push(entry)
  currentJackpotRound.totalPot += betAmount

  // Broadcast updated state
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'jackpot:state',
        data: currentJackpotRound
      }))
    }
  })

  res.json({ success: true, round: currentJackpotRound })
})

// Start Jackpot round timer
function startJackpotRoundTimer() {
  const timer = setInterval(() => {
    currentJackpotRound.timeLeft--

    // Broadcast time update
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'jackpot:time-update',
          data: { timeLeft: currentJackpotRound.timeLeft }
        }))
      }
    })

    if (currentJackpotRound.timeLeft <= 0) {
      clearInterval(timer)
      endJackpotRound()
    }
  }, 1000)
}

function endJackpotRound() {
  if (currentJackpotRound.entries.length === 0) {
    // No entries, start new round
    startNewJackpotRound()
    return
  }

  // Calculate total tickets
  const totalTickets = currentJackpotRound.entries.reduce((sum, entry) => sum + entry.tickets, 0)

  // Pick random winning ticket
  const winningTicket = Math.floor(Math.random() * totalTickets)

  // Find winner
  let currentTicket = 0
  let winner = null

  for (const entry of currentJackpotRound.entries) {
    currentTicket += entry.tickets
    if (winningTicket < currentTicket) {
      winner = entry
      break
    }
  }

  if (winner) {
    currentJackpotRound.winnerId = winner.userId
    currentJackpotRound.isActive = false

    // Broadcast winner
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'jackpot:winner',
          data: {
            winner,
            totalPot: currentJackpotRound.totalPot,
            winAmount: currentJackpotRound.totalPot * 0.95, // 5% house edge
            winningTicket,
            totalTickets
          }
        }))
      }
    })
  }

  // Start new round after delay
  setTimeout(startNewJackpotRound, 15000)
}

function startNewJackpotRound() {
  currentJackpotRound = {
    id: Math.random().toString(36).substr(2, 9),
    isActive: true,
    totalPot: 0,
    entries: [],
    timeLeft: 60,
    winnerId: null
  }

  // Broadcast new round
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'jackpot:round-started',
        data: currentJackpotRound
      }))
    }
  })

  startJackpotRoundTimer()
}

// Start first Jackpot round
startJackpotRoundTimer()

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Create or get user
app.post('/api/users', (req, res) => {
  const { username, isGuest = true } = req.body
  
  const userId = generateUserId()
  const user: User = {
    id: userId,
    username: username || `Guest_${Math.floor(Math.random() * 9999)}`,
    balance: 1000, // Start with $1000
    isGuest,
    gamesPlayed: 0,
    totalWon: 0,
    totalLost: 0,
    createdAt: new Date()
  }
  
  users.set(userId, user)
  
  res.json({
    success: true,
    user
  })
})

// Get user
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  res.json({
    success: true,
    user
  })
})

// Update user balance
app.patch('/api/users/:userId/balance', (req, res) => {
  const { userId } = req.params
  const { balance } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  user.balance = Math.max(0, balance)
  users.set(userId, user)
  
  res.json({
    success: true,
    user
  })
})

// Play coinflip
app.post('/api/games/coinflip', (req, res) => {
  const { userId, betAmount, choice } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateCoinflip(choice)
  const winAmount = gameResult.won ? betAmount * 1.98 : 0
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'coinflip',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Play crash
app.post('/api/games/crash', (req, res) => {
  const { userId, betAmount, cashOutAt } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateCrash(cashOutAt)
  const winAmount = gameResult.won ? betAmount * gameResult.cashOutAt : 0
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'crash',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Play roulette
app.post('/api/games/roulette', (req, res) => {
  const { userId, betAmount, betType } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateRoulette(betType)
  let multiplier = 1.98 // Red/Black
  if (betType === 'green') multiplier = 14
  
  const winAmount = gameResult.won ? betAmount * multiplier : 0
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'roulette',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Play jackpot
app.post('/api/games/jackpot', (req, res) => {
  const { userId, betAmount } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateJackpot(betAmount)
  const winAmount = gameResult.won ? gameResult.totalPot * 0.95 : 0 // 5% house edge
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'jackpot',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Get user's game history
app.get('/api/users/:userId/games', (req, res) => {
  const { userId } = req.params
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  const userGames = Array.from(gameResults.values())
    .filter(game => game.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50) // Last 50 games
  
  res.json({
    success: true,
    games: userGames
  })
})

// Get recent games (all users)
app.get('/api/games/recent', (req, res) => {
  const recentGames = Array.from(gameResults.values())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)
    .map(game => {
      const user = users.get(game.userId)
      return {
        id: game.id,
        gameType: game.gameType,
        player: user?.username || 'Unknown',
        betAmount: game.betAmount,
        winAmount: game.winAmount,
        won: game.winAmount > 0,
        timestamp: game.timestamp
      }
    })
  
  res.json({
    success: true,
    games: recentGames
  })
})

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Array.from(users.values())
    .filter(user => user.gamesPlayed > 0)
    .sort((a, b) => b.totalWon - a.totalWon)
    .slice(0, 10)
    .map(user => ({
      username: user.username,
      totalWon: user.totalWon,
      gamesPlayed: user.gamesPlayed,
      winRate: user.gamesPlayed > 0 ? ((user.totalWon / (user.totalWon + user.totalLost)) * 100).toFixed(1) : '0'
    }))
  
  res.json({
    success: true,
    leaderboard
  })
})

// Get server stats
app.get('/api/stats', (req, res) => {
  const totalUsers = users.size
  const totalGames = gameResults.size
  const totalWagered = Array.from(gameResults.values()).reduce((sum, game) => sum + game.betAmount, 0)
  const totalWon = Array.from(gameResults.values()).reduce((sum, game) => sum + game.winAmount, 0)
  
  res.json({
    success: true,
    stats: {
      totalUsers,
      totalGames,
      totalWagered: totalWagered.toFixed(2),
      totalWon: totalWon.toFixed(2),
      houseEdge: ((totalWagered - totalWon) / totalWagered * 100).toFixed(2) + '%'
    }
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Express server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available:`)
  console.log(`   - POST /api/users - Create user`)
  console.log(`   - GET  /api/users/:id - Get user`)
  console.log(`   - POST /api/games/coinflip - Play coinflip`)
  console.log(`   - POST /api/games/crash - Play crash`)
  console.log(`   - POST /api/games/roulette - Play roulette`)
  console.log(`   - POST /api/games/jackpot - Play jackpot`)
  console.log(`   - GET  /api/games/recent - Recent games`)
  console.log(`   - GET  /api/leaderboard - Leaderboard`)
  console.log(`   - GET  /api/stats - Server stats`)
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is in use, trying ${BACKUP_PORT}...`)
    app.listen(BACKUP_PORT, () => {
      console.log(`🚀 Simple server running on port ${BACKUP_PORT}`)
      console.log(`📊 Health: http://localhost:${BACKUP_PORT}/health`)
    })
  } else {
    console.error('Server error:', err)
  }
})

export default app