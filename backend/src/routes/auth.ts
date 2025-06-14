import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Simple auth middleware for this file
const simpleAuthMiddleware = (req: any, res: any, next: any) => {
  try {
    const token = req.cookies['auth-token'] || req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cs2-gambling-jwt-secret') as any
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Steam authentication
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }))

// Steam authentication callback
router.get('/steam/return', 
  passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL + '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user as any
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          steamId: user.steamId,
          username: user.username 
        },
        process.env.JWT_SECRET || 'cs2-gambling-jwt-secret',
        { expiresIn: '7d' }
      )

      // Set secure cookie with token
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}?auth=success`)
    } catch (error) {
      console.error('Auth callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/login?error=server_error`)
    }
  }
)

// Get current user
router.get('/me', simpleAuthMiddleware, async (req, res) => {
  try {
    const user = req.user as any
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    res.json({
      id: user.userId || user.id,
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar || '',
      balance: 1000.00, // Mock balance
      level: 1,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      joinedAt: new Date(),
      isOnline: true
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  // Clear the auth cookie
  res.clearCookie('auth-token')
  res.json({ message: 'Logged out successfully' })
})

// Refresh token
router.post('/refresh', simpleAuthMiddleware, async (req, res) => {
  try {
    const user = req.user as any
    
    // Generate new JWT token
    const newToken = jwt.sign(
      { 
        userId: user.id,
        steamId: user.steamId,
        username: user.username 
      },
      process.env.JWT_SECRET || 'cs2-gambling-jwt-secret',
      { expiresIn: '7d' }
    )

    // Set new cookie
    res.cookie('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({ message: 'Token refreshed successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' })
  }
})

// Check authentication status
router.get('/status', (req, res) => {
  const token = req.cookies['auth-token']
  
  if (!token) {
    return res.json({ authenticated: false })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'cs2-gambling-jwt-secret')
    res.json({ authenticated: true })
  } catch (error) {
    res.json({ authenticated: false })
  }
})

export default router 