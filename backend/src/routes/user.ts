import express from 'express'

const router = express.Router()

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.user as any
    res.json({
      id: user.id,
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar,
      balance: user.balance || 0,
      level: user.level || 1,
      totalWagered: user.totalWagered || 0,
      totalWon: user.totalWon || 0,
      gamesPlayed: user.gamesPlayed || 0,
      joinedAt: user.createdAt,
      isOnline: user.isOnline
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const user = req.user as any
    const { displayName, preferences } = req.body

    // Update user preferences
    const updatedUser = {
      ...user,
      displayName: displayName || user.username,
      preferences: preferences || {}
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get user balance
router.get('/balance', async (req, res) => {
  try {
    const user = req.user as any
    res.json({ 
      balance: user.balance || 0,
      currency: 'USD'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// Get user game history
router.get('/history', async (req, res) => {
  try {
    const user = req.user as any
    const { page = 1, limit = 20, gameType } = req.query

    // Mock game history - replace with database query
    const mockHistory = [
      {
        id: '1',
        gameType: 'jackpot',
        betAmount: 150.00,
        winAmount: 750.00,
        result: 'win',
        timestamp: new Date(Date.now() - 3600000),
        gameId: 'jp_123'
      },
      {
        id: '2',
        gameType: 'crash',
        betAmount: 50.00,
        winAmount: 0,
        result: 'loss',
        timestamp: new Date(Date.now() - 7200000),
        gameId: 'cr_456'
      }
    ]

    res.json({
      history: mockHistory,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockHistory.length,
        totalPages: Math.ceil(mockHistory.length / Number(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game history' })
  }
})

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const user = req.user as any

    const stats = {
      totalGamesPlayed: user.gamesPlayed || 0,
      totalWagered: user.totalWagered || 0,
      totalWon: user.totalWon || 0,
      netProfit: (user.totalWon || 0) - (user.totalWagered || 0),
      winRate: user.gamesPlayed > 0 ? ((user.totalWon || 0) / (user.totalWagered || 0) * 100).toFixed(2) : 0,
      currentLevel: user.level || 1,
      experiencePoints: user.experiencePoints || 0,
      achievements: user.achievements || [],
      currentWinStreak: user.currentWinStreak || 0,
      bestWinStreak: user.bestWinStreak || 0,
      favoriteGame: 'Jackpot', // Would be calculated from history
      accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// Get user achievements
router.get('/achievements', async (req, res) => {
  try {
    const user = req.user as any

    // Mock achievements
    const achievements = [
      {
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        earned: true,
        earnedAt: new Date(user.createdAt),
        rarity: 'common',
        reward: 'Badge + 10 XP'
      },
      {
        id: 'big_spender',
        title: 'Big Spender',
        description: 'Wager $1000 in total',
        icon: '💰',
        earned: (user.totalWagered || 0) >= 1000,
        earnedAt: (user.totalWagered || 0) >= 1000 ? new Date() : null,
        rarity: 'rare',
        reward: 'Badge + 50 XP'
      },
      {
        id: 'jackpot_master',
        title: 'Jackpot Master',
        description: 'Win 10 jackpot games',
        icon: '🎰',
        earned: false,
        earnedAt: null,
        rarity: 'epic',
        reward: 'Badge + 100 XP + $50 Bonus'
      }
    ]

    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

// Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const user = req.user as any
    const { unreadOnly = false } = req.query

    // Mock notifications
    const notifications = [
      {
        id: 'notif_1',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You earned the "First Victory" achievement',
        read: false,
        timestamp: new Date(Date.now() - 1800000)
      },
      {
        id: 'notif_2',
        type: 'system',
        title: 'Welcome!',
        message: 'Welcome to CS2 Gambling! Enjoy your games.',
        read: true,
        timestamp: new Date(user.createdAt)
      }
    ]

    const filteredNotifications = unreadOnly === 'true' 
      ? notifications.filter(n => !n.read)
      : notifications

    res.json(filteredNotifications)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    
    // Mock update - replace with database update
    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' })
  }
})

// Mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    // Mock update - replace with database update
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' })
  }
})

export default router 