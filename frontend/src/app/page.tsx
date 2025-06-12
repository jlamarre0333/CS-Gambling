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
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
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
                  CS Gambling
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                The ultimate destination for CS2 skin gambling
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Experience provably fair gaming with instant withdrawals, competitive odds, and a thriving community of players.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/coinflip"
                className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center space-x-2"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Start Playing</span>
                <ArrowTrendingUpIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/achievements"
                className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border border-gray-700 hover:border-gray-600 backdrop-blur-sm"
              >
                View Achievements
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl mb-4 border border-orange-500/30">
                  <stat.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Game
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From classic coin flips to high-stakes jackpots, find your perfect game and start winning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Link href={game.href}>
                  <div className="gaming-card p-6 h-full cursor-pointer">
                    {/* Game Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <game.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Game Info */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Game Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Players Online</span>
                        <span className="text-sm font-medium text-green-400">{game.players}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Win Chance</span>
                        <span className="text-sm font-medium text-blue-400">{game.winChance}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Max Multiplier</span>
                        <span className="text-sm font-medium text-orange-400">{game.multiplier}</span>
                      </div>
                    </div>

                    {/* Play Button */}
                    <div className="mt-6">
                      <div className={`w-full bg-gradient-to-r ${game.color} text-white py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 group-hover:shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}>
                        Play Now
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the best in CS2 gambling with industry-leading features and security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl mb-6 border border-orange-500/30">
                  <feature.icon className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="gaming-card p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Winning?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of players and experience the thrill of CS2 skin gambling with guaranteed fair play and instant payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/coinflip"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25"
              >
                Start Playing Now
              </Link>
              <Link
                href="/deposit"
                className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border border-gray-700 hover:border-gray-600"
              >
                Deposit Skins
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage 