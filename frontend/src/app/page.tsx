'use client'

import React from 'react'
import Link from 'next/link'
import { 
  PlayIcon, 
  TrophyIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const games = [
    {
      name: 'Roulette',
      description: 'Classic casino roulette with CS:GO skins',
      href: '/roulette',
      icon: '🎯',
      color: 'from-red-500 to-red-600',
      players: 234,
      jackpot: '$12,430'
    },
    {
      name: 'Coin Flip',
      description: 'Head-to-head battles with your skins',
      href: '/coinflip',
      icon: '🪙',
      color: 'from-blue-500 to-blue-600',
      players: 89,
      jackpot: '$3,240'
    },
    {
      name: 'Crash',
      description: 'Multiplier game - cash out before crash!',
      href: '/crash',
      icon: '📈',
      color: 'from-green-500 to-green-600',
      players: 156,
      jackpot: '$8,750'
    },
    {
      name: 'Jackpot',
      description: 'Community pot - winner takes all',
      href: '/jackpot',
      icon: '💎',
      color: 'from-purple-500 to-purple-600',
      players: 45,
      jackpot: '$25,690'
    },
    {
      name: 'Case Opening',
      description: 'Open virtual CS:GO cases for rewards',
      href: '/cases',
      icon: '📦',
      color: 'from-yellow-500 to-yellow-600',
      players: 78,
      jackpot: '$5,120'
    }
  ]

  const stats = [
    { label: 'Total Players', value: '15,249', icon: UserGroupIcon },
    { label: 'Games Played', value: '2.1M+', icon: PlayIcon },
    { label: 'Total Wagered', value: '$89.2M', icon: CurrencyDollarIcon },
    { label: 'Winners Today', value: '1,834', icon: TrophyIcon }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-neon bg-clip-text text-transparent">
                CS:GO Skin
              </span>
              <br />
              <span className="text-white">
                Casino Experience
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Experience the thrill of CS:GO/CS2 skin gambling with provably fair games, 
              instant deposits, and real-time action. Join thousands of players today!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="gaming-button text-lg px-8 py-4">
              <PlayIcon className="w-6 h-6 mr-2 inline" />
              Start Playing
            </button>
            <button className="gaming-button-secondary text-lg px-8 py-4">
              <ShieldCheckIcon className="w-6 h-6 mr-2 inline" />
              Provably Fair
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="gaming-card p-6 text-center">
                <stat.icon className="w-8 h-8 text-accent-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your <span className="neon-text">Game</span>
            </h2>
            <p className="text-xl text-gray-300">
              Fair, fast, and thrilling games with real CS:GO/CS2 skins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <Link key={index} href={game.href}>
                <div className="game-tile h-full group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{game.icon}</div>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${game.color} text-white text-xs font-semibold`}>
                      LIVE
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-primary transition-colors">
                    {game.name}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    {game.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Players Online</div>
                      <div className="text-accent-primary font-semibold">{game.players}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Pot Size</div>
                      <div className="text-accent-success font-semibold">{game.jackpot}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gaming-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="neon-text">SkinsCasino</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-neon p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShieldCheckIcon className="w-8 h-8 text-gaming-dark" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Provably Fair</h3>
              <p className="text-gray-400">
                Every game is cryptographically verified to ensure complete fairness and transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-neon p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8 text-gaming-dark" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Action</h3>
              <p className="text-gray-400">
                Experience instant deposits, live games, and real-time chat with other players.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-neon p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CurrencyDollarIcon className="w-8 h-8 text-gaming-dark" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Payouts</h3>
              <p className="text-gray-400">
                Withdraw your winnings directly to your Steam inventory instantly and securely.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage 