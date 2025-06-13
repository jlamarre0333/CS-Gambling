import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import session from 'express-session'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'cs2-gambling-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Types for session
declare module 'express-session' {
  interface Session {
    user?: {
      steamId: string
      username: string
      avatar: string
      profileUrl: string
      loginTime: Date
      balance: number
    }
  }
}

// ============================================================================
// STEAM AUTHENTICATION
// ============================================================================

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid'
const STEAM_API_URL = 'https://api.steampowered.com'

function extractSteamId(identifier: string): string {
  return identifier.replace('https://steamcommunity.com/openid/id/', '')
}

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
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CS2 Gambling Backend with Steam Auth',
    steamApiKey: !!process.env.STEAM_API_KEY,
    hasSession: !!req.session.user
  })
})

// Steam login
app.get('/api/auth/steam/login', (req, res) => {
  const returnUrl = `${req.protocol}://${req.get('host')}/api/auth/steam/callback`
  const authUrl = generateSteamAuthUrl(returnUrl)
  
  console.log('🔐 Redirecting to Steam for authentication...')
  res.redirect(authUrl)
})

// Steam callback
app.get('/api/auth/steam/callback', async (req, res) => {
  try {
    console.log('🔐 Steam callback received...')
    
    const isValid = await verifySteamAuth(req.query)
    
    if (!isValid) {
      console.log('❌ Steam authentication failed')
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'STEAM_LOGIN_ERROR',
                error: 'Steam authentication failed'
              }, 'http://localhost:3003');
              window.close();
            </script>
          </body>
        </html>
      `)
    }

    const steamId = extractSteamId(req.query['openid.identity'] as string)
    console.log(`✅ Steam authentication successful for: ${steamId}`)

    const steamProfile = await getSteamProfile(steamId)
    
    req.session.user = {
      steamId: steamId,
      username: steamProfile.personaname,
      avatar: steamProfile.avatarfull,
      profileUrl: steamProfile.profileurl,
      loginTime: new Date(),
      balance: 1000.00
    }

    console.log(`👤 User logged in: ${steamProfile.personaname}`)
    
    // Generate JWT token
    const token = jwt.sign(
      {
        steamId: steamId,
        username: steamProfile.personaname,
        avatar: steamProfile.avatarfull,
        balance: 1000.00
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    
    // For popup authentication, send success message to parent window
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'STEAM_LOGIN_SUCCESS',
              token: '${token}',
              user: {
                steamId: '${steamId}',
                username: '${steamProfile.personaname}',
                avatar: '${steamProfile.avatarfull}',
                balance: 1000.00
              }
            }, 'http://localhost:3003');
            window.close();
          </script>
        </body>
      </html>
    `)
    
  } catch (error) {
    console.error('Steam callback error:', error)
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'STEAM_LOGIN_ERROR',
              error: 'Server error occurred'
            }, 'http://localhost:3003');
            window.close();
          </script>
        </body>
      </html>
    `)
  }
})

// Get current user
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    res.json({
      success: true,
      user: {
        steamId: decoded.steamId,
        username: decoded.username,
        avatar: decoded.avatar,
        balance: decoded.balance
      }
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
})

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      console.log(`👋 User logged out: ${decoded.username}`)
    }
  } catch (error) {
    // Token might be invalid, but that's okay for logout
  }
  
  res.json({ success: true, message: 'Logged out successfully' })
})

// ============================================================================
// STEAM INVENTORY WITH AUTH
// ============================================================================

function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    req.user = {
      steamId: decoded.steamId,
      username: decoded.username,
      avatar: decoded.avatar,
      balance: decoded.balance
    }
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

app.get('/api/inventory', requireAuth, async (req, res) => {
  try {
    const user = req.user as any
    
    console.log(`🎮 Fetching REAL Steam inventory for: ${user.username} (${user.steamId})`)
    
    const inventoryUrl = `https://steamcommunity.com/inventory/${user.steamId}/730/2?l=english&count=100`
    
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

    for (const asset of assets.slice(0, 20)) {
      const description = descriptions.find((desc: any) => 
        desc.classid === asset.classid && desc.instanceid === asset.instanceid
      )

      if (!description || description.tradable !== 1 || description.marketable !== 1) {
        continue
      }

      const price = await getRealSteamPrice(description.market_hash_name)

      items.push({
        id: asset.assetid,
        name: description.name,
        marketHashName: description.market_hash_name,
        price: price,
        image: `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`,
        rarity: getRarity(description.tags),
        exterior: getExterior(description.name),
        tradable: true,
        marketable: true,
        selected: false
      })

      await new Promise(resolve => setTimeout(resolve, 200))
    }

    const totalValue = items.reduce((sum: number, item: any) => sum + item.price, 0)

    res.json({
      success: true,
      items,
      totalValue,
      totalItems: items.length,
      steamId: user.steamId,
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

// Deposit skins endpoint
app.post('/api/inventory/deposit', requireAuth, async (req, res) => {
  try {
    const user = req.user as any
    const { skinIds } = req.body

    if (!skinIds || !Array.isArray(skinIds) || skinIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No skins selected for deposit' 
      })
    }

    console.log(`💰 Processing deposit for ${user.username}: ${skinIds.length} items`)

    // In a real app, you would:
    // 1. Verify the user owns these items
    // 2. Create a Steam trade offer
    // 3. Wait for trade completion
    // 4. Update user balance
    
    // For demo purposes, we'll simulate the deposit
    const mockDepositValue = skinIds.length * 50 // $50 per item for demo
    
    res.json({
      success: true,
      message: 'Deposit processed successfully',
      depositedCount: skinIds.length,
      depositedValue: mockDepositValue,
      newBalance: user.balance + mockDepositValue
    })

  } catch (error) {
    console.error('Deposit error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Deposit processing failed' 
    })
  }
})

// ============================================================================
// LIVE PRICING SYSTEM
// ============================================================================

const priceCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000

async function getRealSteamPrice(marketHashName: string): Promise<number> {
  try {
    const cached = priceCache.get(marketHashName)
    
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

    priceCache.set(marketHashName, {
      price,
      timestamp: Date.now()
    })

    return price
  } catch (error) {
    console.error(`Price fetch error for ${marketHashName}:`, error)
    return 0
  }
}

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
      timestamp: new Date()
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Price fetch failed' })
  }
})

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
      'AK-47 | Vulcan (Factory New)'
    ]

    console.log(`📈 Fetching LIVE trending prices...`)

    const trending = []
    
    for (const itemName of popularItems.slice(0, 6)) {
      try {
        const price = await getRealSteamPrice(itemName)
        trending.push({
          name: itemName,
          price,
          source: 'Real-time Steam Market',
          lastUpdated: new Date()
        })
        
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