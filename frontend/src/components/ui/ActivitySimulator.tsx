'use client'

import { useEffect, useCallback } from 'react'
import { useToast, createBigWinNotification, createNewRoundNotification, createAchievementNotification } from './ToastNotifications'

interface ActivitySimulatorProps {
  enabled?: boolean
  frequency?: number // notifications per minute
}

const ActivitySimulator: React.FC<ActivitySimulatorProps> = ({ 
  enabled = true, 
  frequency = 3 
}) => {
  const { addNotification } = useToast()

  const gameNames = ['Crash', 'Roulette', 'Coinflip', 'Case Opening', 'Jackpot']
  const userNames = [
    'SkinMaster', 'CS2Pro', 'TradeKing', 'CaseHunter', 'DropLord', 'SkinWizard',
    'GameChanger', 'LootSeeker', 'SkinCollector', 'ProGamer', 'MarketKing',
    'SkinTrader', 'RareDrops', 'CsgoExpert', 'SkinInvestor', 'LuckyPlayer'
  ]
  const achievements = [
    { name: 'First Blood', desc: 'Won your first game!' },
    { name: 'Lucky Streak', desc: 'Won 5 games in a row' },
    { name: 'High Roller', desc: 'Bet over $1000 in a single game' },
    { name: 'Skin Collector', desc: 'Collected 100 different skins' },
    { name: 'Big Winner', desc: 'Won over $5000 in total' },
    { name: 'Daily Warrior', desc: 'Played every day this week' },
    { name: 'Case Master', desc: 'Opened 50 cases' },
    { name: 'Trade Expert', desc: 'Made 25 successful trades' }
  ]

  const getRandomUser = () => userNames[Math.floor(Math.random() * userNames.length)]
  const getRandomGame = () => gameNames[Math.floor(Math.random() * gameNames.length)]
  const getRandomAmount = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min)
  const getRandomAvatar = () => {
    const avatars = ['🎰', '🏆', '💰', '🎮', '👑', '⚡', '🔥', '💎', '🚀', '🎯']
    return avatars[Math.floor(Math.random() * avatars.length)]
  }

  const generateRandomActivity = useCallback(() => {
    const activityType = Math.random()
    
    if (activityType < 0.4) {
      // Big win notifications (40% chance)
      const user = getRandomUser()
      const game = getRandomGame()
      const amount = getRandomAmount(500, 15000)
      
      addNotification(createBigWinNotification(
        user,
        amount,
        game,
        getRandomAvatar()
      ))
    } else if (activityType < 0.65) {
      // New round notifications (25% chance)
      const game = getRandomGame()
      const roundNum = getRandomAmount(1000, 9999)
      const potValue = getRandomAmount(200, 5000)
      
      addNotification(createNewRoundNotification(
        game,
        roundNum,
        potValue
      ))
    } else if (activityType < 0.8) {
      // Achievement notifications (15% chance)
      const user = getRandomUser()
      const achievement = achievements[Math.floor(Math.random() * achievements.length)]
      
      addNotification(createAchievementNotification(
        achievement.name,
        achievement.desc,
        'Bonus reward unlocked!'
      ))
    } else if (activityType < 0.9) {
      // Friend activity (10% chance)
      const user = getRandomUser()
      const game = getRandomGame()
      
      addNotification({
        type: 'friend_activity',
        title: 'Friend Activity 👥',
        message: `Your friend ${user} is playing ${game}!`,
        avatar: '👤',
        duration: 4000,
        action: {
          label: 'Join Friend',
          onClick: () => {
            window.location.href = `/${game.toLowerCase()}`
          }
        },
        metadata: {
          game,
          user,
          timestamp: new Date()
        }
      })
    } else {
      // System messages (10% chance)
      const messages = [
        { title: 'Happy Hour Active! 🎉', message: 'Double XP for the next 30 minutes!' },
        { title: 'New Skins Added! 💎', message: 'Check out the latest CS2 skin collection' },
        { title: 'Tournament Starting! 🏆', message: 'Weekly jackpot tournament begins in 10 minutes' },
        { title: 'Market Update 📈', message: 'Skin prices updated with latest market data' },
        { title: 'Maintenance Complete ✅', message: 'All systems running smoothly!' }
      ]
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      
      addNotification({
        type: 'system',
        title: message.title,
        message: message.message,
        duration: 6000,
        metadata: {
          timestamp: new Date()
        }
      })
    }
  }, [addNotification])

  // Simulate background activity
  useEffect(() => {
    if (!enabled) return

    // Convert frequency per minute to interval in milliseconds
    const baseInterval = (60 / frequency) * 1000
    
    const scheduleNext = () => {
      // Add some randomness (±30%) to make it feel more natural
      const randomFactor = 0.7 + Math.random() * 0.6
      const interval = baseInterval * randomFactor
      
      setTimeout(() => {
        generateRandomActivity()
        scheduleNext()
      }, interval)
    }

    // Start the activity simulation after a short delay
    const initialDelay = setTimeout(() => {
      scheduleNext()
    }, 5000) // Wait 5 seconds before starting

    return () => {
      clearTimeout(initialDelay)
    }
  }, [enabled, frequency, generateRandomActivity])

  // Simulate some initial activity when component mounts
  useEffect(() => {
    if (!enabled) return

    // Generate 2-3 initial notifications to show the system is active
    const initialNotifications = Math.floor(Math.random() * 2) + 2
    
    for (let i = 0; i < initialNotifications; i++) {
      setTimeout(() => {
        generateRandomActivity()
      }, (i + 1) * 2000) // Spread them out over 6 seconds
    }
  }, [enabled, generateRandomActivity])

  return null // This component doesn't render anything
}

export default ActivitySimulator 