import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import session from 'express-session'
import crypto from 'crypto'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session middleware for Steam auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// ============================================================================
// STEAM OPENID AUTHENTICATION
// ============================================================================

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid'
const STEAM_API_URL = 'https://api.steampowered.com'

// Helper function to extract Steam ID from OpenID identifier
function extractSteamId(identifier: string): string {
  const steamId64 = identifier.replace('https://steamcommunity.com/openid/id/', '')
  return steamId64
}

// Generate authentication URL for Steam
function generateSteamAuthUrl(returnUrl: string): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': returnUrl.split('/auth')[0],
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  })

  return `${STEAM_OPENID_URL}/login?${params.toString()}`
}

// Verify Steam OpenID response
async function verifySteamAuth(params: any): Promise<boolean> {
  try {
    const verifyParams = { ...params }
    verifyParams['openid.mode'] = 'check_authentication'
    
    const response = await axios.post(STEAM_OPENID_URL + '/login', 
      new URLSearchParams(verifyParams).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    return response.data.includes('is_valid:true')
  } catch (error) {
    console.error('Steam auth verification error:', error)
    return false
  }
}

// Get Steam user profile
async function getSteamProfile(steamId: string) {
  try {
    if (!process.env.STEAM_API_KEY) {
      throw new Error('Steam API key not configured')
    }

    const response = await axios.get(
      `${STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: {
          key: process.env.STEAM_API_KEY,
          steamids: steamId
        }
      }
    )

    const players = response.data.response.players
    if (players && players.length > 0) {
      return players[0]
    }

    throw new Error('Player not found')
  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    throw error
  }
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CS2 Gambling Backend with Steam Auth',
    steamApiKey: !!process.env.STEAM_API_KEY,
    hasSession: !!(req.session as any)?.user
  })
})

// Steam login initiation
app.get('/api/auth/steam/login', (req, res) => {
  const returnUrl = `${req.protocol}://${req.get('host')}/api/auth/steam/callback`
  const authUrl = generateSteamAuthUrl(returnUrl)
  
  console.log('🔐 Redirecting to Steam for authentication...')
  res.redirect(authUrl)
})

// Steam authentication callback
app.get('/api/auth/steam/callback', async (req, res) => {
  try {
    console.log('🔐 Steam callback received...')
    
    const isValid = await verifySteamAuth(req.query)
    
    if (!isValid) {
      console.log('❌ Steam authentication failed')
      return res.redirect('http://localhost:3000/login?error=auth_failed')
    }

    const steamId = extractSteamId(req.query['openid.identity'] as string)
    console.log(`✅ Steam authentication successful for: ${steamId}`)

    // Get Steam profile
    const steamProfile = await getSteamProfile(steamId)
    
    // Store user in session
    (req.session as any).user = {
      steamId: steamId,
      username: steamProfile.personaname,
      avatar: steamProfile.avatarfull,
      profileUrl: steamProfile.profileurl,
      loginTime: new Date(),
      balance: 1000.00
    }

    console.log(`👤 User logged in: ${steamProfile.personaname}`)
    
    // Redirect to frontend
    res.redirect('http://localhost:3000/dashboard?login=success')
    
  } catch (error) {
    console.error('Steam callback error:', error)
    res.redirect('http://localhost:3000/login?error=server_error')
  }
})

// Get current user
app.get('/api/auth/me', (req, res) => {
  const user = (req.session as any)?.user
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  res.json({
    success: true,
    user: {
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar,
      profileUrl: user.profileUrl,
      balance: user.balance,
      loginTime: user.loginTime
    }
  })
})

// Logout
app.post('/api/auth/logout', (req, res) => {
  const user = (req.session as any)?.user
  
  if (user) {
    console.log(`👋 User logged out: ${user.username}`)
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err)
      return res.status(500).json({ success: false, error: 'Logout failed' })
    }
    
    res.json({ success: true, message: 'Logged out successfully' })
  })
})

// ============================================================================
// REAL STEAM INVENTORY WITH AUTHENTICATION
// ============================================================================

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any)?.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }
  next()
}

// Get authenticated user's Steam inventory
app.get('/api/inventory', requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user
    const steamId = user.steamId
    
    console.log(`🎮 Fetching REAL Steam inventory for authenticated user: ${user.username} (${steamId})`)
    
    // Real Steam inventory call
    const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=100`
    
    const response = await axios.get(inventoryUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.data || !response.data.assets) {
      throw new Error('Invalid inventory response or private inventory')
    }

    const { assets, descriptions } = response.data
    const items = []

    console.log(`📦 Processing ${assets.length} items from inventory...`)

    for (const asset of assets.slice(0, 20)) { // Limit to first 20 items for performance
      const description = descriptions.find((desc: any) => 
        desc.classid === asset.classid && desc.instanceid === asset.instanceid
      )

      if (!description || description.tradable !== 1 || description.marketable !== 1) {
        continue
      }

      // Get real-time price
      const price = await getRealSteamPrice(description.market_hash_name)

      items.push({
        id: asset.assetid,
        name: description.name,
        marketHashName: description.market_hash_name,
        price: price,
        image: `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`,
        rarity: getRarity(description.tags),
        exterior: getExterior(description.name),
        tradable: description.tradable === 1,
        marketable: description.marketable === 1,
        selected: false,
        type: getItemType(description.tags)
      })

      // Rate limiting to avoid being blocked
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    const totalValue = items.reduce((sum: number, item: any) => sum + item.price, 0)

    res.json({
      success: true,
      items,
      totalValue,
      totalItems: items.length,
      steamId,
      username: user.username,
      priceSource: 'Real-time Steam Market API',
      lastUpdated: new Date()
    })

  } catch (error) {
    console.error('Steam inventory error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Steam inventory. Make sure your inventory is public.' 
    })
  }
})

// ============================================================================
// LIVE PRICING SYSTEM
// ============================================================================

// Cache for prices to avoid too many API calls
const priceCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getRealSteamPrice(marketHashName: string): Promise<number> {
  try {
    // Check cache first
    const cacheKey = marketHashName
    const cached = priceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.price
    }

    const url = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`
    
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    let price = 0
    if (response.data.success && response.data.median_price) {
      const priceStr = response.data.median_price.replace(/[^0-9.]/g, '')
      price = parseFloat(priceStr) || 0
    }

    // Cache the result
    priceCache.set(cacheKey, {
      price,
      timestamp: Date.now()
    })

    return price
  } catch (error) {
    console.error(`Price fetch error for ${marketHashName}:`, error)
    return 0
  }
}

// Get real-time price for specific item
app.get('/api/prices/item/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params
    const decodedName = decodeURIComponent(marketHashName)
    
    console.log(`💰 Fetching REAL-TIME price for: ${decodedName}`)
    
    const price = await getRealSteamPrice(decodedName)
    
    res.json({
      success: true,
      item: decodedName,
      price,
      source: 'Real-time Steam Market API',
      timestamp: new Date(),
      cached: priceCache.has(marketHashName)
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Price fetch failed' })
  }
})

// Get trending items with live prices
app.get('/api/prices/trending', async (req, res) => {
  try {
    const popularItems = [
      'AK-47 | Redline (Field-Tested)',
      'AWP | Dragon Lore (Factory New)',
      'M4A4 | Howl (Field-Tested)',
      'AK-47 | Fire Serpent (Field-Tested)',
      'AWP | Asiimov (Field-Tested)',
      'Glock-18 | Fade (Factory New)',
      'Desert Eagle | Blaze (Factory New)',
      'AK-47 | Vulcan (Factory New)',
      'AWP | Lightning Strike (Factory New)',
      'M4A1-S | Hot Rod (Factory New)'
    ]

    console.log(`📈 Fetching LIVE trending prices...`)

    const trending = []
    
    for (const itemName of popularItems.slice(0, 8)) {
      try {
        const price = await getRealSteamPrice(itemName)
        trending.push({
          name: itemName,
          price,
          source: 'Real-time Steam Market',
          lastUpdated: new Date()
        })
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Error fetching price for ${itemName}:`, error)
      }
    }

    res.json({
      success: true,
      trending,
      source: 'Real-time Steam Market API',
      timestamp: new Date(),
      cacheSize: priceCache.size
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Trending fetch failed' })
  }
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRarity(tags: any[]): string {
  if (!tags) return 'Unknown'
  const rarityTag = tags.find(tag => tag.category === 'Rarity')
  return rarityTag ? rarityTag.localized_name : 'Unknown'
}

function getExterior(itemName: string): string | undefined {
  const exteriors = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred']
  for (const exterior of exteriors) {
    if (itemName.includes(`(${exterior})`)) {
      return exterior
    }
  }
  return undefined
}

function getItemType(tags: any[]): string {
  if (!tags) return 'Unknown'
  const typeTag = tags.find(tag => tag.category === 'Type')
  return typeTag ? typeTag.localized_name : 'Unknown'
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Server with STEAM AUTH running on port ${PORT}`)
  console.log(``)
  console.log(`🔐 Steam Login: http://localhost:${PORT}/api/auth/steam/login`)
  console.log(`📊 Health Check: http://localhost:${PORT}/health`)
  console.log(`👤 Current User: http://localhost:${PORT}/api/auth/me`)
  console.log(`🎮 Inventory: http://localhost:${PORT}/api/inventory`)
  console.log(`💰 Live Prices: http://localhost:${PORT}/api/prices/trending`)
  console.log(``)
  
  if (process.env.STEAM_API_KEY) {
    console.log(`✅ Steam API Key: ${process.env.STEAM_API_KEY.substring(0, 8)}...`)
  } else {
    console.log(`⚠️  Warning: No Steam API key configured`)
  }
  
  console.log(``)
  console.log(`🎯 TO TEST STEAM LOGIN:`)
  console.log(`   1. Visit: http://localhost:${PORT}/api/auth/steam/login`)
  console.log(`   2. Login with your Steam account`)
  console.log(`   3. You'll be redirected back with authentication`)
  console.log(`   4. Test your inventory: http://localhost:${PORT}/api/inventory`)
  console.log(``)
  console.log(`💡 Make sure your Steam inventory is PUBLIC for inventory access!`)
}) 