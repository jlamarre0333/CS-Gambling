import { io, Socket } from 'socket.io-client'

interface SocketMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: Date
  room: string
}

interface GameUpdate {
  jackpots?: any[]
  crashes?: any[]
  timestamp: Date
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  avatar?: string
  amount?: number
  duration?: number
  timestamp: Date
}

class SocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private token: string | null = null

  constructor() {
    this.setupConnection()
  }

  private setupConnection() {
    // Get auth token from cookies or localStorage
    this.token = this.getAuthToken()

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      withCredentials: true,
      auth: {
        token: this.token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Connected to CS2 Gambling Backend')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from backend:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })

    this.socket.on('welcome', (data) => {
      console.log('Welcome message:', data)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Game-specific events
    this.socket.on('gameUpdates', (data: GameUpdate) => {
      this.emit('gameUpdates', data)
    })

    this.socket.on('activeGames', (data) => {
      this.emit('activeGames', data)
    })

    // Jackpot events
    this.socket.on('newJackpotGame', (game) => {
      this.emit('newJackpotGame', game)
    })

    this.socket.on('jackpotUpdated', (game) => {
      this.emit('jackpotUpdated', game)
    })

    this.socket.on('jackpotSpinResult', (result) => {
      this.emit('jackpotSpinResult', result)
    })

    this.socket.on('jackpotJoined', (data) => {
      this.emit('jackpotJoined', data)
    })

    // Crash events
    this.socket.on('newCrashGame', (game) => {
      this.emit('newCrashGame', game)
    })

    this.socket.on('crashGameUpdated', (game) => {
      this.emit('crashGameUpdated', game)
    })

    this.socket.on('crashCashout', (data) => {
      this.emit('crashCashout', data)
    })

    this.socket.on('playerCashedOut', (data) => {
      this.emit('playerCashedOut', data)
    })

    // Chat events
    this.socket.on('newMessage', (message: SocketMessage) => {
      this.emit('newMessage', message)
    })

    this.socket.on('messageSent', (data) => {
      this.emit('messageSent', data)
    })

    this.socket.on('joinedRoom', (data) => {
      this.emit('joinedRoom', data)
    })

    this.socket.on('leftRoom', (data) => {
      this.emit('leftRoom', data)
    })

    // Notification events
    this.socket.on('notification', (notification: Notification) => {
      this.emit('notification', notification)
    })

    // User events
    this.socket.on('userStats', (stats) => {
      this.emit('userStats', stats)
    })

    this.socket.on('leaderboardData', (data) => {
      this.emit('leaderboardData', data)
    })
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Try to get token from cookies
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'auth-token') {
        return value
      }
    }
    
    // Fallback to localStorage
    return localStorage.getItem('auth-token')
  }

  // Connection management
  connect() {
    if (!this.socket) {
      this.setupConnection()
    } else if (!this.isConnected) {
      this.socket.connect()
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.isConnected = false
    }
  }

  reconnect() {
    this.disconnect()
    setTimeout(() => {
      this.setupConnection()
    }, 1000)
  }

  isSocketConnected(): boolean {
    return this.isConnected && !!this.socket?.connected
  }

  // Event handling
  on(event: string, callback: Function) {
    if (typeof window !== 'undefined') {
      window.addEventListener(`socket:${event}`, callback as EventListener)
    }
  }

  off(event: string, callback: Function) {
    if (typeof window !== 'undefined') {
      window.removeEventListener(`socket:${event}`, callback as EventListener)
    }
  }

  private emit(event: string, data: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`socket:${event}`, { detail: data }))
    }
  }

  // === GAME ACTIONS ===

  // Jackpot actions
  joinJackpot(gameId: string, items: string[]) {
    if (!this.socket) return
    this.socket.emit('joinJackpot', { gameId, items })
  }

  createJackpot() {
    if (!this.socket) return
    this.socket.emit('createJackpot')
  }

  spinJackpot(gameId: string) {
    if (!this.socket) return
    this.socket.emit('spinJackpot', { gameId })
  }

  // Crash actions
  joinCrash(gameId: string, betAmount: number) {
    if (!this.socket) return
    this.socket.emit('joinCrash', { gameId, betAmount })
  }

  cashoutCrash(gameId: string) {
    if (!this.socket) return
    this.socket.emit('cashoutCrash', { gameId })
  }

  createCrash() {
    if (!this.socket) return
    this.socket.emit('createCrash')
  }

  // Chat actions
  sendMessage(message: string, room: string = 'general') {
    if (!this.socket) return
    this.socket.emit('sendMessage', { message, room })
  }

  joinChatRoom(room: string) {
    if (!this.socket) return
    this.socket.emit('joinChatRoom', room)
  }

  leaveChatRoom(room: string) {
    if (!this.socket) return
    this.socket.emit('leaveChatRoom', room)
  }

  // User actions
  getUserStats() {
    if (!this.socket) return
    this.socket.emit('getUserStats')
  }

  getLeaderboard(type: string, period: string) {
    if (!this.socket) return
    this.socket.emit('getLeaderboard', { type, period })
  }

  // Health check
  ping() {
    if (!this.socket) return
    this.socket.emit('ping', { timestamp: Date.now() })
  }

  // Update auth token
  updateAuthToken(token: string) {
    this.token = token
    if (this.socket) {
      this.socket.auth = { token }
      this.reconnect()
    }
  }
}

// Create singleton instance
const socketService = new SocketService()

// Auto-connect when window loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    socketService.connect()
  })

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !socketService.isSocketConnected()) {
      socketService.connect()
    }
  })
}

export default socketService
export type { SocketMessage, GameUpdate, Notification } 