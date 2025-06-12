import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/database'
import { User, UserRole, UserStatus } from '../entities/User'
import { createError } from './errorHandler'

export interface AuthenticatedRequest extends Request {
  user?: User
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return next(createError('Access denied. No token provided.', 401))
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      
      // Get user from database
      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        relations: ['achievements']
      })

      if (!user) {
        return next(createError('Token is valid but user no longer exists.', 401))
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        return next(createError('Your account has been suspended or banned.', 403))
      }

      // Add user to request object
      req.user = user
      next()
    } catch (error) {
      return next(createError('Invalid token.', 401))
    }
  } catch (error) {
    next(error)
  }
}

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Access denied. Authentication required.', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Access denied. Insufficient permissions.', 403))
    }

    next()
  }
}

export const requireAdmin = requireRole([UserRole.ADMIN])
export const requireModerator = requireRole([UserRole.MODERATOR, UserRole.ADMIN])
export const requireVip = requireRole([UserRole.VIP, UserRole.MODERATOR, UserRole.ADMIN])

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.token) {
      token = req.cookies.token
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOne({
          where: { id: decoded.userId },
          relations: ['achievements']
        })

        if (user && user.status === UserStatus.ACTIVE) {
          req.user = user
        }
      } catch (error) {
        // Token is invalid, but we don't throw an error for optional auth
        console.log('Invalid token in optional auth:', error)
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
} 
} 