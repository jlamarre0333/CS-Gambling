import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  GAME_WIN = 'game_win',
  GAME_LOSS = 'game_loss',
  REFERRAL_BONUS = 'referral_bonus',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  SKIN_DEPOSIT = 'skin_deposit',
  SKIN_WITHDRAWAL = 'skin_withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  STEAM_TRADE = 'steam_trade',
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalTransactionId: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  gameId: string

  @Column({ type: 'varchar', length: 50 })
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET_WIN' | 'BET_LOSS' | 'REFUND' | 'BONUS' | 'RAKE'

  @Column({ type: 'varchar', length: 50 })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PROCESSING'

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: 'STEAM_TRADE' | 'CRYPTO_BTC' | 'CRYPTO_ETH' | 'PAYPAL' | 'STRIPE' | 'BANK_TRANSFER' | 'GIFT_CARD'

  @Column({ type: 'text', nullable: true })
  adminNote: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User)
  user: User

  // Virtual properties
  get isDeposit(): boolean {
    return this.type === TransactionType.DEPOSIT || this.type === TransactionType.SKIN_DEPOSIT
  }

  get isWithdrawal(): boolean {
    return this.type === TransactionType.WITHDRAWAL || this.type === TransactionType.SKIN_WITHDRAWAL
  }

  get isGameRelated(): boolean {
    return this.type === TransactionType.GAME_WIN || this.type === TransactionType.GAME_LOSS
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING
  }

  get isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED
  }
} 