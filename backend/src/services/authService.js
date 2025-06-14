const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m' // 15 minutes
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d' // 7 days

class AuthService {
  constructor() {
    this.blacklistedTokens = new Set() // In production, use Redis or database
    this.refreshTokens = new Map() // In production, use database
  }

  // Generate JWT tokens
  generateTokenPair(user) {
    const payload = {
      sub: user.steamId,
      username: user.username,
      avatar: user.avatar,
      role: user.role || 'user',
      iat: Math.floor(Date.now() / 1000),
    }

    // Generate unique JWT ID for token blacklisting
    const jti = crypto.randomUUID()
    payload.jti = jti

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      issuer: 'cs-gambling',
      audience: 'cs-gambling-users'
    })

    const refreshToken = jwt.sign(
      { 
        sub: user.steamId, 
        type: 'refresh',
        jti: crypto.randomUUID()
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRY,
        issuer: 'cs-gambling',
        audience: 'cs-gambling-users'
      }
    )

    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      steamId: user.steamId,
      createdAt: new Date(),
      lastUsed: new Date()
    })

    return { accessToken, refreshToken }
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      // Check if token is blacklisted
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been revoked')
      }

      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'cs-gambling',
        audience: 'cs-gambling-users'
      })

      return { valid: true, payload: decoded }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'cs-gambling',
        audience: 'cs-gambling-users'
      })

      // Check if refresh token exists and is valid
      const tokenData = this.refreshTokens.get(token)
      if (!tokenData) {
        throw new Error('Refresh token not found')
      }

      if (tokenData.steamId !== decoded.sub) {
        throw new Error('Token mismatch')
      }

      return { valid: true, payload: decoded, tokenData }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken, getUserFunction) {
    const verification = this.verifyRefreshToken(refreshToken)
    
    if (!verification.valid) {
      throw new Error(`Invalid refresh token: ${verification.error}`)
    }

    // Get fresh user data
    const user = await getUserFunction(verification.payload.sub)
    if (!user) {
      throw new Error('User not found')
    }

    // Update refresh token usage
    const tokenData = this.refreshTokens.get(refreshToken)
    tokenData.lastUsed = new Date()
    this.refreshTokens.set(refreshToken, tokenData)

    // Generate new access token
    const { accessToken } = this.generateTokenPair(user)

    return { accessToken, refreshToken } // Return same refresh token
  }

  // Revoke tokens (logout)
  revokeTokens(accessToken, refreshToken) {
    // Blacklist access token
    if (accessToken) {
      this.blacklistedTokens.add(accessToken)
    }

    // Remove refresh token
    if (refreshToken) {
      this.refreshTokens.delete(refreshToken)
    }
  }

  // Clean up expired tokens (call periodically)
  cleanupExpiredTokens() {
    const now = new Date()
    
    // Clean up refresh tokens (older than expiry)
    for (const [token, data] of this.refreshTokens.entries()) {
      try {
        jwt.verify(token, JWT_REFRESH_SECRET)
      } catch (error) {
        // Token is expired or invalid, remove it
        this.refreshTokens.delete(token)
      }
    }

    // Clean up blacklisted access tokens (older than expiry)
    const expiredTokens = []
    for (const token of this.blacklistedTokens) {
      try {
        jwt.verify(token, JWT_SECRET)
      } catch (error) {
        // Token is expired, safe to remove from blacklist
        expiredTokens.push(token)
      }
    }
    
    expiredTokens.forEach(token => this.blacklistedTokens.delete(token))
  }

  // Get token info
  getTokenInfo(token) {
    try {
      const decoded = jwt.decode(token, { complete: true })
      return {
        header: decoded.header,
        payload: decoded.payload,
        isExpired: decoded.payload.exp < Math.floor(Date.now() / 1000)
      }
    } catch (error) {
      return null
    }
  }

  // Middleware for protecting routes
  requireAuth() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'NO_TOKEN'
        })
      }

      const token = authHeader.substring(7) // Remove 'Bearer '
      const verification = this.verifyAccessToken(token)

      if (!verification.valid) {
        return res.status(401).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
          details: verification.error
        })
      }

      // Add user info to request
      req.user = verification.payload
      req.token = token
      next()
    }
  }

  // Middleware for role-based access
  requireRole(roles) {
    if (typeof roles === 'string') {
      roles = [roles]
    }

    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'NO_USER'
        })
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_ROLE',
          required: roles,
          current: req.user.role
        })
      }

      next()
    }
  }

  // Get user info from token
  getUserFromToken(token) {
    const verification = this.verifyAccessToken(token)
    return verification.valid ? verification.payload : null
  }

  // Check if user has permission
  hasPermission(userRole, requiredRoles) {
    const roleHierarchy = {
      'user': 1,
      'vip': 2,
      'admin': 3
    }

    const userLevel = roleHierarchy[userRole] || 0
    const requiredLevel = Math.max(...requiredRoles.map(role => roleHierarchy[role] || 0))

    return userLevel >= requiredLevel
  }
}

// Create singleton instance
const authService = new AuthService()

// Set up periodic cleanup (every hour)
setInterval(() => {
  authService.cleanupExpiredTokens()
}, 60 * 60 * 1000)

module.exports = authService 