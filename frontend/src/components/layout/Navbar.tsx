'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  TrophyIcon, 
  ChartBarIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { api } from '../../config/api'
import { useAuth } from '@/contexts/AuthContext'

const Navbar = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const userBalance = user?.balance || 0

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Coin Flip', href: '/coinflip', icon: CurrencyDollarIcon },
    { name: 'Jackpot', href: '/jackpot', icon: TrophyIcon },
    { name: 'Crash', href: '/crash', icon: ChartBarIcon },
    { name: 'Blackjack', href: '/blackjack', icon: StarIcon },
    { name: 'Roulette', href: '/roulette', icon: StarIcon },
    { name: 'Tournaments', href: '/tournaments', icon: TrophyIcon },
    { name: 'Live Dealer', href: '/live-dealer', icon: StarIcon },
    { name: 'Achievements', href: '/achievements', icon: StarIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
    { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
    { name: 'Security', href: '/security', icon: ShieldCheckIcon },
    { name: 'Mobile', href: '/mobile', icon: DevicePhoneMobileIcon },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">CS</span>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  CS Gambling
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Premium Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`relative group px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                      isActive(item.href)
                        ? 'text-white bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    
                    {/* Active indicator */}
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Balance Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center space-x-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700/50"
              >
                <div className="text-right">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="text-sm font-bold text-green-400">${userBalance.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-white" />
                </div>
              </motion.div>

              {/* User Menu */}
              <div className="hidden lg:flex items-center space-x-3">
                {isAuthenticated && user ? (
                  <>
                    {/* User Profile */}
                    <div className="flex items-center space-x-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700/50">
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-8 h-8 rounded-lg"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">Level {user.level}</p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <CogIcon className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span className="hidden xl:block">Logout</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <CogIcon className="w-5 h-5" />
                    </motion.button>
                    
                    <Link href="/login">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="hidden xl:block">Login</span>
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CS</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-white">CS Gambling</h2>
                      <p className="text-xs text-gray-400">Mobile Menu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Balance */}
                <div className="p-6 border-b border-gray-800">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <p className="text-2xl font-bold text-green-400">${userBalance.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6">
                  <nav className="space-y-2 px-6">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-orange-500/30'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                          {isActive(item.href) && (
                            <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-800 space-y-3">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Profile in Mobile */}
                      <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={user.avatar} 
                            alt={user.username}
                            className="w-12 h-12 rounded-xl"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-white">{user.username}</p>
                            <p className="text-sm text-gray-400">Level {user.level}</p>
                            <p className="text-xs text-green-400">Steam ID: {user.steamId.slice(-8)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-lg transition-colors">
                          <CogIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button 
                          onClick={logout}
                          className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-medium transition-all duration-300">
                          <UserIcon className="w-5 h-5" />
                          <span>Sign In with Steam</span>
                        </button>
                      </Link>
                      
                      <div className="flex space-x-3">
                        <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-lg transition-colors">
                          <CogIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-lg transition-colors">
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          <span>Exit</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  )
}

export default Navbar 