import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Game } from './Game'
import { Transaction } from './Transaction'
import { ChatMessage } from './ChatMessage'
import { UserAchievement } from './UserAchievement'

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
  id!: string

  @Column({ type: 'varchar', unique: true })
  steamId!: string

  @Column({ type: 'varchar' })
  username!: string

  @Column({ type: 'varchar' })
  avatar!: string

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance!: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalWagered!: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalWon!: number

  @Column({ type: 'int', default: 0 })
  gamesPlayed!: number

  @Column({ type: 'int', default: 1 })
  level!: number

  @Column({ type: 'int', default: 0 })
  experience!: number

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status!: UserStatus

  @Column({ type: 'varchar', nullable: true })
  email!: string

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled!: boolean

  @Column({ type: 'varchar', nullable: true })
  twoFactorSecret!: string

  @Column({ type: 'varchar', nullable: true })
  lastLoginIp!: string

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date

  @Column({ type: 'int', default: 0 })
  loginCount!: number

  @Column({ type: 'jsonb', default: {} })
  preferences!: Record<string, any>

  @Column({ type: 'jsonb', default: {} })
  statistics!: Record<string, any>

  @Column({ type: 'varchar', nullable: true })
  referredBy!: string

  @Column({ type: 'int', default: 0 })
  referralCount!: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  referralEarnings!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // Relations
  @OneToMany(() => Game, game => game.user)
  games!: Game[]

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions!: Transaction[]

  @OneToMany(() => ChatMessage, message => message.user)
  chatMessages!: ChatMessage[]

  @OneToMany(() => UserAchievement, userAchievement => userAchievement.user)
  achievements!: UserAchievement[]

  // Virtual properties
  get winRate(): number {
    if (this.gamesPlayed === 0) return 0
    const wins = this.statistics?.wins || 0
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
} 