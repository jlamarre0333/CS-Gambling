import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import session from 'express-session'
import passport from 'passport'
import SteamStrategy from 'passport-steam'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Mock user storage (replace with database later)
const users = new Map()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*"]
    }
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Logging
app.use(morgan('combined'))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'cs2-gambling-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}))

// Passport configuration
app.use(passport.initialize())
app.use(passport.session())

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cs2-gambling-jwt-secret') as any
    const user = users.get(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Steam authentication strategy
if (process.env.STEAM_API_KEY && process.env.STEAM_API_KEY !== 'your-steam-api-key-here') {
  passport.use(new SteamStrategy({
    returnURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/steam/return`,
    realm: process.env.BACKEND_URL || 'http://localhost:3001',
    apiKey: process.env.STEAM_API_KEY
  }, async (identifier: string, profile: any, done: any) => {
    try {
      const steamId = identifier.split('/').pop()
      
      let user = users.get(steamId)
      
      if (!user) {
        user = {
          id: `user_${Date.now()}`,
          steamId,
          username: profile.displayName,
          avatar: profile.photos[0]?.value || '',
          profileUrl: profile._json.profileurl,
          balance: 1000, // Starting balance
          level: 1,
          totalWagered: 0,
          totalWon: 0,
          gamesPlayed: 0,
          isOnline: true,
          createdAt: new Date(),
          lastActive: new Date()
        }
        users.set(steamId, user)
      } else {
        user.username = profile.displayName
        user.avatar = profile.photos[0]?.value || ''
        user.isOnline = true
        user.lastActive = new Date()
      }

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }))
}

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  const user = Array.from(users.values()).find((u: any) => u.id === id)
  done(null, user)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    steam_configured: !!(process.env.STEAM_API_KEY && process.env.STEAM_API_KEY !== 'your-steam-api-key-here')
  })
})

// === AUTH ROUTES ===

// Steam authentication
app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }))

// Steam authentication callback
app.get('/auth/steam/return', 
  passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL + '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user as any
      
      const token = jwt.sign(
        { 
          userId: user.id,
          steamId: user.steamId,
          username: user.username 
        },
        process.env.JWT_SECRET || 'cs2-gambling-jwt-secret',
        { expiresIn: '7d' }
      )

      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}?auth=success`)
    } catch (error) {
      console.error('Auth callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/login?error=server_error`)
    }
  }
)

// Get current user
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user as any
    res.json({
      id: user.id,
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar,
      balance: user.balance,
      level: user.level,
      totalWagered: user.totalWagered,
      totalWon: user.totalWon,
      gamesPlayed: user.gamesPlayed,
      joinedAt: user.createdAt,
      isOnline: user.isOnline
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

// Check authentication status
app.get('/auth/status', (req, res) => {
  const token = req.cookies['auth-token']
  
  if (!token) {
    return res.json({ authenticated: false })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'cs2-gambling-jwt-secret')
    res.json({ authenticated: true })
  } catch (error) {
    res.json({ authenticated: false })
  }
})

// Logout
app.post('/auth/logout', authenticateToken, (req: any, res) => {
  res.clearCookie('auth-token')
  
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' })
    }
    res.json({ message: 'Logged out successfully' })
  })
})

// === API ROUTES ===

// Get active games
app.get('/api/games/active', async (req, res) => {
  const activeGames = {
    jackpot: {
      id: 'jp_current',
      participants: 3,
      totalValue: 2500.75,
      timeLeft: 45,
      status: 'waiting'
    },
    crash: {
      id: 'cr_current',
      multiplier: 1.85,
      status: 'flying',
      participants: 12
    }
  }
  res.json(activeGames)
})

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const leaderboard = [
    {
      rank: 1,
      username: 'ProGamer2024',
      avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/f1/f1dd60a188883caf82d0cbfccfe6aba0af1732d4_full.jpg',
      amount: 125450.75,
      gamesPlayed: 2847,
      level: 87
    },
    {
      rank: 2,
      username: 'SkinMaster',
      avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/42/4271c11c8b275c5b8c0471b9f9b5a4c7e4f3c8a2_full.jpg',
      amount: 98765.50,
      gamesPlayed: 1923,
      level: 72
    }
  ]
  res.json({ leaderboard })
})

// Get user inventory
app.get('/api/inventory', authenticateToken, async (req, res) => {
  const inventory = [
    {
      id: 'item_1',
      name: 'AK-47 | Redline',
      exterior: 'Field-Tested',
      rarity: 'Classified',
      weapon: 'AK-47',
      price: 125.50,
      image: '/images/ak47-redline.jpg',
      tradable: true
    },
    {
      id: 'item_2',
      name: 'AWP | Dragon Lore',
      exterior: 'Minimal Wear',
      rarity: 'Covert',
      weapon: 'AWP',
      price: 2850.00,
      image: '/images/awp-dragonlore.jpg',
      tradable: true
    }
  ]

  res.json({
    items: inventory,
    totalValue: inventory.reduce((sum, item) => sum + item.price, 0),
    totalItems: inventory.length
  })
})

// WebSocket configuration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.emit('welcome', {
    message: 'Connected to CS2 Gambling Backend',
    timestamp: new Date()
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Backend Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎮 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3002'}`)
  
  if (process.env.STEAM_API_KEY && process.env.STEAM_API_KEY !== 'your-steam-api-key-here') {
    console.log(`🔗 Steam Auth: http://localhost:${PORT}/auth/steam`)
  } else {
    console.log(`⚠️  Steam API key not configured. Set STEAM_API_KEY in .env file.`)
  }
})

export { app, io } 