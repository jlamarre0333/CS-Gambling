'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import EnhancedButton from '@/components/ui/EnhancedButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  CurrencyDollarIcon, 
  TrophyIcon, 
  ChartBarIcon, 
  StarIcon,
  UserIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in to access the dashboard</p>
          <Link href="/login">
            <EnhancedButton variant="primary">Login</EnhancedButton>
          </Link>
        </div>
      </div>
    )
  }

  const games = [
    { name: 'Coin Flip', href: '/coinflip', icon: CurrencyDollarIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Jackpot', href: '/jackpot', icon: TrophyIcon, color: 'from-yellow-500 to-orange-500' },
    { name: 'Crash', href: '/crash', icon: ChartBarIcon, color: 'from-green-500 to-emerald-500' },
    { name: 'Roulette', href: '/roulette', icon: StarIcon, color: 'from-red-500 to-pink-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, <span className="text-orange-400">{user.username}</span>!
          </h1>
          <p className="text-xl text-gray-400">Ready to continue your gaming journey?</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <EnhancedCard className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">${(user.balance || 0).toFixed(2)}</div>
            <div className="text-gray-400">Current Balance</div>
          </EnhancedCard>

          <EnhancedCard className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">Level {user.level || 1}</div>
            <div className="text-gray-400">Player Level</div>
          </EnhancedCard>

          <EnhancedCard className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{user.isVip ? 'VIP' : 'Standard'}</div>
            <div className="text-gray-400">Account Type</div>
          </EnhancedCard>
        </div>

        {/* Quick Actions */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Choose Your Game</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {games.map((game) => (
              <Link key={game.name} href={game.href}>
                <EnhancedCard 
                  className="p-6 text-center hover:scale-105 transition-transform cursor-pointer"
                  hover={true}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <game.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-semibold">{game.name}</div>
                </EnhancedCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Actions */}
        <div className="text-center">
          <div className="space-x-4">
            <Link href="/profile">
              <EnhancedButton variant="primary" size="lg">
                <UserIcon className="w-5 h-5 mr-2" />
                View Profile
              </EnhancedButton>
            </Link>
            <Link href="/payments">
              <EnhancedButton variant="secondary" size="lg">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Manage Funds
              </EnhancedButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 