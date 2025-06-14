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
    message: 'Steam Auth Backend Server Running',
    timestamp: new Date().toISOString(),
    port: PORT,
    features: ['steam-auth', 'inventory', 'user-profiles']
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
          // Steam Web API key (you'll need to get this from https://steamcommunity.com/dev/apikey)
          const STEAM_API_KEY = process.env.STEAM_API_KEY || '9D0FC6D133693B6F6FD1A71935254257'
          
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
        const user = {
          id: `user_${steamId}`,
          steamId: steamId,
          username: profile?.personaname || `Player_${steamId.slice(-4)}`,
          avatar: profile?.avatarfull || 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
          profileUrl: profile?.profileurl || `https://steamcommunity.com/profiles/${steamId}`,
          balance: 1000.00,
          level: 1,
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
        console.log('💾 User session created:', { steamId, username: user.username })
        
        // Redirect with user data (using test page for now to avoid auth context issues)
        const userData = encodeURIComponent(JSON.stringify(user))
        res.redirect(`${FRONTEND_URL}/login-test?user=${userData}&token=${sessionToken}`)
      } else {
        res.redirect(`${FRONTEND_URL}/login/error?message=Invalid Steam ID`)
      }
    } else {
      res.redirect(`${FRONTEND_URL}/login/error?message=Steam authentication failed`)
    }
  } catch (error) {
    console.error('❌ Steam authentication error:', error)
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

    console.log(`🎒 Fetching inventory for Steam ID: ${steamId}`)
    
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
app.get('/api/steam-auth/steam-profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    const response = await axios.get(`${STEAM_SERVER_URL}/api/steam/profile/${steamId}`)
    
    if (response.data.success) {
      res.json({
        success: true,
        profile: response.data.profile
      })
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Failed to fetch Steam profile' 
      })
    }
  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Steam profile' 
    })
  }
})

// Test endpoints for development
app.get('/api/test/steam-auth', (req, res) => {
  res.json({
    message: 'Steam Auth API is working!',
    endpoints: {
      login: '/api/steam-auth/login',
      callback: '/api/steam-auth/callback',
      profile: '/api/steam-auth/steam-profile/:steamId',
      inventory: '/api/inventory?steamId=:steamId',
      steamStatus: '/api/inventory/steam-status'
    },
    instructions: 'Navigate to /api/steam-auth/login to start Steam authentication flow'
  })
})

app.listen(PORT, () => {
  console.log('')
  console.log('🎮 ===== CS:GO GAMBLING BACKEND =====')
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('📍 Steam Auth Server (Simple Version)')
  console.log('')
  console.log('🔗 STEAM AUTHENTICATION:')
  console.log(`   Login: http://localhost:${PORT}/api/steam-auth/login`)
  console.log(`   Test:  http://localhost:${PORT}/api/test/steam-auth`)
  console.log('')
  console.log('📊 STATUS:')
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Steam:  http://localhost:${PORT}/api/inventory/steam-status`)
  console.log('')
  console.log('⚠️  Note: Ensure Steam server is running on port 3002')
  console.log('💡 Frontend should be on port 3003 for redirects')
  console.log('')
}) 