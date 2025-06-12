import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface User {
  id: string
  steamId: string
  username: string
  avatar: string
  balance: number
  level: number
  totalWagered: number
  totalWon: number
  gamesPlayed: number
  joinedAt: string
  isOnline: boolean
}

export interface GameData {
  jackpot?: {
    id: string
    participants: number
    totalValue: number
    timeLeft: number
    status: string
  }
  crash?: {
    id: string
    multiplier: number
    status: string
    participants: number
  }
}

export interface InventoryItem {
  id: string
  name: string
  exterior: string
  rarity: string
  weapon: string
  price: number
  image: string
  tradable: boolean
}

export interface LeaderboardEntry {
  rank: number
  username: string
  avatar: string
  amount: number
  gamesPlayed: number
  level: number
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      withCredentials: true,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        // Add any auth headers if needed
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login or clear auth
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // === HEALTH & STATUS ===
  
  async getHealth(): Promise<any> {
    const response = await this.api.get('/health')
    return response.data
  }

  // === AUTHENTICATION ===
  
  async getAuthStatus(): Promise<{ authenticated: boolean }> {
    try {
      const response = await this.api.get('/auth/status')
      return response.data
    } catch (error) {
      return { authenticated: false }
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me')
    return response.data
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout')
  }

  getSteamLoginUrl(): string {
    return `${this.api.defaults.baseURL}/auth/steam`
  }

  // === GAMES ===
  
  async getActiveGames(): Promise<GameData> {
    const response = await this.api.get('/api/games/active')
    return response.data
  }

  async getGameHistory(gameType?: string, limit: number = 50): Promise<any[]> {
    const params = new URLSearchParams()
    if (gameType) params.append('gameType', gameType)
    params.append('limit', limit.toString())
    
    const response = await this.api.get(`/api/games/history?${params}`)
    return response.data
  }

  async getGameStats(): Promise<any> {
    const response = await this.api.get('/api/games/stats')
    return response.data
  }

  // === LEADERBOARD ===
  
  async getLeaderboard(type: string = 'winnings', period: string = 'all_time', limit: number = 100): Promise<{ leaderboard: LeaderboardEntry[] }> {
    const params = new URLSearchParams()
    params.append('type', type)
    params.append('period', period)
    params.append('limit', limit.toString())
    
    const response = await this.api.get(`/api/leaderboard?${params}`)
    return response.data
  }

  async getUserRank(userId: string, type: string = 'winnings', period: string = 'all_time'): Promise<any> {
    const params = new URLSearchParams()
    params.append('type', type)
    params.append('period', period)
    
    const response = await this.api.get(`/api/leaderboard/rank/${userId}?${params}`)
    return response.data
  }

  async getLeaderboardStats(): Promise<any> {
    const response = await this.api.get('/api/leaderboard/stats')
    return response.data
  }

  // === INVENTORY ===
  
  async getInventory(): Promise<{ items: InventoryItem[]; totalValue: number; totalItems: number }> {
    const response = await this.api.get('/api/inventory')
    return response.data
  }

  async refreshInventory(): Promise<any> {
    const response = await this.api.post('/api/inventory/refresh')
    return response.data
  }

  async getItemDetails(itemId: string): Promise<any> {
    const response = await this.api.get(`/api/inventory/item/${itemId}`)
    return response.data
  }

  // === USER PROFILE ===
  
  async getUserProfile(): Promise<User> {
    const response = await this.api.get('/api/user/profile')
    return response.data
  }

  async updateUserProfile(data: { displayName?: string; preferences?: any }): Promise<any> {
    const response = await this.api.put('/api/user/profile', data)
    return response.data
  }

  async getUserBalance(): Promise<{ balance: number; currency: string }> {
    const response = await this.api.get('/api/user/balance')
    return response.data
  }

  async getUserStats(): Promise<any> {
    const response = await this.api.get('/api/user/stats')
    return response.data
  }

  async getUserHistory(page: number = 1, limit: number = 20, gameType?: string): Promise<any> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (gameType) params.append('gameType', gameType)
    
    const response = await this.api.get(`/api/user/history?${params}`)
    return response.data
  }

  async getUserAchievements(): Promise<any[]> {
    const response = await this.api.get('/api/user/achievements')
    return response.data
  }

  // === TRANSACTIONS ===
  
  async getTransactions(page: number = 1, limit: number = 20, type?: string): Promise<any> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (type) params.append('type', type)
    
    const response = await this.api.get(`/api/transactions?${params}`)
    return response.data
  }

  async createDeposit(items: string[]): Promise<any> {
    const response = await this.api.post('/api/transactions/deposit', { items })
    return response.data
  }

  async createWithdrawal(amount: number, steamTradeUrl: string): Promise<any> {
    const response = await this.api.post('/api/transactions/withdrawal', { amount, steamTradeUrl })
    return response.data
  }

  async getTransaction(id: string): Promise<any> {
    const response = await this.api.get(`/api/transactions/${id}`)
    return response.data
  }

  async cancelTransaction(id: string): Promise<any> {
    const response = await this.api.put(`/api/transactions/${id}/cancel`)
    return response.data
  }

  // === CHAT ===
  
  async getChatMessages(room: string = 'general', limit: number = 50, before?: string): Promise<any> {
    const params = new URLSearchParams()
    params.append('room', room)
    params.append('limit', limit.toString())
    if (before) params.append('before', before)
    
    const response = await this.api.get(`/api/chat/messages?${params}`)
    return response.data
  }

  async sendChatMessage(message: string, room: string = 'general'): Promise<any> {
    const response = await this.api.post('/api/chat/messages', { message, room })
    return response.data
  }

  async getChatRooms(): Promise<any[]> {
    const response = await this.api.get('/api/chat/rooms')
    return response.data
  }

  async getRoomUsers(roomId: string): Promise<any> {
    const response = await this.api.get(`/api/chat/rooms/${roomId}/users`)
    return response.data
  }

  async reportMessage(messageId: string, reason: string, description?: string): Promise<any> {
    const response = await this.api.post(`/api/chat/messages/${messageId}/report`, { reason, description })
    return response.data
  }

  async getChatStats(): Promise<any> {
    const response = await this.api.get('/api/chat/stats')
    return response.data
  }

  // === NOTIFICATIONS ===
  
  async getNotifications(unreadOnly: boolean = false): Promise<any[]> {
    const params = new URLSearchParams()
    if (unreadOnly) params.append('unreadOnly', 'true')
    
    const response = await this.api.get(`/api/user/notifications?${params}`)
    return response.data
  }

  async markNotificationRead(id: string): Promise<any> {
    const response = await this.api.put(`/api/user/notifications/${id}/read`)
    return response.data
  }

  async markAllNotificationsRead(): Promise<any> {
    const response = await this.api.put('/api/user/notifications/read-all')
    return response.data
  }

  // === STEAM API ===
  
  async getSteamInventory(steamId: string): Promise<any> {
    const response = await this.api.get(`/api/steam/inventory/${steamId}`)
    return response.data
  }

  async getSteamMarketPrice(marketHashName: string): Promise<{ price: number }> {
    const response = await this.api.get(`/api/steam/market-price/${encodeURIComponent(marketHashName)}`)
    return response.data
  }

  // === ERROR HANDLING ===
  
  private handleError(error: any): never {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || 'Server error')
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection')
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred')
    }
  }
}

// Create singleton instance
const apiService = new ApiService()
export default apiService 