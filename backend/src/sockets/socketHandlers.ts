import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { GameService } from '../services/gameService'
import { NotificationService } from '../services/notificationService'

interface AuthenticatedSocket extends Socket {
  userId?: string
  username?: string
}

export function setupSocketHandlers(
  io: SocketIOServer, 
  gameService: GameService, 
  notificationService: NotificationService
) {
  
  // Authentication middleware for sockets
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cs2-gambling-jwt-secret') as any
      socket.userId = decoded.userId
      socket.username = decoded.username
      
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.username} connected`)

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }

    // Send current active games
    socket.emit('activeGames', {
      jackpots: gameService.getActiveJackpots(),
      crashes: gameService.getActiveCrashGames()
    })

    // === JACKPOT GAME HANDLERS ===
    
    socket.on('joinJackpot', async (data: { gameId: string; items: string[] }) => {
      try {
        if (!socket.userId) throw new Error('Not authenticated')
        
        const game = await gameService.joinJackpot(data.gameId, socket.userId, data.items)
        
        // Broadcast updated game to all clients
        io.emit('jackpotUpdated', game)
        
        // Send success to user
        socket.emit('jackpotJoined', { success: true, game })
        
        // Notify others about new participant
        if (socket.username) {
          notificationService.notifyUserJoined(socket.username, 'Jackpot', game.totalValue)
        }
        
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    socket.on('createJackpot', async () => {
      try {
        const game = await gameService.createJackpotGame()
        io.emit('newJackpotGame', game)
        
        notificationService.notifyNewJackpotRound(game.roundNumber, game.totalValue)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    socket.on('spinJackpot', async (data: { gameId: string }) => {
      try {
        const result = await gameService.spinJackpot(data.gameId)
        
        // Broadcast spin result to all clients
        io.emit('jackpotSpinResult', {
          gameId: data.gameId,
          winner: result.winner,
          game: result.game
        })
        
        // Send winner notification
        notificationService.notifyJackpotWin(
          result.winner.username,
          result.game.totalValue,
          result.game.roundNumber,
          result.winner.avatar
        )
        
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    // === CRASH GAME HANDLERS ===
    
    socket.on('joinCrash', async (data: { gameId: string; betAmount: number }) => {
      try {
        if (!socket.userId) throw new Error('Not authenticated')
        
        const game = await gameService.joinCrashGame(data.gameId, socket.userId, data.betAmount)
        
        // Broadcast updated game to all clients
        io.emit('crashGameUpdated', game)
        
        // Send success to user
        socket.emit('crashJoined', { success: true, game })
        
        // Notify others about new participant
        if (socket.username) {
          notificationService.notifyUserJoined(socket.username, 'Crash', data.betAmount)
        }
        
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    socket.on('cashoutCrash', async (data: { gameId: string }) => {
      try {
        if (!socket.userId) throw new Error('Not authenticated')
        
        const winAmount = await gameService.cashoutCrash(data.gameId, socket.userId)
        
        // Send cashout confirmation to user
        socket.emit('crashCashout', { 
          success: true, 
          winAmount,
          multiplier: gameService.getCrashGame(data.gameId)?.multiplier 
        })
        
        // Broadcast cashout to all players in game
        io.emit('playerCashedOut', {
          gameId: data.gameId,
          username: socket.username,
          winAmount,
          multiplier: gameService.getCrashGame(data.gameId)?.multiplier
        })
        
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    socket.on('createCrash', async () => {
      try {
        const game = await gameService.createCrashGame()
        io.emit('newCrashGame', game)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    // === CHAT HANDLERS ===
    
    socket.on('sendMessage', async (data: { message: string; room?: string }) => {
      try {
        if (!socket.userId || !socket.username) throw new Error('Not authenticated')
        
        const chatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: socket.userId,
          username: socket.username,
          message: data.message,
          timestamp: new Date(),
          room: data.room || 'general'
        }

        // Broadcast message to room
        const room = data.room || 'general'
        io.to(room).emit('newMessage', chatMessage)
        
        // Send confirmation to sender
        socket.emit('messageSent', { success: true })
        
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    socket.on('joinChatRoom', (room: string) => {
      socket.join(room)
      socket.emit('joinedRoom', { room })
    })

    socket.on('leaveChatRoom', (room: string) => {
      socket.leave(room)
      socket.emit('leftRoom', { room })
    })

    // === GENERAL HANDLERS ===
    
    socket.on('getUserStats', async () => {
      try {
        if (!socket.userId) throw new Error('Not authenticated')
        
        // This would fetch user stats from database
        const stats = {
          gamesPlayed: 0,
          totalWon: 0,
          totalWagered: 0,
          currentWinStreak: 0,
          achievements: []
        }
        
        socket.emit('userStats', stats)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    socket.on('getLeaderboard', async (data: { type: string; period: string }) => {
      try {
        // This would fetch leaderboard from database
        const leaderboard = [
          { rank: 1, username: 'TopPlayer', amount: 50000, avatar: '🏆' },
          { rank: 2, username: 'SecondPlace', amount: 35000, avatar: '🥈' },
          { rank: 3, username: 'ThirdPlace', amount: 25000, avatar: '🥉' }
        ]
        
        socket.emit('leaderboardData', {
          type: data.type,
          period: data.period,
          data: leaderboard
        })
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    // === REAL-TIME GAME UPDATES ===
    
    // Send periodic updates for active games
    const gameUpdatesInterval = setInterval(() => {
      const activeJackpots = gameService.getActiveJackpots()
      const activeCrashes = gameService.getActiveCrashGames()
      
      if (activeJackpots.length > 0 || activeCrashes.length > 0) {
        socket.emit('gameUpdates', {
          jackpots: activeJackpots,
          crashes: activeCrashes,
          timestamp: new Date()
        })
      }
    }, 1000) // Send updates every second

    // === DISCONNECT HANDLER ===
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`)
      clearInterval(gameUpdatesInterval)
    })

    // === ERROR HANDLER ===
    
    socket.on('error', (error) => {
      console.error('Socket error:', error)
      socket.emit('error', { message: 'An unexpected error occurred' })
    })
  })

  // Periodic notifications for platform activity
  setInterval(() => {
    const stats = notificationService.getNotificationStats()
    
    if (stats.connectedUsers > 0) {
      // Send random activity notifications to keep platform feeling alive
      const activityTypes = [
        () => notificationService.createBigWinNotification('ProGamer', 2500, 'Roulette'),
        () => notificationService.createNewRoundNotification('Crash', Math.floor(Math.random() * 1000) + 5000),
        () => notificationService.createSystemNotification('New Feature!', 'Check out the improved jackpot interface!', 'info')
      ]
      
      if (Math.random() > 0.7) { // 30% chance every interval
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const notification = randomActivity()
        notificationService.broadcastNotification(notification)
      }
    }
  }, 15000) // Every 15 seconds

  console.log('✅ Socket handlers configured successfully')
} 