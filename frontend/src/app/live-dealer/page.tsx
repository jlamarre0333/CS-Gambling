'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiHeart, FiMessageCircle, FiUsers, FiTrendingUp, FiStar, FiClock, FiVideo, FiMic } from 'react-icons/fi';

interface Dealer {
  id: string;
  name: string;
  avatar: string;
  isLive: boolean;
  game: string;
  rating: number;
  viewers: number;
  tips: number;
  languages: string[];
  experience: string;
  nextSession?: string;
}

interface LiveTable {
  id: string;
  game: string;
  dealer: Dealer;
  minBet: number;
  maxBet: number;
  players: number;
  maxPlayers: number;
  isVip: boolean;
}

const mockDealers: Dealer[] = [
  {
    id: '1',
    name: 'Sophia Chen',
    avatar: '/api/placeholder/150/150',
    isLive: true,
    game: 'Roulette',
    rating: 4.9,
    viewers: 247,
    tips: 1250,
    languages: ['English', 'Mandarin'],
    experience: '3 years'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    avatar: '/api/placeholder/150/150',
    isLive: true,
    game: 'Blackjack',
    rating: 4.8,
    viewers: 189,
    tips: 980,
    languages: ['English', 'Spanish'],
    experience: '5 years'
  },
  {
    id: '3',
    name: 'Elena Petrov',
    avatar: '/api/placeholder/150/150',
    isLive: false,
    game: 'Roulette',
    rating: 4.7,
    viewers: 0,
    tips: 750,
    languages: ['English', 'Russian'],
    experience: '2 years',
    nextSession: '2:00 PM EST'
  }
];

const mockTables: LiveTable[] = [
  {
    id: '1',
    game: 'European Roulette',
    dealer: mockDealers[0],
    minBet: 1,
    maxBet: 500,
    players: 12,
    maxPlayers: 15,
    isVip: false
  },
  {
    id: '2',
    game: 'VIP Blackjack',
    dealer: mockDealers[1],
    minBet: 10,
    maxBet: 2000,
    players: 6,
    maxPlayers: 7,
    isVip: true
  }
];

export default function LiveDealerPage() {
  const [selectedTable, setSelectedTable] = useState<LiveTable | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date, isDealer: boolean}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [tipAmount, setTipAmount] = useState(1);
  const [showTipModal, setShowTipModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTable) {
        const messages = [
          { user: selectedTable.dealer.name, message: "Good luck everyone! Next spin coming up!", isDealer: true },
          { user: "Player123", message: "Going all in on red!", isDealer: false },
          { user: "SkinMaster", message: "Thanks for the great stream!", isDealer: false },
          { user: selectedTable.dealer.name, message: "Thank you for the tip! 🎰", isDealer: true },
          { user: "CSGOPro", message: "What's your strategy for tonight?", isDealer: false }
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          user: randomMessage.user,
          message: randomMessage.message,
          timestamp: new Date(),
          isDealer: randomMessage.isDealer
        }]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedTable]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = () => {
    if (newMessage.trim() && selectedTable) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        user: 'You',
        message: newMessage,
        timestamp: new Date(),
        isDealer: false
      }]);
      setNewMessage('');
    }
  };

  const sendTip = () => {
    if (selectedTable && tipAmount > 0) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        user: 'System',
        message: `You tipped ${selectedTable.dealer.name} $${tipAmount}! 💰`,
        timestamp: new Date(),
        isDealer: false
      }]);
      setShowTipModal(false);
      setTipAmount(1);
    }
  };

  if (selectedTable) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <button 
              onClick={() => setSelectedTable(null)}
              className="gaming-button"
            >
              ← Back to Lobby
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              {selectedTable.game} with {selectedTable.dealer.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiUsers className="text-orange-400" />
                <span>{selectedTable.players}/{selectedTable.maxPlayers}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">LIVE</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video Stream */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-3"
            >
              <div className="gaming-card p-6">
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiVideo size={64} className="text-gray-600" />
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      {isVideoMuted ? <FiVolumeX /> : <FiVolume2 />}
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold">Current Game: {selectedTable.game}</span>
                        <span className="text-orange-400 font-bold">Min: ${selectedTable.minBet} | Max: ${selectedTable.maxBet}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-400 to-red-600 h-2 rounded-full w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="gaming-button bg-green-600 hover:bg-green-700">
                    Place Bet
                  </button>
                  <button className="gaming-button bg-blue-600 hover:bg-blue-700">
                    View Table Stats
                  </button>
                  <button 
                    onClick={() => setShowTipModal(true)}
                    className="gaming-button bg-yellow-600 hover:bg-yellow-700"
                  >
                    <FiHeart className="inline mr-2" />
                    Tip Dealer
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Chat & Dealer Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Dealer Info */}
              <div className="gaming-card p-4">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
                    {selectedTable.dealer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xl font-bold">{selectedTable.dealer.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <FiStar className="text-yellow-400" />
                    <span>{selectedTable.dealer.rating}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedTable.dealer.experience} experience
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Viewers:</span>
                    <span className="text-orange-400">{selectedTable.dealer.viewers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tips Today:</span>
                    <span className="text-green-400">${selectedTable.dealer.tips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <span className="text-blue-400">{selectedTable.dealer.languages.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="gaming-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FiMessageCircle className="text-orange-400" />
                  <h3 className="text-lg font-bold">Live Chat</h3>
                </div>
                
                <div className="h-64 overflow-y-auto mb-4 space-y-2">
                  {chatMessages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded-lg text-sm ${
                        msg.isDealer ? 'bg-orange-600/20 border-l-2 border-orange-400' :
                        msg.user === 'You' ? 'bg-blue-600/20 border-l-2 border-blue-400' :
                        msg.user === 'System' ? 'bg-green-600/20 border-l-2 border-green-400' :
                        'bg-gray-700/50'
                      }`}
                    >
                      <div className="font-semibold text-xs mb-1">
                        {msg.user}
                        {msg.isDealer && <span className="text-orange-400 ml-1">🎰</span>}
                      </div>
                      <div>{msg.message}</div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="gaming-input flex-1"
                  />
                  <button 
                    onClick={sendMessage}
                    className="gaming-button px-4"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tip Modal */}
        <AnimatePresence>
          {showTipModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="gaming-card p-6 max-w-md mx-4"
              >
                <h3 className="text-xl font-bold mb-4">Tip {selectedTable.dealer.name}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tip Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(parseInt(e.target.value) || 1)}
                    className="gaming-input w-full"
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  {[1, 5, 10, 25].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={`px-3 py-1 rounded transition-colors ${
                        tipAmount === amount 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTipModal(false)}
                    className="gaming-button bg-gray-600 hover:bg-gray-700 flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendTip}
                    className="gaming-button bg-green-600 hover:bg-green-700 flex-1"
                  >
                    Send Tip
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
            Live Dealer Casino
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the thrill of real casino games with professional dealers streaming live
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: 'Live Tables', value: '8', icon: FiVideo },
            { label: 'Active Players', value: '1,247', icon: FiUsers },
            { label: 'Online Dealers', value: '12', icon: FiStar },
            { label: 'Total Tips Today', value: '$15,640', icon: FiTrendingUp }
          ].map((stat, index) => (
            <div key={index} className="gaming-card p-6 text-center">
              <stat.icon className="mx-auto mb-3 text-orange-400" size={24} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Live Tables */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">Live Tables</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockTables.map((table) => (
              <motion.div 
                key={table.id}
                whileHover={{ scale: 1.02 }}
                className="gaming-card p-6 cursor-pointer"
                onClick={() => setSelectedTable(table)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{table.game}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                      {table.isVip && (
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">VIP</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Players</div>
                    <div className="text-lg font-bold text-orange-400">
                      {table.players}/{table.maxPlayers}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center text-lg font-bold">
                    {table.dealer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{table.dealer.name}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <FiStar className="text-yellow-400" size={12} />
                      <span>{table.dealer.rating}</span>
                      <span className="mx-1">•</span>
                      <span>{table.dealer.viewers} viewers</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-400">Bet Range: </span>
                    <span className="text-green-400">${table.minBet} - ${table.maxBet}</span>
                  </div>
                  <button className="gaming-button py-2 px-4">
                    Join Table
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dealer Schedule */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-6">Dealer Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockDealers.map((dealer) => (
              <div key={dealer.id} className="gaming-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {dealer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold">{dealer.name}</div>
                    <div className="text-sm text-gray-400">{dealer.game}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <FiStar className="text-yellow-400" size={12} />
                      <span>{dealer.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span className="text-blue-400">{dealer.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <span className="text-green-400">{dealer.languages.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    {dealer.isLive ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Live Now
                      </span>
                    ) : (
                      <span className="text-orange-400 flex items-center gap-1">
                        <FiClock size={12} />
                        Next: {dealer.nextSession}
                      </span>
                    )}
                  </div>
                </div>

                {dealer.isLive ? (
                  <button 
                    onClick={() => {
                      const table = mockTables.find(t => t.dealer.id === dealer.id);
                      if (table) setSelectedTable(table);
                    }}
                    className="gaming-button w-full bg-green-600 hover:bg-green-700"
                  >
                    Join Table
                  </button>
                ) : (
                  <button className="gaming-button w-full bg-gray-600" disabled>
                    Offline
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 