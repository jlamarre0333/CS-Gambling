import { Request, Response, NextFunction } from 'express'
import { createError } from './errorHandler'

export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    enum?: any[]
    custom?: (value: any) => boolean | string
  }
}

export const validateRequest = (schema: ValidationSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[location]
    const errors: string[] = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`)
        continue
      }

      // Skip validation if field is not required and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue
      }

      // Type validation
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`)
            continue
          }
          
          if (rules.min && value.length < rules.min) {
            errors.push(`${field} must be at least ${rules.min} characters long`)
          }
          
          if (rules.max && value.length > rules.max) {
            errors.push(`${field} must be no more than ${rules.max} characters long`)
          }
          
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} format is invalid`)
          }
          break

        case 'number':
          const numValue = Number(value)
          if (isNaN(numValue)) {
            errors.push(`${field} must be a valid number`)
            continue
          }
          
          if (rules.min !== undefined && numValue < rules.min) {
            errors.push(`${field} must be at least ${rules.min}`)
          }
          
          if (rules.max !== undefined && numValue > rules.max) {
            errors.push(`${field} must be no more than ${rules.max}`)
          }
          
          // Convert to number for further processing
          data[field] = numValue
          break

        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push(`${field} must be a boolean`)
            continue
          }
          
          // Convert string booleans to actual booleans
          if (typeof value === 'string') {
            data[field] = value === 'true'
          }
          break

        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`)
            continue
          }
          
          if (rules.min && value.length < rules.min) {
            errors.push(`${field} must contain at least ${rules.min} items`)
          }
          
          if (rules.max && value.length > rules.max) {
            errors.push(`${field} must contain no more than ${rules.max} items`)
          }
          break

        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`${field} must be an object`)
          }
          break
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`)
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(value)
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} is invalid`)
        }
      }
    }

    if (errors.length > 0) {
      return next(createError(`Validation failed: ${errors.join(', ')}`, 400))
    }

    next()
  }
}

// Common validation schemas
export const gameValidation = {
  betAmount: {
    type: 'number' as const,
    required: true,
    min: 0.01,
    max: 10000
  },
  gameType: {
    type: 'string' as const,
    required: true,
    enum: ['coinflip', 'crash', 'jackpot', 'roulette', 'blackjack']
  }
}

export const userUpdateValidation = {
  username: {
    type: 'string' as const,
    min: 3,
    max: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
}

export const transactionValidation = {
  amount: {
    type: 'number' as const,
    required: true,
    min: 0.01,
    max: 100000
  },
  type: {
    type: 'string' as const,
    required: true,
    enum: ['deposit', 'withdrawal']
  },
  paymentMethod: {
    type: 'string' as const,
    required: true,
    enum: ['steam_trade', 'bitcoin', 'ethereum', 'paypal', 'credit_card']
  }
}

export const chatValidation = {
  content: {
    type: 'string' as const,
    required: true,
    min: 1,
    max: 500
  },
  chatType: {
    type: 'string' as const,
    enum: ['general', 'game', 'vip', 'private']
  }
} 