import { useState, useEffect, useRef, useCallback } from 'react'

interface SoundPreferences {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  isMuted: boolean
  backgroundMusicEnabled: boolean
}

interface SoundEffects {
  [key: string]: HTMLAudioElement
}

type SoundType = 
  | 'wheel_spin'
  | 'wheel_tick'
  | 'wheel_stop'
  | 'bet_place'
  | 'bet_win'
  | 'bet_lose'
  | 'big_win'
  | 'jackpot_win'
  | 'crash_takeoff'
  | 'crash_explosion'
  | 'coin_flip'
  | 'notification'
  | 'button_click'
  | 'error'

export const useSound = () => {
  const [preferences, setPreferences] = useState<SoundPreferences>({
    masterVolume: 0.7,
    musicVolume: 0.4,
    effectsVolume: 0.8,
    isMuted: false,
    backgroundMusicEnabled: true
  })

  const [isLoading, setIsLoading] = useState(true)
  const soundEffects = useRef<SoundEffects>({})
  const backgroundMusic = useRef<HTMLAudioElement | null>(null)
  const currentlyPlaying = useRef<Set<string>>(new Set())

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('soundPreferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to parse saved sound preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('soundPreferences', JSON.stringify(preferences))
  }, [preferences])

  // Initialize audio files
  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Sound effect mappings - using placeholder URLs for now
        // In production, these would be actual audio files
        const soundMappings: Record<SoundType, string> = {
          wheel_spin: '/sounds/wheel-spin.mp3',
          wheel_tick: '/sounds/wheel-tick.mp3', 
          wheel_stop: '/sounds/wheel-stop.mp3',
          bet_place: '/sounds/bet-place.mp3',
          bet_win: '/sounds/bet-win.mp3',
          bet_lose: '/sounds/bet-lose.mp3',
          big_win: '/sounds/big-win.mp3',
          jackpot_win: '/sounds/jackpot-win.mp3',
          crash_takeoff: '/sounds/crash-takeoff.mp3',
          crash_explosion: '/sounds/crash-explosion.mp3',
          coin_flip: '/sounds/coin-flip.mp3',
          notification: '/sounds/notification.mp3',
          button_click: '/sounds/button-click.mp3',
          error: '/sounds/error.mp3'
        }

        // Load sound effects
        Object.entries(soundMappings).forEach(([key, src]) => {
          const audio = new Audio()
          audio.preload = 'auto'
          audio.volume = 0 // Start muted, will be set by preferences
          
          // For demo purposes, we'll create silent audio elements
          // Replace this with actual audio loading in production
          soundEffects.current[key] = audio
        })

        // Load background music
        backgroundMusic.current = new Audio('/sounds/ambient-casino.mp3')
        if (backgroundMusic.current) {
          backgroundMusic.current.loop = true
          backgroundMusic.current.volume = 0
          backgroundMusic.current.preload = 'auto'
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load audio files:', error)
        setIsLoading(false)
      }
    }

    loadAudio()

    // Cleanup function
    return () => {
      Object.values(soundEffects.current).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      if (backgroundMusic.current) {
        backgroundMusic.current.pause()
        backgroundMusic.current.src = ''
      }
    }
  }, [])

  // Update volumes when preferences change
  useEffect(() => {
    const effectVolume = preferences.isMuted ? 0 : preferences.masterVolume * preferences.effectsVolume
    const musicVolume = preferences.isMuted ? 0 : preferences.masterVolume * preferences.musicVolume

    // Update sound effect volumes
    Object.values(soundEffects.current).forEach(audio => {
      audio.volume = effectVolume
    })

    // Update background music volume
    if (backgroundMusic.current) {
      backgroundMusic.current.volume = musicVolume
    }
  }, [preferences])

  // Background music control
  useEffect(() => {
    if (!backgroundMusic.current) return

    if (preferences.backgroundMusicEnabled && !preferences.isMuted) {
      const playPromise = backgroundMusic.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Background music autoplay blocked:', error)
        })
      }
    } else {
      backgroundMusic.current.pause()
    }
  }, [preferences.backgroundMusicEnabled, preferences.isMuted])

  // Play sound effect
  const playSound = useCallback((soundType: SoundType, options?: { 
    volume?: number
    loop?: boolean
    fadeIn?: boolean
  }) => {
    if (preferences.isMuted || isLoading) return

    const audio = soundEffects.current[soundType]
    if (!audio) {
      console.warn(`Sound effect '${soundType}' not found`)
      return
    }

    try {
      // Reset audio to start
      audio.currentTime = 0
      
      // Apply options
      if (options?.volume !== undefined) {
        audio.volume = Math.min(1, options.volume * preferences.masterVolume * preferences.effectsVolume)
      }
      
      if (options?.loop !== undefined) {
        audio.loop = options.loop
      }

      // Track currently playing sounds
      const soundId = `${soundType}-${Date.now()}`
      currentlyPlaying.current.add(soundId)

      // Play the sound
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (options?.fadeIn) {
              // Implement fade-in effect
              audio.volume = 0
              let currentVol = 0
              const targetVol = options.volume || (preferences.masterVolume * preferences.effectsVolume)
              const fadeInterval = setInterval(() => {
                currentVol += 0.1
                audio.volume = Math.min(targetVol, currentVol)
                if (currentVol >= targetVol) {
                  clearInterval(fadeInterval)
                }
              }, 50)
            }
          })
          .catch(error => {
            console.warn(`Failed to play sound '${soundType}':`, error)
            currentlyPlaying.current.delete(soundId)
          })
      }

      // Remove from tracking when finished
      audio.addEventListener('ended', () => {
        currentlyPlaying.current.delete(soundId)
      }, { once: true })

    } catch (error) {
      console.error(`Error playing sound '${soundType}':`, error)
    }
  }, [preferences, isLoading])

  // Stop specific sound
  const stopSound = useCallback((soundType: SoundType) => {
    const audio = soundEffects.current[soundType]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    Object.values(soundEffects.current).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    currentlyPlaying.current.clear()
  }, [])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<SoundPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setPreferences(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }, [])

  // Convenience functions for common game sounds
  const gameActions = {
    wheelSpin: () => playSound('wheel_spin', { loop: true }),
    wheelTick: () => playSound('wheel_tick'),
    wheelStop: () => {
      stopSound('wheel_spin')
      playSound('wheel_stop')
    },
    placeBet: () => playSound('bet_place'),
    winSmall: () => playSound('bet_win'),
    winBig: () => playSound('big_win'),
    winJackpot: () => playSound('jackpot_win', { volume: 1.0 }),
    lose: () => playSound('bet_lose'),
    crashTakeoff: () => playSound('crash_takeoff', { loop: true }),
    crashExplosion: () => {
      stopSound('crash_takeoff')
      playSound('crash_explosion')
    },
    coinFlip: () => playSound('coin_flip'),
    notification: () => playSound('notification'),
    buttonClick: () => playSound('button_click', { volume: 0.3 }),
    error: () => playSound('error')
  }

  return {
    preferences,
    isLoading,
    playSound,
    stopSound,
    stopAllSounds,
    updatePreferences,
    toggleMute,
    gameActions,
    isPlaying: currentlyPlaying.current.size > 0
  }
} 