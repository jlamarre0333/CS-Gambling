import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// ============================================================================
// DUMMY USER DATA & SESSION MANAGEMENT
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

// Mock user inventories with CS2 skins
const userInventories = {
  '1': [
    {
      id: 'item_1',
      name: 'AK-47 | Redline (Field-Tested)',
      price: 125.50,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJ6ZEpiLuSrY6njQO3-hE-NWz0cYDGIFM2aA7T_gK3kufng8S6uJ-fyiM1vCMh4yvVyhG-1x5SLrs4b5JCJ_c',
      rarity: 'Classified',
      exterior: 'Field-Tested',
      weapon: 'AK-47',
      tradable: true,
      marketable: true,
      deposited: false
    },
    {
      id: 'item_2',
      name: 'M4A4 | Asiimov (Battle-Scarred)',
      price: 45.75,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL_Dl2hu5Mx2gv2PoNj3jVG2qhE9NzzzJISRdFI2ZAzU8gC5x7i5hZ-6tZ_InSM36HIis2GdwUJHQJh9Pg',
      rarity: 'Covert',
      exterior: 'Battle-Scarred',
      weapon: 'M4A4',
      tradable: true,
      marketable: true,
      deposited: false
    },
    {
      id: 'item_3',
      name: 'AWP | Asiimov (Field-Tested)',
      price: 89.25,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJU7c-ikZKSqPrxN7LEmyUJ6ZEpiLuSrY6njQO3-hE-NWz0cYDGIFM2aA7U_w',
      rarity: 'Covert',
      exterior: 'Field-Tested',
      weapon: 'AWP',
      tradable: true,
      marketable: true,
      deposited: false
    }
  ],
  '2': [
    {
      id: 'item_4',
      name: 'Glock-18 | Fade (Factory New)',
      price: 175.00,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6rwOANf1OD3ejVN79eJmImMn-O6YOuFxD4DvJwp3r2Xrd6gjQDhqEs4YTqgctSWdw89aV7Rq1i2kOy6jMK56pTOzHdk7j5iuyiY0V2l1wNu',
      rarity: 'Covert',
      exterior: 'Factory New',
      weapon: 'Glock-18',
      tradable: true,
      marketable: true,
      deposited: false
    },
    {
      id: 'item_5',
      name: 'Desert Eagle | Blaze (Factory New)',
      price: 245.50,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PLZTjlH7du6kb-HnvD8J_WExzwDsJ0h0riWpNii2ATl-hE-Y2H3JNSVdg89ZluDqVfryuu50MC9upTJzXQx7Cck4HiMyUTn1wEz',
      rarity: 'Restricted',
      exterior: 'Factory New',
      weapon: 'Desert Eagle',
      tradable: true,
      marketable: true,
      deposited: false
    }
  ],
  '3': [
    {
      id: 'item_6',
      name: 'AWP | Dragon Lore (Minimal Wear)',
      price: 6500.00,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJF_9W7m5a0mvLwOq7c2DtQ18tyi7-UrdSg3w21rhFvN2z7IdKVdFNsZQvY_wLrxe3og5fv756Yz3E16D5iuygA',
      rarity: 'Covert',
      exterior: 'Minimal Wear',
      weapon: 'AWP',
      tradable: true,
      marketable: true,
      deposited: false
    },
    {
      id: 'item_7',
      name: 'Karambit | Doppler (Factory New)',
      price: 1250.00,
      image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5u5cB1g_zMu9_w0FXj_UpoZD31LYKQdVU7YF7X_wW2yO3n1sa46J6bwCc37SAq5XjYmUXn0E5MOuFl1PbPHQKJUfLQVRbAQ1LCnO0',
      rarity: 'Covert',
      exterior: 'Factory New',
      weapon: 'Karambit',
      tradable: true,
      marketable: true,
      deposited: false
    }
  ]
}

// Simple session storage
const sessions = new Map()

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CS2 Gambling Backend - Simple',
    users: dummyUsers.length,
    totalSkins: Object.values(userInventories).flat().length
  })
})

// Login with dummy data
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

    console.log(`✅ User logged in: ${user.username}`)

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

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const session = sessions.get(token)
  const user = dummyUsers.find(u => u.id === session.userId)

  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' })
  }

  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    user: userWithoutPassword
  })
})

// Get test users
app.get('/api/auth/test-users', (req, res) => {
  res.json({
    success: true,
    users: dummyUsers.map(u => ({ 
      username: u.username, 
      password: 'password123',
      balance: u.balance,
      steamId: u.steamId
    })),
    note: 'All users have password: password123'
  })
})

// ============================================================================
// INVENTORY & SKIN DEPOSIT ROUTES
// ============================================================================

// Get user's available skins for deposit
app.get('/api/inventory', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token || !sessions.has(token)) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const session = sessions.get(token)
    const userSkins = userInventories[session.userId] || []

    // Only show non-deposited skins
    const availableSkins = userSkins.filter(skin => !skin.deposited)
    const totalValue = availableSkins.reduce((sum, skin) => sum + skin.price, 0)

    console.log(`📦 Showing ${availableSkins.length} available skins for user: ${session.username}`)

    res.json({
      success: true,
      items: availableSkins.map(skin => ({
        ...skin,
        selected: false // For frontend UI
      })),
      totalValue,
      totalItems: availableSkins.length,
      username: session.username,
      lastUpdated: new Date()
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' })
  }
})

// Get user's deposited skins
app.get('/api/inventory/deposited', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token || !sessions.has(token)) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const session = sessions.get(token)
    const userSkins = userInventories[session.userId] || []

    // Only show deposited skins
    const depositedSkins = userSkins.filter(skin => skin.deposited)
    const totalValue = depositedSkins.reduce((sum, skin) => sum + skin.price, 0)

    res.json({
      success: true,
      items: depositedSkins,
      totalValue,
      totalItems: depositedSkins.length,
      username: session.username
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch deposited skins' })
  }
})

// Deposit selected skins
app.post('/api/inventory/deposit', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token || !sessions.has(token)) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const { skinIds } = req.body
    
    if (!skinIds || !Array.isArray(skinIds) || skinIds.length === 0) {
      return res.status(400).json({ success: false, error: 'No skins selected for deposit' })
    }

    const session = sessions.get(token)
    const userSkins = userInventories[session.userId] || []

    let depositedValue = 0
    let depositedCount = 0

    // Mark selected skins as deposited
    userSkins.forEach(skin => {
      if (skinIds.includes(skin.id) && !skin.deposited) {
        skin.deposited = true
        skin.depositedAt = new Date()
        depositedValue += skin.price
        depositedCount++
      }
    })

    // Update user balance
    const user = dummyUsers.find(u => u.id === session.userId)
    if (user) {
      user.balance += depositedValue
    }

    console.log(`💰 User ${session.username} deposited ${depositedCount} skins worth $${depositedValue.toFixed(2)}`)

    res.json({
      success: true,
      message: 'Skins deposited successfully',
      depositedCount,
      depositedValue,
      newBalance: user?.balance,
      depositedSkins: userSkins.filter(skin => skinIds.includes(skin.id))
    })

  } catch (error) {
    console.error('Error depositing skins:', error)
    res.status(500).json({ success: false, error: 'Failed to deposit skins' })
  }
})

// Withdraw skins (reverse deposit)
app.post('/api/inventory/withdraw', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token || !sessions.has(token)) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const { skinIds } = req.body
    
    if (!skinIds || !Array.isArray(skinIds) || skinIds.length === 0) {
      return res.status(400).json({ success: false, error: 'No skins selected for withdrawal' })
    }

    const session = sessions.get(token)
    const userSkins = userInventories[session.userId] || []

    let withdrawnValue = 0
    let withdrawnCount = 0

    // Mark selected skins as not deposited
    userSkins.forEach(skin => {
      if (skinIds.includes(skin.id) && skin.deposited) {
        skin.deposited = false
        delete skin.depositedAt
        withdrawnValue += skin.price
        withdrawnCount++
      }
    })

    // Update user balance
    const user = dummyUsers.find(u => u.id === session.userId)
    if (user && user.balance >= withdrawnValue) {
      user.balance -= withdrawnValue
    }

    console.log(`🔄 User ${session.username} withdrew ${withdrawnCount} skins worth $${withdrawnValue.toFixed(2)}`)

    res.json({
      success: true,
      message: 'Skins withdrawn successfully',
      withdrawnCount,
      withdrawnValue,
      newBalance: user?.balance,
      withdrawnSkins: userSkins.filter(skin => skinIds.includes(skin.id))
    })

  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to withdraw skins' })
  }
})

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 CS2 Gambling Server - Simple Version running on port ${PORT}`)
  console.log(``)
  console.log(`📊 Health Check: http://localhost:${PORT}/health`)
  console.log(`🔑 Test Users: http://localhost:${PORT}/api/auth/test-users`)
  console.log(``)
  console.log(`🎯 DUMMY LOGIN TESTING:`)
  console.log(`   POST /api/auth/login`)
  console.log(`   Body: { "username": "TestPlayer1", "password": "password123" }`)
  console.log(``)
  console.log(`🎮 SKIN DEPOSIT FEATURES:`)
  console.log(`   GET /api/inventory - View available skins for deposit`)
  console.log(`   GET /api/inventory/deposited - View deposited skins`)
  console.log(`   POST /api/inventory/deposit - Deposit selected skins`)
  console.log(`   POST /api/inventory/withdraw - Withdraw deposited skins`)
  console.log(``)
  console.log(`💡 Use Bearer token from login response for authenticated requests`)
  console.log(``)
  console.log(`🎲 Test Users Available:`)
  dummyUsers.forEach(user => {
    const skinCount = userInventories[user.id]?.length || 0
    console.log(`   - ${user.username}: $${user.balance} balance, ${skinCount} skins`)
  })
}) 