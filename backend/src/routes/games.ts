import express from 'express'

const router = express.Router()

// Get active games
router.get('/active', async (req, res) => {
  try {
    // Mock active games
    const activeGames = {
      jackpot: {
        id: 'jp_current',
        participants: 3,
        totalValue: 2500.75,
        timeLeft: 45,
        status: 'waiting'
      },
      crash: {
        id: 'cr_current',
        multiplier: 1.85,
        status: 'flying',
        participants: 12
      },
      roulette: {
        id: 'rt_current',
        bets: 24,
        totalBet: 1200.50,
        timeLeft: 12,
        status: 'betting'
      }
    }

    res.json(activeGames)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active games' })
  }
})

// Get game history
router.get('/history', async (req, res) => {
  try {
    const { gameType, limit = 50 } = req.query

    // Mock game history
    const games = [
      {
        id: 'jp_123',
        type: 'jackpot',
        winner: 'ProGamer',
        winAmount: 3250.00,
        participants: 8,
        endTime: new Date(Date.now() - 300000)
      },
      {
        id: 'cr_456',
        type: 'crash',
        crashPoint: 2.45,
        winners: 5,
        totalPayout: 850.00,
        endTime: new Date(Date.now() - 600000)
      }
    ]

    const filteredGames = gameType ? games.filter(g => g.type === gameType) : games

    res.json(filteredGames.slice(0, Number(limit)))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game history' })
  }
})

// Get game statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalGamesPlayed: 15420,
      totalWagered: 2847563.50,
      totalPayout: 2561820.25,
      houseEdge: 10.03,
      averageGameDuration: 45.2,
      popularGame: 'Jackpot',
      biggestWin: {
        amount: 15000.00,
        game: 'Jackpot',
        winner: 'LuckyPlayer',
        date: new Date(Date.now() - 86400000)
      },
      dailyStats: {
        gamesPlayed: 234,
        totalWagered: 12450.75,
        uniquePlayers: 89
      }
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game statistics' })
  }
})

export default router 