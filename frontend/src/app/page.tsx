'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrophyIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  FireIcon,
  SparklesIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [currentJackpot, setCurrentJackpot] = useState(4750.80)
  const [playersOnline, setPlayersOnline] = useState(1247)
  const [recentWinners, setRecentWinners] = useState([
    { name: 'SkinMaster', amount: 3245.75, avatar: '👑', time: '2m ago' },
    { name: 'CSGOPro', amount: 1890.25, avatar: '⚡', time: '15m ago' },
    { name: 'TradeKing', amount: 5670.80, avatar: '💎', time: '32m ago' },
  ])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJackpot(prev => prev + Math.random() * 50 + 10)
      setPlayersOnline(prev => prev + Math.floor(Math.random() * 10 - 5))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const gameFeatures = [
    {
      title: 'Jackpot',
      description: 'Deposit CS2 skins, winner takes all',
      icon: TrophyIcon,
      href: '/jackpot',
      color: 'from-yellow-500 to-orange-500',
      featured: true,
      stats: `$${currentJackpot.toFixed(0)} Current Pot`
    },
    {
      title: 'Coin Flip',
      description: 'Head-to-head skin battles',
      icon: CurrencyDollarIcon,
      href: '/coinflip',
      color: 'from-blue-500 to-cyan-500',
      stats: '24 Active Games'
    },
    {
      title: 'Crash',
      description: 'Cash out before the crash',
      icon: ChartBarIcon,
      href: '/crash',
      color: 'from-red-500 to-pink-500',
      stats: '2.45x Last Crash'
    },
    {
      title: 'Roulette',
      description: 'Classic casino roulette',
      icon: SparklesIcon,
      href: '/roulette',
      color: 'from-green-500 to-emerald-500',
      stats: 'Round #2847'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  CS2 Skin
                </span>
                <br />
                <span className="text-white">Gambling</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Deposit your CS2 skins and compete for massive jackpots. 
                <span className="text-yellow-400 font-semibold"> Winner takes all!</span>
              </p>

              {/* Live Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <EnhancedCard variant="stats" className="p-6 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">
                      ${currentJackpot.toFixed(0)}
                    </div>
                    <div className="text-gray-400">Current Jackpot</div>
                  </EnhancedCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <EnhancedCard variant="stats" className="p-6 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                      {playersOnline.toLocaleString()}
                    </div>
                    <div className="text-gray-400">Players Online</div>
                  </EnhancedCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <EnhancedCard variant="stats" className="p-6 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                      24/7
                    </div>
                    <div className="text-gray-400">Live Games</div>
                  </EnhancedCard>
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/jackpot">
                  <EnhancedButton 
                    variant="primary" 
                    size="xl"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    <TrophyIcon className="w-6 h-6 mr-2" />
                    Join Jackpot Now
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </EnhancedButton>
                </Link>

                                 {!isAuthenticated && (
                   <EnhancedButton 
                     variant="ghost" 
                     size="xl"
                     onClick={() => { window.location.href = 'http://localhost:3001/api/steam-auth/login' }}
                     className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-blue-500 hover:bg-blue-500/10"
                   >
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.3-.11.49-.4.49-.72v-1.34c0-.32-.19-.61-.49-.72C14.34 18.21 13.19 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6c0 1.66-.67 3.16-1.76 4.24-.15.15-.24.35-.24.56v2.4c0 .41.34.75.75.75s.75-.34.75-.75V16.8c1.1-1.08 1.76-2.58 1.76-4.24C22 6.48 17.52 2 12 2z"/>
                    </svg>
                    Login with Steam
                  </EnhancedButton>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Jackpot Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Live Jackpot
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Watch the action unfold in real-time. Deposit your CS2 skins and compete for the entire pot!
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <EnhancedCard variant="premium" className="p-8 lg:p-12">
              <div className="text-center">
                {/* Live Jackpot Display */}
                <div className="mb-8">
                  <div className="text-6xl lg:text-8xl font-bold text-yellow-400 mb-4">
                    ${currentJackpot.toFixed(2)}
                  </div>
                  <div className="text-xl text-gray-300 mb-6">
                    Current Jackpot • 3 Players • 45s remaining
                  </div>
                  
                  {/* Spinning Wheel Preview */}
                  <div className="relative w-32 h-32 lg:w-48 lg:h-48 mx-auto mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full rounded-full border-8 border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center"
                    >
                      <div className="text-4xl lg:text-6xl">🎰</div>
                    </motion.div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Link href="/jackpot">
                    <EnhancedButton 
                      variant="primary" 
                      size="xl"
                      className="w-full h-16 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500"
                    >
                      <PlayIcon className="w-6 h-6 mr-2" />
                      Join Live Game
                    </EnhancedButton>
                  </Link>
                  
                  <Link href="/profile">
                    <EnhancedButton 
                      variant="ghost" 
                      size="xl"
                      className="w-full h-16 text-xl border-2 border-gray-600 hover:border-gray-500"
                    >
                      <CubeIcon className="w-6 h-6 mr-2" />
                      View My Skins
                    </EnhancedButton>
                  </Link>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Choose Your Game
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Multiple ways to gamble with your CS2 skins. Each game offers unique excitement and winning opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameFeatures.map((game, index) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={game.href}>
                  <EnhancedCard 
                    variant={game.featured ? "premium" : "default"}
                    className={`p-6 h-full hover:scale-105 transition-all duration-300 cursor-pointer group ${
                      game.featured ? 'ring-2 ring-yellow-500/50' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <game.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">
                        {game.title}
                        {game.featured && <span className="ml-2 text-yellow-400">⭐</span>}
                      </h3>
                      
                      <p className="text-gray-400 mb-4">{game.description}</p>
                      
                      <div className="text-sm font-semibold text-blue-400">
                        {game.stats}
                      </div>
                    </div>
                  </EnhancedCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Recent Big Wins
            </h2>
            <p className="text-xl text-gray-300">
              See who's been winning big with their CS2 skins
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {recentWinners.map((winner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnhancedCard variant="default" className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{winner.avatar}</div>
                        <div>
                          <div className="text-lg font-bold text-white">{winner.name}</div>
                          <div className="text-gray-400">{winner.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          +${winner.amount.toLocaleString()}
                        </div>
                        <div className="text-gray-400">Jackpot Win</div>
                      </div>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Login with Steam',
                description: 'Connect your Steam account to access your CS2 inventory',
                icon: '🔑'
              },
              {
                step: '2', 
                title: 'Deposit Skins',
                description: 'Choose CS2 skins from your inventory to add to the pot',
                icon: '🎒'
              },
              {
                step: '3',
                title: 'Win Big',
                description: 'Watch the wheel spin and win the entire jackpot!',
                icon: '🏆'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <EnhancedCard variant="default" className="p-8 text-center h-full">
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <div className="text-4xl font-bold text-blue-400 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </EnhancedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 