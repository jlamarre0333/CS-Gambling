import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { UserAchievement } from './UserAchievement'

export enum AchievementCategory {
  BEGINNER = 'beginner',
  VETERAN = 'veteran',
  HIGH_ROLLER = 'high_roller',
  LUCKY_STREAKS = 'lucky_streaks',
  SOCIAL = 'social',
  SPECIAL = 'special'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  key: string

  @Column()
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({
    type: 'enum',
    enum: AchievementCategory
  })
  category: AchievementCategory

  @Column({
    type: 'enum',
    enum: AchievementRarity,
    default: AchievementRarity.COMMON
  })
  rarity: AchievementRarity

  @Column()
  icon: string

  @Column({ default: 0 })
  points: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rewardAmount: number

  @Column({ type: 'jsonb', default: {} })
  requirements: Record<string, any>

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isSecret: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @OneToMany(() => UserAchievement, userAchievement => userAchievement.achievement)
  userAchievements: UserAchievement[]

  // Virtual properties
  get difficultyScore(): number {
    const rarityScores = {
      [AchievementRarity.COMMON]: 1,
      [AchievementRarity.UNCOMMON]: 2,
      [AchievementRarity.RARE]: 3,
      [AchievementRarity.EPIC]: 4,
      [AchievementRarity.LEGENDARY]: 5
    }
    return rarityScores[this.rarity]
  }
} 