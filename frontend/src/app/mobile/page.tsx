'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  StarIcon,
  ShareIcon,
  BellIcon,
  CogIcon,
  UserIcon,
  ChartBarIcon,
  GlobeAltIcon,
  WifiIcon,
  BatteryIcon
} from '@heroicons/react/24/outline';

interface MobileFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  implemented: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface AppStats {
  downloads: number;
  rating: number;
  reviews: number;
  activeUsers: number;
}

const mobileFeatures: MobileFeature[] = [
  {
    id: '1',
    title: 'Touch-Optimized Gaming',
    description: 'All games optimized for touch controls with haptic feedback',
    icon: DevicePhoneMobileIcon,
    implemented: true,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Push Notifications',
    description: 'Real-time alerts for game results, bonuses, and security',
    icon: BellIcon,
    implemented: true,
    priority: 'high'
  },
  {
    id: '3',
    title: 'Biometric Authentication',
    description: 'Login with Face ID, Touch ID, or fingerprint',
    icon: UserIcon,
    implemented: true,
    priority: 'high'
  },
  {
    id: '4',
    title: 'Offline Mode',
    description: 'View history and stats without internet connection',
    icon: WifiIcon,
    implemented: false,
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Progressive Web App',
    description: 'Install as native app on any device',
    icon: ArrowDownTrayIcon,
    implemented: true,
    priority: 'high'
  },
  {
    id: '6',
    title: 'Apple Pay Integration',
    description: 'Quick deposits using Apple Pay and Google Pay',
    icon: CreditCardIcon,
    implemented: false,
    priority: 'medium'
  }
];

const appStats: AppStats = {
  downloads: 125890,
  rating: 4.8,
  reviews: 8542,
  activeUsers: 23456
};

export default function MobilePage() {
  const [activeView, setActiveView] = useState<'phone' | 'tablet' | 'desktop'>('phone');
  const [selectedFeature, setSelectedFeature] = useState<MobileFeature | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const getDeviceFrame = () => {
    switch (activeView) {
      case 'phone':
        return 'w-80 h-[640px] bg-black rounded-[3rem] p-2';
      case 'tablet':
        return 'w-96 h-[640px] bg-black rounded-3xl p-3';
      case 'desktop':
        return 'w-full max-w-4xl h-[640px] bg-gray-800 rounded-2xl p-4';
      default:
        return 'w-80 h-[640px] bg-black rounded-[3rem] p-2';
    }
  };

  const getScreenContent = () => {
    switch (activeView) {
      case 'phone':
        return (
          <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className="flex justify-between items-center p-3 text-white text-sm">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <WifiIcon className="w-4 h-4" />
                <BatteryIcon className="w-4 h-4" />
              </div>
            </div>

            {/* App Content */}
            <div className="px-4 pb-4 h-full">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">CS Gambling Mobile</h2>
                <p className="text-gray-400 text-sm">Play anywhere, anytime</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl text-white font-medium"
                >
                  🎰 Play Now
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-xl text-white font-medium"
                >
                  💰 Deposit
                </motion.button>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {['Coin Flip', 'Jackpot', 'Crash', 'Roulette', 'Blackjack', 'Live'].map((game, index) => (
                  <motion.div
                    key={game}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 p-3 rounded-lg text-center"
                  >
                    <div className="text-2xl mb-1">
                      {index === 0 && '🪙'}
                      {index === 1 && '🎰'}
                      {index === 2 && '📈'}
                      {index === 3 && '🎡'}
                      {index === 4 && '🃏'}
                      {index === 5 && '🎮'}
                    </div>
                    <div className="text-white text-xs">{game}</div>
                  </motion.div>
                ))}
              </div>

              {/* Balance */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <div className="text-gray-400 text-sm mb-1">Your Balance</div>
                <div className="text-white text-2xl font-bold">$1,250.75</div>
              </div>

              {/* Navigation */}
              <div className="flex justify-around bg-gray-800 rounded-xl p-2">
                {[
                  { icon: ChartBarIcon, label: 'Games' },
                  { icon: UserIcon, label: 'Profile' },
                  { icon: CogIcon, label: 'Settings' }
                ].map((item, index) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center p-2 rounded-lg ${index === 0 ? 'bg-orange-500' : ''}`}
                  >
                    <item.icon className={`w-5 h-5 ${index === 0 ? 'text-white' : 'text-gray-400'}`} />
                    <span className={`text-xs mt-1 ${index === 0 ? 'text-white' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tablet':
        return (
          <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">CS Gambling</h2>
                <div className="flex items-center gap-4">
                  <div className="text-white">$1,250.75</div>
                  <button className="bg-orange-500 px-4 py-2 rounded-lg text-white font-medium">
                    Deposit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Games Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Featured Games</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['Coin Flip', 'Jackpot', 'Crash', 'Roulette'].map((game, index) => (
                      <motion.div
                        key={game}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gray-800 p-6 rounded-xl text-center cursor-pointer"
                      >
                        <div className="text-4xl mb-2">
                          {index === 0 && '🪙'}
                          {index === 1 && '🎰'}
                          {index === 2 && '📈'}
                          {index === 3 && '🎡'}
                        </div>
                        <div className="text-white font-medium">{game}</div>
                        <div className="text-gray-400 text-sm mt-1">Play Now</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Stats Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm">Total Winnings</div>
                      <div className="text-green-400 text-xl font-bold">$8,547.32</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm">Games Played</div>
                      <div className="text-blue-400 text-xl font-bold">1,247</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm">Win Rate</div>
                      <div className="text-purple-400 text-xl font-bold">68.4%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className="w-full h-full bg-gray-900 rounded-xl overflow-hidden">
            <iframe
              src="/"
              className="w-full h-full rounded-xl"
              title="Desktop View"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Mobile Experience
          </h1>
          <p className="text-gray-400">Optimized for every device, anywhere you play</p>
        </motion.div>

        {/* Device Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="gaming-card p-2 flex gap-2">
            {[
              { id: 'phone', name: 'Mobile', icon: DevicePhoneMobileIcon },
              { id: 'tablet', name: 'Tablet', icon: DeviceTabletIcon },
              { id: 'desktop', name: 'Desktop', icon: ComputerDesktopIcon }
            ].map((device) => (
              <button
                key={device.id}
                onClick={() => setActiveView(device.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === device.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <device.icon className="w-4 h-4" />
                {device.name}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Preview */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-center"
            >
              <div className={getDeviceFrame()}>
                {getScreenContent()}
              </div>
            </motion.div>
          </div>

          {/* Features & Stats */}
          <div className="space-y-6">
            {/* App Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="gaming-card p-6"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
                App Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-bold text-green-400">{appStats.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yellow-400">{appStats.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(appStats.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Reviews</span>
                  <span className="font-bold text-blue-400">{appStats.reviews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="font-bold text-purple-400">{appStats.activeUsers.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => setShowQRCode(true)}
                  className="gaming-button w-full bg-blue-600 hover:bg-blue-700"
                >
                  <QrCodeIcon className="w-4 h-4 inline mr-2" />
                  Download App
                </button>
              </div>
            </motion.div>

            {/* Mobile Features */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="gaming-card p-6"
            >
              <h3 className="text-xl font-bold mb-4">Mobile Features</h3>
              
              <div className="space-y-3">
                {mobileFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedFeature(feature)}
                    className="p-3 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        feature.implemented 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-400">{feature.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        feature.implemented 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {feature.implemented ? 'Live' : 'Coming Soon'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* PWA Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="gaming-card p-6"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <GlobeAltIcon className="w-6 h-6 text-purple-400" />
                Progressive Web App
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Install like native app</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Auto-updates</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 text-sm">
                  <strong>Tip:</strong> Add to your home screen for the best experience!
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowQRCode(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="gaming-card p-6 max-w-sm w-full text-center"
              >
                <h3 className="text-xl font-bold mb-4">Download Our App</h3>
                
                <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-black text-sm">QR Code Placeholder</div>
                </div>
                
                <p className="text-gray-400 mb-4">
                  Scan this QR code with your phone to download the app
                </p>

                <div className="space-y-3">
                  <button className="gaming-button w-full bg-black text-white">
                    📱 Download for iOS
                  </button>
                  <button className="gaming-button w-full bg-green-600 text-white">
                    🤖 Download for Android
                  </button>
                </div>

                <button
                  onClick={() => setShowQRCode(false)}
                  className="mt-4 text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Detail Modal */}
        <AnimatePresence>
          {selectedFeature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedFeature(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="gaming-card p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <selectedFeature.icon className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-bold">{selectedFeature.title}</h3>
                </div>
                
                <p className="text-gray-300 mb-4">{selectedFeature.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedFeature.implemented 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {selectedFeature.implemented ? 'Available Now' : 'Coming Soon'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedFeature.priority === 'high' 
                      ? 'bg-red-500/20 text-red-400'
                      : selectedFeature.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedFeature.priority} priority
                  </span>
                </div>

                <button
                  onClick={() => setSelectedFeature(null)}
                  className="gaming-button w-full"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 