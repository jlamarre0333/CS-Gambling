const API_BASE_URL = 'http://localhost:3001'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Health check
  async getHealth() {
    return this.request('/health')
  }

  // Auth
  async demoLogin(username: string) {
    return this.request('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    })
  }

  // User
  async getUserProfile(userId: string) {
    return this.request(`/api/user/profile/${userId}`)
  }

  // Games
  async placeBet(userId: string, gameType: string, betAmount: number, gameData?: any) {
    return this.request('/api/games/bet', {
      method: 'POST',
      body: JSON.stringify({ userId, gameType, betAmount, gameData }),
    })
  }

  async getGameHistory(userId: string) {
    return this.request(`/api/games/history/${userId}`)
  }

  // Leaderboard
  async getLeaderboard() {
    return this.request('/api/leaderboard')
  }

  // Social
  async getSocialFeed() {
    return this.request('/api/social/feed')
  }
}

export const api = new ApiClient()
export default api 