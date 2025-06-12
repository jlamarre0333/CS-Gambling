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
// import { PrismaClient } from '@prisma/client'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import gameRoutes from './routes/games'
import inventoryRoutes from './routes/inventory'
import transactionRoutes from './routes/transactions'
import leaderboardRoutes from './routes/leaderboard'
import chatRoutes from './routes/chat'

// Import middleware
import { authenticateToken } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'

// Import services
import { SteamService } from './services/steamService'
import { GameService } from './services/gameService'
import { NotificationService } from './services/notificationService'

// Import socket handlers
import { setupSocketHandlers } from './sockets/socketHandlers'

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

// Initialize services
// const prisma = new PrismaClient()
const steamService = new SteamService()
// const gameService = new GameService(prisma)
const notificationService = new NotificationService(io)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://steamcdn-a.akamaihd.net", "https://community.cloudflare.steamstatic.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*"]
    }
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
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
  secret: process.env.SESSION_SECRET || 'cs2-gambling-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Passport configuration
app.use(passport.initialize())
app.use(passport.session())

// Steam authentication strategy
passport.use(new SteamStrategy({
  returnURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/steam/return`,
  realm: process.env.BACKEND_URL || 'http://localhost:3001',
  apiKey: process.env.STEAM_API_KEY!
}, async (identifier: string, profile: any, done: any) => {
  try {
    const steamId = identifier.split('/').pop()
    
    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { steamId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          steamId,
          username: profile.displayName,
          avatar: profile.photos[0]?.value || '',
          profileUrl: profile._json.profileurl,
          isOnline: true,
          lastActive: new Date()
        }
      })
    } else {
      // Update user info
      user = await prisma.user.update({
        where: { steamId },
        data: {
          username: profile.displayName,
          avatar: profile.photos[0]?.value || '',
          isOnline: true,
          lastActive: new Date()
        }
      })
    }

    return done(null, user)
  } catch (error) {
    return done(error, null)
  }
}))

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        inventory: true,
        gameHistory: true
      }
    })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API Routes
app.use('/auth', authRoutes)
app.use('/api/user', authenticateToken, userRoutes)
app.use('/api/games', authenticateToken, gameRoutes)
app.use('/api/inventory', authenticateToken, inventoryRoutes)
app.use('/api/transactions', authenticateToken, transactionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/chat', authenticateToken, chatRoutes)

// Steam API proxy endpoints
app.get('/api/steam/inventory/:steamId', authenticateToken, async (req, res) => {
  try {
    const { steamId } = req.params
    const inventory = await steamService.getUserInventory(steamId)
    res.json(inventory)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Steam inventory' })
  }
})

app.get('/api/steam/market-price/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params
    const price = await steamService.getMarketPrice(marketHashName)
    res.json({ price })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market price' })
  }
})

// WebSocket configuration
setupSocketHandlers(io, gameService, notificationService)

// Global error handler
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    prisma.$disconnect()
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  httpServer.close(() => {
    prisma.$disconnect()
    process.exit(0)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Backend Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎮 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3002'}`)
  console.log(`🔗 Steam Auth: http://localhost:${PORT}/auth/steam`)
})

export { app, io, prisma } 