'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { 
  ArrowPathIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TargetIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
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
          setTimeout(() => loadGameHistory(), 1000);
        }
      }
    } catch (error) {
      console.error('Error dealing cards:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const hit = async () => {
    if (!user || gameState.isLoading) return;
    
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Add a card to player hand (simplified - would need full game state management)
      const newCard = { 
        suit: ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)] as any,
        rank: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][Math.floor(Math.random() * 13)]
      };
      
      const newPlayerHand = createHandFromCards([...gameState.playerHand.cards, newCard]);
      
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        canHit: !newPlayerHand.isBust,
        canStand: !newPlayerHand.isBust,
        canDouble: false,
        gamePhase: newPlayerHand.isBust ? 'game-over' : 'player-turn',
        gameResult: newPlayerHand.isBust ? 'lose' : null,
        isLoading: false
      }));

      if (newPlayerHand.isBust) {
        // Process loss
        setTimeout(() => {
          loadGameHistory();
        }, 1000);
      }
    } catch (error) {
      console.error('Error hitting:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const stand = async () => {
    if (!user || gameState.isLoading) return;
    
    setGameState(prev => ({ ...prev, isLoading: true, gamePhase: 'dealer-turn' }));
    
    try {
      // Let dealer play via API
      const response = await api.placeBet(user.id, 'blackjack', 0, {
        action: 'stand',
        playerCards: gameState.playerHand.cards,
        dealerCards: gameState.dealerHand.cards
      }) as any;
      
      if (response.success) {
        const { dealerCards, dealerValue, finalResult } = response.game.gameData;
        
        const finalDealerHand = createHandFromCards(dealerCards);
        
        updateUser(response.user);
        
        setGameState(prev => ({
          ...prev,
          dealerHand: finalDealerHand,
          gamePhase: 'game-over',
          gameResult: finalResult,
          canHit: false,
          canStand: false,
          canDouble: false,
          isLoading: false
        }));
        
        setTimeout(() => {
          loadGameHistory();
        }, 2000);
      }
    } catch (error) {
      console.error('Error standing:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
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
      return '🂠'; // Card back
    }
    
    const suitEmojis = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    };
    
    return `${card.rank}${suitEmojis[card.suit]}`;
  };

  const getResultMessage = () => {
    switch (gameState.gameResult) {
      case 'win': return '🎉 You Win!';
      case 'lose': return '💔 You Lose';
      case 'push': return '🤝 Push (Tie)';
      case 'blackjack': return '🃏 Blackjack!';
      default: return '';
    }
  };

  const getResultColor = () => {
    switch (gameState.gameResult) {
      case 'win':
      case 'blackjack':
        return 'text-green-400';
      case 'lose':
        return 'text-red-400';
      case 'push':
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to play Blackjack</h2>
          <p className="text-gray-400">You need to be logged in to place bets and track your progress.</p>
          <div className="mt-6">
            <a href="/test-backend" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
            🃏 Blackjack 21
          </h1>
          <p className="text-gray-300">Beat the dealer without going over 21!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div className="gaming-card p-6">
              {/* Dealer Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-center">Dealer</h2>
                <div className="flex justify-center space-x-2 mb-2">
                  {gameState.dealerHand.cards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white text-black rounded-lg p-4 font-bold text-lg shadow-lg"
                    >
                      {getCardDisplay(card)}
                    </motion.div>
                  ))}
                </div>
                <div className="text-center text-gray-300">
                  Value: {gameState.gamePhase === 'betting' ? '-' : gameState.dealerHand.value}
                  {gameState.dealerHand.isSoft && gameState.gamePhase !== 'betting' ? ' (Soft)' : ''}
                </div>
              </div>

              {/* Player Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-center">Player</h2>
                <div className="flex justify-center space-x-2 mb-2">
                  {gameState.playerHand.cards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white text-black rounded-lg p-4 font-bold text-lg shadow-lg"
                    >
                      {getCardDisplay(card)}
                    </motion.div>
                  ))}
                </div>
                <div className="text-center text-gray-300">
                  Value: {gameState.playerHand.value}
                  {gameState.playerHand.isSoft ? ' (Soft)' : ''}
                  {gameState.playerHand.isBlackjack ? ' - BLACKJACK!' : ''}
                  {gameState.playerHand.isBust ? ' - BUST!' : ''}
                </div>
              </div>

              {/* Game Result */}
              <AnimatePresence>
                {gameState.gameResult && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`text-center text-2xl font-bold mb-6 ${getResultColor()}`}
                  >
                    {getResultMessage()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                {gameState.gamePhase === 'betting' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={placeBet}
                    disabled={betAmount > (user?.balance || 0) || gameState.isLoading}
                    className="gaming-button bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gameState.isLoading ? 'Dealing...' : `Deal Cards ($${betAmount})`}
                  </motion.button>
                )}

                {gameState.gamePhase === 'player-turn' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={hit}
                      disabled={!gameState.canHit || gameState.isLoading}
                      className="gaming-button bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      Hit
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stand}
                      disabled={!gameState.canStand || gameState.isLoading}
                      className="gaming-button bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Stand
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameState(prev => ({ ...prev, canDouble: false }))}
                      disabled={!gameState.canDouble || gameState.isLoading}
                      className="gaming-button bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                      Double
                    </motion.button>
                  </>
                )}

                {gameState.gamePhase === 'game-over' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={newGame}
                    className="gaming-button bg-green-600 hover:bg-green-700"
                  >
                    <ArrowPathIcon className="mr-2 w-5 h-5" />
                    New Game
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="gaming-card p-4 text-center">
              <CurrencyDollarIcon className="mx-auto mb-2 text-green-400 w-5 h-5" />
              <div className="text-lg font-bold text-green-400">${user?.balance}</div>
              <div className="text-xs text-gray-400">Balance</div>
            </div>

            {/* Betting Controls */}
            {gameState.gamePhase === 'betting' && (
              <div className="gaming-card p-4">
                <h3 className="font-bold mb-4 flex items-center">
                  <TargetIcon className="mr-2 w-5 h-5" />
                  Bet Amount
                </h3>
                
                <div className="flex space-x-2 mb-4">
                  <input
                    type="number"
                    min="1"
                    max={user?.balance}
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value) || 1)}
                    disabled={gameState.gamePhase !== 'betting' || gameState.isLoading}
                    className="gaming-input flex-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={gameState.gamePhase !== 'betting' || amount > (user?.balance || 0) || gameState.isLoading}
                      className={`px-3 py-2 rounded transition-colors text-sm ${
                        betAmount === amount 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game Stats */}
            <div className="gaming-card p-4">
              <h3 className="font-bold mb-4 flex items-center">
                <TrophyIcon className="mr-2 w-5 h-5" />
                Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Games Played:</span>
                  <span className="font-bold">{gameStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wins:</span>
                  <span className="font-bold text-green-400">{gameStats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Losses:</span>
                  <span className="font-bold text-red-400">{gameStats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pushes:</span>
                  <span className="font-bold text-yellow-400">{gameStats.pushes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blackjacks:</span>
                  <span className="font-bold text-purple-400">{gameStats.blackjacks}</span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-2">
                  <span>Net Winnings:</span>
                  <span className={`font-bold ${gameStats.totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${gameStats.totalWinnings}
                  </span>
                </div>
              </div>
            </div>

            {/* Game History */}
            <div className="gaming-card p-4">
              <h3 className="font-bold mb-4 flex items-center">
                <ClockIcon className="mr-2 w-5 h-5" />
                Recent Games
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gameHistory.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <div key={game.id} className="flex justify-between items-center p-2 bg-gray-800 rounded text-sm">
                      <div>
                        <div className={`font-bold ${
                          game.result === 'win' || game.result === 'blackjack' ? 'text-green-400' :
                          game.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {game.result === 'win' ? 'Win' :
                           game.result === 'loss' ? 'Loss' :
                           game.result === 'push' ? 'Push' :
                           game.result === 'blackjack' ? 'Blackjack' : game.result}
                        </div>
                        <div className="text-gray-400">{game.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${game.winAmount}</div>
                        <div className="text-gray-400 text-xs">Bet: ${game.betAmount}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No games played yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}