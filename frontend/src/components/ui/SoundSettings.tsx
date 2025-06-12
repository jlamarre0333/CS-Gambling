'use client'

import React, { useState } from 'react'
import { 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon, 
  MusicalNoteIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useSound } from '@/hooks/useSound'

interface SoundSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, toggleMute, gameActions } = useSound()

  if (!isOpen) return null

  const handleVolumeChange = (type: 'master' | 'music' | 'effects', value: number) => {
    const updates = {
      [`${type}Volume`]: value / 100
    }
    updatePreferences(updates)
    
    // Play test sound for effects volume
    if (type === 'effects') {
      gameActions.buttonClick()
    }
  }

  const handleToggleBackgroundMusic = () => {
    updatePreferences({ backgroundMusicEnabled: !preferences.backgroundMusicEnabled })
  }

  const VolumeSlider: React.FC<{
    label: string
    value: number
    onChange: (value: number) => void
    icon: React.ReactNode
    testSound?: () => void
  }> = ({ label, value, onChange, icon, testSound }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-white font-medium">{label}</span>
        </div>
        <span className="text-accent-primary text-sm font-mono">
          {Math.round(value)}%
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gaming-darker rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #00f5ff 0%, #00f5ff ${value}%, #1a1a1a ${value}%, #1a1a1a 100%)`
          }}
        />
        {testSound && (
          <button
            onClick={testSound}
            className="absolute right-0 top-6 text-xs text-gray-400 hover:text-accent-primary transition-colors"
          >
            Test
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gaming-card border border-gray-700 rounded-lg shadow-neon max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-primary/20 rounded-lg">
              <SpeakerWaveIcon className="w-6 h-6 text-accent-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Sound Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Master Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Master Controls
            </h3>
            
            {/* Mute Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Mute All Sounds</span>
              <button
                onClick={toggleMute}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${preferences.isMuted ? 'bg-gray-600' : 'bg-accent-primary'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${preferences.isMuted ? 'translate-x-1' : 'translate-x-6'}
                  `}
                />
              </button>
            </div>

            {/* Master Volume */}
            {!preferences.isMuted && (
              <VolumeSlider
                label="Master Volume"
                value={preferences.masterVolume * 100}
                onChange={(value) => handleVolumeChange('master', value)}
                icon={<SpeakerWaveIcon className="w-5 h-5 text-accent-primary" />}
              />
            )}
          </div>

          {/* Individual Controls */}
          {!preferences.isMuted && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Volume Controls
              </h3>
              
              {/* Effects Volume */}
              <VolumeSlider
                label="Sound Effects"
                value={preferences.effectsVolume * 100}
                onChange={(value) => handleVolumeChange('effects', value)}
                icon={<Cog6ToothIcon className="w-5 h-5 text-yellow-400" />}
                testSound={gameActions.buttonClick}
              />

              {/* Music Volume */}
              <VolumeSlider
                label="Background Music"
                value={preferences.musicVolume * 100}
                onChange={(value) => handleVolumeChange('music', value)}
                icon={<MusicalNoteIcon className="w-5 h-5 text-purple-400" />}
              />

              {/* Background Music Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Enable Background Music</span>
                <button
                  onClick={handleToggleBackgroundMusic}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${preferences.backgroundMusicEnabled ? 'bg-accent-primary' : 'bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${preferences.backgroundMusicEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Sound Test Section */}
          {!preferences.isMuted && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Test Sounds
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={gameActions.wheelSpin}
                  className="p-3 bg-gaming-darker hover:bg-gaming-hover rounded-lg text-sm text-white transition-colors"
                >
                  🎡 Wheel Spin
                </button>
                <button
                  onClick={gameActions.winSmall}
                  className="p-3 bg-gaming-darker hover:bg-gaming-hover rounded-lg text-sm text-white transition-colors"
                >
                  🎉 Small Win
                </button>
                <button
                  onClick={gameActions.winBig}
                  className="p-3 bg-gaming-darker hover:bg-gaming-hover rounded-lg text-sm text-white transition-colors"
                >
                  💰 Big Win
                </button>
                <button
                  onClick={gameActions.coinFlip}
                  className="p-3 bg-gaming-darker hover:bg-gaming-hover rounded-lg text-sm text-white transition-colors"
                >
                  🪙 Coin Flip
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Sound settings are automatically saved and will persist between sessions
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00f5ff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
          border: 2px solid #0d1117;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00f5ff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
          border: 2px solid #0d1117;
        }
      `}</style>
    </div>
  )
}

// Quick sound toggle button for header/navigation
export const SoundToggle: React.FC = () => {
  const { preferences, toggleMute } = useSound()
  
  return (
    <button
      onClick={toggleMute}
      className="p-2 text-gray-300 hover:text-white transition-colors"
      title={preferences.isMuted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {preferences.isMuted ? (
        <SpeakerXMarkIcon className="w-5 h-5" />
      ) : (
        <SpeakerWaveIcon className="w-5 h-5" />
      )}
    </button>
  )
} 