'use client'

import React, { useState, useEffect, useRef, memo, useCallback } from 'react'
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ChatMessage {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: Date
  type: 'chat' | 'win' | 'system'
  amount?: number
}

const LiveChat = memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const gamingMessages = [
    "Just won big on crash! 🚀",
    "Anyone else playing roulette?",
    "Dragon Lore just dropped! 💎",
    "This jackpot is insane",
    "GG on that win bro",
    "Red or black this round?",
    "My inventory is stacked now 😎",
    "Crash at 1.2x again... 😭",
    "Who wants to trade skins?",
    "Best gambling site ever!",
    "Just deposited my AK Redline",
    "Coin flip anyone?",
    "This site is so smooth",
    "Provably fair = best fair",
    "Let's go gambling! 🎰"
  ]

  const users = [
    { name: 'SkinMaster', avatar: '👑' },
    { name: 'CSGOPro', avatar: '⚡' },
    { name: 'TradeKing', avatar: '💎' },
    { name: 'GamerX', avatar: '🔥' },
    { name: 'ProPlayer', avatar: '🎮' },
    { name: 'SkinCollector', avatar: '🏆' },
    { name: 'CrashExpert', avatar: '🚀' },
    { name: 'RouletteKing', avatar: '🎯' },
    { name: 'JackpotHero', avatar: '💰' },
    { name: 'SkinTrader', avatar: '⭐' }
  ]

  // Simulate live chat messages
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const user = users[Math.floor(Math.random() * users.length)]
        const messageText = gamingMessages[Math.floor(Math.random() * gamingMessages.length)]
        
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: user.name,
          avatar: user.avatar,
          message: messageText,
          timestamp: new Date(),
          type: 'chat'
        }

        setMessages(prev => [...prev.slice(-19), newMsg]) // Keep last 20 messages
      }

      // Simulate win announcements
      if (Math.random() > 0.85) {
        const user = users[Math.floor(Math.random() * users.length)]
        const amount = Math.floor(Math.random() * 5000) + 100
        
        const winMsg: ChatMessage = {
          id: Date.now().toString() + '_win',
          user: user.name,
          avatar: user.avatar,
          message: `won $${amount.toFixed(2)} on Crash!`,
          timestamp: new Date(),
          type: 'win',
          amount
        }

        setMessages(prev => [...prev.slice(-19), winMsg])
      }
    }, 3000 + Math.random() * 4000) // Random interval 3-7 seconds

    return () => clearInterval(interval)
  }, [isOpen])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      avatar: '😎',
      message: newMessage,
      timestamp: new Date(),
      type: 'chat'
    }

    setMessages(prev => [...prev.slice(-19), userMsg])
    setNewMessage('')

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      
      // Auto-reply sometimes
      if (Math.random() > 0.6) {
        const replyUser = users[Math.floor(Math.random() * users.length)]
        const replies = [
          "Nice one!",
          "GL bro! 🍀",
          "Same here 😄",
          "Let's go! 🚀",
          "Good luck!",
          "Hope you win big!"
        ]
        
        const replyMsg: ChatMessage = {
          id: Date.now().toString() + '_reply',
          user: replyUser.name,
          avatar: replyUser.avatar,
          message: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date(),
          type: 'chat'
        }

        setTimeout(() => {
          setMessages(prev => [...prev.slice(-19), replyMsg])
        }, 1000 + Math.random() * 2000)
      }
    }, 1500)
  }, [newMessage])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-accent-primary hover:bg-accent-primary/80 text-white p-4 rounded-full shadow-neon transition-all duration-200 hover:scale-110"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-gaming-card border border-gaming-border rounded-lg shadow-neon flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gaming-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold">Live Chat</span>
          <span className="text-accent-primary text-sm">({47} online)</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2 animate-fade-in ${
              msg.type === 'win' ? 'bg-green-500/10 p-2 rounded' : ''
            }`}
          >
            <span className="text-lg flex-shrink-0">{msg.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-semibold ${
                  msg.user === 'You' ? 'text-accent-primary' : 
                  msg.type === 'win' ? 'text-green-400' : 'text-gray-300'
                }`}>
                  {msg.user}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                msg.type === 'win' ? 'text-green-300' : 'text-gray-200'
              }`}>
                {msg.type === 'win' && <span className="text-yellow-400">🎉 </span>}
                {msg.message}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 opacity-70">
            <span className="text-lg">💭</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gaming-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gaming-darker border border-gaming-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-primary"
            maxLength={100}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-accent-primary hover:bg-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

export default LiveChat 