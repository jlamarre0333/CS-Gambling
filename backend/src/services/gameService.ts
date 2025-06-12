export interface GameResult {
  gameId: string
  userId: string
  gameType: string
  betAmount: number
  winAmount: number
  items: string[]
  result: any
  timestamp: Date
}

export interface JackpotGame {
  id: string
  participants: JackpotParticipant[]
  totalValue: number
  status: 'waiting' | 'spinning' | 'completed'
  winner?: string
  endTime: Date
  roundNumber: number
}

export interface JackpotParticipant {
  userId: string
  username: string
  avatar: string
  items: string[]
  totalValue: number
  winChance: number
}

export interface CrashGame {
  id: string
  multiplier: number
  status: 'betting' | 'flying' | 'crashed'
  crashPoint?: number
  startTime: Date
  participants: CrashParticipant[]
}

export interface CrashParticipant {
  userId: string
  username: string
  betAmount: number
  cashoutMultiplier?: number
  winAmount?: number
}

export class GameService {
  private prisma: any
  private activeJackpots: Map<string, JackpotGame> = new Map()
  private activeCrashGames: Map<string, CrashGame> = new Map()

  constructor(prisma: any) {
    this.prisma = prisma
  }

  // Jackpot Game Methods
  async createJackpotGame(): Promise<JackpotGame> {
    const gameId = this.generateGameId()
    const roundNumber = await this.getNextRoundNumber('jackpot')
    
    const jackpotGame: JackpotGame = {
      id: gameId,
      participants: [],
      totalValue: 0,
      status: 'waiting',
      endTime: new Date(Date.now() + 60000), // 1 minute from now
      roundNumber
    }

    this.activeJackpots.set(gameId, jackpotGame)
    return jackpotGame
  }

  async joinJackpot(gameId: string, userId: string, items: string[]): Promise<JackpotGame> {
    const game = this.activeJackpots.get(gameId)
    if (!game || game.status !== 'waiting') {
      throw new Error('Game not available for joining')
    }

    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Calculate total value of items
    const totalValue = await this.calculateItemsValue(items)

    // Check if user already in game
    const existingParticipant = game.participants.find(p => p.userId === userId)
    if (existingParticipant) {
      // Update existing participant
      existingParticipant.items.push(...items)
      existingParticipant.totalValue += totalValue
    } else {
      // Add new participant
      game.participants.push({
        userId,
        username: user.username,
        avatar: user.avatar,
        items,
        totalValue,
        winChance: 0 // Will be calculated later
      })
    }

    game.totalValue += totalValue
    this.calculateWinChances(game)

    // Save to database
    await this.saveGameToDatabase(game)

    return game
  }

  async spinJackpot(gameId: string): Promise<{ winner: JackpotParticipant; game: JackpotGame }> {
    const game = this.activeJackpots.get(gameId)
    if (!game || game.status !== 'waiting') {
      throw new Error('Game cannot be spun')
    }

    game.status = 'spinning'

    // Determine winner using weighted random selection
    const winner = this.selectJackpotWinner(game.participants)
    game.winner = winner.userId
    game.status = 'completed'

    // Update database with results
    await this.saveGameResult({
      gameId,
      userId: winner.userId,
      gameType: 'jackpot',
      betAmount: winner.totalValue,
      winAmount: game.totalValue,
      items: game.participants.flatMap(p => p.items),
      result: { winner: winner.userId, totalParticipants: game.participants.length },
      timestamp: new Date()
    })

    // Update user balance
    await this.prisma.user.update({
      where: { id: winner.userId },
      data: {
        balance: { increment: game.totalValue },
        totalWon: { increment: game.totalValue },
        gamesPlayed: { increment: 1 }
      }
    })

    return { winner, game }
  }

  // Crash Game Methods
  async createCrashGame(): Promise<CrashGame> {
    const gameId = this.generateGameId()
    const crashPoint = this.generateCrashPoint()
    
    const crashGame: CrashGame = {
      id: gameId,
      multiplier: 1.0,
      status: 'betting',
      crashPoint,
      startTime: new Date(Date.now() + 10000), // 10 seconds from now
      participants: []
    }

    this.activeCrashGames.set(gameId, crashGame)
    
    // Schedule game start
    setTimeout(() => {
      this.startCrashGame(gameId)
    }, 10000)

    return crashGame
  }

  async joinCrashGame(gameId: string, userId: string, betAmount: number): Promise<CrashGame> {
    const game = this.activeCrashGames.get(gameId)
    if (!game || game.status !== 'betting') {
      throw new Error('Game not available for betting')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.balance < betAmount) {
      throw new Error('Insufficient balance')
    }

    // Add participant
    game.participants.push({
      userId,
      username: user.username,
      betAmount
    })

    // Deduct bet amount from user balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: { decrement: betAmount },
        totalWagered: { increment: betAmount }
      }
    })

    return game
  }

  async cashoutCrash(gameId: string, userId: string): Promise<number> {
    const game = this.activeCrashGames.get(gameId)
    if (!game || game.status !== 'flying') {
      throw new Error('Cannot cashout at this time')
    }

    const participant = game.participants.find(p => p.userId === userId)
    if (!participant || participant.cashoutMultiplier) {
      throw new Error('Invalid cashout attempt')
    }

    participant.cashoutMultiplier = game.multiplier
    participant.winAmount = participant.betAmount * game.multiplier

    // Update user balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: { increment: participant.winAmount },
        totalWon: { increment: participant.winAmount }
      }
    })

    return participant.winAmount
  }

  // Helper Methods
  private calculateWinChances(game: JackpotGame): void {
    game.participants.forEach(participant => {
      participant.winChance = (participant.totalValue / game.totalValue) * 100
    })
  }

  private selectJackpotWinner(participants: JackpotParticipant[]): JackpotParticipant {
    const totalValue = participants.reduce((sum, p) => sum + p.totalValue, 0)
    const random = Math.random() * totalValue
    
    let currentSum = 0
    for (const participant of participants) {
      currentSum += participant.totalValue
      if (random <= currentSum) {
        return participant
      }
    }
    
    return participants[participants.length - 1] // Fallback
  }

  private generateCrashPoint(): number {
    // Generate crash point using house edge
    const random = Math.random()
    return Math.max(1.0, 1 / (1 - random * 0.96)) // 4% house edge
  }

  private async startCrashGame(gameId: string): Promise<void> {
    const game = this.activeCrashGames.get(gameId)
    if (!game) return

    game.status = 'flying'
    
    // Simulate crash game progression
    const interval = setInterval(() => {
      game.multiplier += 0.01
      
      if (game.multiplier >= game.crashPoint!) {
        game.status = 'crashed'
        clearInterval(interval)
        this.endCrashGame(gameId)
      }
    }, 100)
  }

  private async endCrashGame(gameId: string): Promise<void> {
    const game = this.activeCrashGames.get(gameId)
    if (!game) return

    // Process remaining participants (those who didn't cashout)
    for (const participant of game.participants) {
      if (!participant.cashoutMultiplier) {
        // Player didn't cashout - they lose their bet
        await this.saveGameResult({
          gameId,
          userId: participant.userId,
          gameType: 'crash',
          betAmount: participant.betAmount,
          winAmount: 0,
          items: [],
          result: { crashPoint: game.crashPoint, cashout: false },
          timestamp: new Date()
        })
      }
    }

    this.activeCrashGames.delete(gameId)
  }

  private async calculateItemsValue(items: string[]): Promise<number> {
    // This would typically fetch from database or Steam API
    // For now, return random value
    return items.length * (50 + Math.random() * 200)
  }

  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getNextRoundNumber(gameType: string): Promise<number> {
    const lastGame = await this.prisma.gameHistory.findFirst({
      where: { gameType },
      orderBy: { createdAt: 'desc' }
    })
    
    return (lastGame?.roundNumber || 0) + 1
  }

  private async saveGameToDatabase(game: JackpotGame): Promise<void> {
    await this.prisma.game.upsert({
      where: { id: game.id },
      update: {
        participants: JSON.stringify(game.participants),
        totalValue: game.totalValue,
        status: game.status
      },
      create: {
        id: game.id,
        type: 'jackpot',
        participants: JSON.stringify(game.participants),
        totalValue: game.totalValue,
        status: game.status,
        roundNumber: game.roundNumber
      }
    })
  }

  private async saveGameResult(result: GameResult): Promise<void> {
    await this.prisma.gameHistory.create({
      data: {
        gameId: result.gameId,
        userId: result.userId,
        gameType: result.gameType,
        betAmount: result.betAmount,
        winAmount: result.winAmount,
        items: JSON.stringify(result.items),
        result: JSON.stringify(result.result)
      }
    })
  }

  // Public getters
  getActiveJackpots(): JackpotGame[] {
    return Array.from(this.activeJackpots.values())
  }

  getActiveCrashGames(): CrashGame[] {
    return Array.from(this.activeCrashGames.values())
  }

  getJackpotGame(gameId: string): JackpotGame | undefined {
    return this.activeJackpots.get(gameId)
  }

  getCrashGame(gameId: string): CrashGame | undefined {
    return this.activeCrashGames.get(gameId)
  }
} 