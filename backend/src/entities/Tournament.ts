import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum TournamentType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  SWISS = 'swiss',
  ROUND_ROBIN = 'round_robin'
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  REGISTRATION = 'registration',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({
    type: 'enum',
    enum: TournamentType
  })
  type: TournamentType

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.UPCOMING
  })
  status: TournamentStatus

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  entryFee: number

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  prizePool: number

  @Column({ default: 0 })
  maxParticipants: number

  @Column({ default: 0 })
  currentParticipants: number

  @Column({ type: 'jsonb', default: [] })
  participants: string[]

  @Column({ type: 'jsonb', default: {} })
  brackets: Record<string, any>

  @Column({ type: 'jsonb', default: {} })
  results: Record<string, any>

  @Column()
  startTime: Date

  @Column({ nullable: true })
  endTime: Date

  @Column()
  registrationStart: Date

  @Column()
  registrationEnd: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Virtual properties
  get isRegistrationOpen(): boolean {
    const now = new Date()
    return this.status === TournamentStatus.REGISTRATION &&
           now >= this.registrationStart &&
           now <= this.registrationEnd &&
           this.currentParticipants < this.maxParticipants
  }

  get isFull(): boolean {
    return this.currentParticipants >= this.maxParticipants
  }

  get isActive(): boolean {
    return this.status === TournamentStatus.ACTIVE
  }

  get isCompleted(): boolean {
    return this.status === TournamentStatus.COMPLETED
  }
} 