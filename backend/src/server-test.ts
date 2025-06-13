import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import priceService from './services/priceService'
import steamService from './services/steamService'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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
    service: 'CS2 Gambling Backend with Steam API',
    steamApiConfigured: !!process.env.STEAM_API_KEY
  })
})

// ============================================================================
// DUMMY LOGIN SYSTEM FOR TESTING
// ============================================================================

// Dummy users for testing
const dummyUsers = [
  {
    id: '1',
    username: 'TestPlayer1',
    email: 'test1@example.com',
    password: 'password123',
    steamId: '76561198123456789',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    balance: 1250.75,
    level: 15,
    totalWagered: 5420.50,
    totalWon: 6150.25,
    gamesPlayed: 89
  },
  {
    id: '2', 
    username: 'SkinCollector',
    email: 'collector@example.com',
    password: 'password123',
    steamId: '76561198987654321',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9849b8556_full.jpg',
    balance: 3750.00,
    level: 28,
    totalWagered: 15420.50,
    totalWon: 18650.25,
    gamesPlayed: 234
  },
  {
    id: '3',
    username: 'ProGamer',
    email: 'pro@example.com', 
    password: 'password123',
    steamId: '76561198456789123',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c5/c5d56c1bb4644a474a2e4972be27ef9849b8556_full.jpg',
    balance: 8500.50,
    level: 42,
    totalWagered: 25420.50,
    totalWon: 31150.25,
    gamesPlayed: 456
  }
]

// Simple session storage (in production, use proper session management)
const sessions = new Map()

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      })
    }

    // Find user
    const user = dummyUsers.find(u => 
      u.username === username && u.password === password
    )

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      })
    }

    // Create simple session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store session
    sessions.set(sessionToken, {
      userId: user.id,
      username: user.username,
      loginTime: new Date()
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      sessionToken,
      expiresIn: '24h'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Get current user info
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !sessions.has(token)) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      })
    }

    const session = sessions.get(token)
    const user = dummyUsers.find(u => u.id === session.userId)

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      })
    }

    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Auth check error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (token && sessions.has(token)) {
      sessions.delete(token)
    }

    res.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// List dummy users for testing
app.get('/api/auth/test-users', (req, res) => {
  const usersForTesting = dummyUsers.map(user => ({
    username: user.username,
    password: 'password123',
    steamId: user.steamId
  }))

  res.json({
    success: true,
    message: 'Test users for login',
    users: usersForTesting,
    note: 'All users have password: password123'
  })
})

// ============================================================================
// REAL STEAM API INTEGRATION
// ============================================================================

// Get user's Steam inventory with REAL pricing data
app.get('/api/inventory', async (req, res) => {
  try {
    const steamId = req.query.steamId as string || '76561198123456789'
    
    console.log(`Fetching REAL Steam inventory for: ${steamId}`)
    
    // Get real Steam inventory with our enhanced pricing
    const inventory = await steamService.getUserInventory(steamId)
    
    // Add selected field for frontend compatibility
    const itemsWithSelection = inventory.items.map(item => ({
      ...item,
      selected: false
    }))

    res.json({
      success: true,
      items: itemsWithSelection,
      totalValue: inventory.totalValue,
      totalItems: inventory.totalItems,
      steamId,
      lastUpdated: new Date(),
      priceSource: 'Real Steam API + Multiple Sources'
    })

  } catch (error) {
    console.error('Error fetching Steam inventory:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Steam inventory' 
    })
  }
})

// Get Steam profile information
app.get('/api/inventory/profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    console.log(`Fetching REAL Steam profile for: ${steamId}`)
    
    const profile = await steamService.getUserProfile(steamId)
    
    res.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Steam profile' 
    })
  }
})

// ============================================================================
// REAL-TIME PRICE API ENDPOINTS
// ============================================================================

// Get price for a specific item
app.get('/api/prices/item/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params
    const decodedName = decodeURIComponent(marketHashName)
    
    console.log(`Fetching REAL price for: ${decodedName}`)
    
    const priceData = await priceService.getItemPrice(decodedName)
    
    res.json({
      success: true,
      item: decodedName,
      priceData,
      timestamp: new Date(),
      source: 'Steam API + Multiple Price Sources'
    })

  } catch (error) {
    console.error('Error fetching item price:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch item price' 
    })
  }
})

// Get trending items with REAL data
app.get('/api/prices/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query
    
    console.log(`Fetching REAL trending items (limit: ${limit})`)
    
    const trendingItems = await priceService.getTrendingItems(Number(limit))
    
    res.json({
      success: true,
      trending: trendingItems,
      count: trendingItems.length,
      timestamp: new Date(),
      source: 'Real Steam Market Data'
    })

  } catch (error) {
    console.error('Error fetching trending items:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch trending items' 
    })
  }
})

// Bulk price check with REAL data
app.post('/api/prices/bulk', async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      })
    }

    if (items.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 20 items allowed per request'
      })
    }

    console.log(`REAL bulk price check for ${items.length} items`)
    
    const priceMap = await priceService.updateInventoryPrices(items)
    
    // Convert Map to object for JSON response
    const priceObject: { [key: string]: any } = {}
    priceMap.forEach((value, key) => {
      priceObject[key] = value
    })
    
    res.json({
      success: true,
      prices: priceObject,
      itemCount: items.length,
      timestamp: new Date(),
      source: 'Real Steam API Data'
    })

  } catch (error) {
    console.error('Error in bulk price check:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to process bulk price check' 
    })
  }
})

// Market statistics with REAL data
app.get('/api/prices/market/stats', async (req, res) => {
  try {
    const trending = await priceService.getTrendingItems(10)
    
    const totalValue = trending.reduce((sum, item) => sum + item.price, 0)
    const averagePrice = trending.length > 0 ? totalValue / trending.length : 0
    
    res.json({
      success: true,
      marketStats: {
        overview: {
          totalActiveItems: trending.length,
          averagePrice: Math.round(averagePrice * 100) / 100,
          totalMarketValue: Math.round(totalValue * 100) / 100,
          lastUpdate: new Date()
        },
        topPerformers: trending.slice(0, 5),
        dataSource: 'Real Steam Market API'
      },
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error fetching market stats:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch market statistics' 
    })
  }
})

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Server with REAL Steam API running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔑 Test users: http://localhost:${PORT}/api/auth/test-users`)
  console.log(`💰 Price API: http://localhost:${PORT}/api/prices/trending`)
  console.log(`🎮 Steam API configured: ${!!process.env.STEAM_API_KEY}`)
  
  if (process.env.STEAM_API_KEY) {
    console.log(`✅ Using REAL Steam API key: ${process.env.STEAM_API_KEY.substring(0, 8)}...`)
  } else {
    console.log(`⚠️  No Steam API key found - using mock data`)
  }
}) 