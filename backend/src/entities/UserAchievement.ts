import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Achievement } from './Achievement'

@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'jsonb', default: {} })
  progress: Record<string, any>

  @Column({ default: false })
  isCompleted: boolean

  @Column({ nullable: true })
  completedAt: Date

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rewardClaimed: number

  @CreateDateColumn()
  createdAt: Date

  // Relations
  @ManyToOne(() => User, user => user.achievements)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @ManyToOne(() => Achievement, achievement => achievement.userAchievements)
  @JoinColumn({ name: 'achievementId' })
  achievement: Achievement

  @Column()
  achievementId: string

  // Virtual properties
  get progressPercentage(): number {
    if (!this.achievement?.requirements || this.isCompleted) return 100
    
    const requirements = this.achievement.requirements
    let totalProgress = 0
    let totalRequirements = 0

    for (const [key, required] of Object.entries(requirements)) {
      const current = this.progress[key] || 0
      totalProgress += Math.min(current / (required as number), 1)
      totalRequirements += 1
    }

    return totalRequirements > 0 ? (totalProgress / totalRequirements) * 100 : 0
  }
} 