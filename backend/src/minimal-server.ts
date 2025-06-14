import express from 'express'
import cors from 'cors'
import axios from 'axios'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 3001
const STEAM_SERVER_URL = 'http://localhost:3002'
const FRONTEND_URL = 'http://localhost:3003'

// Steam OpenID configuration
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
const STEAM_API_URL = 'https://api.steampowered.com'

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  })
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
  
  console.log('Redirecting to Steam login:', steamLoginUrl)
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
        console.log('Steam authentication successful for Steam ID:', steamId)
        
        // Get Steam profile
        const profileResponse = await axios.get(`${STEAM_SERVER_URL}/api/steam/profile/${steamId}`)
        
        if (profileResponse.data.success) {
          const profile = profileResponse.data.profile
          
          // Create user object
          const user = {
            id: `user_${profile.steamid}`,
            steamId: profile.steamid,
            username: profile.personaname,
            avatar: profile.avatarfull,
            profileUrl: profile.profileurl,
            balance: 1000.00,
            level: 1,
            isOnline: profile.personastate === 1,
            lastLogin: new Date(),
            createdAt: new Date()
          }
          
          // Generate a simple session token
          const sessionToken = crypto.randomBytes(32).toString('hex')
          
          // In a real app, you'd store this in a database or Redis
          // For now, we'll just redirect with the user data
          const userData = encodeURIComponent(JSON.stringify(user))
          
          res.redirect(`${FRONTEND_URL}/login/success?user=${userData}&token=${sessionToken}`)
        } else {
          res.redirect(`${FRONTEND_URL}/login/error?message=Failed to fetch Steam profile`)
        }
      } else {
        res.redirect(`${FRONTEND_URL}/login/error?message=Invalid Steam ID`)
      }
    } else {
      res.redirect(`${FRONTEND_URL}/login/error?message=Steam authentication failed`)
    }
  } catch (error) {
    console.error('Steam authentication error:', error)
    res.redirect(`${FRONTEND_URL}/login/error?message=Authentication error`)
  }
})

// Steam server status check
app.get('/api/inventory/steam-status', async (req, res) => {
  try {
    const response = await axios.get(`${STEAM_SERVER_URL}/health`)
    res.json({
      online: response.status === 200,
      status: response.data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.json({
      online: false,
      error: 'Steam server not available',
      timestamp: new Date().toISOString()
    })
  }
})

// Get Steam inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const { steamId } = req.query
    
    if (!steamId) {
      return res.status(400).json({ error: 'Steam ID is required' })
    }

    console.log(`Fetching inventory for Steam ID: ${steamId}`)
    
    const response = await axios.get(`${STEAM_SERVER_URL}/api/steam/inventory/${steamId}`)
    
    if (response.data.success) {
      res.json({
        items: response.data.items,
        totalValue: response.data.totalValue,
        totalItems: response.data.totalItems,
        steamId: response.data.steamId,
        lastUpdated: new Date()
      })
    } else {
      res.status(404).json({ error: 'Failed to fetch inventory or inventory is private' })
    }
  } catch (error) {
    console.error('Error fetching inventory:', error)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
})

// Get Steam profile
app.get('/api/inventory/profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    console.log(`Fetching profile for Steam ID: ${steamId}`)
    
    const response = await axios.get(`${STEAM_SERVER_URL}/api/steam/profile/${steamId}`)
    
    if (response.data.success) {
      res.json({
        success: true,
        profile: response.data.profile
      })
    } else {
      res.status(404).json({ error: 'Steam profile not found' })
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch Steam profile' })
  }
})

// Get tradable items
app.get('/api/inventory/tradable/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    console.log(`Fetching tradable items for Steam ID: ${steamId}`)
    
    // First get the full inventory
    const response = await axios.get(`${STEAM_SERVER_URL}/api/steam/inventory/${steamId}`)
    
    if (response.data.success) {
      // Filter for tradable items only
      const tradableItems = response.data.items.filter((item: any) => item.tradable)
      
      res.json({
        success: true,
        items: tradableItems,
        totalItems: tradableItems.length,
        totalValue: tradableItems.reduce((sum: number, item: any) => sum + item.price, 0)
      })
    } else {
      res.status(404).json({ error: 'Failed to fetch inventory or inventory is private' })
    }
  } catch (error) {
    console.error('Error fetching tradable items:', error)
    res.status(500).json({ error: 'Failed to fetch tradable items' })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎮 Steam inventory: http://localhost:${PORT}/api/inventory`)
  console.log(`🔐 Steam auth: http://localhost:${PORT}/api/steam-auth`)
  console.log(`🔗 Steam server: ${STEAM_SERVER_URL}`)
}) 