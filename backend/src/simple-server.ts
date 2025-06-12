import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import { AppDataSource } from './config/database-simple'
import { User } from './entities/User-simple'
import { Game } from './entities/Game'
import { Transaction } from './entities/Transaction'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const BACKUP_PORT = 3004
const wsPort = process.env.WS_PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// In-memory storage for Jackpot game
let currentJackpotRound = {
  id: Math.random().toString(36).substr(2, 9),
  isActive: true,
  totalPot: 0,
  entries: [],
  timeLeft: 60,
  winnerId: null
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/health`)
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