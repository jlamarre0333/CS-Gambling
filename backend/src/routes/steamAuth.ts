import express from 'express'
import steamIntegrationService from '../services/steamIntegrationService'

const router = express.Router()

// Simple Steam login endpoint (for testing)
router.post('/login', async (req, res) => {
  try {
    const { steamId } = req.body
    
    if (!steamId) {
      return res.status(400).json({ error: 'Steam ID is required' })
    }
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    console.log(`Attempting Steam login for: ${steamId}`)
    
    // Authenticate with Steam
    const { user, token } = await steamIntegrationService.authenticateWithSteam(steamId)
    
    // Set secure cookie with token
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.json({
      success: true,
      message: 'Steam authentication successful',
      user: {
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatar: user.avatar,
        balance: user.balance,
        level: user.level
      }
    })
  } catch (error) {
    console.error('Steam login error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Steam authentication failed' 
    })
  }
})

// Get Steam profile (public endpoint)
router.get('/profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    const profile = await steamIntegrationService.getSteamProfile(steamId)
    
    if (!profile) {
      return res.status(404).json({ error: 'Steam profile not found' })
    }
    
    res.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    res.status(500).json({ error: 'Failed to fetch Steam profile' })
  }
})

// Check if Steam ID exists and is valid
router.get('/validate/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    // Basic format validation
    const isValidFormat = steamIntegrationService.isValidSteamId(steamId)
    
    if (!isValidFormat) {
      return res.json({
        valid: false,
        reason: 'Invalid Steam ID format'
      })
    }
    
    // Check if profile exists
    const profile = await steamIntegrationService.getSteamProfile(steamId)
    
    res.json({
      valid: !!profile,
      steamId,
      profile: profile ? {
        username: profile.personaname,
        avatar: profile.avatarfull
      } : null
    })
  } catch (error) {
    console.error('Error validating Steam ID:', error)
    res.json({
      valid: false,
      reason: 'Error validating Steam ID'
    })
  }
})

// Steam server health check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await steamIntegrationService.checkSteamServerHealth()
    const status = await steamIntegrationService.getSteamServerStatus()
    
    res.json({
      steamServer: {
        healthy: isHealthy,
        ...status
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking Steam health:', error)
    res.status(500).json({ error: 'Failed to check Steam server health' })
  }
})

export default router 