import express from 'express'
import { GameService } from '../services/gameService'

const router = express.Router()

// Initialize game service (this would come from dependency injection in production)
let gameService: GameService

// Middleware to ensure game service is available
router.use((req, res, next) => {
  if (!gameService && req.app.locals.gameService) {
    gameService = req.app.locals.gameService
  }
  next()
})

// Get current active jackpot game
router.get('/current', async (req, res) => {
  try {
    // If no game service available, return mock data
    if (!gameService) {
      const mockJackpot = {
        id: `jp_${Date.now()}`,
        participants: [
          {
            userId: 'user_1',
            username: 'ProGamer',
            avatar: '/avatars/player1.jpg',
            items: ['AK-47 | Redline', 'AWP | Dragon Lore'],
            totalValue: 1250.50,
            winChance: 35.2
          },
          {
            userId: 'user_2', 
            username: 'SkinCollector',
            avatar: '/avatars/player2.jpg',
            items: ['Karambit | Fade', 'M4A4 | Howl'],
            totalValue: 2300.75,
            winChance: 64.8
          }
        ],
        totalValue: 3551.25,
        status: 'waiting',
        timeLeft: Math.floor(Math.random() * 45) + 15,
        endTime: new Date(Date.now() + 60000),
        roundNumber: Math.floor(Math.random() * 1000) + 1,
        hash: `hash_${Math.random().toString(36).substr(2, 16)}`
      }
      return res.json(mockJackpot)
    }

    // Get active jackpots from service
    const activeJackpots = gameService.getActiveJackpots()
    
    if (activeJackpots.length === 0) {
      // Create new game if none active
      const newGame = await gameService.createJackpotGame()
      return res.json({
        ...newGame,
        timeLeft: Math.floor((newGame.endTime.getTime() - Date.now()) / 1000),
        hash: `hash_${Math.random().toString(36).substr(2, 16)}`
      })
    }

    // Return current active game
    const currentGame = activeJackpots[0]
    res.json({
      ...currentGame,
      timeLeft: Math.floor((currentGame.endTime.getTime() - Date.now()) / 1000),
      hash: `hash_${Math.random().toString(36).substr(2, 16)}`
    })

  } catch (error) {
    console.error('Error fetching current jackpot:', error)
    res.status(500).json({ error: 'Failed to fetch current jackpot game' })
  }
})

// Join current jackpot game
router.post('/join', async (req, res) => {
  try {
    const { userId, items, totalValue } = req.body

    // Validation
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'User ID and items are required' })
    }

    if (!gameService) {
      // Mock response for development
      const mockResponse = {
        success: true,
        gameId: `jp_${Date.now()}`,
        userEntry: {
          userId,
          items,
          totalValue: totalValue || Math.floor(Math.random() * 500) + 100,
          winChance: Math.floor(Math.random() * 40) + 10
        },
        message: 'Successfully joined jackpot'
      }
      return res.json(mockResponse)
    }

    // Get current active game
    const activeJackpots = gameService.getActiveJackpots()
    let gameId: string

    if (activeJackpots.length === 0) {
      // Create new game if none active
      const newGame = await gameService.createJackpotGame()
      gameId = newGame.id
    } else {
      gameId = activeJackpots[0].id
    }

    // Join the game
    const updatedGame = await gameService.joinJackpot(gameId, userId, items)

    res.json({
      success: true,
      gameId: updatedGame.id,
      game: updatedGame,
      message: 'Successfully joined jackpot'
    })

  } catch (error) {
    console.error('Error joining jackpot:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Game not available for joining') {
        return res.status(400).json({ error: 'Jackpot round is no longer accepting participants' })
      }
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' })
      }
    }
    
    res.status(500).json({ error: 'Failed to join jackpot game' })
  }
})

// Start/spin the jackpot
router.post('/spin/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params

    if (!gameService) {
      // Mock response for development
      const mockWinner = {
        userId: 'user_1',
        username: 'ProGamer',
        avatar: '/avatars/player1.jpg',
        items: ['AK-47 | Redline', 'AWP | Dragon Lore'],
        totalValue: 1250.50,
        winChance: 35.2
      }
      
      return res.json({
        success: true,
        winner: mockWinner,
        winAmount: 3551.25,
        gameId,
        message: 'Jackpot completed'
      })
    }

    const result = await gameService.spinJackpot(gameId)

    res.json({
      success: true,
      winner: result.winner,
      winAmount: result.game.totalValue,
      gameId: result.game.id,
      game: result.game,
      message: 'Jackpot completed'
    })

  } catch (error) {
    console.error('Error spinning jackpot:', error)
    
    if (error instanceof Error && error.message === 'Game cannot be spun') {
      return res.status(400).json({ error: 'Game is not in a valid state for spinning' })
    }
    
    res.status(500).json({ error: 'Failed to spin jackpot' })
  }
})

// Get jackpot game history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query

    // Mock history data
    const jackpotHistory = Array.from({ length: Number(limit) }, (_, i) => ({
      id: `jp_${Date.now() - i * 180000}`,
      roundNumber: 1000 - i,
      winner: {
        userId: `user_${Math.floor(Math.random() * 100)}`,
        username: `Player${Math.floor(Math.random() * 100)}`,
        avatar: `/avatars/player${Math.floor(Math.random() * 10) + 1}.jpg`
      },
      totalValue: Math.floor(Math.random() * 5000) + 500,
      participantCount: Math.floor(Math.random() * 10) + 2,
      winChance: Math.floor(Math.random() * 90) + 5,
      items: [
        'AK-47 | Redline',
        'AWP | Dragon Lore',
        'Karambit | Fade',
        'M4A4 | Howl'
      ].slice(0, Math.floor(Math.random() * 4) + 1),
      endTime: new Date(Date.now() - i * 180000),
      provablyFair: {
        serverSeed: `seed_${Math.random().toString(36).substr(2, 16)}`,
        clientSeed: `client_${Math.random().toString(36).substr(2, 8)}`,
        hash: `hash_${Math.random().toString(36).substr(2, 16)}`
      }
    }))

    res.json({
      games: jackpotHistory,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: 1000,
        hasMore: Number(offset) + Number(limit) < 1000
      }
    })

  } catch (error) {
    console.error('Error fetching jackpot history:', error)
    res.status(500).json({ error: 'Failed to fetch jackpot history' })
  }
})

// Get specific jackpot game details
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params

    if (!gameService) {
      // Mock specific game data
      const mockGame = {
        id: gameId,
        roundNumber: Math.floor(Math.random() * 1000),
        participants: [
          {
            userId: 'user_1',
            username: 'ProGamer',
            avatar: '/avatars/player1.jpg',
            items: ['AK-47 | Redline', 'AWP | Dragon Lore'],
            totalValue: 1250.50,
            winChance: 35.2
          },
          {
            userId: 'user_2',
            username: 'SkinCollector', 
            avatar: '/avatars/player2.jpg',
            items: ['Karambit | Fade', 'M4A4 | Howl'],
            totalValue: 2300.75,
            winChance: 64.8
          }
        ],
        totalValue: 3551.25,
        status: 'completed',
        winner: 'user_2',
        endTime: new Date(Date.now() - 60000),
        provablyFair: {
          serverSeed: `seed_${Math.random().toString(36).substr(2, 16)}`,
          clientSeed: `client_${Math.random().toString(36).substr(2, 8)}`,
          hash: `hash_${Math.random().toString(36).substr(2, 16)}`
        }
      }
      
      return res.json(mockGame)
    }

    const game = gameService.getJackpotGame(gameId)
    
    if (!game) {
      return res.status(404).json({ error: 'Jackpot game not found' })
    }

    res.json({
      ...game,
      provablyFair: {
        serverSeed: `seed_${Math.random().toString(36).substr(2, 16)}`,
        clientSeed: `client_${Math.random().toString(36).substr(2, 8)}`,
        hash: `hash_${Math.random().toString(36).substr(2, 16)}`
      }
    })

  } catch (error) {
    console.error('Error fetching jackpot game:', error)
    res.status(500).json({ error: 'Failed to fetch jackpot game' })
  }
})

// Get jackpot statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      totalGames: Math.floor(Math.random() * 10000) + 5000,
      totalValueWon: Math.floor(Math.random() * 1000000) + 500000,
      averagePot: Math.floor(Math.random() * 2000) + 800,
      biggestPot: {
        amount: Math.floor(Math.random() * 50000) + 10000,
        winner: 'LegendaryPlayer',
        date: new Date(Date.now() - Math.random() * 86400000 * 30),
        gameId: `jp_legendary_${Date.now()}`
      },
      recentWinners: Array.from({ length: 5 }, (_, i) => ({
        username: `Winner${i + 1}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        winChance: Math.floor(Math.random() * 80) + 10,
        date: new Date(Date.now() - i * 300000)
      })),
      dailyStats: {
        gamesPlayed: Math.floor(Math.random() * 100) + 20,
        totalValue: Math.floor(Math.random() * 50000) + 10000,
        uniqueParticipants: Math.floor(Math.random() * 200) + 50,
        averageParticipants: Math.floor(Math.random() * 8) + 3
      }
    }

    res.json(stats)

  } catch (error) {
    console.error('Error fetching jackpot stats:', error)
    res.status(500).json({ error: 'Failed to fetch jackpot statistics' })
  }
})

export default router 