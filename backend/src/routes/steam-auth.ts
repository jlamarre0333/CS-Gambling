import express from 'express'
import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import jwt from 'jsonwebtoken'
import { User } from '../entities/User'
import { AppDataSource } from '../data-source'

const router = express.Router()

// Steam Strategy Configuration
passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:3001/api/steam-auth/return',
  realm: process.env.STEAM_REALM || 'http://localhost:3001/',
  apiKey: process.env.STEAM_API_KEY || ''
}, async (identifier: string, profile: any, done: any) => {
  try {
    const steamId = identifier.replace('https://steamcommunity.com/openid/id/', '')
    const userRepository = AppDataSource.getRepository(User)
    
    // Check if user exists
    let user = await userRepository.findOne({ where: { steamId } })
    
    if (!user) {
      // Create new user
      user = userRepository.create({
        steamId,
        username: profile.displayName || `Player_${steamId.slice(-6)}`,
        avatar: profile.photos?.[2]?.value || profile.photos?.[1]?.value || profile.photos?.[0]?.value || '',
        profileUrl: profile._json?.profileurl || '',
        balance: 1000, // Welcome bonus
        isActive: true,
        lastLoginAt: new Date(),
        metadata: {
          steamProfile: profile._json,
          welcomeBonusGiven: true,
          registrationDate: new Date().toISOString()
        }
      })
      
      await userRepository.save(user)
      
      // Log registration
      console.log(`New user registered: ${user.username} (${steamId})`)
    } else {
      // Update existing user
      user.lastLoginAt = new Date()
      user.avatar = profile.photos?.[2]?.value || profile.photos?.[1]?.value || profile.photos?.[0]?.value || user.avatar
      user.username = profile.displayName || user.username
      
      await userRepository.save(user)
      
      // Log login
      console.log(`User logged in: ${user.username} (${steamId})`)
    }
    
    return done(null, user)
  } catch (error) {
    console.error('Steam authentication error:', error)
    return done(error, null)
  }
}))

// Serialize/Deserialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Routes

// Initiate Steam login
router.get('/login', (req, res, next) => {
  // Add state parameter for security
  const state = Math.random().toString(36).substring(2, 15)
  req.session.oauthState = state
  
  passport.authenticate('steam', {
    state: state
  })(req, res, next)
})

// Steam return callback
router.get('/return', 
  passport.authenticate('steam', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3003'}/login?error=steam_auth_failed` 
  }),
  async (req, res) => {
    try {
      const user = req.user as User
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3003'}/login?error=no_user`)
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          steamId: user.steamId,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { 
          expiresIn: '7d',
          issuer: 'cs-gambling-platform',
          audience: 'cs-gambling-users'
        }
      )
      
      // Set secure cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3003'}/?login=success&welcome=${!user.metadata?.welcomeBonusGiven ? 'true' : 'false'}`)
    } catch (error) {
      console.error('Steam callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3003'}/login?error=callback_failed`)
    }
  }
)

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any
    const userRepository = AppDataSource.getRepository(User)
    
    const user = await userRepository.findOne({ 
      where: { id: decoded.userId },
      select: ['id', 'steamId', 'username', 'avatar', 'balance', 'role', 'isVip', 'lastLoginAt', 'createdAt']
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      user: {
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatar: user.avatar,
        balance: user.balance,
        role: user.role,
        isVip: user.isVip,
        lastLoginAt: user.lastLoginAt,
        memberSince: user.createdAt
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  try {
    // Clear auth cookie
    res.clearCookie('auth_token')
    
    // Destroy session if exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err)
        }
      })
    }
    
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.auth_token
    
    if (!token) {
      return res.status(401).json({ error: 'No token to refresh' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any
    const userRepository = AppDataSource.getRepository(User)
    
    const user = await userRepository.findOne({ where: { id: decoded.userId } })
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        steamId: user.steamId,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { 
        expiresIn: '7d',
        issuer: 'cs-gambling-platform',
        audience: 'cs-gambling-users'
      }
    )
    
    // Set new cookie
    res.cookie('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.json({ success: true, message: 'Token refreshed' })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ error: 'Token refresh failed' })
  }
})

// Get Steam profile info (for inventory, etc.)
router.get('/steam-profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    const apiKey = process.env.STEAM_API_KEY
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Steam API key not configured' })
    }
    
    // Fetch Steam profile
    const profileResponse = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    )
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Steam profile')
    }
    
    const profileData = await profileResponse.json()
    const player = profileData.response.players[0]
    
    if (!player) {
      return res.status(404).json({ error: 'Steam profile not found' })
    }
    
    // Fetch CS2 inventory (if needed)
    let inventory = null
    try {
      const inventoryResponse = await fetch(
        `http://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`
      )
      
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        inventory = inventoryData.assets || []
      }
    } catch (inventoryError) {
      console.log('Could not fetch inventory:', inventoryError)
    }
    
    res.json({
      profile: {
        steamId: player.steamid,
        username: player.personaname,
        avatar: player.avatarfull,
        profileUrl: player.profileurl,
        countryCode: player.loccountrycode,
        stateCode: player.locstatecode,
        cityId: player.loccityid,
        timeCreated: player.timecreated,
        lastLogoff: player.lastlogoff,
        profileState: player.profilestate,
        visibility: player.communityvisibilitystate
      },
      inventory: inventory ? inventory.slice(0, 50) : null // Limit to 50 items
    })
  } catch (error) {
    console.error('Steam profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch Steam profile' })
  }
})

export default router 