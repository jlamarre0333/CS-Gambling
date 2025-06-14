const express = require('express')
const authService = require('../services/authService')
const steamService = require('../services/steamService')

const router = express.Router()

// Mock user database (in production, use real database)
const users = new Map()

// Helper function to get or create user
async function getOrCreateUser(steamId) {
  let user = users.get(steamId)
  
  if (!user) {
    // Fetch Steam profile
    try {
      const steamProfile = await steamService.getPlayerSummary(steamId)
      
      user = {
        steamId: steamId,
        username: steamProfile.personaname,
        avatar: steamProfile.avatarfull,
        role: 'user',
        isVip: false,
        balance: 1000, // Starting balance
        memberSince: new Date(),
        lastLoginAt: new Date(),
        level: 1,
        gamesPlayed: 0,
        totalWagered: 0,
        totalWon: 0,
      }
      
      users.set(steamId, user)
    } catch (error) {
      console.error('Error fetching Steam profile:', error)
      throw new Error('Failed to fetch Steam profile')
    }
  } else {
    // Update last login
    user.lastLoginAt = new Date()
    users.set(steamId, user)
  }
  
  return user
}

// Helper function to get user by steamId
async function getUserBySteamId(steamId) {
  return users.get(steamId)
}

// Steam Login - Exchange Steam ID for JWT tokens
router.post('/steam-login', async (req, res) => {
  try {
    const { steamId } = req.body
    
    if (!steamId) {
      return res.status(400).json({ 
        error: 'Steam ID is required',
        code: 'MISSING_STEAM_ID'
      })
    }

    // Validate Steam ID format
    if (!/^\d{17}$/.test(steamId)) {
      return res.status(400).json({ 
        error: 'Invalid Steam ID format',
        code: 'INVALID_STEAM_ID'
      })
    }

    // Get or create user
    const user = await getOrCreateUser(steamId)
    
    // Generate JWT tokens
    const tokens = authService.generateTokenPair(user)
    
    res.json({
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        steamId: user.steamId,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        isVip: user.isVip,
        balance: user.balance,
        memberSince: user.memberSince,
        lastLoginAt: user.lastLoginAt,
        level: user.level
      }
    })
  } catch (error) {
    console.error('Steam login error:', error)
    res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      details: error.message
    })
  }
})

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      })
    }

    // Refresh the access token
    const tokens = await authService.refreshAccessToken(refreshToken, getUserBySteamId)
    
    res.json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ 
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR',
      details: error.message
    })
  }
})

// Logout
router.post('/logout', authService.requireAuth(), (req, res) => {
  try {
    const { refreshToken } = req.body
    const accessToken = req.token
    
    // Revoke tokens
    authService.revokeTokens(accessToken, refreshToken)
    
    res.json({ 
      message: 'Logout successful',
      code: 'LOGOUT_SUCCESS'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_ERROR',
      details: error.message
    })
  }
})

// Get Current User (protected route)
router.get('/me', authService.requireAuth(), async (req, res) => {
  try {
    const steamId = req.user.sub
    const user = await getUserBySteamId(steamId)
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }
    
    res.json({
      user: {
        steamId: user.steamId,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        isVip: user.isVip,
        balance: user.balance,
        memberSince: user.memberSince,
        lastLoginAt: user.lastLoginAt,
        level: user.level,
        gamesPlayed: user.gamesPlayed,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ 
      error: 'Failed to get user data',
      code: 'GET_USER_ERROR',
      details: error.message
    })
  }
})

// Verify Token (check if token is valid)
router.get('/verify', authService.requireAuth(), (req, res) => {
  res.json({
    valid: true,
    user: {
      steamId: req.user.sub,
      username: req.user.username,
      avatar: req.user.avatar,
      role: req.user.role
    },
    tokenInfo: {
      issuedAt: new Date(req.user.iat * 1000),
      expiresAt: new Date(req.user.exp * 1000)
    }
  })
})

// Update User Profile (protected route)
router.patch('/profile', authService.requireAuth(), async (req, res) => {
  try {
    const steamId = req.user.sub
    const user = await getUserBySteamId(steamId)
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Allow updating certain fields
    const allowedUpdates = ['balance', 'isVip', 'level', 'gamesPlayed', 'totalWagered', 'totalWon']
    const updates = {}
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    // Apply updates
    Object.assign(user, updates)
    users.set(steamId, user)
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        steamId: user.steamId,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        isVip: user.isVip,
        balance: user.balance,
        memberSince: user.memberSince,
        lastLoginAt: user.lastLoginAt,
        level: user.level,
        gamesPlayed: user.gamesPlayed,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ 
      error: 'Failed to update profile',
      code: 'UPDATE_PROFILE_ERROR',
      details: error.message
    })
  }
})

// Admin Routes
router.get('/users', authService.requireAuth(), authService.requireRole(['admin']), (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    steamId: user.steamId,
    username: user.username,
    role: user.role,
    isVip: user.isVip,
    balance: user.balance,
    memberSince: user.memberSince,
    lastLoginAt: user.lastLoginAt,
    level: user.level,
    gamesPlayed: user.gamesPlayed,
    totalWagered: user.totalWagered,
    totalWon: user.totalWon
  }))
  
  res.json({
    users: userList,
    total: userList.length
  })
})

// Update User Role (admin only)
router.patch('/users/:steamId/role', authService.requireAuth(), authService.requireRole(['admin']), async (req, res) => {
  try {
    const { steamId } = req.params
    const { role } = req.body
    
    if (!['user', 'vip', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        code: 'INVALID_ROLE'
      })
    }

    const user = await getUserBySteamId(steamId)
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    user.role = role
    user.isVip = role === 'vip' || role === 'admin'
    users.set(steamId, user)
    
    res.json({
      message: 'User role updated successfully',
      user: {
        steamId: user.steamId,
        username: user.username,
        role: user.role,
        isVip: user.isVip
      }
    })
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ 
      error: 'Failed to update user role',
      code: 'UPDATE_ROLE_ERROR',
      details: error.message
    })
  }
})

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString(),
    activeUsers: users.size
  })
})

module.exports = router 