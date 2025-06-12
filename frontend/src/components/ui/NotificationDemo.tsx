'use client'

import React from 'react'
import { 
  useToast, 
  createBigWinNotification, 
  createJackpotNotification, 
  createNewRoundNotification, 
  createAchievementNotification 
} from './ToastNotifications'

const NotificationDemo: React.FC = () => {
  const { addNotification } = useToast()

  const triggerBigWin = () => {
    addNotification(createBigWinNotification(
      'SkinMaster42',
      7850,
      'Jackpot',
      '🎰'
    ))
  }

  const triggerJackpot = () => {
    addNotification(createJackpotNotification(
      'CS2ProGamer',
      25000,
      147,
      '🏆'
    ))
  }

  const triggerNewRound = () => {
    addNotification(createNewRoundNotification(
      'Jackpot',
      148,
      3200
    ))
  }

  const triggerAchievement = () => {
    addNotification(createAchievementNotification(
      'First Win',
      'Congratulations on your first victory!',
      '100 bonus coins'
    ))
  }

  const triggerFriendActivity = () => {
    addNotification({
      type: 'friend_activity',
      title: 'Friend Activity',
      message: 'Your friend just joined a Crash game!',
      avatar: '👤',
      duration: 4000,
      action: {
        label: 'Join Friend',
        onClick: () => console.log('Joining friend...')
      }
    })
  }

  const triggerWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Connection Issue',
      message: 'Poor network connection detected. Some features may be limited.',
      duration: 8000,
      persistent: false
    })
  }

  const triggerSystemMessage = () => {
    addNotification({
      type: 'system',
      title: 'Maintenance Notice',
      message: 'Scheduled maintenance in 30 minutes. Save your progress!',
      duration: 10000,
      persistent: true
    })
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gaming-card border border-gaming-border rounded-lg p-4 z-40">
      <h3 className="text-lg font-bold mb-4 text-accent-primary">🔔 Notification Demo</h3>
      <div className="grid grid-cols-2 gap-2 max-w-xs">
        <button
          onClick={triggerBigWin}
          className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded text-xs transition-colors"
        >
          💰 Big Win
        </button>
        <button
          onClick={triggerJackpot}
          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-xs transition-colors"
        >
          🎰 Jackpot
        </button>
        <button
          onClick={triggerNewRound}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs transition-colors"
        >
          🔄 New Round
        </button>
        <button
          onClick={triggerAchievement}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-xs transition-colors"
        >
          🏆 Achievement
        </button>
        <button
          onClick={triggerFriendActivity}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded text-xs transition-colors"
        >
          👥 Friend
        </button>
        <button
          onClick={triggerWarning}
          className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded text-xs transition-colors"
        >
          ⚠️ Warning
        </button>
        <button
          onClick={triggerSystemMessage}
          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-xs transition-colors col-span-2"
        >
          ⚙️ System Message
        </button>
      </div>
    </div>
  )
}

export default NotificationDemo 