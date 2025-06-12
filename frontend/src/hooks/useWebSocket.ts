import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from '@/contexts/UserContext'

interface WebSocketState {
  connected: boolean
  connecting: boolean
  error: string | null
  lastPing: number
}

interface GameUpdate {
  type: string
  data: any
  timestamp: number
}

interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  timestamp: Date
  type: 'message' | 'system' | 'win' | 'join'
}

export function useWebSocket() {
  const { user } = useUser()
  const socketRef = useRef<Socket | null>(null)
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastPing: 0
  })
  
  const [gameUpdates, setGameUpdates] = useState<GameUpdate[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [connectedUsers, setConnectedUsers] = useState(0)
  
  // Connection management
  useEffect(() => {
    if (!user) return
    
    setState(prev => ({ ...prev, connecting: true, error: null }))
    
    const socket = io('ws://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    socketRef.current = socket
    
    // Connection events
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected')
      setState(prev => ({ ...prev, connected: true, connecting: false, error: null }))
      
      // Authenticate with server
      socket.emit('authenticate', {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        balance: user.balance
      })
    })
    
    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
      setState(prev => ({ ...prev, connected: false, connecting: false }))
    })
    
    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false, 
        error: error.message 
      }))
    })
    
    // Authentication response
    socket.on('authenticated', (response) => {
      if (response.success) {
        console.log('✅ WebSocket authenticated')
      }
    })
    
    // Game update handlers
    socket.on('crash:game-started', (data) => {
      addGameUpdate('crash:game-started', data)
    })
    
    socket.on('crash:update', (data) => {
      addGameUpdate('crash:update', data)
    })
    
    socket.on('crash:crashed', (data) => {
      addGameUpdate('crash:crashed', data)
    })
    
    socket.on('crash:bet', (data) => {
      addGameUpdate('crash:bet', data)
      addChatMessage({
        id: `bet-${Date.now()}`,
        userId: 'system',
        username: 'System',
        content: `${data.username} bet $${data.betAmount} on crash!`,
        timestamp: new Date(),
        type: 'join'
      })
    })
    
    socket.on('crash:cashout', (data) => {
      addGameUpdate('crash:cashout', data)
      addChatMessage({
        id: `cashout-${Date.now()}`,
        userId: 'system',
        username: 'System',
        content: `${data.username} cashed out at ${data.multiplier.toFixed(2)}x for $${data.winAmount.toFixed(2)}!`,
        timestamp: new Date(),
        type: 'win'
      })
    })
    
    // Jackpot handlers
    socket.on('jackpot:round-started', (data) => {
      addGameUpdate('jackpot:round-started', data)
    })
    
    socket.on('jackpot:entry', (data) => {
      addGameUpdate('jackpot:entry', data)
      addChatMessage({
        id: `jackpot-${Date.now()}`,
        userId: 'system',
        username: 'System',
        content: `${data.entry.username} joined jackpot with $${data.entry.betAmount}!`,
        timestamp: new Date(),
        type: 'join'
      })
    })
    
    socket.on('jackpot:winner', (data) => {
      addGameUpdate('jackpot:winner', data)
      addChatMessage({
        id: `jackpot-win-${Date.now()}`,
        userId: 'system',
        username: 'System',
        content: `🎉 ${data.winner.username} won the jackpot of $${data.winAmount.toFixed(2)}!`,
        timestamp: new Date(),
        type: 'win'
      })
    })
    
    // Chat handlers
    socket.on('chat:message', (message: ChatMessage) => {
      addChatMessage(message)
    })
    
    // User count
    socket.on('users:count', (count: number) => {
      setConnectedUsers(count)
    })
    
    // Cleanup
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])
  
  // Helper functions
  const addGameUpdate = (type: string, data: any) => {
    const update: GameUpdate = {
      type,
      data,
      timestamp: Date.now()
    }
    
    setGameUpdates(prev => [...prev.slice(-49), update]) // Keep last 50 updates
  }
  
  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev.slice(-99), message]) // Keep last 100 messages
  }
  
  // Public API
  const sendChatMessage = (content: string) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit('chat:message', { content })
    }
  }
  
  const joinCrashGame = (betAmount: number) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit('crash:join', { betAmount })
    }
  }
  
  const cashOutCrash = () => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit('crash:cashout')
    }
  }
  
  const joinJackpot = (betAmount: number) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit('jackpot:join', { betAmount })
    }
  }
  
  const startRain = (totalAmount: number) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit('rain:start', { totalAmount })
    }
  }
  
  const joinRain = (rainId: string) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit('rain:join', rainId)
    }
  }
  
  // Subscribe to specific game events
  const subscribeTo = (event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, handler)
        }
      }
    }
  }
  
  return {
    // Connection state
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    connectedUsers,
    
    // Data
    gameUpdates,
    chatMessages,
    
    // Actions
    sendChatMessage,
    joinCrashGame,
    cashOutCrash,
    joinJackpot,
    startRain,
    joinRain,
    subscribeTo,
    
    // Utils
    clearGameUpdates: () => setGameUpdates([]),
    clearChatMessages: () => setChatMessages([])
  }
}

// Hook for specific game WebSocket features
export function useCrashGame() {
  const ws = useWebSocket()
  const [gameState, setGameState] = useState({
    isActive: false,
    multiplier: 1.0,
    startTime: null,
    bets: [],
    crashed: false,
    userBet: null
  })
  
  useEffect(() => {
    const unsubscribes = [
      ws.subscribeTo('crash:state', setGameState),
      ws.subscribeTo('crash:game-started', (data) => {
        setGameState(prev => ({
          ...prev,
          isActive: true,
          startTime: data.startTime,
          multiplier: 1.0,
          crashed: false
        }))
      }),
      ws.subscribeTo('crash:update', (data) => {
        setGameState(prev => ({
          ...prev,
          multiplier: data.multiplier
        }))
      }),
      ws.subscribeTo('crash:crashed', (data) => {
        setGameState(prev => ({
          ...prev,
          isActive: false,
          crashed: true,
          multiplier: data.crashPoint
        }))
      }),
      ws.subscribeTo('crash:bet-confirmed', (data) => {
        setGameState(prev => ({
          ...prev,
          userBet: { confirmed: true, balance: data.newBalance }
        }))
      }),
      ws.subscribeTo('crash:cashout-success', (data) => {
        setGameState(prev => ({
          ...prev,
          userBet: { ...prev.userBet, cashedOut: true, winAmount: data.winAmount }
        }))
      })
    ]
    
    return () => {
      unsubscribes.forEach(unsub => unsub && unsub())
    }
  }, [ws])
  
  return {
    ...gameState,
    joinGame: ws.joinCrashGame,
    cashOut: ws.cashOutCrash,
    connected: ws.connected
  }
}

export function useJackpotGame() {
  const ws = useWebSocket()
  const [jackpotState, setJackpotState] = useState({
    id: null,
    isActive: false,
    totalPot: 0,
    entries: [],
    timeLeft: 0,
    winnerId: null
  })
  
  useEffect(() => {
    const unsubscribes = [
      ws.subscribeTo('jackpot:state', setJackpotState),
      ws.subscribeTo('jackpot:round-started', setJackpotState),
      ws.subscribeTo('jackpot:entry', (data) => {
        setJackpotState(prev => ({
          ...prev,
          totalPot: data.totalPot,
          entries: [...prev.entries, data.entry]
        }))
      }),
      ws.subscribeTo('jackpot:time-update', (data) => {
        setJackpotState(prev => ({
          ...prev,
          timeLeft: data.timeLeft
        }))
      }),
      ws.subscribeTo('jackpot:winner', (data) => {
        setJackpotState(prev => ({
          ...prev,
          winnerId: data.winner.userId,
          isActive: false
        }))
      })
    ]
    
    return () => {
      unsubscribes.forEach(unsub => unsub && unsub())
    }
  }, [ws])
  
  return {
    ...jackpotState,
    joinJackpot: ws.joinJackpot,
    connected: ws.connected
  }
} 