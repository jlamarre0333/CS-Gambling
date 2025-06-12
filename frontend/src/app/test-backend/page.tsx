'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useUser } from '@/contexts/UserContext'

export default function TestBackend() {
  const { user, login, logout, isLoading } = useUser()
  const [health, setHealth] = useState<any>(null)
  const [lastBet, setLastBet] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('TestUser123')

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const healthData = await api.getHealth()
      setHealth(healthData)
    } catch (err) {
      setError('Failed to connect to backend')
    }
  }

  const handleLogin = async () => {
    if (!username.trim()) return
    
    const success = await login(username.trim())
    if (!success) {
      setError('Failed to log in')
    } else {
      setError(null)
    }
  }

  const placeDemoBet = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const result = await api.placeBet(user.id, 'crash', 50)
      setLastBet(result.game)
      // The user context will be updated automatically through the updateUser function
      window.location.reload() // Refresh to see updated balance
    } catch (err) {
      setError('Failed to place bet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Backend Connection Test
        </h1>
        
        {/* Health Check */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🏥 Health Check</h2>
          {health ? (
            <div className="text-green-400">
              <p>✅ Backend is connected!</p>
              <p>Status: {health.status}</p>
              <p>Users: {health.users}</p>
              <p>Games: {health.games}</p>
              <p>Timestamp: {new Date(health.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-400">❌ Backend not responding</p>
          )}
        </div>

        {/* User Login */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">👤 User Login</h2>
          {!user ? (
            <div className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleLogin}
                disabled={isLoading || !username.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {isLoading ? 'Logging in...' : 'Login / Create User'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-green-400">
                <p>✅ Logged in!</p>
                <p>ID: {user.id}</p>
                <p>Username: {user.username}</p>
                <p>Balance: ${user.balance.toFixed(2)}</p>
                <p>Level: {user.level}</p>
                {user.stats && (
                  <div className="mt-2 text-blue-400">
                    <p>Stats: {user.stats.wins}/{user.stats.totalGames} wins</p>
                    <p>Total Won: ${user.stats.totalWon.toFixed(2)}</p>
                    <p>Total Wagered: ${user.stats.totalWagered.toFixed(2)}</p>
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Demo Betting */}
        {user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">🎲 Demo Betting</h2>
            <button
              onClick={placeDemoBet}
              disabled={loading || user.balance < 50}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold mb-4"
            >
              {loading ? 'Placing Bet...' : 'Place $50 Bet on Crash'}
            </button>
            
            {user.balance < 50 && (
              <p className="text-yellow-400 mb-4">⚠️ Insufficient balance for $50 bet</p>
            )}
            
            {lastBet && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Last Bet Result:</h3>
                <p className="text-white">Game Type: {lastBet.gameType}</p>
                <p className="text-white">Bet Amount: ${lastBet.betAmount}</p>
                <p className="text-white">Win Amount: ${lastBet.winAmount}</p>
                <p className={`font-bold ${lastBet.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  Result: {lastBet.result.toUpperCase()}
                </p>
                {lastBet.multiplier && lastBet.multiplier > 0 && (
                  <p className="text-white">Multiplier: {lastBet.multiplier.toFixed(2)}x</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {/* Game Links */}
        {user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">🎮 Test Games</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/crash"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-center font-semibold"
              >
                🚀 Test Crash Game
              </a>
              <a
                href="/coinflip"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg text-center font-semibold"
              >
                🪙 Test Coinflip Game
              </a>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">🔄 Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={checkHealth}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Refresh Health
            </button>
            <a
              href="http://localhost:3001/health"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              View Backend Directly
            </a>
            <a
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 