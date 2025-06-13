import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'

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

// ============================================================================
// DUMMY LOGIN SYSTEM FOR TESTING
// ============================================================================

const dummyUsers = [
  {
    id: '1',
    username: 'TestPlayer1',
    password: 'password123',
    steamId: '76561198123456789',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    balance: 1250.75,
    level: 15
  },
  {
    id: '2', 
    username: 'SkinCollector',
    password: 'password123',
    steamId: '76561198987654321',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9849b8556_full.jpg',
    balance: 3750.00,
    level: 28
  },
  {
    id: '3',
    username: 'ProGamer',
    password: 'password123',
    steamId: '76561198456789123',
    avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c5/c5d56c1bb4644a474a2e4972be27ef9849b8556_full.jpg',
    balance: 8500.50,
    level: 42
  }
]

const sessions = new Map()

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CS2 Gambling Backend',
    steamApiKey: !!process.env.STEAM_API_KEY
  })
})

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body

    const user = dummyUsers.find(u => 
      u.username === username && u.password === password
    )

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    sessions.set(sessionToken, {
      userId: user.id,
      username: user.username,
      loginTime: new Date()
    })

    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      sessionToken
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// Get test users
app.get('/api/auth/test-users', (req, res) => {
  res.json({
    success: true,
    users: dummyUsers.map(u => ({ username: u.username, password: 'password123' })),
    note: 'All users have password: password123'
  })
})

// ============================================================================
// REAL STEAM API INTEGRATION (Direct calls)
// ============================================================================

// Get real Steam inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const steamId = req.query.steamId as string || '76561198123456789'
    
    console.log(`🎮 Fetching REAL Steam inventory for: ${steamId}`)
    
    if (!process.env.STEAM_API_KEY) {
      console.log('⚠️ No Steam API key - using mock data')
      return res.json({
        success: true,
        items: [
          {
            id: 'mock_1',
            name: 'AK-47 | Redline (Field-Tested)',
            price: 125.50,
            image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJ6ZEpiLuSrY6njQO3-hE-NWz0cYDGIFM2aA7T_gK3kufng8S6uJ-fyiM1vCMh4yvVyhG-1x5SLrs4b5JCJ_c',
            rarity: 'Classified',
            exterior: 'Field-Tested',
            tradable: true,
            marketable: true,
            selected: false
          },
          {
            id: 'mock_2',
            name: 'AWP | Dragon Lore (Factory New)',
            price: 8500.00,
            image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJF_9W7m5a0mvLwOq7c2DtQ18tyi7-UrdSg3w21rhFvN2z7IdKVdFNsZQvY_wLrxe3og5fv756Yz3E16D5iuygA',
            rarity: 'Covert',
            exterior: 'Factory New',
            tradable: true,
            marketable: true,
            selected: false
          }
        ],
        totalValue: 8625.50,
        totalItems: 2,
        steamId,
        priceSource: 'Mock data (Set STEAM_API_KEY for real data)'
      })
    }

    // Real Steam inventory call
    const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=100`
    
    const response = await axios.get(inventoryUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.data || !response.data.assets) {
      throw new Error('Invalid inventory response')
    }

    const { assets, descriptions } = response.data
    const items = []

    for (const asset of assets.slice(0, 10)) { // Limit to first 10 items
      const description = descriptions.find((desc: any) => 
        desc.classid === asset.classid && desc.instanceid === asset.instanceid
      )

      if (!description || !description.tradable || !description.marketable) {
        continue
      }

      // Get real price from Steam Market
      const price = await getRealSteamPrice(description.market_hash_name)

      items.push({
        id: asset.assetid,
        name: description.name,
        price: price,
        image: `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`,
        rarity: getRarity(description.tags),
        exterior: getExterior(description.name),
        tradable: description.tradable === 1,
        marketable: description.marketable === 1,
        selected: false
      })
    }

    const totalValue = items.reduce((sum: number, item: any) => sum + item.price, 0)

    res.json({
      success: true,
      items,
      totalValue,
      totalItems: items.length,
      steamId,
      priceSource: 'Real Steam Market API',
      lastUpdated: new Date()
    })

  } catch (error) {
    console.error('Steam inventory error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Steam inventory' 
    })
  }
})

// Get real Steam prices
async function getRealSteamPrice(marketHashName: string): Promise<number> {
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (response.data.success && response.data.median_price) {
      const priceStr = response.data.median_price.replace(/[^0-9.]/g, '')
      return parseFloat(priceStr) || 0
    }

    return 0
  } catch (error) {
    console.error(`Price fetch error for ${marketHashName}:`, error)
    return 0
  }
}

// Helper functions
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

// Real-time price endpoints
app.get('/api/prices/item/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params
    const decodedName = decodeURIComponent(marketHashName)
    
    console.log(`💰 Fetching REAL price for: ${decodedName}`)
    
    const price = await getRealSteamPrice(decodedName)
    
    res.json({
      success: true,
      item: decodedName,
      price,
      source: 'Real Steam Market API',
      timestamp: new Date()
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Price fetch failed' })
  }
})

// Trending items with real prices
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

    console.log(`📈 Fetching REAL trending prices...`)

    const trending = []
    
    for (const itemName of popularItems.slice(0, 5)) {
      const price = await getRealSteamPrice(itemName)
      trending.push({
        name: itemName,
        price,
        source: 'Real Steam Market'
      })
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    res.json({
      success: true,
      trending,
      source: 'Real Steam Market API',
      timestamp: new Date()
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Trending fetch failed' })
  }
})

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Server WORKING on port ${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/health`)
  console.log(`🔑 Test users: http://localhost:${PORT}/api/auth/test-users`)
  console.log(`💰 Prices: http://localhost:${PORT}/api/prices/trending`)
  console.log(`🎮 Inventory: http://localhost:${PORT}/api/inventory`)
  
  if (process.env.STEAM_API_KEY) {
    console.log(`✅ Steam API: ${process.env.STEAM_API_KEY.substring(0, 8)}...`)
  } else {
    console.log(`⚠️ No Steam API key - using mock data`)
  }
  
  console.log(`\n🎯 READY TO TEST! Try these:`)
  console.log(`   Login: POST /api/auth/login { "username": "TestPlayer1", "password": "password123" }`)
  console.log(`   Inventory: GET /api/inventory?steamId=76561198123456789`)
}) 