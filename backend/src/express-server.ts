import express from 'express'
import cors from 'cors'
import axios from 'axios'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = 3001
const FRONTEND_URL = 'http://localhost:3003'

// Steam OpenID configuration
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
const STEAM_API_KEY = process.env.STEAM_API_KEY || '9D0FC6D133693B6F6FD1A71935254257'

// Middleware
app.use(cors({
  origin: 'http://localhost:3003',
  credentials: true
}))
app.use(express.json())

// In-memory storage (replace with database later)
interface User {
  id: string
  username: string
  balance: number
  isGuest: boolean
  gamesPlayed: number
  totalWon: number
  totalLost: number
  createdAt: Date
}

interface GameResult {
  id: string
  userId: string
  gameType: 'coinflip' | 'crash' | 'jackpot' | 'roulette'
  betAmount: number
  winAmount: number
  result: any
  timestamp: Date
}

const users = new Map<string, User>()
const gameResults = new Map<string, GameResult>()

// Helper functions
const generateUserId = () => `user_${uuidv4()}`
const generateGameId = () => `game_${uuidv4()}`

// Game logic functions
const simulateCoinflip = (choice: 'heads' | 'tails') => {
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const won = result === choice
  return { outcome: result, won }
}

const simulateCrash = (cashOutAt?: number) => {
  // Generate crash point (weighted towards lower multipliers)
  const random = Math.random()
  let crashPoint: number
  
  if (random < 0.5) {
    crashPoint = 1 + Math.random() * 2 // 1.0x - 3.0x (50% chance)
  } else if (random < 0.8) {
    crashPoint = 3 + Math.random() * 7 // 3.0x - 10.0x (30% chance)
  } else {
    crashPoint = 10 + Math.random() * 40 // 10.0x - 50.0x (20% chance)
  }
  
  const targetCashOut = cashOutAt || (1.5 + Math.random() * 2)
  const won = crashPoint >= targetCashOut
  
  return {
    crashPoint: Number(crashPoint.toFixed(2)),
    cashOutAt: Number(targetCashOut.toFixed(2)),
    won
  }
}

const simulateRoulette = (betType: 'red' | 'black' | 'green') => {
  const random = Math.random()
  let result: { number: number; color: string }
  
  if (random < 0.0526) {
    result = { number: 0, color: 'green' }
  } else if (random < 0.5263) {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    result = { 
      number: redNumbers[Math.floor(Math.random() * redNumbers.length)], 
      color: 'red' 
    }
  } else {
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
    result = { 
      number: blackNumbers[Math.floor(Math.random() * blackNumbers.length)], 
      color: 'black' 
    }
  }
  
  const won = result.color === betType
  return { ...result, won }
}

const simulateJackpot = (betAmount: number) => {
  const participants = Math.floor(Math.random() * 8) + 2
  const totalPot = betAmount * participants
  const winChance = betAmount / totalPot
  const won = Math.random() < winChance
  
  return {
    won,
    totalPot,
    participants,
    winChance: (winChance * 100).toFixed(1) + '%'
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Steam OAuth login initiation
app.get('/api/steam-auth/login', (req, res) => {
  const returnUrl = `http://localhost:${PORT}/api/steam-auth/callback`
  
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': `http://localhost:${PORT}`,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  })
  
  const steamLoginUrl = `${STEAM_OPENID_URL}?${params.toString()}`
  
  console.log('🚀 Redirecting to Steam login:', steamLoginUrl)
  res.redirect(steamLoginUrl)
})

// Steam OAuth callback
app.get('/api/steam-auth/callback', async (req, res) => {
  try {
    const query = req.query
    
    // Verify the OpenID response
    const verifyParams = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      verifyParams.append(key, value as string)
    }
    verifyParams.set('openid.mode', 'check_authentication')
    
    // Verify with Steam
    const verifyResponse = await axios.post(STEAM_OPENID_URL, verifyParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    if (verifyResponse.data.includes('is_valid:true')) {
      // Extract Steam ID from the identity URL
      const identity = query['openid.identity'] as string
      const steamId = identity.split('/').pop()
      
      if (steamId) {
        console.log('✅ Steam authentication successful for Steam ID:', steamId)
        
        // Get real Steam profile data directly from Steam API
        let profile = null
        try {
          if (STEAM_API_KEY && STEAM_API_KEY !== 'YOUR_STEAM_API_KEY_HERE') {
            const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
            const steamResponse = await axios.get(steamApiUrl)
            
            if (steamResponse.data.response && steamResponse.data.response.players.length > 0) {
              profile = steamResponse.data.response.players[0]
              console.log('✅ Got real Steam profile:', profile.personaname)
            } else {
              console.log('⚠️ No Steam profile data returned')
            }
          } else {
            console.log('⚠️ No Steam API key configured, using Steam Community fallback')
            
            // Fallback: Try to get basic info from Steam Community (doesn't require API key)
            try {
              const communityUrl = `https://steamcommunity.com/profiles/${steamId}/?xml=1`
              const communityResponse = await axios.get(communityUrl, { timeout: 5000 })
              
              // Parse basic XML data (this is a simple fallback)
              const xmlData = communityResponse.data
              const nameMatch = xmlData.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/)
              const avatarMatch = xmlData.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/)
              
              if (nameMatch && avatarMatch) {
                profile = {
                  personaname: nameMatch[1],
                  avatarfull: avatarMatch[1],
                  profileurl: `https://steamcommunity.com/profiles/${steamId}`,
                  personastate: 0 // Unknown status without API key
                }
                console.log('✅ Got Steam Community profile:', profile.personaname)
              }
            } catch (xmlError) {
              console.log('⚠️ Steam Community also unavailable, using fallback profile')
            }
          }
        } catch (error) {
          console.log('⚠️ Steam API unavailable, using fallback profile:', error instanceof Error ? error.message : 'Unknown error')
        }
        
        // Create user object (with fallback data)
        const steamUser = {
          id: `user_${steamId}`,
          steamId: steamId,
          username: profile?.personaname || `Player_${steamId.slice(-4)}`,
          avatar: profile?.avatarfull || 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
          profileUrl: profile?.profileurl || `https://steamcommunity.com/profiles/${steamId}`,
          balance: 1000.00,
          isOnline: profile?.personastate === 1 || false,
          lastLogin: new Date(),
          createdAt: new Date(),
          memberSince: new Date(),
          role: 'user',
          isVip: false
        }
        
        // Generate a simple session token
        const sessionToken = crypto.randomBytes(32).toString('hex')
        
        // Store session data (in production, use database/Redis)
        console.log('💾 User session created:', { steamId, username: steamUser.username })
        
        // Redirect with user data (using steam-test page to verify the integration)
        const userData = encodeURIComponent(JSON.stringify(steamUser))
        res.redirect(`${FRONTEND_URL}/steam-test?user=${userData}&token=${sessionToken}`)
      } else {
        res.redirect(`${FRONTEND_URL}/steam-test?error=Invalid Steam ID`)
      }
    } else {
      res.redirect(`${FRONTEND_URL}/steam-test?error=Steam authentication failed`)
    }
  } catch (error) {
    console.error('❌ Steam authentication error:', error)
    res.redirect(`${FRONTEND_URL}/steam-test?error=Authentication error`)
  }
})

// Get Steam profile data
app.get('/api/steam-auth/steam-profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    if (STEAM_API_KEY && STEAM_API_KEY !== 'YOUR_STEAM_API_KEY_HERE') {
      const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
      const steamResponse = await axios.get(steamApiUrl)
      
      if (steamResponse.data.response && steamResponse.data.response.players.length > 0) {
        const profile = steamResponse.data.response.players[0]
        res.json({
          success: true,
          profile: {
            steamId: profile.steamid,
            username: profile.personaname,
            avatar: profile.avatarfull,
            profileUrl: profile.profileurl,
            countryCode: profile.loccountrycode,
            stateCode: profile.locstatecode,
            cityId: profile.loccityid,
            timeCreated: profile.timecreated,
            lastLogoff: profile.lastlogoff,
            profileState: profile.profilestate,
            visibility: profile.communityvisibilitystate
          }
        })
      } else {
        res.status(404).json({ success: false, error: 'Steam profile not found' })
      }
    } else {
      res.status(500).json({ success: false, error: 'Steam API key not configured' })
    }
  } catch (error) {
    console.error('Steam profile fetch error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch Steam profile' })
  }
})

// Get CS2 inventory
app.get('/api/steam-auth/inventory/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    if (!STEAM_API_KEY || STEAM_API_KEY === 'YOUR_STEAM_API_KEY_HERE') {
      return res.status(500).json({ success: false, error: 'Steam API key not configured' })
    }

    console.log(`🎒 Fetching CS2 inventory for Steam ID: ${steamId}`)
    
    // CS2 App ID is 730
    const inventoryUrl = `https://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json`
    
    try {
      const inventoryResponse = await axios.get(inventoryUrl, { timeout: 10000 })
      
      if (inventoryResponse.data.result && inventoryResponse.data.result.status === 1) {
        const items = inventoryResponse.data.result.items || []
        
        // Filter and process CS2 items
        const cs2Items = items.map((item: any) => ({
          id: item.id,
          defindex: item.defindex,
          quality: item.quality,
          rarity: item.rarity,
          tradable: item.flag_cannot_trade ? false : true,
          marketable: item.flag_cannot_craft ? false : true,
          name: item.custom_name || `Item ${item.defindex}`,
          type: item.type || 'Unknown',
          image: item.image_url || null,
          // Estimate value based on rarity (mock pricing)
          estimatedValue: getEstimatedItemValue(item.rarity, item.quality)
        }))

        const totalValue = cs2Items.reduce((sum: number, item: any) => sum + item.estimatedValue, 0)
        
        res.json({
          success: true,
          items: cs2Items,
          totalItems: cs2Items.length,
          totalValue: totalValue,
          steamId: steamId,
          lastUpdated: new Date().toISOString()
        })
      } else {
        // Inventory is private or empty
        res.json({
          success: true,
          items: [],
          totalItems: 0,
          totalValue: 0,
          steamId: steamId,
          message: 'Inventory is private or empty',
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (apiError: any) {
      if (apiError.response?.status === 403) {
        res.json({
          success: true,
          items: [],
          totalItems: 0,
          totalValue: 0,
          steamId: steamId,
          message: 'Inventory is private',
          lastUpdated: new Date().toISOString()
        })
      } else {
        throw apiError
      }
    }
  } catch (error) {
    console.error('CS2 inventory fetch error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch CS2 inventory',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Helper function to estimate item values based on rarity
function getEstimatedItemValue(rarity: number, quality: number): number {
  // Mock pricing based on rarity and quality
  const baseValues: { [key: number]: number } = {
    1: 0.03,  // Consumer Grade (White)
    2: 0.08,  // Industrial Grade (Light Blue)
    3: 0.25,  // Mil-Spec (Blue)
    4: 1.50,  // Restricted (Purple)
    5: 8.00,  // Classified (Pink)
    6: 50.00, // Covert (Red)
    7: 200.00 // Extraordinary (Gold/Knife)
  }
  
  const qualityMultiplier = quality >= 10 ? 1.5 : 1.0 // StatTrak multiplier
  const baseValue = baseValues[rarity] || 0.01
  
  // Add some randomness to make it more realistic
  const randomMultiplier = 0.8 + (Math.random() * 0.4) // 0.8 to 1.2
  
  return Math.round((baseValue * qualityMultiplier * randomMultiplier) * 100) / 100
}

// Create or get user
app.post('/api/users', (req, res) => {
  try {
    console.log('Creating user with body:', req.body)
    const { username, isGuest = true } = req.body
    
    const userId = generateUserId()
    console.log('Generated user ID:', userId)
    
    const user: User = {
      id: userId,
      username: username || `Guest_${Math.floor(Math.random() * 9999)}`,
      balance: 1000, // Start with $1000
      isGuest,
      gamesPlayed: 0,
      totalWon: 0,
      totalLost: 0,
      createdAt: new Date()
    }
    
    users.set(userId, user)
    console.log('User created successfully:', user)
    
    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    })
  }
})

// Get user
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  res.json({
    success: true,
    user
  })
})

// Update user balance
app.patch('/api/users/:userId/balance', (req, res) => {
  const { userId } = req.params
  const { balance } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  user.balance = Math.max(0, balance)
  users.set(userId, user)
  
  res.json({
    success: true,
    user
  })
})

// Play coinflip
app.post('/api/games/coinflip', (req, res) => {
  const { userId, betAmount, choice } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateCoinflip(choice)
  const winAmount = gameResult.won ? betAmount * 1.98 : 0
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'coinflip',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Play crash
app.post('/api/games/crash', (req, res) => {
  const { userId, betAmount, cashOutAt } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateCrash(cashOutAt)
  const winAmount = gameResult.won ? betAmount * gameResult.cashOutAt : 0
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'crash',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Play roulette
app.post('/api/games/roulette', (req, res) => {
  const { userId, betAmount, betType } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateRoulette(betType)
  let multiplier = 1.98 // Red/Black
  if (betType === 'green') multiplier = 14
  
  const winAmount = gameResult.won ? betAmount * multiplier : 0
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'roulette',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Play jackpot
app.post('/api/games/jackpot', (req, res) => {
  const { userId, betAmount } = req.body
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  if (betAmount > user.balance) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' })
  }
  
  const gameResult = simulateJackpot(betAmount)
  const winAmount = gameResult.won ? gameResult.totalPot * 0.95 : 0 // 5% house edge
  const lossAmount = gameResult.won ? 0 : betAmount
  
  // Update user stats
  user.balance += winAmount - lossAmount
  user.gamesPlayed += 1
  user.totalWon += winAmount
  user.totalLost += lossAmount
  users.set(userId, user)
  
  // Save game result
  const gameId = generateGameId()
  const game: GameResult = {
    id: gameId,
    userId,
    gameType: 'jackpot',
    betAmount,
    winAmount,
    result: gameResult,
    timestamp: new Date()
  }
  gameResults.set(gameId, game)
  
  res.json({
    success: true,
    game,
    user,
    winAmount,
    lossAmount
  })
})

// Get user's game history
app.get('/api/users/:userId/games', (req, res) => {
  const { userId } = req.params
  const user = users.get(userId)
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  
  const userGames = Array.from(gameResults.values())
    .filter(game => game.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50) // Last 50 games
  
  res.json({
    success: true,
    games: userGames
  })
})

// Get recent games (all users)
app.get('/api/games/recent', (req, res) => {
  const recentGames = Array.from(gameResults.values())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)
    .map(game => {
      const user = users.get(game.userId)
      return {
        id: game.id,
        gameType: game.gameType,
        player: user?.username || 'Unknown',
        betAmount: game.betAmount,
        winAmount: game.winAmount,
        won: game.winAmount > 0,
        timestamp: game.timestamp
      }
    })
  
  res.json({
    success: true,
    games: recentGames
  })
})

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Array.from(users.values())
    .filter(user => user.gamesPlayed > 0)
    .sort((a, b) => b.totalWon - a.totalWon)
    .slice(0, 10)
    .map(user => ({
      username: user.username,
      totalWon: user.totalWon,
      gamesPlayed: user.gamesPlayed,
      winRate: user.gamesPlayed > 0 ? ((user.totalWon / (user.totalWon + user.totalLost)) * 100).toFixed(1) : '0'
    }))
  
  res.json({
    success: true,
    leaderboard
  })
})

// Get server stats
app.get('/api/stats', (req, res) => {
  const totalUsers = users.size
  const totalGames = gameResults.size
  const totalWagered = Array.from(gameResults.values()).reduce((sum, game) => sum + game.betAmount, 0)
  const totalWon = Array.from(gameResults.values()).reduce((sum, game) => sum + game.winAmount, 0)
  
  res.json({
    success: true,
    stats: {
      totalUsers,
      totalGames,
      totalWagered: totalWagered.toFixed(2),
      totalWon: totalWon.toFixed(2),
      houseEdge: totalWagered > 0 ? ((totalWagered - totalWon) / totalWagered * 100).toFixed(2) + '%' : '0%'
    }
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Express server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available:`)
  console.log(`   - POST /api/users - Create user`)
  console.log(`   - GET  /api/users/:id - Get user`)
  console.log(`   - POST /api/games/coinflip - Play coinflip`)
  console.log(`   - POST /api/games/crash - Play crash`)
  console.log(`   - POST /api/games/roulette - Play roulette`)
  console.log(`   - POST /api/games/jackpot - Play jackpot`)
  console.log(`   - GET  /api/games/recent - Recent games`)
  console.log(`   - GET  /api/leaderboard - Leaderboard`)
  console.log(`   - GET  /api/stats - Server stats`)
})

export default app 