'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrophy, 
  FiUsers, 
  FiClock, 
  FiDollarSign, 
  FiCalendar, 
  FiTarget,
  FiStar,
  FiPlay,
  FiAward,
  FiTrendingUp,
  FiFilter,
  FiSearch
} from 'react-icons/fi';

interface Player {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  wins: number;
  losses: number;
  earnings: number;
  level: number;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: 'upcoming' | 'active' | 'completed';
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  format: 'single-elimination' | 'double-elimination' | 'swiss' | 'round-robin';
  description: string;
  isVip: boolean;
  winner?: Player;
  brackets?: any[];
  participants: Player[];
}

const mockPlayers: Player[] = [
  {
    id: '1',
    username: 'SkinMaster',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 2450,
    wins: 47,
    losses: 12,
    earnings: 15670.50,
    level: 25
  },
  {
    id: '2',
    username: 'ProGamer2024',
    avatar: 'https://i.pravatar.cc/150?img=22',
    rating: 2380,
    wins: 52,
    losses: 18,
    earnings: 12890.75,
    level: 23
  },
  {
    id: '3',
    username: 'CSLegend',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 2350,
    wins: 41,
    losses: 15,
    earnings: 11450.25,
    level: 21
  },
  {
    id: '4',
    username: 'CrashKing',
    avatar: 'https://i.pravatar.cc/150?img=44',
    rating: 2290,
    wins: 38,
    losses: 19,
    earnings: 9875.00,
    level: 19
  }
];

const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Weekend Warrior Championship',
    game: 'Crash',
    status: 'upcoming',
    entryFee: 25,
    prizePool: 1250,
    maxPlayers: 64,
    currentPlayers: 47,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 180,
    format: 'single-elimination',
    description: 'High-stakes crash tournament with elimination rounds',
    isVip: false,
    participants: mockPlayers.slice(0, 4)
  },
  {
    id: '2',
    name: 'VIP Roulette Masters',
    game: 'Roulette',
    status: 'active',
    entryFee: 100,
    prizePool: 5000,
    maxPlayers: 32,
    currentPlayers: 32,
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
    duration: 240,
    format: 'swiss',
    description: 'Exclusive roulette tournament for VIP members',
    isVip: true,
    participants: mockPlayers
  },
  {
    id: '3',
    name: 'Daily Coin Flip Showdown',
    game: 'Coin Flip',
    status: 'completed',
    entryFee: 10,
    prizePool: 320,
    maxPlayers: 32,
    currentPlayers: 32,
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 120,
    format: 'single-elimination',
    description: 'Fast-paced coin flip elimination tournament',
    isVip: false,
    winner: mockPlayers[0],
    participants: mockPlayers
  },
  {
    id: '4',
    name: 'Blackjack Championship Series',
    game: 'Blackjack',
    status: 'upcoming',
    entryFee: 50,
    prizePool: 2500,
    maxPlayers: 48,
    currentPlayers: 31,
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    duration: 300,
    format: 'double-elimination',
    description: 'Professional blackjack tournament with live dealers',
    isVip: false,
    participants: mockPlayers.slice(0, 3)
  }
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesStatus = filter === 'all' || tournament.status === filter;
    const matchesGame = gameFilter === 'all' || tournament.game === gameFilter;
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tournament.game.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesGame && matchesSearch;
  });

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-500/20';
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'completed': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const joinTournament = (tournamentId: string) => {
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, currentPlayers: Math.min(t.currentPlayers + 1, t.maxPlayers) }
        : t
    ));
  };

  if (selectedTournament) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button 
              onClick={() => setSelectedTournament(null)}
              className="gaming-button"
            >
              ← Back to Tournaments
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                {selectedTournament.name}
              </h1>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTournament.status)}`}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                {selectedTournament.status.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">${selectedTournament.prizePool.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Prize Pool</div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tournament Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Bracket Visualization */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiTarget className="text-orange-400" />
                  Tournament Bracket
                </h3>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {/* Round 1 */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 text-center">Round 1</h4>
                      {[1,2,3,4].map(i => (
                        <div key={i} className="bg-gray-700/50 rounded p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Player {i}</span>
                            <span className="text-green-400">✓</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Round 2 */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 text-center">Round 2</h4>
                      {[1,2].map(i => (
                        <div key={i} className="bg-gray-700/50 rounded p-2 text-sm mb-8">
                          <div className="flex justify-between items-center">
                            <span>Winner {i}</span>
                            <span className="text-yellow-400">⏳</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Finals */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 text-center">Finals</h4>
                      <div className="bg-gray-700/50 rounded p-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Finalist</span>
                          <span className="text-gray-400">—</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 text-center">Champion</h4>
                      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded p-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400">
                            {selectedTournament.winner?.username || 'TBD'}
                          </span>
                          <FiTrophy className="text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Progress */}
              {selectedTournament.status === 'active' && (
                <div className="gaming-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-green-400" />
                    Live Progress
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Tournament Progress</span>
                      <span className="text-green-400">Round 2 of 6</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-400 to-red-600 h-3 rounded-full w-1/3"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">16</div>
                        <div className="text-sm text-gray-400">Players Remaining</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">45m</div>
                        <div className="text-sm text-gray-400">Time Remaining</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Tournament Details */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold mb-4">Tournament Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Game:</span>
                    <span className="text-white font-medium">{selectedTournament.game}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white font-medium capitalize">{selectedTournament.format.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Fee:</span>
                    <span className="text-green-400 font-medium">${selectedTournament.entryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-medium">{selectedTournament.duration}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Players:</span>
                    <span className="text-white font-medium">
                      {selectedTournament.currentPlayers}/{selectedTournament.maxPlayers}
                    </span>
                  </div>
                  
                  {selectedTournament.status === 'upcoming' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Starts in:</span>
                      <span className="text-blue-400 font-medium">
                        {formatTimeUntil(selectedTournament.startTime)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedTournament.status === 'upcoming' && selectedTournament.currentPlayers < selectedTournament.maxPlayers && (
                  <button 
                    onClick={() => joinTournament(selectedTournament.id)}
                    className="gaming-button w-full mt-6 bg-green-600 hover:bg-green-700"
                  >
                    <FiPlay className="inline mr-2" />
                    Join Tournament
                  </button>
                )}
              </div>

              {/* Prize Distribution */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiAward className="text-yellow-400" />
                  Prize Distribution
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FiTrophy className="text-yellow-400" />
                      <span>1st Place</span>
                    </div>
                    <span className="text-yellow-400 font-bold">
                      ${(selectedTournament.prizePool * 0.5).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FiTrophy className="text-gray-300" />
                      <span>2nd Place</span>
                    </div>
                    <span className="text-gray-300 font-bold">
                      ${(selectedTournament.prizePool * 0.3).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FiTrophy className="text-orange-400" />
                      <span>3rd Place</span>
                    </div>
                    <span className="text-orange-400 font-bold">
                      ${(selectedTournament.prizePool * 0.2).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiUsers className="text-blue-400" />
                  Top Participants
                </h3>
                
                <div className="space-y-3">
                  {selectedTournament.participants.slice(0, 8).map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3">
                      <div className="text-sm text-gray-400 w-6">#{index + 1}</div>
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {player.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{player.username}</div>
                        <div className="text-xs text-gray-400">Rating: {player.rating}</div>
                      </div>
                      <div className="text-xs text-green-400">
                        ${player.earnings.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            Tournament Arena
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compete in scheduled tournaments with real prize pools and climb the rankings
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Active Tournaments', value: tournaments.filter(t => t.status === 'active').length.toString(), icon: FiPlay },
            { label: 'Total Prize Pool', value: `$${tournaments.reduce((sum, t) => sum + t.prizePool, 0).toLocaleString()}`, icon: FiDollarSign },
            { label: 'Registered Players', value: tournaments.reduce((sum, t) => sum + t.currentPlayers, 0).toString(), icon: FiUsers },
            { label: 'Completed Today', value: tournaments.filter(t => t.status === 'completed').length.toString(), icon: FiTrophy }
          ].map((stat, index) => (
            <div key={index} className="gaming-card p-6 text-center">
              <stat.icon className="mx-auto mb-3 text-orange-400" size={24} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gaming-card p-6 mb-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-orange-400" />
              <span className="font-medium">Filters:</span>
            </div>
            
            {/* Status Filter */}
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="gaming-input px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            {/* Game Filter */}
            <select 
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="gaming-input px-3 py-2"
            >
              <option value="all">All Games</option>
              <option value="Crash">Crash</option>
              <option value="Roulette">Roulette</option>
              <option value="Coin Flip">Coin Flip</option>
              <option value="Blackjack">Blackjack</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gaming-input pl-10 w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Tournaments Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {filteredTournaments.map((tournament, index) => (
            <motion.div 
              key={tournament.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => setSelectedTournament(tournament)}
            >
              <div className="gaming-card p-6 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-orange-400 transition-colors">
                      {tournament.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400">{tournament.game}</span>
                      {tournament.isVip && (
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">VIP</span>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                    {tournament.status.toUpperCase()}
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    ${tournament.prizePool.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Prize Pool</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </div>
                    <div className="text-xs text-gray-400">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      ${tournament.entryFee}
                    </div>
                    <div className="text-xs text-gray-400">Entry Fee</div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="mb-6">
                  {tournament.status === 'upcoming' && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock className="text-blue-400" />
                      <span className="text-gray-400">Starts in:</span>
                      <span className="text-blue-400 font-medium">
                        {formatTimeUntil(tournament.startTime)}
                      </span>
                    </div>
                  )}
                  
                  {tournament.status === 'active' && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-medium">LIVE NOW</span>
                    </div>
                  )}
                  
                  {tournament.status === 'completed' && tournament.winner && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiTrophy className="text-yellow-400" />
                      <span className="text-gray-400">Winner:</span>
                      <span className="text-yellow-400 font-medium">{tournament.winner.username}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Registration</span>
                    <span>{Math.round((tournament.currentPlayers / tournament.maxPlayers) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  {tournament.status === 'upcoming' && tournament.currentPlayers < tournament.maxPlayers ? (
                    <div className="gaming-button w-full bg-green-600 hover:bg-green-700 text-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Join Tournament
                    </div>
                  ) : tournament.status === 'active' ? (
                    <div className="gaming-button w-full bg-blue-600 hover:bg-blue-700 text-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Watch Live
                    </div>
                  ) : (
                    <div className="gaming-button w-full bg-gray-600 text-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      View Results
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}