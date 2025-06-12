import express from 'express'

const router = express.Router()

// Get chat messages
router.get('/messages', async (req, res) => {
  try {
    const { room = 'general', limit = 50, before } = req.query

    // Mock chat messages
    const messages = [
      {
        id: 'msg_1',
        userId: 'user_1',
        username: 'ProGamer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/f1/f1dd60a188883caf82d0cbfccfe6aba0af1732d4_full.jpg',
        message: 'Just won big on jackpot! 🎉',
        timestamp: new Date(Date.now() - 300000),
        room: 'general',
        level: 87,
        badges: ['👑', 'VIP']
      },
      {
        id: 'msg_2',
        userId: 'user_2',
        username: 'SkinCollector',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/42/4271c11c8b275c5b8c0471b9f9b5a4c7e4f3c8a2_full.jpg',
        message: 'Nice win! I\'m going for crash next',
        timestamp: new Date(Date.now() - 240000),
        room: 'general',
        level: 45,
        badges: ['🎯']
      },
      {
        id: 'msg_3',
        userId: 'user_3',
        username: 'NewPlayer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default_1.jpg',
        message: 'How does the jackpot work?',
        timestamp: new Date(Date.now() - 180000),
        room: 'general',
        level: 1,
        badges: ['🆕']
      }
    ]

    res.json({
      messages,
      hasMore: false,
      room
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat messages' })
  }
})

// Send chat message (handled via WebSocket, this is for backup)
router.post('/messages', async (req, res) => {
  try {
    const user = req.user as any
    const { message, room = 'general' } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' })
    }

    // Basic content filtering
    const bannedWords = ['spam', 'scam', 'hack', 'cheat']
    const containsBannedWord = bannedWords.some(word => 
      message.toLowerCase().includes(word.toLowerCase())
    )

    if (containsBannedWord) {
      return res.status(400).json({ error: 'Message contains inappropriate content' })
    }

    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      message: message.trim(),
      timestamp: new Date(),
      room,
      level: user.level || 1,
      badges: user.badges || []
    }

    res.json({
      message: chatMessage,
      success: true
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Get chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = [
      {
        id: 'general',
        name: 'General Chat',
        description: 'Main chat for all users',
        userCount: 247,
        isPublic: true
      },
      {
        id: 'jackpot',
        name: 'Jackpot',
        description: 'Discuss jackpot games',
        userCount: 89,
        isPublic: true
      },
      {
        id: 'crash',
        name: 'Crash',
        description: 'Crash game discussion',
        userCount: 156,
        isPublic: true
      },
      {
        id: 'vip',
        name: 'VIP Lounge',
        description: 'Exclusive chat for VIP members',
        userCount: 23,
        isPublic: false,
        requiresLevel: 50
      }
    ]

    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat rooms' })
  }
})

// Get online users in room
router.get('/rooms/:roomId/users', async (req, res) => {
  try {
    const { roomId } = req.params

    // Mock online users
    const users = [
      {
        userId: 'user_1',
        username: 'ProGamer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/f1/f1dd60a188883caf82d0cbfccfe6aba0af1732d4_full.jpg',
        level: 87,
        isOnline: true,
        status: 'Playing Jackpot'
      },
      {
        userId: 'user_2',
        username: 'SkinCollector',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/42/4271c11c8b275c5b8c0471b9f9b5a4c7e4f3c8a2_full.jpg',
        level: 45,
        isOnline: true,
        status: 'Online'
      }
    ]

    res.json({
      users,
      totalOnline: users.length,
      room: roomId
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room users' })
  }
})

// Report message (moderation)
router.post('/messages/:messageId/report', async (req, res) => {
  try {
    const { messageId } = req.params
    const { reason, description } = req.body
    const user = req.user as any

    if (!reason) {
      return res.status(400).json({ error: 'Report reason required' })
    }

    // Mock report creation
    const report = {
      id: `report_${Date.now()}`,
      messageId,
      reportedBy: user.id,
      reason,
      description: description || '',
      timestamp: new Date(),
      status: 'pending'
    }

    res.json({
      report,
      message: 'Message reported successfully. Moderators will review it.'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to report message' })
  }
})

// Get user's chat statistics
router.get('/stats', async (req, res) => {
  try {
    const user = req.user as any

    const stats = {
      messagessent: 1247,
      favoriteRoom: 'general',
      timeSpentChatting: 15420, // minutes
      warnings: 0,
      mutes: 0,
      reputation: 4.8,
      badges: user.badges || [],
      joinedChatsAt: user.createdAt,
      lastMessage: new Date(Date.now() - 300000)
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat statistics' })
  }
})

export default router 