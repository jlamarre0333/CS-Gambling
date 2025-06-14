import { jwtDecode } from 'jwt-decode'

export interface JWTPayload {
  sub: string // Steam ID
  username: string
  avatar: string
  role: 'user' | 'vip' | 'admin'
  iat: number
  exp: number
  jti: string // JWT ID for token blacklisting
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthTokens {
  accessToken: string | null
  refreshToken: string | null
}

export class JWTManager {
  private static instance: JWTManager
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshPromise: Promise<TokenPair> | null = null
  private refreshTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.loadTokensFromStorage()
    this.scheduleTokenRefresh()
  }

  public static getInstance(): JWTManager {
    if (!JWTManager.instance) {
      JWTManager.instance = new JWTManager()
    }
    return JWTManager.instance
  }

  // Token Storage Management
  private loadTokensFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const storedAccessToken = localStorage.getItem('cs_gambling_access_token')
      const storedRefreshToken = localStorage.getItem('cs_gambling_refresh_token')

      if (storedAccessToken && this.isValidToken(storedAccessToken)) {
        this.accessToken = storedAccessToken
      } else {
        this.clearAccessToken()
      }

      if (storedRefreshToken && this.isValidToken(storedRefreshToken)) {
        this.refreshToken = storedRefreshToken
      } else {
        this.clearRefreshToken()
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error)
      this.clearAllTokens()
    }
  }

  private saveTokensToStorage(tokens: Partial<TokenPair>): void {
    if (typeof window === 'undefined') return

    try {
      if (tokens.accessToken) {
        localStorage.setItem('cs_gambling_access_token', tokens.accessToken)
        this.accessToken = tokens.accessToken
      }

      if (tokens.refreshToken) {
        localStorage.setItem('cs_gambling_refresh_token', tokens.refreshToken)
        this.refreshToken = tokens.refreshToken
      }
    } catch (error) {
      console.error('Error saving tokens to storage:', error)
    }
  }

  // Token Validation
  private isValidToken(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const currentTime = Date.now() / 1000
      return decoded.exp > currentTime
    } catch (error) {
      return false
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const currentTime = Date.now() / 1000
      return decoded.exp <= currentTime
    } catch (error) {
      return true
    }
  }

  public getTokenPayload(token?: string): JWTPayload | null {
    const tokenToUse = token || this.accessToken
    if (!tokenToUse) return null

    try {
      return jwtDecode<JWTPayload>(tokenToUse)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  // Token Management
  public setTokens(tokens: TokenPair): void {
    this.saveTokensToStorage(tokens)
    this.scheduleTokenRefresh()
  }

  public getAccessToken(): string | null {
    if (!this.accessToken || this.isTokenExpired(this.accessToken)) {
      return null
    }
    return this.accessToken
  }

  public getRefreshToken(): string | null {
    if (!this.refreshToken || this.isTokenExpired(this.refreshToken)) {
      return null
    }
    return this.refreshToken
  }

  public getAuthTokens(): AuthTokens {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken()
    }
  }

  // Token Refresh Logic
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    const token = this.getAccessToken()
    if (!token) return

    try {
      const payload = this.getTokenPayload(token)
      if (!payload) return

      // Schedule refresh 5 minutes before expiration
      const refreshTime = (payload.exp * 1000) - Date.now() - (5 * 60 * 1000)
      
      if (refreshTime > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshAccessToken()
        }, refreshTime)
      } else {
        // Token expires soon, refresh immediately
        this.refreshAccessToken()
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error)
    }
  }

  public async refreshAccessToken(): Promise<TokenPair | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.clearAllTokens()
      throw new Error('No refresh token available')
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const tokens = await this.refreshPromise
      this.setTokens(tokens)
      return tokens
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAllTokens()
      throw error
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<TokenPair> {
    const response = await fetch('http://localhost:3001/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid token refresh response')
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    }
  }

  // Token Cleanup
  private clearAccessToken(): void {
    this.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cs_gambling_access_token')
    }
  }

  private clearRefreshToken(): void {
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cs_gambling_refresh_token')
    }
  }

  public clearAllTokens(): void {
    this.clearAccessToken()
    this.clearRefreshToken()
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // Authentication State
  public isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token !== null && !this.isTokenExpired(token)
  }

  public getUserInfo(): Partial<JWTPayload> | null {
    const token = this.getAccessToken()
    if (!token) return null

    const payload = this.getTokenPayload(token)
    if (!payload) return null

    return {
      sub: payload.sub,
      username: payload.username,
      avatar: payload.avatar,
      role: payload.role
    }
  }

  // Logout
  public async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    
    // Attempt to revoke tokens on server
    if (refreshToken) {
      try {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error revoking tokens on server:', error)
      }
    }

    this.clearAllTokens()
  }
}

// Export singleton instance
export const jwtManager = JWTManager.getInstance()

// Utility functions
export const getAuthHeaders = (): Record<string, string> => {
  const token = jwtManager.getAccessToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })

  // If unauthorized, try to refresh token once
  if (response.status === 401 && jwtManager.getRefreshToken()) {
    try {
      await jwtManager.refreshAccessToken()
      
      // Retry with new token
      const newHeaders = {
        ...headers,
        ...getAuthHeaders()
      }

      response = await fetch(url, {
        ...options,
        headers: newHeaders,
        credentials: 'include'
      })
    } catch (error) {
      console.error('Token refresh failed during request:', error)
      // Let the original 401 response be handled by caller
    }
  }

  return response
} 