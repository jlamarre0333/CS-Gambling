// Mock API for Guest Mode MVP
// Simulates backend responses for testing games without real server

export interface MockGameResult {
  success: boolean
  result: any
  newBalance: number
  winAmount: number
  lossAmount: number
}

export interface MockUser {
  id: string
  username: string
  balance: number
  avatar: string
  isGuest: boolean
}

class MockAPI {
  private static instance: MockAPI
  
  private constructor() {}
  
  public static getInstance(): MockAPI {
    if (!MockAPI.instance) {
      MockAPI.instance = new MockAPI()
    }
    return MockAPI.instance
  }

  // Simulate network delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Coinflip game simulation
  async playCoinflip(betAmount: number, choice: 'heads' | 'tails'): Promise<MockGameResult> {
    await this.delay(1000) // Simulate flip animation time
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails'
    const won = result === choice
    const winAmount = won ? betAmount * 1.98 : 0
    const lossAmount = won ? 0 : betAmount
    
    return {
      success: true,
      result: { outcome: result, won },
      newBalance: 0, // Will be calculated by context
      winAmount,
      lossAmount
    }
  }

  // Crash game simulation
  async playCrash(betAmount: number, cashOutAt?: number): Promise<MockGameResult> {
    await this.delay(2000) // Simulate crash game time
    
    // Generate crash point (weighted towards lower multipliers)
    const random = Math.random()
    let crashPoint: number
    
    if (random < 0.5) {
      crashPoint = 1 + Math.random() * 2 // 1.0x - 3.0x (50% chance)
    } else if (random < 0.8) {
      crashPoint = 3 + Math.random() * 7 // 3.0x - 10.0x (30% chance)
    } else {
      crashPoint = 10 + Math.random() * 40 // 10.0x - 50.0x (20% chance)
    }
    
    const targetCashOut = cashOutAt || (1.5 + Math.random() * 2) // Auto cash out between 1.5x-3.5x
    const won = crashPoint >= targetCashOut
    const winAmount = won ? betAmount * targetCashOut : 0
    const lossAmount = won ? 0 : betAmount
    
    return {
      success: true,
      result: { 
        crashPoint: Number(crashPoint.toFixed(2)), 
        cashOutAt: Number(targetCashOut.toFixed(2)),
        won 
      },
      newBalance: 0,
      winAmount,
      lossAmount
    }
  }

  // Roulette game simulation
  async playRoulette(betAmount: number, betType: 'red' | 'black' | 'green'): Promise<MockGameResult> {
    await this.delay(3000) // Simulate wheel spin time
    
    // Roulette probabilities: Red/Black ~47.37%, Green ~5.26%
    const random = Math.random()
    let result: { number: number; color: string }
    
    if (random < 0.0526) {
      // Green (0)
      result = { number: 0, color: 'green' }
    } else if (random < 0.5263) {
      // Red numbers
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
      result = { 
        number: redNumbers[Math.floor(Math.random() * redNumbers.length)], 
        color: 'red' 
      }
    } else {
      // Black numbers
      const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
      result = { 
        number: blackNumbers[Math.floor(Math.random() * blackNumbers.length)], 
        color: 'black' 
      }
    }
    
    const won = result.color === betType
    let multiplier = 1.98 // Red/Black
    if (betType === 'green') multiplier = 14
    
    const winAmount = won ? betAmount * multiplier : 0
    const lossAmount = won ? 0 : betAmount
    
    return {
      success: true,
      result,
      newBalance: 0,
      winAmount,
      lossAmount
    }
  }

  // Jackpot simulation (simplified)
  async joinJackpot(betAmount: number): Promise<MockGameResult> {
    await this.delay(1500)
    
    // Simulate joining a jackpot with random chance to win
    const participants = Math.floor(Math.random() * 8) + 2 // 2-10 participants
    const totalPot = betAmount * participants
    const winChance = betAmount / totalPot // Your chance based on contribution
    
    const won = Math.random() < winChance
    const winAmount = won ? totalPot * 0.95 : 0 // 5% house edge
    const lossAmount = won ? 0 : betAmount
    
    return {
      success: true,
      result: { 
        won, 
        totalPot, 
        participants, 
        winChance: (winChance * 100).toFixed(1) + '%' 
      },
      newBalance: 0,
      winAmount,
      lossAmount
    }
  }

  // Get mock leaderboard
  async getLeaderboard(): Promise<any[]> {
    await this.delay(300)
    
    const mockPlayers = [
      { username: 'SkinMaster_2024', totalWon: 15420.50, gamesPlayed: 234 },
      { username: 'CS2_Legend', totalWon: 12890.25, gamesPlayed: 189 },
      { username: 'CrashKing', totalWon: 11567.80, gamesPlayed: 156 },
      { username: 'RouletteQueen', totalWon: 9834.15, gamesPlayed: 203 },
      { username: 'JackpotHunter', totalWon: 8765.90, gamesPlayed: 145 },
      { username: 'FlipMaster', totalWon: 7654.30, gamesPlayed: 178 },
      { username: 'SkinCollector', totalWon: 6543.20, gamesPlayed: 134 },
      { username: 'BetLegend', totalWon: 5432.10, gamesPlayed: 167 }
    ]
    
    return mockPlayers
  }

  // Get mock recent games
  async getRecentGames(): Promise<any[]> {
    await this.delay(200)
    
    const games = ['Coinflip', 'Crash', 'Roulette', 'Jackpot']
    const mockGames = []
    
    for (let i = 0; i < 10; i++) {
      mockGames.push({
        id: `game_${Date.now()}_${i}`,
        game: games[Math.floor(Math.random() * games.length)],
        player: `Player_${Math.floor(Math.random() * 9999)}`,
        amount: Math.floor(Math.random() * 500) + 10,
        won: Math.random() > 0.5,
        timestamp: new Date(Date.now() - Math.random() * 3600000) // Last hour
      })
    }
    
    return mockGames.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
}

export const mockAPI = MockAPI.getInstance() 