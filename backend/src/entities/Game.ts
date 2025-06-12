import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

export enum GameType {
  COINFLIP = 'coinflip',
  CRASH = 'crash',
  JACKPOT = 'jackpot',
  ROULETTE = 'roulette',
  BLACKJACK = 'blackjack',
  TOURNAMENT = 'tournament'
}

export enum GameStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum GameResult {
  WIN = 'win',
  LOSS = 'loss',
  PUSH = 'push',
  CANCELLED = 'cancelled'
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50 })
  type: 'CRASH' | 'COINFLIP' | 'ROULETTE' | 'BLACKJACK' | 'JACKPOT'

  @Column({
    type: 'varchar',
    length: 50,
    default: GameStatus.PENDING
  })
  status: GameStatus

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  betAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  winAmount: number

  @Column({ type: 'real', nullable: true })
  multiplier: number

  @Column({ type: 'varchar', length: 50 })
  result: 'WIN' | 'LOSS' | 'PUSH' | 'PLAYING'

  @Column({ type: 'varchar', length: 255, nullable: true })
  serverSeed: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientSeed: string

  @Column({ type: 'integer', nullable: true })
  nonce: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  fairnessHash: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  gameHash: string

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date

  @Column({ type: 'text', nullable: true })
  gameData: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.games)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ type: 'uuid' })
  userId: string

  // Virtual properties
  get duration(): number | null {
    if (!this.startedAt || !this.completedAt) return null
    return this.completedAt.getTime() - this.startedAt.getTime()
  }

  get isActive(): boolean {
    return this.status === GameStatus.ACTIVE
  }

  get isCompleted(): boolean {
    return this.status === GameStatus.COMPLETED
  }

  get profit(): number {
    if (!this.winAmount) return -this.betAmount
    return this.winAmount - this.betAmount
  }

  // Helper methods for gameData JSON
  getGameData(): Record<string, any> {
    try {
      return JSON.parse(this.gameData || '{}')
    } catch {
      return {}
    }
  }

  setGameData(data: Record<string, any>) {
    this.gameData = JSON.stringify(data)
  }
} 