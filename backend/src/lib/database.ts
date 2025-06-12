import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export default prisma

// Database connection helper
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database query test passed')
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect()
  console.log('📤 Database disconnected')
}

// Health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }
  }
}

// User operations
export class UserService {
  static async createUser(data: {
    username: string
    steamId?: string
    email?: string
    avatar?: string
  }) {
    return await prisma.user.create({
      data: {
        username: data.username,
        steamId: data.steamId,
        email: data.email,
        avatar: data.avatar,
      }
    })
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        games: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async findUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username }
    })
  }

  static async updateUserBalance(id: string, amount: number) {
    return await prisma.user.update({
      where: { id },
      data: {
        balance: {
          increment: amount
        }
      }
    })
  }

  static async getUserStats(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        games: true,
        transactions: true
      }
    })

    if (!user) return null

    const stats = {
      totalGames: user.games.length,
      totalWins: user.games.filter(g => g.result === 'WIN' || g.result === 'BLACKJACK').length,
      totalLosses: user.games.filter(g => g.result === 'LOSS').length,
      totalWagered: user.games.reduce((sum, g) => sum + Number(g.betAmount), 0),
      totalWon: user.games.reduce((sum, g) => sum + Number(g.winAmount), 0),
      winRate: user.games.length > 0 ? 
        (user.games.filter(g => g.result === 'WIN' || g.result === 'BLACKJACK').length / user.games.length) * 100 
        : 0
    }

    return { user, stats }
  }
}

// Game operations
export class GameService {
  static async createGame(data: {
    userId: string
    gameType: string
    betAmount: number
    winAmount?: number
    multiplier?: number
    result: string
    gameData?: any
  }) {
    return await prisma.game.create({
      data: {
        userId: data.userId,
        gameType: data.gameType as any,
        betAmount: data.betAmount,
        winAmount: data.winAmount || 0,
        multiplier: data.multiplier || 0,
        result: data.result as any,
        gameData: data.gameData
      }
    })
  }

  static async getUserGameHistory(userId: string, gameType?: string, limit = 50) {
    return await prisma.game.findMany({
      where: {
        userId,
        ...(gameType && { gameType: gameType as any })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        }
      }
    })
  }

  static async getGameStats() {
    const totalGames = await prisma.game.count()
    const totalWagered = await prisma.game.aggregate({
      _sum: { betAmount: true }
    })
    const totalWon = await prisma.game.aggregate({
      _sum: { winAmount: true }
    })

    return {
      totalGames,
      totalWagered: Number(totalWagered._sum.betAmount || 0),
      totalWon: Number(totalWon._sum.winAmount || 0),
      houseEdge: totalWagered._sum.betAmount ? 
        ((Number(totalWagered._sum.betAmount) - Number(totalWon._sum.winAmount)) / Number(totalWagered._sum.betAmount)) * 100 
        : 0
    }
  }

  static async getLeaderboard(limit = 10) {
    return await prisma.user.findMany({
      orderBy: [
        { totalWon: 'desc' },
        { gamesPlayed: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        username: true,
        avatar: true,
        totalWon: true,
        totalWagered: true,
        gamesPlayed: true,
        winStreak: true,
        maxWinStreak: true
      }
    })
  }
}

// Transaction operations
export class TransactionService {
  static async createTransaction(data: {
    userId: string
    type: string
    amount: number
    description?: string
    metadata?: any
  }) {
    return await prisma.transaction.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        amount: data.amount,
        description: data.description,
        metadata: data.metadata,
        status: 'COMPLETED' // For now, auto-complete
      }
    })
  }

  static async getUserTransactions(userId: string, limit = 50) {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }
} 