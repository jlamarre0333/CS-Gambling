import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

export enum ChatType {
  GENERAL = 'general',
  GAME = 'game',
  VIP = 'vip',
  PRIVATE = 'private',
  SYSTEM = 'system'
}

export enum MessageStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  MODERATED = 'moderated'
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  content!: string

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.GENERAL
  })
  chatType!: ChatType

  @Column({ type: 'varchar', nullable: true })
  roomId!: string

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.ACTIVE
  })
  status!: MessageStatus

  @Column({ type: 'varchar', nullable: true })
  replyToId!: string

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>

  @Column({ type: 'varchar', nullable: true })
  moderatedBy!: string

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt!: Date

  @Column({ type: 'varchar', nullable: true })
  moderationReason!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // Relations
  @ManyToOne(() => User, user => user.chatMessages)
  @JoinColumn({ name: 'userId' })
  user!: User

  @Column({ type: 'varchar' })
  userId!: string

  // Virtual properties
  get isDeleted(): boolean {
    return this.status === MessageStatus.DELETED
  }

  get isModerated(): boolean {
    return this.status === MessageStatus.MODERATED
  }

  get isActive(): boolean {
    return this.status === MessageStatus.ACTIVE
  }
} 