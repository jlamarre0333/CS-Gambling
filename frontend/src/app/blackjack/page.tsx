'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { 
  ArrowPathIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import EnhancedButton from '@/components/ui/EnhancedButton';
import { EnhancedCard } from '@/components/ui/EnhancedCard';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  hidden?: boolean;
}

interface Hand {
  cards: Card[];
  value: number;
  isSoft: boolean; // Has ace counted as 11
  isBlackjack: boolean;
  isBust: boolean;
}

interface GameState {
  playerHand: Hand;
  dealerHand: Hand;
  gamePhase: 'betting' | 'dealing' | 'player-turn' | 'dealer-turn' | 'game-over';
  currentBet: number;
  gameResult: 'win' | 'lose' | 'push' | 'blackjack' | null;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  isLoading: boolean;
}

const calculateHandValue = (cards: Card[]): { value: number; isSoft: boolean } => {
  let value = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  }
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return {
    value,
    isSoft: aces > 0 && value <= 21
  };
};

const createHandFromCards = (cards: Card[]): Hand => {
  const { value, isSoft } = calculateHandValue(cards);
  return {
    cards,
    value,
    isSoft,
    isBlackjack: cards.length === 2 && value === 21,
    isBust: value > 21
  };
};

export default function BlackjackPage() {
  const { user, updateUser } = useUser();
  const [gameState, setGameState] = useState<GameState>({
    playerHand: { cards: [], value: 0, isSoft: false, isBlackjack: false, isBust: false },
    dealerHand: { cards: [], value: 0, isSoft: false, isBlackjack: false, isBust: false },
    gamePhase: 'betting',
    currentBet: 0,
    gameResult: null,
    canHit: false,
    canStand: false,
    canDouble: false,
    isLoading: false
  });

  const [betAmount, setBetAmount] = useState(10);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    totalWinnings: 0
  });
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Load user's game history
  useEffect(() => {
    if (user) {
      loadGameHistory();
    }
  }, [user]);

  const loadGameHistory = async () => {
    if (!user) return;
    try {
      const response = await api.getGameHistory(user.id) as any;
      if (response.success) {
        const blackjackGames = response.games
          .filter((game: any) => game.gameType === 'blackjack')
          .slice(0, 10)
          .map((game: any) => ({
            id: game.id,
            result: game.result,
            betAmount: game.betAmount,
            winAmount: game.winAmount,
            time: getTimeAgo(game.timestamp),
            gameData: game.gameData
          }));
        setGameHistory(blackjackGames);
        
        // Calculate stats
        const stats = blackjackGames.reduce((acc: any, game: any) => {
          acc.gamesPlayed++;
          if (game.result === 'win') acc.wins++;
          else if (game.result === 'loss') acc.losses++;
          else if (game.result === 'push') acc.pushes++;
          else if (game.result === 'blackjack') acc.blackjacks++;
          acc.totalWinnings += game.winAmount;
          return acc;
        }, { gamesPlayed: 0, wins: 0, losses: 0, pushes: 0, blackjacks: 0, totalWinnings: 0 });
        
        setGameStats(stats);
      }
    } catch (error) {
      console.error('Error loading game history:', error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const gameTime = new Date(timestamp);
    const diffMs = now.getTime() - gameTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const placeBet = async () => {
    if (!user || betAmount > user.balance || gameState.isLoading) return;
    
    setGameState(prev => ({ ...prev, isLoading: true, currentBet: betAmount }));
    
    try {
      // Deal initial cards via API
      const response = await api.placeBet(user.id, 'blackjack', betAmount, {
        action: 'deal'
      }) as any;
      
      if (response.success) {
        const { playerCards, dealerCards, playerValue, dealerValue, playerBlackjack } = response.game.gameData;
        
        const playerHand = createHandFromCards(playerCards);
        const dealerHand = createHandFromCards([dealerCards[0]]); // Only show first dealer card
        dealerHand.cards.push({ ...dealerCards[1], hidden: true }); // Hide second card
        
        updateUser(response.user);
        
        setGameState(prev => ({
          ...prev,
          playerHand,
          dealerHand,
          gamePhase: playerBlackjack ? 'game-over' : 'player-turn',
          gameResult: response.game.result === 'blackjack' ? 'blackjack' : null,
          canHit: !playerBlackjack,
          canStand: !playerBlackjack,
          canDouble: !playerBlackjack && user.balance >= betAmount,
          isLoading: false
        }));
        
        if (playerBlackjack) {
          setShowToast({
            type: 'success',
            message: '🎉 BLACKJACK! You won!'
          });
          setTimeout(() => loadGameHistory(), 1000);
        }
      }
    } catch (error) {
      console.error('Error dealing cards:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      setShowToast({
        type: 'error',
        message: 'Failed to deal cards. Please try again.'
      });
    }
  };

  const hit = async () => {
    if (!user || gameState.isLoading) return;
    
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.placeBet(user.id, 'blackjack', gameState.currentBet, {
        action: 'hit'
      }) as any;
      
      if (response.success) {
        const { playerCards, playerValue, playerBust } = response.game.gameData;
        const playerHand = createHandFromCards(playerCards);
        
        setGameState(prev => ({
          ...prev,
          playerHand,
          gamePhase: playerBust ? 'game-over' : 'player-turn',
          gameResult: response.game.result,
          canHit: !playerBust,
          canStand: !playerBust,
          canDouble: false,
          isLoading: false
        }));
        
        if (playerBust) {
          setShowToast({
            type: 'error',
            message: '💥 BUST! You went over 21!'
          });
          setTimeout(() => loadGameHistory(), 1000);
        }
      }
    } catch (error) {
      console.error('Error hitting:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      setShowToast({
        type: 'error',
        message: 'Failed to hit. Please try again.'
      });
    }
  };

  const stand = async () => {
    if (!user || gameState.isLoading) return;
    
    setGameState(prev => ({ ...prev, isLoading: true, gamePhase: 'dealer-turn' }));
    
    try {
      const response = await api.placeBet(user.id, 'blackjack', gameState.currentBet, {
        action: 'stand'
      }) as any;
      
      if (response.success) {
        const { dealerCards, dealerValue, gameResult } = response.game.gameData;
        const dealerHand = createHandFromCards(dealerCards);
        
        updateUser(response.user);
        
        setGameState(prev => ({
          ...prev,
          dealerHand,
          gamePhase: 'game-over',
          gameResult: response.game.result,
          canHit: false,
          canStand: false,
          canDouble: false,
          isLoading: false
        }));
        
        const resultMessage = response.game.result === 'win' ? '🎉 You won!' :
                             response.game.result === 'push' ? '🤝 Push! It\'s a tie!' :
                             '😔 Dealer wins!';
        
        setShowToast({
          type: response.game.result === 'win' ? 'success' : response.game.result === 'push' ? 'success' : 'error',
          message: resultMessage
        });
        
        setTimeout(() => loadGameHistory(), 1000);
      }
    } catch (error) {
      console.error('Error standing:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      setShowToast({
        type: 'error',
        message: 'Failed to stand. Please try again.'
      });
    }
  };

  const newGame = () => {
    setGameState({
      playerHand: { cards: [], value: 0, isSoft: false, isBlackjack: false, isBust: false },
      dealerHand: { cards: [], value: 0, isSoft: false, isBlackjack: false, isBust: false },
      gamePhase: 'betting',
      currentBet: 0,
      gameResult: null,
      canHit: false,
      canStand: false,
      canDouble: false,
      isLoading: false
    });
  };

  const getCardDisplay = (card: Card & { hidden?: boolean }) => {
    if (card.hidden) {
      return '🂠';
    }
    
    const suitSymbols = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    };
    
    return `${card.rank}${suitSymbols[card.suit]}`;
  };

  const getResultMessage = () => {
    switch (gameState.gameResult) {
      case 'blackjack': return '🎉 BLACKJACK!';
      case 'win': return '🎉 YOU WIN!';
      case 'lose': return '😔 YOU LOSE';
      case 'push': return '🤝 PUSH';
      default: return '';
    }
  };

  const getResultColor = () => {
    switch (gameState.gameResult) {
      case 'blackjack':
      case 'win': return 'text-green-400';
      case 'lose': return 'text-red-400';
      case 'push': return 'text-yellow-400';
      default: return '';
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white flex items-center justify-center p-4">
        <EnhancedCard variant="glow" className="text-center max-w-md w-full">
          <div className="p-8">
            <div className="text-6xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold mb-4">Please log in to play Blackjack</h2>
            <p className="text-gray-400 mb-6">You need to be logged in to place bets and track your progress.</p>
            <EnhancedButton 
              variant="primary" 
              size="lg"
              onClick={() => { window.location.href = '/test-backend' }}
              className="w-full"
            >
              Go to Login Page
            </EnhancedButton>
          </div>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🃏 <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Blackjack</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Get as close to 21 as possible without going over!
          </p>
          
          {/* User Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-xl font-bold text-green-400">${user.balance.toFixed(2)}</div>
              </div>
            </EnhancedCard>
            <EnhancedCard variant="stats" className="px-6 py-3">
              <div className="text-center">
                <div className="text-sm text-gray-400">Level</div>
                <div className="text-xl font-bold text-blue-400">{user.level}</div>
              </div>
            </EnhancedCard>
            {gameStats.gamesPlayed > 0 && (
              <>
                <EnhancedCard variant="stats" className="px-6 py-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-xl font-bold text-green-400">
                      {((gameStats.wins + gameStats.blackjacks) / gameStats.gamesPlayed * 100).toFixed(1)}%
                    </div>
                  </div>
                </EnhancedCard>
                <EnhancedCard variant="stats" className="px-6 py-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Total Won</div>
                    <div className="text-xl font-bold text-blue-400">${gameStats.totalWinnings.toFixed(0)}</div>
                  </div>
                </EnhancedCard>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Table */}
            <EnhancedCard variant="game" className="p-8">
              <div className="text-center">
                {/* Dealer Hand */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Dealer</h3>
                  <div className="flex justify-center space-x-2 mb-4">
                    {gameState.dealerHand.cards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className={`w-16 h-24 bg-white text-black rounded-lg flex items-center justify-center text-lg font-bold shadow-lg ${
                          card.hidden ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        {getCardDisplay(card)}
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-lg font-semibold">
                    {gameState.gamePhase === 'game-over' || gameState.gamePhase === 'dealer-turn' ? 
                      `Value: ${gameState.dealerHand.value}` : 
                      'Hidden Card'
                    }
                  </div>
                </div>

                {/* Game Result */}
                {gameState.gameResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-3xl font-bold mb-6 ${getResultColor()}`}
                  >
                    {getResultMessage()}
                  </motion.div>
                )}

                {/* Player Hand */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Your Hand</h3>
                  <div className="flex justify-center space-x-2 mb-4">
                    {gameState.playerHand.cards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="w-16 h-24 bg-white text-black rounded-lg flex items-center justify-center text-lg font-bold shadow-lg"
                      >
                        {getCardDisplay(card)}
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-lg font-semibold">
                    Value: {gameState.playerHand.value}
                    {gameState.playerHand.isSoft && ' (Soft)'}
                    {gameState.playerHand.isBlackjack && ' - BLACKJACK!'}
                    {gameState.playerHand.isBust && ' - BUST!'}
                  </div>
                </div>

                {/* Game Actions */}
                <div className="space-y-6">
                  {gameState.gamePhase === 'betting' && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Place Your Bet</h3>
                      <EnhancedInput
                        type="number"
                        value={betAmount.toString()}
                        onChange={(value) => setBetAmount(Math.max(0, Number(value)))}
                        disabled={gameState.isLoading}
                        placeholder="Enter bet amount"
                        className="w-full mb-4"
                      />
                      
                      {/* Quick bet buttons */}
                      <div className="grid grid-cols-5 gap-2 mb-6">
                        {quickAmounts.map((amount) => (
                          <EnhancedButton
                            key={amount}
                            variant="ghost"
                            size="sm"
                            onClick={() => setBetAmount(Math.min(amount, user.balance))}
                            disabled={gameState.isLoading || amount > user.balance}
                          >
                            ${amount}
                          </EnhancedButton>
                        ))}
                      </div>
                      
                      <EnhancedButton
                        variant="primary"
                        size="xl"
                        onClick={placeBet}
                        disabled={!user || betAmount <= 0 || betAmount > user.balance || gameState.isLoading}
                        loading={gameState.isLoading}
                        className="w-full h-16 text-xl font-bold"
                      >
                        {gameState.isLoading ? '🃏 Dealing...' : 
                         betAmount > 0 && betAmount <= user.balance ? 
                           `🃏 Deal Cards ($${betAmount})` : 
                           'Enter Valid Bet Amount'
                        }
                      </EnhancedButton>
                    </div>
                  )}

                  {gameState.gamePhase === 'player-turn' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <EnhancedButton
                        variant="primary"
                        size="lg"
                        onClick={hit}
                        disabled={!gameState.canHit || gameState.isLoading}
                        loading={gameState.isLoading}
                        className="h-14 text-lg font-bold"
                      >
                        {gameState.isLoading ? '🃏 Hitting...' : '🃏 Hit'}
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="secondary"
                        size="lg"
                        onClick={stand}
                        disabled={!gameState.canStand || gameState.isLoading}
                        className="h-14 text-lg font-bold"
                      >
                        ✋ Stand
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="warning"
                        size="lg"
                        onClick={() => {
                          setBetAmount(gameState.currentBet * 2);
                          hit();
                        }}
                        disabled={!gameState.canDouble || gameState.isLoading}
                        className="h-14 text-lg font-bold"
                      >
                        💰 Double
                      </EnhancedButton>
                    </div>
                  )}

                  {gameState.gamePhase === 'dealer-turn' && (
                    <div className="text-center">
                      <LoadingSpinner variant="casino" size="lg" />
                      <div className="text-lg mt-4">Dealer is playing...</div>
                    </div>
                  )}

                  {gameState.gamePhase === 'game-over' && (
                    <EnhancedButton
                      variant="primary"
                      size="xl"
                      onClick={newGame}
                      className="w-full h-16 text-xl font-bold"
                    >
                      🔄 New Game
                    </EnhancedButton>
                  )}
                </div>
              </div>
            </EnhancedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <EnhancedCard variant="stats" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-green-500" />
                Game Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Played</span>
                  <span className="font-semibold">{gameStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wins</span>
                  <span className="font-semibold text-green-400">{gameStats.wins + gameStats.blackjacks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losses</span>
                  <span className="font-semibold text-red-400">{gameStats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pushes</span>
                  <span className="font-semibold text-yellow-400">{gameStats.pushes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blackjacks</span>
                  <span className="font-semibold text-purple-400">{gameStats.blackjacks}</span>
                </div>
              </div>
            </EnhancedCard>

            {/* Recent Games */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-blue-500" />
                Recent Games
              </h3>
              <div className="space-y-2">
                {gameHistory.length > 0 ? (
                  gameHistory.map((game) => (
                    <div key={game.id} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🃏</span>
                        <div>
                          <div className="text-sm font-semibold">${game.betAmount}</div>
                          <div className="text-xs text-gray-400">{game.time}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        game.result === 'win' || game.result === 'blackjack' ? 'text-green-400' : 
                        game.result === 'push' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {game.result === 'win' || game.result === 'blackjack' ? `+$${game.winAmount}` : 
                         game.result === 'push' ? 'Push' : `-$${game.betAmount}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No recent games
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Game Rules */}
            <EnhancedCard variant="default" className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
                How to Play
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>• Get as close to 21 as possible</div>
                <div>• Don't go over 21 (bust)</div>
                <div>• Aces count as 1 or 11</div>
                <div>• Face cards count as 10</div>
                <div>• Blackjack pays 3:2</div>
                <div>• Dealer stands on 17</div>
              </div>
            </EnhancedCard>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          <div className="flex items-center justify-between">
            <span>{showToast.message}</span>
            <button 
              onClick={() => setShowToast(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}