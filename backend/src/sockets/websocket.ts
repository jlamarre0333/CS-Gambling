import { Server as SocketIOServer, Socket } from 'socket.io'
import Redis from 'ioredis'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/database'
import { User } from '../entities/User'

interface AuthenticatedSocket extends Socket {
  user?: User
}

export const setupWebSocket = (io: SocketIOServer, redis: Redis) => {
  // Authentication middleware for WebSocket
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { id: decoded.userId } })

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) return

    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`)

    // Join user-specific room
    socket.join(`user:${socket.user.id}`)
    
    // Join general chat
    socket.join('chat:general')
    
    // Join VIP chat if user is VIP
    if (socket.user.isVip) {
      socket.join('chat:vip')
    }

    // Store user session in Redis
    redis.setex(`socket:${socket.id}`, 3600, JSON.stringify({
      userId: socket.user.id,
      username: socket.user.username,
      connectedAt: new Date().toISOString()
    }))

    // Update user online status
    redis.setex(`online:${socket.user.id}`, 300, 'true') // 5 minutes TTL

    // Notify friends of online status
    socket.broadcast.to(`friends:${socket.user.id}`).emit('friend_online', {
      userId: socket.user.id,
      username: socket.user.username
    })

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        const { content, chatType = 'general', roomId } = data
        
        if (!content || content.trim().length === 0) {
          return socket.emit('error', { message: 'Message content is required' })
        }

        if (content.length > 500) {
          return socket.emit('error', { message: 'Message too long' })
        }

        const message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: socket.user!.id,
          username: socket.user!.username,
          avatar: socket.user!.avatar,
          content: content.trim(),
          chatType,
          roomId,
          timestamp: new Date().toISOString()
        }

        // Determine target room
        let targetRoom = 'chat:general'
        if (chatType === 'vip' && socket.user!.isVip) {
          targetRoom = 'chat:vip'
        } else if (chatType === 'game' && roomId) {
          targetRoom = `game:${roomId}`
        }

        // Broadcast message
        io.to(targetRoom).emit('chat_message', message)

        // Store message in Redis for history (keep last 100 messages)
        redis.lpush(`chat_history:${targetRoom}`, JSON.stringify(message))
        redis.ltrim(`chat_history:${targetRoom}`, 0, 99)

      } catch (error) {
        console.error('❌ Chat message error:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle game events
    socket.on('join_game', async (data) => {
      const { gameType, gameId } = data
      
      if (!gameType || !gameId) {
        return socket.emit('error', { message: 'Game type and ID are required' })
      }

      // Join game room
      socket.join(`game:${gameId}`)
      
      // Notify other players
      socket.to(`game:${gameId}`).emit('player_joined', {
        userId: socket.user!.id,
        username: socket.user!.username,
        avatar: socket.user!.avatar
      })

      console.log(`🎮 ${socket.user!.username} joined ${gameType} game: ${gameId}`)
    })

    socket.on('leave_game', async (data) => {
      const { gameId } = data
      
      if (gameId) {
        socket.leave(`game:${gameId}`)
        socket.to(`game:${gameId}`).emit('player_left', {
          userId: socket.user!.id,
          username: socket.user!.username
        })
      }
    })

    // Handle game bets
    socket.on('place_bet', async (data) => {
      try {
        const { gameType, gameId, betAmount, betData } = data
        
        // Validate bet
        if (!gameType || !gameId || !betAmount || betAmount <= 0) {
          return socket.emit('error', { message: 'Invalid bet data' })
        }

        if (betAmount > socket.user!.balance) {
          return socket.emit('error', { message: 'Insufficient balance' })
        }

        // Process bet (this would integrate with game logic)
        const bet = {
          id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: socket.user!.id,
          username: socket.user!.username,
          gameType,
          gameId,
          amount: betAmount,
          data: betData,
          timestamp: new Date().toISOString()
        }

        // Broadcast bet to game room
        io.to(`game:${gameId}`).emit('bet_placed', bet)

        console.log(`💰 ${socket.user!.username} placed bet: $${betAmount} on ${gameType}`)

      } catch (error) {
        console.error('❌ Bet placement error:', error)
        socket.emit('error', { message: 'Failed to place bet' })
      }
    })

    // Handle crash game cashout
    socket.on('crash_cashout', async (data) => {
      const { gameId, multiplier } = data
      
      if (!gameId || !multiplier) {
        return socket.emit('error', { message: 'Game ID and multiplier are required' })
      }

      // Process cashout
      const cashout = {
        userId: socket.user!.id,
        username: socket.user!.username,
        gameId,
        multiplier,
        timestamp: new Date().toISOString()
      }

      io.to(`game:${gameId}`).emit('player_cashout', cashout)
      console.log(`🚀 ${socket.user!.username} cashed out at ${multiplier}x`)
    })

    // Handle friend requests
    socket.on('friend_request', async (data) => {
      const { targetUserId } = data
      
      if (!targetUserId) {
        return socket.emit('error', { message: 'Target user ID is required' })
      }

      // Send friend request notification
      io.to(`user:${targetUserId}`).emit('friend_request', {
        fromUserId: socket.user!.id,
        fromUsername: socket.user!.username,
        fromAvatar: socket.user!.avatar
      })
    })

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { chatType = 'general', roomId } = data
      let targetRoom = 'chat:general'
      
      if (chatType === 'vip' && socket.user!.isVip) {
        targetRoom = 'chat:vip'
      } else if (roomId) {
        targetRoom = `game:${roomId}`
      }

      socket.to(targetRoom).emit('user_typing', {
        userId: socket.user!.id,
        username: socket.user!.username
      })
    })

    socket.on('typing_stop', (data) => {
      const { chatType = 'general', roomId } = data
      let targetRoom = 'chat:general'
      
      if (chatType === 'vip' && socket.user!.isVip) {
        targetRoom = 'chat:vip'
      } else if (roomId) {
        targetRoom = `game:${roomId}`
      }

      socket.to(targetRoom).emit('user_stopped_typing', {
        userId: socket.user!.id,
        username: socket.user!.username
      })
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user!.username} (${socket.id})`)

      // Remove socket session from Redis
      redis.del(`socket:${socket.id}`)

      // Update offline status after 30 seconds (give time for reconnection)
      setTimeout(async () => {
        const stillOnline = await redis.get(`online:${socket.user!.id}`)
        if (!stillOnline) {
          // Notify friends of offline status
          socket.broadcast.to(`friends:${socket.user!.id}`).emit('friend_offline', {
            userId: socket.user!.id,
            username: socket.user!.username
          })
        }
      }, 30000)
    })

    // Send initial data
    socket.emit('connected', {
      userId: socket.user.id,
      username: socket.user.username,
      balance: socket.user.balance,
      level: socket.user.level,
      serverTime: new Date().toISOString()
    })
  })

  // Broadcast system messages
  setInterval(() => {
    io.emit('server_stats', {
      onlineUsers: io.sockets.sockets.size,
      timestamp: new Date().toISOString()
    })
  }, 30000) // Every 30 seconds

  console.log('✅ WebSocket server configured')
}

export default setupWebSocket 