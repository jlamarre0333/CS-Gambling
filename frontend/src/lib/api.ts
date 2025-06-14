// Simple API client for Express backend
const API_BASE_URL = 'http://localhost:3001/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface User {
  id: string
  username: string
  balance: number
  isGuest: boolean
  gamesPlayed: number
  totalWon: number
  totalLost: number
  createdAt: string
}

interface GameResult {
  id: string
  userId: string
  gameType: 'coinflip' | 'crash' | 'jackpot' | 'roulette'
  betAmount: number
  winAmount: number
  result: any
  timestamp: string
}

class ApiClient {
  private static instance: ApiClient
  
  private constructor() {}
  
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health')
  }

  // User management
  async createUser(username?: string): Promise<ApiResponse<{ user: User }>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ username, isGuest: true })
    })
  }

  async getUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    return this.request(`/users/${userId}`)
  }

  async updateUserBalance(userId: string, balance: number): Promise<ApiResponse<{ user: User }>> {
    return this.request(`/users/${userId}/balance`, {
      method: 'PATCH',
      body: JSON.stringify({ balance })
    })
  }

  // Game endpoints
  async playCoinflip(
    userId: string, 
    betAmount: number, 
    choice: 'heads' | 'tails'
  ): Promise<ApiResponse<{ game: GameResult; user: User; winAmount: number; lossAmount: number }>> {
    return this.request('/games/coinflip', {
      method: 'POST',
      body: JSON.stringify({ userId, betAmount, choice })
    })
  }

  async playCrash(
    userId: string, 
    betAmount: number, 
    cashOutAt?: number
  ): Promise<ApiResponse<{ game: GameResult; user: User; winAmount: number; lossAmount: number }>> {
    return this.request('/games/crash', {
      method: 'POST',
      body: JSON.stringify({ userId, betAmount, cashOutAt })
    })
  }

  async playRoulette(
    userId: string, 
    betAmount: number, 
    betType: 'red' | 'black' | 'green'
  ): Promise<ApiResponse<{ game: GameResult; user: User; winAmount: number; lossAmount: number }>> {
    return this.request('/games/roulette', {
      method: 'POST',
      body: JSON.stringify({ userId, betAmount, betType })
    })
  }

  async playJackpot(
    userId: string, 
    betAmount: number
  ): Promise<ApiResponse<{ game: GameResult; user: User; winAmount: number; lossAmount: number }>> {
    return this.request('/games/jackpot', {
      method: 'POST',
      body: JSON.stringify({ userId, betAmount })
    })
  }

  // Data endpoints
  async getUserGames(userId: string): Promise<ApiResponse<{ games: GameResult[] }>> {
    return this.request(`/users/${userId}/games`)
  }

  async getRecentGames(): Promise<ApiResponse<{ games: any[] }>> {
    return this.request('/games/recent')
  }

  async getLeaderboard(): Promise<ApiResponse<{ leaderboard: any[] }>> {
    return this.request('/leaderboard')
  }

  async getServerStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request('/stats')
  }
}

export const api = ApiClient.getInstance()
export type { User, GameResult, ApiResponse } 