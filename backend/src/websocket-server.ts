import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3002', 'http://localhost:3003'],
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: ['http://localhost:3002', 'http://localhost:3003'] }))
app.use(express.json())

// In-memory storage for real-time data
const connectedUsers = new Map()
const activeGames = new Map()
const crashGame = {
  isActive: false,
  multiplier: 1.0,
  startTime: null,
  bets: new Map(),
  crashPoint: null
}

const jackpotRound = {
  id: Math.random().toString(36).substr(2, 9),
  isActive: true,
  totalPot: 0,
  entries: [],
  timeLeft: 60,
  winnerId: null
}

// WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`)
  
  // User authentication
  socket.on('authenticate', (userData) => {
    connectedUsers.set(socket.id, {
      ...userData,
      socketId: socket.id,
      joinedAt: new Date()
    })
    
    socket.emit('authenticated', { success: true })
    
    // Send current game states
    socket.emit('crash:state', getCrashGameState())
    socket.emit('jackpot:state', getJackpotState())
    
    // Broadcast user count update
    io.emit('users:count', connectedUsers.size)
    
    console.log(`✅ User authenticated: ${userData.username} (${socket.id})`)
  })
  
  // Crash Game Events
  socket.on('crash:join', (betData) => {
    const user = connectedUsers.get(socket.id)
    if (!user || !crashGame.isActive) return
    
    const { betAmount } = betData
    
    // Validate bet
    if (betAmount <= 0 || betAmount > user.balance) {
      socket.emit('crash:error', { message: 'Invalid bet amount' })
      return
    }
    
    // Add bet to crash game
    crashGame.bets.set(socket.id, {
      userId: user.id,
      username: user.username,
      betAmount,
      cashedOut: false,
      cashOutMultiplier: null,
      winAmount: 0
    })
    
    // Update user balance
    user.balance -= betAmount
    connectedUsers.set(socket.id, user)
    
    // Broadcast bet to all users
    io.emit('crash:bet', {
      username: user.username,
      betAmount,
      multiplier: crashGame.multiplier
    })
    
    socket.emit('crash:bet-confirmed', { success: true, newBalance: user.balance })
  })
  
  socket.on('crash:cashout', () => {
    const user = connectedUsers.get(socket.id)
    const bet = crashGame.bets.get(socket.id)
    
    if (!user || !bet || bet.cashedOut || !crashGame.isActive) return
    
    // Cash out at current multiplier
    bet.cashedOut = true
    bet.cashOutMultiplier = crashGame.multiplier
    bet.winAmount = bet.betAmount * crashGame.multiplier
    
    // Update user balance
    user.balance += bet.winAmount
    connectedUsers.set(socket.id, user)
    
    // Broadcast cashout
    io.emit('crash:cashout', {
      username: user.username,
      multiplier: crashGame.multiplier,
      winAmount: bet.winAmount
    })
    
    socket.emit('crash:cashout-success', {
      multiplier: crashGame.multiplier,
      winAmount: bet.winAmount,
      newBalance: user.balance
    })
  })
  
  // Jackpot Events
  socket.on('jackpot:join', (betData) => {
    const user = connectedUsers.get(socket.id)
    if (!user || !jackpotRound.isActive) return
    
    const { betAmount } = betData
    
    if (betAmount <= 0 || betAmount > user.balance) {
      socket.emit('jackpot:error', { message: 'Invalid bet amount' })
      return
    }
    
    // Add entry to jackpot
    const entry = {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      betAmount,
      tickets: Math.floor(betAmount * 10), // 10 tickets per $1
      joinedAt: new Date()
    }
    
    jackpotRound.entries.push(entry)
    jackpotRound.totalPot += betAmount
    
    // Update user balance
    user.balance -= betAmount
    connectedUsers.set(socket.id, user)
    
    // Broadcast jackpot update
    io.emit('jackpot:entry', {
      entry,
      totalPot: jackpotRound.totalPot,
      entryCount: jackpotRound.entries.length
    })
    
    socket.emit('jackpot:join-success', {
      entry,
      newBalance: user.balance
    })
  })
  
  // Chat System
  socket.on('chat:message', (messageData) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return
    
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content: messageData.content,
      timestamp: new Date(),
      type: 'message'
    }
    
    // Broadcast message to all users
    io.emit('chat:message', message)
  })
  
  // Rain/Giveaway System
  socket.on('rain:start', (rainData) => {
    const user = connectedUsers.get(socket.id)
    if (!user || rainData.totalAmount > user.balance) return
    
    const rain = {
      id: Math.random().toString(36).substr(2, 9),
      hostId: user.id,
      hostUsername: user.username,
      totalAmount: rainData.totalAmount,
      participants: [],
      duration: 30, // 30 seconds to join
      active: true
    }
    
    // Broadcast rain event
    io.emit('rain:started', rain)
    
    // Auto-end rain after duration
    setTimeout(() => {
      if (rain.participants.length > 0) {
        const amountPerUser = rain.totalAmount / rain.participants.length
        
        rain.participants.forEach(participantId => {
          const participant = connectedUsers.get(participantId)
          if (participant) {
            participant.balance += amountPerUser
            connectedUsers.set(participantId, participant)
          }
        })
        
        io.emit('rain:completed', {
          ...rain,
          amountPerUser,
          winners: rain.participants.length
        })
      }
    }, rain.duration * 1000)
  })
  
  socket.on('rain:join', (rainId) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return
    
    // Add to rain participants (simplified)
    socket.emit('rain:joined', { success: true })
  })
  
  // User disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`)
    
    // Remove from connected users
    connectedUsers.delete(socket.id)
    
    // Remove from active games
    if (crashGame.bets.has(socket.id)) {
      crashGame.bets.delete(socket.id)
    }
    
    // Broadcast user count update
    io.emit('users:count', connectedUsers.size)
  })
})

// Game Logic Functions
function getCrashGameState() {
  return {
    isActive: crashGame.isActive,
    multiplier: crashGame.multiplier,
    startTime: crashGame.startTime,
    bets: Array.from(crashGame.bets.values()),
    crashed: crashGame.crashPoint !== null
  }
}

function getJackpotState() {
  return {
    id: jackpotRound.id,
    isActive: jackpotRound.isActive,
    totalPot: jackpotRound.totalPot,
    entries: jackpotRound.entries,
    timeLeft: jackpotRound.timeLeft,
    winnerId: jackpotRound.winnerId
  }
}

// Crash Game Automation
function startCrashGame() {
  if (crashGame.isActive) return
  
  console.log('🚀 Starting new crash game')
  
  // Reset game state
  crashGame.isActive = true
  crashGame.multiplier = 1.0
  crashGame.startTime = Date.now()
  crashGame.bets.clear()
  crashGame.crashPoint = generateCrashPoint()
  
  // Broadcast game start
  io.emit('crash:game-started', {
    startTime: crashGame.startTime,
    message: 'New crash game started! Place your bets!'
  })
  
  // Give players time to bet (5 seconds)
  setTimeout(() => {
    runCrashGame()
  }, 5000)
}

function runCrashGame() {
  const interval = setInterval(() => {
    if (!crashGame.isActive) {
      clearInterval(interval)
      return
    }
    
    // Increase multiplier
    crashGame.multiplier += 0.01
    
    // Check if should crash
    if (crashGame.multiplier >= crashGame.crashPoint) {
      // Game crashed!
      crashGame.isActive = false
      
      // Process uncashed bets as losses
      for (const [socketId, bet] of crashGame.bets) {
        if (!bet.cashedOut) {
          bet.winAmount = 0 // Lost
        }
      }
      
      io.emit('crash:crashed', {
        crashPoint: crashGame.crashPoint,
        multiplier: crashGame.multiplier,
        bets: Array.from(crashGame.bets.values())
      })
      
      clearInterval(interval)
      
      // Start next game after delay
      setTimeout(() => {
        startCrashGame()
      }, 10000) // 10 second break
      
      return
    }
    
    // Broadcast current multiplier
    io.emit('crash:update', {
      multiplier: crashGame.multiplier,
      timestamp: Date.now()
    })
    
  }, 100) // Update every 100ms
}

function generateCrashPoint() {
  // Simplified crash point generation (house edge ~1%)
  const random = Math.random()
  const crashPoint = Math.max(1.01, -Math.log(random) * 0.99 + 1)
  
  console.log(`🎯 Generated crash point: ${crashPoint.toFixed(2)}x`)
  return crashPoint
}

// Jackpot Game Automation
function startJackpotRound() {
  console.log('🎰 Starting new jackpot round')
  
  // Reset jackpot
  jackpotRound.id = Math.random().toString(36).substr(2, 9)
  jackpotRound.isActive = true
  jackpotRound.totalPot = 0
  jackpotRound.entries = []
  jackpotRound.timeLeft = 60
  jackpotRound.winnerId = null
  
  io.emit('jackpot:round-started', jackpotRound)
  
  // Countdown timer
  const countdown = setInterval(() => {
    jackpotRound.timeLeft--
    
    if (jackpotRound.timeLeft <= 0) {
      clearInterval(countdown)
      endJackpotRound()
    } else {
      io.emit('jackpot:time-update', { timeLeft: jackpotRound.timeLeft })
    }
  }, 1000)
}

function endJackpotRound() {
  if (jackpotRound.entries.length === 0) {
    // No entries, start new round
    setTimeout(startJackpotRound, 5000)
    return
  }
  
  // Calculate total tickets
  const totalTickets = jackpotRound.entries.reduce((sum, entry) => sum + entry.tickets, 0)
  
  // Pick random winning ticket
  const winningTicket = Math.floor(Math.random() * totalTickets)
  
  // Find winner
  let currentTicket = 0
  let winner = null
  
  for (const entry of jackpotRound.entries) {
    currentTicket += entry.tickets
    if (winningTicket < currentTicket) {
      winner = entry
      break
    }
  }
  
  if (winner) {
    jackpotRound.winnerId = winner.userId
    
    // Update winner's balance
    for (const [socketId, user] of connectedUsers) {
      if (user.id === winner.userId) {
        user.balance += jackpotRound.totalPot * 0.95 // 5% house edge
        connectedUsers.set(socketId, user)
        break
      }
    }
    
    io.emit('jackpot:winner', {
      winner,
      totalPot: jackpotRound.totalPot,
      winAmount: jackpotRound.totalPot * 0.95,
      winningTicket,
      totalTickets
    })
  }
  
  // Start new round after delay
  setTimeout(startJackpotRound, 15000)
}

// HTTP Endpoints for WebSocket info
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    activeGames: {
      crash: crashGame.isActive,
      jackpot: jackpotRound.isActive
    }
  })
})

app.get('/api/websocket/stats', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    activeGames: {
      crash: getCrashGameState(),
      jackpot: getJackpotState()
    }
  })
})

// Start server and game automation
httpServer.listen(PORT, () => {
  console.log('🚀 CS2 Gambling WebSocket Server running on port', PORT)
  console.log('📊 Health check:', `http://localhost:${PORT}/health`)
  console.log('🎮 Frontend URL: http://localhost:3002')
  console.log('⚡ WebSocket endpoint: ws://localhost:' + PORT)
  
  // Start automated games
  setTimeout(() => {
    startCrashGame()
    startJackpotRound()
  }, 2000)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully')
  httpServer.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully')
  httpServer.close(() => {
    process.exit(0)
  })
}) 