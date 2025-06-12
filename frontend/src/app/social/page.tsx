'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  FireIcon,
  SparklesIcon,
  GiftIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  level: number;
  lastSeen: Date;
  isPlaying: boolean;
  currentGame?: string;
  mutualFriends: number;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'game' | 'vip' | 'private';
  memberCount: number;
  isActive: boolean;
  lastMessage: {
    user: string;
    content: string;
    timestamp: Date;
  };
  description?: string;
}

interface ActivityFeedItem {
  id: string;
  type: 'win' | 'achievement' | 'level_up' | 'friend_join' | 'tournament' | 'jackpot';
  user: {
    username: string;
    avatar: string;
    level: number;
  };
  content: string;
  details?: any;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  comments: number;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
  maxProgress: number;
  reward: {
    type: 'coins' | 'items' | 'badge' | 'xp';
    amount: number;
    description: string;
  };
  participants: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

const mockFriends: Friend[] = [
  {
    id: '1',
    username: 'PlayerOne',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    status: 'online',
    level: 24,
    lastSeen: new Date(),
    isPlaying: true,
    currentGame: 'Crash',
    mutualFriends: 3
  },
  {
    id: '2',
    username: 'CsGoMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    status: 'away',
    level: 18,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    isPlaying: false,
    mutualFriends: 7
  },
  {
    id: '3',
    username: 'LuckyGamer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    status: 'online',
    level: 31,
    lastSeen: new Date(),
    isPlaying: true,
    currentGame: 'Roulette',
    mutualFriends: 1
  }
];

const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General Chat',
    type: 'general',
    memberCount: 1247,
    isActive: true,
    lastMessage: {
      user: 'PlayerOne',
      content: 'Just hit a 10x multiplier! 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    description: 'Main community chat for all players'
  },
  {
    id: '2',
    name: 'Crash Masters',
    type: 'game',
    memberCount: 423,
    isActive: true,
    lastMessage: {
      user: 'CrashPro',
      content: 'Anyone else seeing this pattern?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    description: 'Dedicated chat for Crash game enthusiasts'
  },
  {
    id: '3',
    name: 'VIP Lounge',
    type: 'vip',
    memberCount: 89,
    isActive: true,
    lastMessage: {
      user: 'HighRoller',
      content: 'Tournament starting in 10 minutes',
      timestamp: new Date(Date.now() - 1 * 60 * 1000)
    },
    description: 'Exclusive chat for VIP members only'
  }
];

const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: '1',
    type: 'win',
    user: { username: 'PlayerOne', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 24 },
    content: 'won $2,547 in Blackjack! 🃏',
    details: { amount: 2547, game: 'Blackjack', multiplier: '21' },
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    likes: 23,
    isLiked: false,
    comments: 5
  },
  {
    id: '2',
    type: 'achievement',
    user: { username: 'CsGoMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 18 },
    content: 'unlocked "High Roller" achievement! 🏆',
    details: { achievement: 'High Roller', description: 'Bet over $1,000 in a single game' },
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    likes: 41,
    isLiked: true,
    comments: 8
  },
  {
    id: '3',
    type: 'level_up',
    user: { username: 'LuckyGamer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', level: 31 },
    content: 'reached level 31! 🌟',
    details: { newLevel: 31, xpGained: 2500 },
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    likes: 17,
    isLiked: false,
    comments: 3
  },
  {
    id: '4',
    type: 'tournament',
    user: { username: 'TourneyKing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', level: 28 },
    content: 'placed 1st in Weekend Warrior Championship! 🥇',
    details: { position: 1, tournament: 'Weekend Warrior Championship', prize: 1250 },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 67,
    isLiked: true,
    comments: 12
  }
];

const mockChallenges: CommunityChallenge[] = [
  {
    id: '1',
    title: 'Daily Streak Master',
    description: 'Win 5 games in a row today',
    type: 'daily',
    status: 'active',
    progress: 3,
    maxProgress: 5,
    reward: { type: 'coins', amount: 500, description: '500 bonus coins' },
    participants: 234,
    timeLeft: '8h 42m',
    difficulty: 'medium'
  },
  {
    id: '2',
    title: 'Community Jackpot',
    description: 'All players together win 1,000,000 coins',
    type: 'weekly',
    status: 'active',
    progress: 847293,
    maxProgress: 1000000,
    reward: { type: 'items', amount: 1, description: 'Exclusive skin collection' },
    participants: 2847,
    timeLeft: '3d 14h',
    difficulty: 'hard'
  },
  {
    id: '3',
    title: 'Crash Landing',
    description: 'Cash out at exactly 2.00x in Crash game',
    type: 'daily',
    status: 'active',
    progress: 0,
    maxProgress: 1,
    reward: { type: 'xp', amount: 1000, description: '1,000 bonus XP' },
    participants: 156,
    timeLeft: '15h 23m',
    difficulty: 'easy'
  },
  {
    id: '4',
    title: 'Monthly Leaderboard',
    description: 'Reach top 10 on monthly leaderboard',
    type: 'monthly',
    status: 'active',
    progress: 18,
    maxProgress: 10,
    reward: { type: 'badge', amount: 1, description: 'Elite Player Badge' },
    participants: 1247,
    timeLeft: '12d 8h',
    difficulty: 'extreme'
  }
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'chat' | 'challenges'>('feed');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [friendRequests, setFriendRequests] = useState(3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getChallengeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-orange-400 bg-orange-500/20';
      case 'extreme': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'win': return <TrophyIcon className="w-5 h-5 text-yellow-400" />;
      case 'achievement': return <StarIcon className="w-5 h-5 text-purple-400" />;
      case 'level_up': return <SparklesIcon className="w-5 h-5 text-blue-400" />;
      case 'friend_join': return <UserPlusIcon className="w-5 h-5 text-green-400" />;
      case 'tournament': return <TrophyIcon className="w-5 h-5 text-orange-400" />;
      case 'jackpot': return <GiftIcon className="w-5 h-5 text-red-400" />;
      default: return <FireIcon className="w-5 h-5 text-gray-400" />;
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Social Hub
          </h1>
          <p className="text-gray-400">Connect, compete, and celebrate with the community</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="gaming-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{mockFriends.length}</div>
            <div className="text-sm text-gray-400">Friends</div>
          </div>
          <div className="gaming-card p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{friendRequests}</div>
            <div className="text-sm text-gray-400">Requests</div>
          </div>
          <div className="gaming-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">1,247</div>
            <div className="text-sm text-gray-400">Following</div>
          </div>
          <div className="gaming-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">847</div>
            <div className="text-sm text-gray-400">Achievements</div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8 overflow-x-auto"
        >
          <div className="gaming-card p-2 flex gap-2 min-w-max">
            {[
              { id: 'feed', name: 'Activity Feed', icon: FireIcon },
              { id: 'friends', name: 'Friends', icon: UserGroupIcon },
              { id: 'chat', name: 'Chat Rooms', icon: ChatBubbleLeftRightIcon },
              { id: 'challenges', name: 'Challenges', icon: TrophyIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Activity Feed Tab */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Community Activity</h3>
                <div className="flex items-center gap-3">
                  <select className="gaming-input text-sm">
                    <option>All Activities</option>
                    <option>Wins</option>
                    <option>Achievements</option>
                    <option>Level Ups</option>
                  </select>
                  <button className="gaming-button bg-purple-600 hover:bg-purple-700">
                    <ShareIcon className="w-4 h-4 inline mr-2" />
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {mockActivityFeed.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="gaming-card p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {item.user.username.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-gray-900 rounded-full">
                          {getActivityIcon(item.type)}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-purple-400">{item.user.username}</span>
                          <span className="text-gray-300">{item.content}</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            Lv.{item.user.level}
                          </span>
                        </div>

                        {item.details && (
                          <div className="mb-3 p-3 bg-gray-800 rounded-lg">
                            {item.type === 'win' && (
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-400">Amount: ${item.details.amount}</span>
                                <span className="text-blue-400">Game: {item.details.game}</span>
                                <span className="text-yellow-400">Result: {item.details.multiplier}</span>
                              </div>
                            )}
                            {item.type === 'achievement' && (
                              <div className="text-sm">
                                <div className="text-yellow-400 font-medium">{item.details.achievement}</div>
                                <div className="text-gray-400">{item.details.description}</div>
                              </div>
                            )}
                            {item.type === 'tournament' && (
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-yellow-400">Position: #{item.details.position}</span>
                                <span className="text-green-400">Prize: ${item.details.prize}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{item.timestamp.toLocaleTimeString()}</span>
                            <button className={`flex items-center gap-1 ${item.isLiked ? 'text-red-400' : 'hover:text-red-400'}`}>
                              <HeartIcon className={`w-4 h-4 ${item.isLiked ? 'fill-red-400' : ''}`} />
                              {item.likes}
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-400">
                              <ChatBubbleLeftRightIcon className="w-4 h-4" />
                              {item.comments}
                            </button>
                            <button className="flex items-center gap-1 hover:text-green-400">
                              <ShareIcon className="w-4 h-4" />
                              Share
                            </button>
                          </div>
                          <EyeIcon className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Friends ({mockFriends.length})</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search friends..."
                      className="gaming-input pl-10 pr-4"
                    />
                  </div>
                  <button className="gaming-button bg-green-600 hover:bg-green-700">
                    <UserPlusIcon className="w-4 h-4 inline mr-2" />
                    Add Friend
                  </button>
                </div>
              </div>

              {friendRequests > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gaming-card p-4 border border-blue-500/30 bg-blue-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-medium">
                        You have {friendRequests} pending friend requests
                      </span>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View All
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockFriends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedFriend(friend)}
                    className="gaming-card p-6 cursor-pointer hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {friend.username.charAt(0)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(friend.status)} rounded-full border-2 border-gray-900`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{friend.username}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-purple-400">Level {friend.level}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400 capitalize">{friend.status}</span>
                        </div>
                      </div>
                    </div>

                    {friend.isPlaying && friend.currentGame && (
                      <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Playing {friend.currentGame}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {friend.mutualFriends} mutual friends
                      </span>
                      <span className="text-gray-500">
                        {friend.status === 'online' ? 'Online now' : `Last seen ${friend.lastSeen.toLocaleDateString()}`}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="gaming-button flex-1 bg-purple-600 hover:bg-purple-700 text-sm">
                        Message
                      </button>
                      <button className="gaming-button bg-gray-700 hover:bg-gray-600 text-sm">
                        Profile
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat Rooms Tab */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Chat Rooms</h3>
                <button className="gaming-button bg-blue-600 hover:bg-blue-700">
                  Create Room
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockChatRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedChatRoom(room)}
                    className="gaming-card p-6 cursor-pointer hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{room.name}</h4>
                          <p className="text-sm text-gray-400">{room.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {room.isActive && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          room.type === 'vip' 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : room.type === 'game'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {room.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-purple-400">{room.lastMessage.user}:</span>
                        <span className="text-gray-300 text-sm">{room.lastMessage.content}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {room.lastMessage.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {room.memberCount.toLocaleString()} members
                      </span>
                      <button className="gaming-button bg-blue-600 hover:bg-blue-700 text-sm">
                        Join Chat
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Community Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Community Challenges</h3>
                <div className="flex items-center gap-3">
                  <select className="gaming-input text-sm">
                    <option>All Challenges</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                  <button className="gaming-button bg-orange-600 hover:bg-orange-700">
                    My Progress
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="gaming-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <TrophyIcon className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{challenge.title}</h4>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getChallengeColor(challenge.difficulty)}`}>
                          {challenge.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{challenge.timeLeft}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-medium">
                          {challenge.progress.toLocaleString()} / {challenge.maxProgress.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <GiftIcon className="w-4 h-4 text-orange-400" />
                        <span className="font-medium text-orange-400">Reward</span>
                      </div>
                      <p className="text-sm text-gray-300">{challenge.reward.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {challenge.participants.toLocaleString()} participants
                      </span>
                      <div className="flex gap-2">
                        {challenge.status === 'completed' ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircleIcon className="w-4 h-4" />
                            Completed
                          </span>
                        ) : (
                          <button className="gaming-button bg-orange-600 hover:bg-orange-700 text-sm">
                            Join Challenge
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friend Detail Modal */}
        <AnimatePresence>
          {selectedFriend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedFriend(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="gaming-card p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{selectedFriend.username}</h3>
                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-3xl">
                        {selectedFriend.username.charAt(0)}
                      </span>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 ${getStatusColor(selectedFriend.status)} rounded-full border-2 border-gray-900`} />
                  </div>
                  <div className="text-lg font-bold">{selectedFriend.username}</div>
                  <div className="text-purple-400">Level {selectedFriend.level}</div>
                  <div className="text-gray-400 capitalize">{selectedFriend.status}</div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mutual Friends:</span>
                    <span>{selectedFriend.mutualFriends}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Seen:</span>
                    <span>{selectedFriend.lastSeen.toLocaleDateString()}</span>
                  </div>
                  {selectedFriend.isPlaying && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Currently Playing:</span>
                      <span className="text-green-400">{selectedFriend.currentGame}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button className="gaming-button flex-1 bg-purple-600 hover:bg-purple-700">
                    Send Message
                  </button>
                  <button className="gaming-button bg-blue-600 hover:bg-blue-700">
                    View Profile
                  </button>
                  <button className="gaming-button bg-gray-700 hover:bg-gray-600">
                    <CogIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 