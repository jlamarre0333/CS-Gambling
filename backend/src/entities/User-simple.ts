import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum UserRole {
  USER = 'user',
  VIP = 'vip',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  steamId: string

  @Column({ type: 'varchar', length: 255 })
  username: string

  @Column({ type: 'text' })
  avatar: string

  @Column({ type: 'real', default: 0 })
  balance: number

  @Column({ type: 'real', default: 0 })
  totalWagered: number

  @Column({ type: 'real', default: 0 })
  totalWon: number

  @Column({ type: 'integer', default: 0 })
  gamesPlayed: number

  @Column({ type: 'integer', default: 1 })
  level: number

  @Column({ type: 'integer', default: 0 })
  experience: number

  @Column({ type: 'varchar', length: 50, default: UserRole.USER })
  role: UserRole

  @Column({ type: 'varchar', length: 50, default: UserStatus.ACTIVE })
  status: UserStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string

  @Column({ type: 'text', default: '{}' })
  preferences: string  // Store as JSON string

  @Column({ type: 'text', default: '{}' })
  statistics: string   // Store as JSON string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Virtual properties
  get winRate(): number {
    if (this.gamesPlayed === 0) return 0
    const stats = this.getStatistics()
    const wins = stats?.wins || 0
    return Math.round((wins / this.gamesPlayed) * 100 * 100) / 100
  }

  get netProfit(): number {
    return this.totalWon - this.totalWagered
  }

  get isVip(): boolean {
    return this.role === UserRole.VIP || this.role === UserRole.MODERATOR || this.role === UserRole.ADMIN
  }

  get isModerator(): boolean {
    return this.role === UserRole.MODERATOR || this.role === UserRole.ADMIN
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN
  }

  // Helper methods for JSON fields
  getPreferences(): Record<string, any> {
    try {
      return JSON.parse(this.preferences || '{}')
    } catch {
      return {}
    }
  }

  setPreferences(data: Record<string, any>) {
    this.preferences = JSON.stringify(data)
  }

  getStatistics(): Record<string, any> {
    try {
      return JSON.parse(this.statistics || '{}')
    } catch {
      return {}
    }
  }

  setStatistics(data: Record<string, any>) {
    this.statistics = JSON.stringify(data)
  }
} 