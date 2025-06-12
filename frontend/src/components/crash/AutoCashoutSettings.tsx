'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CogIcon, 
  BoltIcon, 
  ShieldCheckIcon, 
  TrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface AutoCashoutStrategy {
  id: string
  name: string
  description: string
  icon: string
  multiplier: number
  enabled: boolean
  riskLevel: 'low' | 'medium' | 'high'
  successRate: number
}

interface AutoCashoutSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: AutoCashoutStrategy[]) => void
  currentSettings: AutoCashoutStrategy[]
}

export const AutoCashoutSettings = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}: AutoCashoutSettingsProps) => {
  const [strategies, setStrategies] = useState<AutoCashoutStrategy[]>(currentSettings)
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'advanced'>('presets')

  const presetStrategies: AutoCashoutStrategy[] = [
    {
      id: 'conservative',
      name: 'Conservative',
      description: 'Low risk, steady profits',
      icon: '🛡️',
      multiplier: 1.5,
      enabled: false,
      riskLevel: 'low',
      successRate: 85
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Medium risk, good returns',
      icon: '⚖️',
      multiplier: 2.5,
      enabled: false,
      riskLevel: 'medium',
      successRate: 65
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'High risk, high reward',
      icon: '🚀',
      multiplier: 5.0,
      enabled: false,
      riskLevel: 'high',
      successRate: 35
    },
    {
      id: 'moonshot',
      name: 'Moonshot',
      description: 'Maximum risk, maximum reward',
      icon: '🌙',
      multiplier: 10.0,
      enabled: false,
      riskLevel: 'high',
      successRate: 15
    }
  ]

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, enabled: !strategy.enabled }
        : { ...strategy, enabled: false } // Only one strategy can be active
    ))
  }

  const updateMultiplier = (strategyId: string, multiplier: number) => {
    setStrategies(prev => prev.map(strategy =>
      strategy.id === strategyId
        ? { ...strategy, multiplier }
        : strategy
    ))
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const handleSave = () => {
    onSave(strategies)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CogIcon className="w-6 h-6 text-orange-400" />
                  <h2 className="text-2xl font-bold text-white">Auto-Cashout Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                {[
                  { id: 'presets', label: 'Presets', icon: ShieldCheckIcon },
                  { id: 'custom', label: 'Custom', icon: CogIcon },
                  { id: 'advanced', label: 'Advanced', icon: ChartBarIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'presets' && (
                <div className="space-y-6">
                  <div className="text-gray-300 mb-6">
                    Choose from our pre-configured strategies based on your risk tolerance.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presetStrategies.map((strategy) => {
                      const isActive = strategies.find(s => s.id === strategy.id)?.enabled
                      
                      return (
                        <motion.div
                          key={strategy.id}
                          whileHover={{ scale: 1.02 }}
                          className={`
                            p-6 rounded-xl border-2 cursor-pointer transition-all
                            ${isActive 
                              ? 'border-orange-500 bg-orange-500/10' 
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }
                          `}
                          onClick={() => toggleStrategy(strategy.id)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{strategy.icon}</span>
                              <div>
                                <h3 className="font-bold text-white">{strategy.name}</h3>
                                <p className="text-sm text-gray-400">{strategy.description}</p>
                              </div>
                            </div>
                            
                            {isActive && (
                              <div className="text-orange-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Target Multiplier:</span>
                              <span className="font-bold text-white">{strategy.multiplier.toFixed(1)}x</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Success Rate:</span>
                              <span className="font-bold text-green-400">{strategy.successRate}%</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Risk Level:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(strategy.riskLevel)}`}>
                                {strategy.riskLevel.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-6">
                  <div className="text-gray-300 mb-6">
                    Create your own auto-cashout strategy with custom settings.
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Custom Strategy</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Target Multiplier
                        </label>
                        <input
                          type="number"
                          min="1.1"
                          max="100"
                          step="0.1"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                          placeholder="2.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Stop Loss (Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                          placeholder="0.50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Max Bet Amount
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                          placeholder="100.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Auto-increase on Win
                        </label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500">
                          <option value="none">No Change</option>
                          <option value="double">Double Bet</option>
                          <option value="1.5x">1.5x Bet</option>
                          <option value="reset">Reset to Base</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="enableCustom"
                        className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="enableCustom" className="text-white">
                        Enable Custom Strategy
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="text-gray-300 mb-6">
                    Advanced features for experienced players.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5 text-blue-400" />
                        Trend Analysis
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Use Historical Data</span>
                          <input type="checkbox" className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Adapt to Patterns</span>
                          <input type="checkbox" className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Smart Multiplier</span>
                          <input type="checkbox" className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BoltIcon className="w-5 h-5 text-yellow-400" />
                        Quick Actions
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Emergency Stop</span>
                          <input type="checkbox" className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Panic Cashout</span>
                          <input type="checkbox" className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Loss Protection</span>
                          <input type="checkbox" className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {strategies.filter(s => s.enabled).length > 0 && (
                  <span className="text-green-400">
                    ✓ Auto-cashout enabled at {strategies.find(s => s.enabled)?.multiplier.toFixed(1)}x
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 