'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface LoginStats {
  onlineUsers: number
  totalUsers: number
  totalWinnings: string
  gamesPlayed: number
}

const LoginPage = () => {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<LoginStats>({
    onlineUsers: 1247,
    totalUsers: 89432,
    totalWinnings: '$2.4M',
    gamesPlayed: 156789
  })
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Military-Grade Security',
      description: 'Bank-level encryption & Steam OAuth 2.0',
      color: 'text-green-400'
    },
    {
      icon: FireIcon,
      title: 'Instant Deposits',
      description: 'Lightning-fast skin deposits & withdrawals',
      color: 'text-orange-400'
    },
    {
      icon: TrophyIcon,
      title: 'VIP Rewards',
      description: 'Exclusive bonuses & premium features',
      color: 'text-yellow-400'
    },
    {
      icon: UserGroupIcon,
      title: 'Active Community',
      description: 'Join thousands of daily players',
      color: 'text-blue-400'
    }
  ]

  const testimonials = [
    {
      name: 'ProGamer_2024',
      text: 'Best CS gambling site! Fast payouts and fair games.',
      rating: 5,
      avatar: '🎮'
    },
    {
      name: 'SkinTrader_Pro',
      text: 'Love the instant deposits and VIP treatment!',
      rating: 5,
      avatar: '💎'
    },
    {
      name: 'LuckyShot_99',
      text: 'Won big on jackpot! Withdrawal was instant.',
      rating: 5,
      avatar: '🍀'
    }
  ]

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  // Rotate features every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length])

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10) - 5,
        gamesPlayed: prev.gamesPlayed + Math.floor(Math.random() * 5)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSteamLogin = async () => {
    setIsLoading(true)
    try {
      // Simulate brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to our backend Steam OAuth endpoint
      window.location.href = 'http://localhost:3001/api/steam-auth/login'
    } catch (error) {
      setIsLoading(false)
      console.error('Failed to connect to Steam:', error)
    }
  }

  const CurrentFeatureIcon = features[currentFeature].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center"
      >
        {/* Left Side - Login Form */}
        <div className="order-2 lg:order-1">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          {/* Login Card */}
          <EnhancedCard variant="premium" className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-white font-bold text-3xl">CS</span>
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Login with Steam to access your account</p>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Online Now</span>
                </div>
                <div className="text-lg font-bold text-white">{stats.onlineUsers.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Total Winnings</div>
                <div className="text-lg font-bold text-green-400">{stats.totalWinnings}</div>
              </div>
            </div>

            {/* Rotating Features */}
            <div className="mb-8 h-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center space-x-3"
                >
                  <CurrentFeatureIcon className={`w-6 h-6 ${features[currentFeature].color}`} />
                  <div>
                    <div className="text-white font-semibold">{features[currentFeature].title}</div>
                    <div className="text-gray-400 text-sm">{features[currentFeature].description}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Steam Login Button */}
            <EnhancedButton
              onClick={handleSteamLogin}
              variant="primary"
              size="lg"
              className="w-full mb-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <span>Login with Steam</span>
                </>
              )}
            </EnhancedButton>

            {/* Security Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center space-x-2 text-gray-300">
                <LockClosedIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Steam Verified</span>
              </div>
            </div>

            {/* Bonus Info */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Welcome Bonus</span>
              </div>
              <p className="text-white text-sm">Get $1000 bonus credits + 50 free case openings!</p>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By logging in, you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </Link>
            </p>
          </EnhancedCard>
        </div>

        {/* Right Side - Social Proof & Features */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Platform Stats */}
          <EnhancedCard variant="glow" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <GlobeAltIcon className="w-6 h-6 text-blue-400" />
              <span>Platform Statistics</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.totalWinnings}</div>
                <div className="text-gray-400 text-sm">Total Winnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.gamesPlayed.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">4.9★</div>
                <div className="text-gray-400 text-sm">User Rating</div>
              </div>
            </div>
          </EnhancedCard>

          {/* Testimonials */}
          <EnhancedCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <StarIcon className="w-6 h-6 text-yellow-400" />
              <span>What Players Say</span>
            </h3>
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </div>
          </EnhancedCard>

          {/* Security Badge */}
          <EnhancedCard className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trusted & Secure</h3>
            <p className="text-gray-400 text-sm">
              Licensed and regulated platform with 24/7 security monitoring
            </p>
          </EnhancedCard>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage 