import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import Redis from 'ioredis'
import { initializeDatabase, redisConfig } from './config/database'
import { setupPassport } from './config/passport'
import { setupWebSocket } from './sockets/websocket'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import gameRoutes from './routes/games'
import jackpotRoutes from './routes/jackpot'
import priceRoutes from './routes/prices'
import chatRoutes from './routes/chat'
import transactionRoutes from './routes/transactions'
import inventoryRoutes from './routes/inventory'
import leaderboardRoutes from './routes/leaderboard'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { validateRequest } from './middleware/validation'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Initialize Redis
const redis = new Redis(redisConfig)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'cs-gambling-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Passport initialization
app.use(passport.initialize())
app.use(passport.session())

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'connected', // Will be updated after DB connection
    redis: redis.status,
    memory: process.memoryUsage()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', authMiddleware, userRoutes)
app.use('/api/games', authMiddleware, gameRoutes)
app.use('/api/games/jackpot', authMiddleware, jackpotRoutes)
app.use('/api/prices', priceRoutes)
app.use('/api/chat', authMiddleware, chatRoutes)
app.use('/api/transactions', authMiddleware, transactionRoutes)
app.use('/api/inventory', authMiddleware, inventoryRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

// Payment gateway routes
app.use('/api/payments', authMiddleware, (req, res, next) => {
  // Payment processing endpoints
  if (req.path === '/deposit') {
    return res.json({
      success: true,
      message: 'Deposit endpoint - requires payment gateway integration',
      methods: ['steam_trade', 'bitcoin', 'ethereum', 'paypal', 'credit_card']
    })
  }
  
  if (req.path === '/withdraw') {
    return res.json({
      success: true,
      message: 'Withdrawal endpoint - requires payment gateway integration',
      methods: ['steam_trade', 'bitcoin', 'ethereum', 'paypal']
    })
  }
  
  next()
})

// Security routes
app.use('/api/security', authMiddleware, (req, res, next) => {
  if (req.path === '/2fa/setup') {
    return res.json({
      success: true,
      message: '2FA setup endpoint - requires authenticator library integration',
      qrCode: 'data:image/png;base64,placeholder'
    })
  }
  
  if (req.path === '/sessions') {
    return res.json({
      sessions: [
        {
          id: 'session_1',
          device: 'Windows PC',
          location: 'New York, US',
          lastActive: new Date().toISOString(),
          current: true
        }
      ]
    })
  }
  
  next()
})

// Mobile app routes
app.use('/api/mobile', (req, res, next) => {
  if (req.path === '/download') {
    return res.json({
      success: true,
      message: 'Mobile app download endpoint',
      platforms: {
        ios: 'https://apps.apple.com/placeholder',
        android: 'https://play.google.com/placeholder'
      }
    })
  }
  
  next()
})

// Social features routes
app.use('/api/social', authMiddleware, (req, res, next) => {
  if (req.path === '/friends') {
    return res.json({
      friends: [
        {
          id: '1',
          username: 'PlayerOne',
          status: 'online',
          level: 24,
          isPlaying: true,
          currentGame: 'Crash'
        }
      ]
    })
  }
  
  if (req.path === '/feed') {
    return res.json({
      activities: [
        {
          id: '1',
          type: 'win',
          user: { username: 'PlayerOne', level: 24 },
          content: 'won $2,547 in Blackjack!',
          timestamp: new Date().toISOString(),
          likes: 23,
          comments: 5
        }
      ]
    })
  }
  
  next()
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  })
})

// Initialize application
async function initializeApp() {
  try {
    console.log('🚀 Starting CS2 Gambling Backend Server...')
    
    // Initialize database
    console.log('📊 Connecting to database...')
    await initializeDatabase()
    
    // Setup Passport strategies
    console.log('🔐 Setting up authentication...')
    setupPassport()
    
    // Setup WebSocket handlers
    console.log('🔌 Setting up WebSocket...')
    setupWebSocket(io, redis)
    
    // Test Redis connection
    console.log('📦 Testing Redis connection...')
    await redis.ping()
    console.log('✅ Redis connection established')
    
    // Start server
    server.listen(PORT, () => {
      console.log('🚀 CS2 Gambling Backend Server running on port', PORT)
      console.log('📊 Health check: http://localhost:' + PORT + '/health')
      console.log('🎮 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3002')
      console.log('🌐 Environment:', process.env.NODE_ENV || 'development')
      
      if (!process.env.STEAM_API_KEY) {
        console.log('⚠️  Steam API key not configured. Set STEAM_API_KEY in .env file.')
      }
      
      if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
        console.log('⚠️  Database not configured. Set DATABASE_URL or DB_* variables in .env file.')
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received. Starting graceful shutdown...')
  
  server.close(async () => {
    console.log('🔌 HTTP server closed')
    
    try {
      await redis.disconnect()
      console.log('📦 Redis connection closed')
      
      // Database connections will be closed automatically
      console.log('📊 Database connections closed')
      
      console.log('✅ Graceful shutdown completed')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
      process.exit(1)
    }
  })
})

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received. Starting graceful shutdown...')
  process.emit('SIGTERM')
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the application
initializeApp()

export { app, server, io, redis } 