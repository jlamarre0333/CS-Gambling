import { Server as SocketIOServer } from 'socket.io'

export interface Notification {
  id: string
  type: 'big_win' | 'jackpot' | 'new_round' | 'achievement' | 'friend_activity' | 'system' | 'warning' | 'success' | 'info'
  title: string
  message: string
  avatar?: string
  amount?: number
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    url: string
  }
  metadata?: {
    game?: string
    user?: string
    round?: number
    timestamp?: Date
  }
}

export class NotificationService {
  private io: SocketIOServer

  constructor(io: SocketIOServer) {
    this.io = io
  }

  // Send notification to all connected clients
  broadcastNotification(notification: Notification): void {
    this.io.emit('notification', {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    })
  }

  // Send notification to specific user
  sendToUser(userId: string, notification: Notification): void {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    })
  }

  // Send notification to specific room/game
  sendToRoom(room: string, notification: Notification): void {
    this.io.to(room).emit('notification', {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    })
  }

  // Predefined notification creators
  createBigWinNotification(winner: string, amount: number, game: string, avatar?: string): Notification {
    return {
      id: this.generateId(),
      type: 'big_win',
      title: 'BIG WIN! 🎉',
      message: `${winner} just won big!`,
      avatar,
      amount,
      duration: 8000,
      metadata: {
        game,
        user: winner,
        timestamp: new Date()
      }
    }
  }

  createJackpotNotification(winner: string, amount: number, round: number, avatar?: string): Notification {
    return {
      id: this.generateId(),
      type: 'jackpot',
      title: 'JACKPOT WINNER! 🎰',
      message: `${winner} hit the jackpot!`,
      avatar,
      amount,
      duration: 10000,
      metadata: {
        game: 'Jackpot',
        user: winner,
        round,
        timestamp: new Date()
      }
    }
  }

  createNewRoundNotification(game: string, round: number, potValue?: number): Notification {
    return {
      id: this.generateId(),
      type: 'new_round',
      title: 'New Round Started! 🔄',
      message: `${game} Round #${round} is now open for bets!`,
      amount: potValue,
      duration: 4000,
      metadata: {
        game,
        round,
        timestamp: new Date()
      },
      action: {
        label: 'Join Now',
        url: `/${game.toLowerCase()}`
      }
    }
  }

  createAchievementNotification(title: string, description: string, reward?: string): Notification {
    return {
      id: this.generateId(),
      type: 'achievement',
      title: `Achievement Unlocked! 🏆`,
      message: `${title}: ${description}`,
      duration: 6000,
      metadata: {
        timestamp: new Date()
      },
      action: reward ? {
        label: 'Claim Reward',
        url: '/profile/achievements'
      } : undefined
    }
  }

  createSystemNotification(title: string, message: string, type: 'system' | 'warning' | 'info' = 'system'): Notification {
    return {
      id: this.generateId(),
      type,
      title,
      message,
      duration: type === 'warning' ? 10000 : 6000,
      metadata: {
        timestamp: new Date()
      }
    }
  }

  // Game-specific notifications
  notifyJackpotWin(winner: string, amount: number, round: number, avatar?: string): void {
    const notification = this.createJackpotNotification(winner, amount, round, avatar)
    this.broadcastNotification(notification)

    // Also send big win notification if amount is significant
    if (amount > 1000) {
      const bigWinNotification = this.createBigWinNotification(winner, amount, 'Jackpot', avatar)
      this.broadcastNotification(bigWinNotification)
    }
  }

  notifyNewJackpotRound(round: number, potValue?: number): void {
    const notification = this.createNewRoundNotification('Jackpot', round, potValue)
    this.broadcastNotification(notification)
  }

  notifyCrashResult(crashPoint: number, winners: Array<{ username: string; winAmount: number }>): void {
    // Notify about the crash
    const crashNotification = this.createSystemNotification(
      `💥 Crashed at ${crashPoint.toFixed(2)}x!`,
      `${winners.length} players cashed out successfully`,
      'info'
    )
    this.broadcastNotification(crashNotification)

    // Notify about big wins
    winners.forEach(winner => {
      if (winner.winAmount > 500) {
        const winNotification = this.createBigWinNotification(
          winner.username,
          winner.winAmount,
          'Crash'
        )
        this.broadcastNotification(winNotification)
      }
    })
  }

  notifyUserJoined(username: string, game: string, amount?: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title: 'Player Joined! 👋',
      message: `${username} joined ${game}`,
      amount,
      duration: 3000,
      metadata: {
        game,
        user: username,
        timestamp: new Date()
      }
    }
    this.broadcastNotification(notification)
  }

  notifyMaintenanceMode(startTime: Date, duration: number): void {
    const notification = this.createSystemNotification(
      'Maintenance Scheduled 🔧',
      `Server maintenance starting at ${startTime.toLocaleTimeString()}. Expected duration: ${duration} minutes.`,
      'warning'
    )
    notification.persistent = true
    this.broadcastNotification(notification)
  }

  // Utility methods
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Event tracking
  trackNotificationSent(notification: Notification, recipients: number = 0): void {
    console.log(`Notification sent: ${notification.type} - "${notification.title}" to ${recipients} recipients`)
  }

  // Notification statistics
  getNotificationStats(): any {
    return {
      timestamp: new Date(),
      connectedUsers: this.io.engine.clientsCount,
      activeRooms: this.io.sockets.adapter.rooms.size
    }
  }
} 