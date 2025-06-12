'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  WalletIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { SoundToggle, SoundSettings } from '@/components/ui/SoundSettings'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSoundSettings, setShowSoundSettings] = useState(false)

  const navigation = [
    { name: 'Games', href: '/games' },
    { name: 'Deposit', href: '/deposit' },
    { name: 'Withdraw', href: '/withdraw' },
    { name: 'Roulette', href: '/roulette' },
    { name: 'Coin Flip', href: '/coinflip' },
    { name: 'Crash', href: '/crash' },
    { name: 'Jackpot', href: '/jackpot' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ]

  return (
    <nav className="bg-gaming-darker/95 backdrop-blur-md border-b border-gaming-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-neon p-2 rounded-lg">
              <div className="w-8 h-8 bg-gaming-dark rounded flex items-center justify-center">
                <span className="text-accent-primary font-bold text-lg">CS</span>
              </div>
            </div>
            <span className="text-xl font-bold neon-text">SkinsCasino</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-accent-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="gaming-button-secondary text-sm">
              <WalletIcon className="w-4 h-4 mr-2 inline" />
              Deposit
            </button>
            <button className="gaming-button text-sm">
              Login with Steam
            </button>
            <SoundToggle />
            <button 
              onClick={() => setShowSoundSettings(true)}
              className="p-2 text-gray-400 hover:text-accent-primary transition-colors"
              title="Sound Settings"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-accent-primary p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gaming-card/95 backdrop-blur-md border-t border-gaming-border">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-accent-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <SoundToggle />
                <button 
                  onClick={() => setShowSoundSettings(true)}
                  className="p-2 text-gray-400 hover:text-accent-primary transition-colors"
                  title="Sound Settings"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
              </div>
              <button className="gaming-button-secondary w-full text-sm">
                <WalletIcon className="w-4 h-4 mr-2 inline" />
                Deposit
              </button>
              <button className="gaming-button w-full text-sm">
                Login with Steam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sound Settings Modal */}
      <SoundSettings 
        isOpen={showSoundSettings} 
        onClose={() => setShowSoundSettings(false)} 
      />
    </nav>
  )
}

export default Navbar 