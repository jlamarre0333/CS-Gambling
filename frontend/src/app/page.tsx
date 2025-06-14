'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  TrophyIcon, 
  ChartBarIcon, 
  StarIcon,
  ArrowTrendingUpIcon,
  PlayIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useGuest } from '@/contexts/GuestContext'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import EnhancedButton from '@/components/ui/EnhancedButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { guestUser } = useGuest()
  const router = useRouter()

  // Redirect to welcome page if no user (neither authenticated nor guest)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !guestUser) {
      router.push('/welcome')
    }
  }, [isLoading, isAuthenticated, guestUser, router])

  // Use guest user if no authenticated user
  const currentUser = user || guestUser
  
  const games = [
    {
      id: 'coinflip',
      name: 'Coin Flip',
      description: 'Classic heads or tails betting with instant results',
      icon: CurrencyDollarIcon,
      href: '/coinflip',
      color: 'from-blue-500 to-cyan-500',
      players: '234 playing',
      winChance: '50%',
      multiplier: '1.98x'
    },
    {
      id: 'jackpot',
      name: 'Jackpot',
      description: 'Pool-based betting with massive potential rewards',
      icon: TrophyIcon,
      href: '/jackpot',
      color: 'from-yellow-500 to-orange-500',
      players: '89 playing',
      winChance: 'Variable',
      multiplier: 'Up to 50x'
    },
    {
      id: 'crash',
      name: 'Crash',
      description: 'Watch the multiplier rise and cash out before it crashes',
      icon: ChartBarIcon,
      href: '/crash',
      color: 'from-green-500 to-emerald-500',
      players: '156 playing',
      winChance: 'Dynamic',
      multiplier: 'Unlimited'
    },
    {
      id: 'roulette',
      name: 'Roulette',
      description: 'Traditional casino roulette with multiple betting options',
      icon: StarIcon,
      href: '/roulette',
      color: 'from-red-500 to-pink-500',
      players: '78 playing',
      winChance: 'Varies',
      multiplier: 'Up to 14x'
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Classic card game with professional strategy features',
      icon: StarIcon,
      href: '/blackjack',
      color: 'from-gray-500 to-slate-500',
      players: '98 playing',
      winChance: 'Skill-based',
      multiplier: '2.5x BJ'
    },
    {
      id: 'tournaments',
      name: 'Tournaments',
      description: 'Scheduled competitions with massive prize pools',
      icon: TrophyIcon,
      href: '/tournaments',
      color: 'from-amber-500 to-yellow-500',
      players: '4 active',
      winChance: 'Competitive',
      multiplier: 'Tournament prizes'
    },
    {
      id: 'live-dealer',
      name: 'Live Dealer',
      description: 'Play with real dealers via live video streaming',
      icon: UserGroupIcon,
      href: '/live-dealer',
      color: 'from-purple-500 to-indigo-500',
      players: '12 dealers live',
      winChance: 'Real-time',
      multiplier: 'Interactive'
    }
  ]

  const stats = [
    { label: 'Total Bets', value: '2.4M+', icon: CurrencyEuroIcon },
    { label: 'Active Players', value: '15.7K', icon: UserGroupIcon },
    { label: 'Total Winnings', value: '$8.9M', icon: TrophyIcon },
    { label: 'Games Played', value: '892K', icon: PlayIcon }
  ]

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Provably Fair',
      description: 'Every game result is cryptographically verifiable and transparent'
    },
    {
      icon: LightBulbIcon,
      title: 'Instant Payouts',
      description: 'Withdraw your winnings immediately with no delays'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Join thousands of players in our vibrant gaming community'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              CS Gambling
            </Link>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-2 text-gray-300">
                    <span className="text-sm">Balance:</span>
                    <span className="text-green-400 font-semibold">${(currentUser?.balance || 0).toFixed(2)}</span>
                  </div>
                  <Link href="/profile">
                    <EnhancedButton variant="ghost" size="sm" className="flex items-center space-x-2">
                      <img 
                        src={user.avatar || '/default-avatar.png'} 
                        alt={user.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="hidden sm:inline">{user.username}</span>
                    </EnhancedButton>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <EnhancedButton variant="primary" size="sm">
                    Login with Steam
                  </EnhancedButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  {isAuthenticated && user ? `Welcome back, ${user.username}!` : 'CS Gambling'}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                {currentUser 
                  ? `Ready to continue your gaming journey? Your balance: $${(currentUser.balance || 0).toFixed(2)}`
                  : 'The ultimate destination for CS2 skin gambling'
                }
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                {isAuthenticated && user
                  ? `Steam ID: ${user.steamId.slice(-8)} • Join thousands of players in fair gaming`
                  : 'Experience provably fair gaming with instant withdrawals, competitive odds, and a thriving community of players.'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated && user ? (
                <>
                  <Link href="/coinflip">
                    <EnhancedButton
                      variant="success"
                      size="lg"
                      className="flex items-center space-x-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      <span>Start Playing</span>
                      <ArrowTrendingUpIcon className="w-5 h-5" />
                    </EnhancedButton>
                  </Link>
                  <Link href="/profile">
                    <EnhancedButton
                      variant="primary"
                      size="lg"
                      className="flex items-center space-x-2"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>View Profile</span>
                      <ArrowTrendingUpIcon className="w-5 h-5" />
                    </EnhancedButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <EnhancedButton
                      variant="success"
                      size="lg"
                      className="flex items-center space-x-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      <span>Login with Steam</span>
                      <ArrowTrendingUpIcon className="w-5 h-5" />
                    </EnhancedButton>
                  </Link>
                  <EnhancedButton
                    variant="secondary"
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Join Community</span>
                  </EnhancedButton>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Game
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From classic coin flips to high-stakes jackpots, find your perfect game
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={game.href}>
                  <EnhancedCard 
                    variant="game" 
                    className="p-6 h-full hover:scale-105 transition-transform cursor-pointer group"
                    hover={true}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <game.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-gray-400 mb-4">{game.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Players:</span>
                        <span className="text-green-400">{game.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Win Chance:</span>
                        <span className="text-blue-400">{game.winChance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Multiplier:</span>
                        <span className="text-yellow-400">{game.multiplier}</span>
                      </div>
                    </div>
                  </EnhancedCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the best in online gaming with our cutting-edge platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <EnhancedCard className="p-8 text-center h-full">
                  <feature.icon className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </EnhancedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Winning?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of players and start your journey to big wins today
            </p>
            
            {!isAuthenticated ? (
              <Link href="/login">
                <EnhancedButton
                  variant="success"
                  size="lg"
                  className="flex items-center space-x-2 mx-auto"
                >
                  <PlayIcon className="w-6 h-6" />
                  <span>Get Started Now</span>
                  <ArrowTrendingUpIcon className="w-6 h-6" />
                </EnhancedButton>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/coinflip">
                  <EnhancedButton
                    variant="success"
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <PlayIcon className="w-6 h-6" />
                    <span>Play Now</span>
                  </EnhancedButton>
                </Link>
                <Link href="/profile">
                  <EnhancedButton
                    variant="primary"
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <UserIcon className="w-6 h-6" />
                    <span>View Profile</span>
                  </EnhancedButton>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage 