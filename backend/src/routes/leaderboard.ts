import express from 'express'

const router = express.Router()

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { type = 'winnings', period = 'all_time', limit = 100 } = req.query

    // Mock leaderboard data
    const leaderboard = [
      {
        rank: 1,
        userId: 'user_1',
        username: 'ProGamer2024',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/f1/f1dd60a188883caf82d0cbfccfe6aba0af1732d4_full.jpg',
        amount: 125450.75,
        gamesPlayed: 2847,
        level: 87,
        badge: '👑'
      },
      {
        rank: 2,
        userId: 'user_2',
        username: 'SkinMaster',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/42/4271c11c8b275c5b8c0471b9f9b5a4c7e4f3c8a2_full.jpg',
        amount: 98765.50,
        gamesPlayed: 1923,
        level: 72,
        badge: '🥈'
      },
      {
        rank: 3,
        userId: 'user_3',
        username: 'LuckyStreak',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/8b/8b9c4e7c8e2b4a1f9d3e6c5a7b8e9f0a1b2c3d4e_full.jpg',
        amount: 87432.25,
        gamesPlayed: 1654,
        level: 65,
        badge: '🥉'
      },
      {
        rank: 4,
        userId: 'user_4',
        username: 'CrashKing',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/cd/cd9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e_full.jpg',
        amount: 72156.80,
        gamesPlayed: 1438,
        level: 58,
        badge: '🎯'
      },
      {
        rank: 5,
        userId: 'user_5',
        username: 'JackpotHero',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/9a/9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b_full.jpg',
        amount: 65789.45,
        gamesPlayed: 1287,
        level: 52,
        badge: '🎰'
      }
    ]

    // Add more players for a complete leaderboard
    for (let i = 6; i <= 50; i++) {
      leaderboard.push({
        rank: i,
        userId: `user_${i}`,
        username: `Player${i}`,
        avatar: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default_${(i % 10) + 1}.jpg`,
        amount: Math.floor(Math.random() * 50000) + 5000,
        gamesPlayed: Math.floor(Math.random() * 1000) + 100,
        level: Math.floor(Math.random() * 40) + 10,
        badge: i <= 10 ? '⭐' : ''
      })
    }

    // Sort by amount (descending)
    leaderboard.sort((a, b) => b.amount - a.amount)

    res.json({
      leaderboard: leaderboard.slice(0, Number(limit)),
      metadata: {
        type,
        period,
        totalPlayers: leaderboard.length,
        lastUpdated: new Date()
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// Get user's rank
router.get('/rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { type = 'winnings', period = 'all_time' } = req.query

    // Mock user rank
    const userRank = {
      rank: 127,
      username: 'CurrentUser',
      amount: 3456.78,
      gamesPlayed: 234,
      level: 28,
      percentile: 15.7, // Top 15.7%
      nextRankAmount: 3500.00,
      amountToNextRank: 43.22
    }

    res.json(userRank)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user rank' })
  }
})

// Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalPlayers: 15847,
      totalWinnings: 8947562.50,
      averageWinnings: 564.32,
      topPlayer: {
        username: 'ProGamer2024',
        amount: 125450.75
      },
      biggestWinToday: {
        username: 'LuckyPlayer',
        amount: 15000.00,
        game: 'Jackpot'
      },
      mostActivePlayer: {
        username: 'Grinder123',
        gamesPlayed: 3421
      },
      rankDistribution: {
        top1Percent: 158,
        top5Percent: 792,
        top10Percent: 1584,
        top25Percent: 3961
      }
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard statistics' })
  }
})

export default router 