import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CS2 Gambling Backend'
  })
})

// User routes
app.get('/api/user/profile', (req, res) => {
  res.json({
    id: '1',
    username: 'TestUser',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    balance: 1250.75,
    level: 15,
    experience: 2850,
    totalWagered: 15420.50,
    totalWon: 18650.25,
    gamesPlayed: 234,
    achievements: ['first_win', 'high_roller', 'lucky_streak']
  })
})

// Game history endpoint
app.get('/api/games/history', (req, res) => {
  const gameHistory = Array.from({ length: 20 }, (_, i) => ({
    id: `game_${i + 1}`,
    game: ['coinflip', 'crash', 'jackpot', 'roulette'][Math.floor(Math.random() * 4)],
    bet: Math.floor(Math.random() * 100) + 10,
    multiplier: (Math.random() * 5 + 1).toFixed(2),
    result: Math.random() > 0.5 ? 'win' : 'loss',
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
  }))
  
  res.json(gameHistory)
})

// Coinflip game routes
app.post('/api/games/coinflip/create', (req, res) => {
  const { bet, side } = req.body
  
  const gameId = `cf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const game = {
    id: gameId,
    creator: 'TestUser',
    bet: bet,
    side: side,
    status: 'waiting',
    createdAt: new Date().toISOString()
  }
  
  // Broadcast to WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({
        type: 'coinflip_created',
        data: game
      }))
    }
  })
  
  res.json(game)
})

app.get('/api/games/coinflip/active', (req, res) => {
  const activeGames = Array.from({ length: 5 }, (_, i) => ({
    id: `cf_${i + 1}`,
    creator: `Player${i + 1}`,
    bet: Math.floor(Math.random() * 100) + 10,
    side: Math.random() > 0.5 ? 'heads' : 'tails',
    status: 'waiting',
    createdAt: new Date(Date.now() - Math.random() * 300000).toISOString()
  }))
  
  res.json(activeGames)
})

// Crash game routes
app.get('/api/games/crash/current', (req, res) => {
  const isActive = Math.random() > 0.3
  
  if (isActive) {
    res.json({
      gameId: `crash_${Date.now()}`,
      status: 'running',
      multiplier: (Math.random() * 5 + 1).toFixed(2),
      startTime: new Date(Date.now() - Math.random() * 30000).toISOString(),
      players: Math.floor(Math.random() * 50) + 10
    })
  } else {
    res.json({
      gameId: null,
      status: 'waiting',
      nextGameIn: Math.floor(Math.random() * 10) + 5
    })
  }
})

app.get('/api/games/crash/history', (req, res) => {
  const history = Array.from({ length: 50 }, (_, i) => ({
    round: i + 1,
    multiplier: (Math.random() * 10 + 1).toFixed(2),
    time: new Date(Date.now() - i * 60000).toISOString(),
    players: Math.floor(Math.random() * 30) + 5
  }))
  
  res.json(history)
})

// Jackpot game routes
app.get('/api/games/jackpot/current', (req, res) => {
  const players = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
    id: `player_${i + 1}`,
    username: `Player${i + 1}`,
    bet: Math.floor(Math.random() * 200) + 50,
    items: [`Item ${i + 1}`, `Skin ${i + 1}`],
    chance: Math.random() * 100
  }))
  
  const totalValue = players.reduce((sum, p) => sum + p.bet, 0)
  
  res.json({
    gameId: `jackpot_${Date.now()}`,
    status: 'active',
    totalValue: totalValue,
    players: players,
    timeLeft: Math.floor(Math.random() * 30) + 10,
    hash: `hash_${Math.random().toString(36).substr(2, 16)}`
  })
})

// Roulette game routes
app.get('/api/games/roulette/current', (req, res) => {
  res.json({
    gameId: `roulette_${Date.now()}`,
    status: 'betting',
    timeLeft: Math.floor(Math.random() * 20) + 5,
    bets: {
      red: Math.floor(Math.random() * 1000) + 100,
      black: Math.floor(Math.random() * 1000) + 100,
      green: Math.floor(Math.random() * 500) + 50
    },
    history: Array.from({ length: 10 }, () => ({
      number: Math.floor(Math.random() * 15),
      color: ['red', 'black', 'green'][Math.floor(Math.random() * 3)]
    }))
  })
})

// Leaderboard endpoint
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Array.from({ length: 50 }, (_, i) => ({
    rank: i + 1,
    username: `Player${i + 1}`,
    level: Math.floor(Math.random() * 30) + 1,
    totalWon: Math.floor(Math.random() * 10000) + 1000,
    gamesPlayed: Math.floor(Math.random() * 500) + 50,
    winRate: (Math.random() * 40 + 40).toFixed(1)
  }))
  
  res.json(leaderboard)
})

// Steam inventory simulation
app.get('/api/steam/inventory', (req, res) => {
  const inventory = Array.from({ length: 20 }, (_, i) => ({
    id: `item_${i + 1}`,
    name: `CS2 Skin ${i + 1}`,
    image: `https://community.cloudflare.steamstatic.com/economy/image/class/730/item_${i + 1}`,
    price: (Math.random() * 100 + 10).toFixed(2),
    rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)],
    wear: Math.random() > 0.5 ? 'Factory New' : 'Minimal Wear'
  }))
  
  res.json(inventory)
})

// Statistics endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalBets: '2.4M+',
    activePlayers: Math.floor(Math.random() * 2000) + 13000,
    totalWinnings: '$8.9M',
    gamesPlayed: '892K',
    onlineNow: Math.floor(Math.random() * 500) + 200
  })
})

// Achievement routes
app.get('/api/achievements', (req, res) => {
  const achievements = [
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      icon: '🏆',
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      reward: 50
    },
    {
      id: 'high_roller',
      name: 'High Roller',
      description: 'Place a bet of $100 or more',
      icon: '💎',
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      reward: 100
    },
    {
      id: 'lucky_streak',
      name: 'Lucky Streak',
      description: 'Win 5 games in a row',
      icon: '🍀',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      reward: 200
    },
    {
      id: 'crash_master',
      name: 'Crash Master',
      description: 'Cash out at 10x multiplier in crash',
      icon: '🚀',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: 500
    }
  ]
  
  res.json(achievements)
})

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established')
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to CS2 Gambling Backend'
  }))
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log('Received WebSocket message:', message)
      
      // Echo back for testing
      ws.send(JSON.stringify({
        type: 'echo',
        data: message
      }))
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  })
  
  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })
})

// Simulate real-time game updates
setInterval(() => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      // Send random game updates
      const updates = [
        {
          type: 'crash_multiplier',
          data: { multiplier: (Math.random() * 5 + 1).toFixed(2) }
        },
        {
          type: 'player_count',
          data: { count: Math.floor(Math.random() * 500) + 200 }
        },
        {
          type: 'new_bet',
          data: { 
            game: 'roulette',
            amount: Math.floor(Math.random() * 100) + 10,
            player: `Player${Math.floor(Math.random() * 100)}`
          }
        }
      ]
      
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)]
      client.send(JSON.stringify(randomUpdate))
    }
  })
}, 5000) // Send updates every 5 seconds

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  })
})

// Start server
const PORT = process.env.PORT || 3001
const BACKUP_PORT = 3004

server.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Backend Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎮 Frontend URL: http://localhost:3003`)
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is in use, trying ${BACKUP_PORT}...`)
    server.listen(BACKUP_PORT, () => {
      console.log(`🚀 CS2 Gambling Backend Server running on port ${BACKUP_PORT}`)
      console.log(`📊 Health check: http://localhost:${BACKUP_PORT}/health`)
      console.log(`🎮 Frontend URL: http://localhost:3003`)
    })
  } else {
    console.error('Server error:', err)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app 