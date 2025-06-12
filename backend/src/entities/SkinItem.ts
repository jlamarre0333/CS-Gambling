import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum SkinRarity {
  CONSUMER = 'consumer',
  INDUSTRIAL = 'industrial',
  MIL_SPEC = 'mil_spec',
  RESTRICTED = 'restricted',
  CLASSIFIED = 'classified',
  COVERT = 'covert',
  CONTRABAND = 'contraband'
}

export enum SkinCondition {
  FACTORY_NEW = 'factory_new',
  MINIMAL_WEAR = 'minimal_wear',
  FIELD_TESTED = 'field_tested',
  WELL_WORN = 'well_worn',
  BATTLE_SCARRED = 'battle_scarred'
}

export enum SkinStatus {
  AVAILABLE = 'available',
  DEPOSITED = 'deposited',
  WITHDRAWN = 'withdrawn',
  LOCKED = 'locked'
}

@Entity('skin_items')
export class SkinItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  steamItemId: string

  @Column()
  name: string

  @Column()
  marketName: string

  @Column()
  imageUrl: string

  @Column({
    type: 'enum',
    enum: SkinRarity
  })
  rarity: SkinRarity

  @Column({
    type: 'enum',
    enum: SkinCondition
  })
  condition: SkinCondition

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  floatValue: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marketPrice: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sitePrice: number

  @Column({
    type: 'enum',
    enum: SkinStatus,
    default: SkinStatus.AVAILABLE
  })
  status: SkinStatus

  @Column({ nullable: true })
  userId: string

  @Column({ nullable: true })
  transactionId: string

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Virtual properties
  get rarityMultiplier(): number {
    const multipliers = {
      [SkinRarity.CONSUMER]: 1.0,
      [SkinRarity.INDUSTRIAL]: 1.1,
      [SkinRarity.MIL_SPEC]: 1.2,
      [SkinRarity.RESTRICTED]: 1.4,
      [SkinRarity.CLASSIFIED]: 1.7,
      [SkinRarity.COVERT]: 2.0,
      [SkinRarity.CONTRABAND]: 3.0
    }
    return multipliers[this.rarity]
  }

  get conditionMultiplier(): number {
    const multipliers = {
      [SkinCondition.FACTORY_NEW]: 1.0,
      [SkinCondition.MINIMAL_WEAR]: 0.95,
      [SkinCondition.FIELD_TESTED]: 0.85,
      [SkinCondition.WELL_WORN]: 0.7,
      [SkinCondition.BATTLE_SCARRED]: 0.5
    }
    return multipliers[this.condition]
  }

  get finalPrice(): number {
    return this.marketPrice * this.rarityMultiplier * this.conditionMultiplier
  }

  get isAvailable(): boolean {
    return this.status === SkinStatus.AVAILABLE
  }

  get isDeposited(): boolean {
    return this.status === SkinStatus.DEPOSITED
  }
} 