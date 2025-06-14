'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import SteamProfile from '@/components/SteamProfile'
import SteamInventory from '@/components/SteamInventory'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { EnhancedCard } from '@/components/ui/EnhancedCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type TabType = 'profile' | 'inventory' | 'stats' | 'settings'

const ProfilePage = () => {
  const { user, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'inventory', label: 'Inventory', icon: CubeIcon },
    { id: 'stats', label: 'Statistics', icon: ChartBarIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon }
  ]

  const handleItemDeposit = (items: any[]) => {
    // Handle item deposit logic
    console.log('Depositing items:', items)
    // In real app, send to backend API
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <EnhancedCard className="p-8 text-center max-w-md">
          <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Not Logged In</h2>
          <p className="text-gray-400 mb-6">Please log in to view your profile</p>
          <Link href="/login">
            <EnhancedButton variant="primary" className="w-full">
              Login with Steam
            </EnhancedButton>
          </Link>
        </EnhancedCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Effects */}
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
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Games</span>
            </Link>
          </div>

          <EnhancedButton
            onClick={logout}
            variant="secondary"
            size="sm"
          >
            Logout
          </EnhancedButton>
        </div>

        {/* Tab Navigation */}
        <EnhancedCard className="p-2 mb-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </EnhancedCard>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && <SteamProfile />}
          
          {activeTab === 'inventory' && (
            <SteamInventory
              steamId={user.steamId}
              onDeposit={handleItemDeposit}
              showPrices={true}
              allowMultiSelect={true}
            />
          )}
          
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <EnhancedCard className="p-8 text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Detailed Statistics</h3>
                <p className="text-gray-500">Advanced statistics and analytics coming soon!</p>
              </EnhancedCard>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Account Settings */}
              <EnhancedCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
                
                <div className="space-y-6">
                  {/* Privacy Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Privacy</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Show profile to other players</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Show inventory publicly</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Show game statistics</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Game result notifications</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Deposit/withdrawal alerts</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Promotional offers</span>
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Two-Factor Authentication</span>
                        <EnhancedButton variant="secondary" size="sm">
                          Enable 2FA
                        </EnhancedButton>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Login Notifications</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 border-t border-gray-700">
                    <EnhancedButton variant="success" className="w-full sm:w-auto">
                      Save Settings
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>

              {/* Danger Zone */}
              <EnhancedCard className="p-6 border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Delete Account</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <EnhancedButton variant="error" size="sm">
                      Delete Account
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage 