'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCardIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface SkinItem {
  id: string;
  name: string;
  game: string;
  rarity: 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert' | 'Contraband';
  quality: 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
  price: number;
  image: string;
  marketPrice: number;
  float: number;
  stickers?: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'card' | 'ewallet' | 'skin';
  icon: string;
  fees: number;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  supported: boolean;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  method: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  txHash?: string;
  items?: SkinItem[];
}

const mockSkins: SkinItem[] = [
  {
    id: '1',
    name: 'AK-47 | Redline',
    game: 'CS2',
    rarity: 'Classified',
    quality: 'Field-Tested',
    price: 85.50,
    marketPrice: 88.20,
    float: 0.25,
    image: 'https://steamcommunity-a.akamaihd.net/economy/image/class/730/4551132222/200fx200f',
    stickers: ['ESL One Cologne 2014']
  },
  {
    id: '2',
    name: 'AWP | Dragon Lore',
    game: 'CS2',
    rarity: 'Covert',
    quality: 'Factory New',
    price: 4250.00,
    marketPrice: 4350.00,
    float: 0.02,
    image: 'https://steamcommunity-a.akamaihd.net/economy/image/class/730/4796303625/200fx200f'
  },
  {
    id: '3',
    name: 'Karambit | Fade',
    game: 'CS2',
    rarity: 'Covert',
    quality: 'Factory New',
    price: 1850.00,
    marketPrice: 1920.00,
    float: 0.01,
    image: 'https://steamcommunity-a.akamaihd.net/economy/image/class/730/4796303625/200fx200f'
  },
  {
    id: '4',
    name: 'M4A4 | Howl',
    game: 'CS2',
    rarity: 'Contraband',
    quality: 'Minimal Wear',
    price: 3200.00,
    marketPrice: 3350.00,
    float: 0.08,
    image: 'https://steamcommunity-a.akamaihd.net/economy/image/class/730/4796303625/200fx200f'
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'steam',
    name: 'Steam Trade',
    type: 'skin',
    icon: '🎮',
    fees: 0,
    minAmount: 1,
    maxAmount: 50000,
    processingTime: '5-15 minutes',
    supported: true
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'crypto',
    icon: '₿',
    fees: 1.5,
    minAmount: 10,
    maxAmount: 10000,
    processingTime: '10-60 minutes',
    supported: true
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'crypto',
    icon: 'Ξ',
    fees: 2.0,
    minAmount: 10,
    maxAmount: 10000,
    processingTime: '5-30 minutes',
    supported: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'ewallet',
    icon: '💰',
    fees: 3.5,
    minAmount: 5,
    maxAmount: 5000,
    processingTime: 'Instant',
    supported: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'card',
    icon: '💳',
    fees: 2.9,
    minAmount: 10,
    maxAmount: 2000,
    processingTime: 'Instant',
    supported: true
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    method: 'Steam Trade',
    amount: 285.50,
    status: 'completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    items: [mockSkins[0]]
  },
  {
    id: '2',
    type: 'withdrawal',
    method: 'Bitcoin',
    amount: 150.00,
    status: 'processing',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    txHash: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
  },
  {
    id: '3',
    type: 'deposit',
    method: 'PayPal',
    amount: 75.00,
    status: 'completed',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [selectedSkins, setSelectedSkins] = useState<SkinItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [userBalance, setUserBalance] = useState(1250.75);
  const [filterRarity, setFilterRarity] = useState<string>('all');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Consumer': return 'text-gray-400 bg-gray-500/20';
      case 'Industrial': return 'text-blue-400 bg-blue-500/20';
      case 'Mil-Spec': return 'text-purple-400 bg-purple-500/20';
      case 'Restricted': return 'text-pink-400 bg-pink-500/20';
      case 'Classified': return 'text-red-400 bg-red-500/20';
      case 'Covert': return 'text-yellow-400 bg-yellow-500/20';
      case 'Contraband': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'pending': return 'text-blue-400 bg-blue-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'cancelled': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'processing': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'failed': return <ExclamationCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <ExclamationCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredSkins = filterRarity === 'all' 
    ? mockSkins 
    : mockSkins.filter(skin => skin.rarity === filterRarity);

  const handleSkinToggle = (skin: SkinItem) => {
    setSelectedSkins(prev => {
      const isSelected = prev.find(s => s.id === skin.id);
      if (isSelected) {
        return prev.filter(s => s.id !== skin.id);
      } else {
        return [...prev, skin];
      }
    });
  };

  const selectedSkinsValue = selectedSkins.reduce((sum, skin) => sum + skin.price, 0);

  const processPayment = () => {
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: activeTab as 'deposit' | 'withdrawal',
      method: selectedMethod?.name || 'Unknown',
      amount: selectedMethod?.type === 'skin' ? selectedSkinsValue : amount,
      status: 'processing',
      timestamp: new Date(),
      items: selectedMethod?.type === 'skin' ? selectedSkins : undefined
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simulate processing
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'completed' as const }
          : tx
      ));
      
      if (activeTab === 'deposit') {
        setUserBalance(prev => prev + newTransaction.amount);
      } else {
        setUserBalance(prev => prev - newTransaction.amount);
      }
    }, 3000);

    setSelectedMethod(null);
    setAmount(0);
    setSelectedSkins([]);
    setActiveTab('history');
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            Payment Center
          </h1>
          <p className="text-gray-400">Secure deposits, withdrawals, and skin trading</p>
        </motion.div>

        {/* Balance Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gaming-card p-6 mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-3xl font-bold text-green-400">${userBalance.toFixed(2)}</div>
              <div className="text-gray-400">Available Balance</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">15</div>
              <div className="text-xs text-gray-400">Total Deposits</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">8</div>
              <div className="text-xs text-gray-400">Withdrawals</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">$2,847</div>
              <div className="text-xs text-gray-400">Volume (30d)</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="gaming-card p-2 flex gap-2">
            {[
              { id: 'deposit', name: 'Deposit', icon: ArrowDownTrayIcon },
              { id: 'withdraw', name: 'Withdraw', icon: ArrowUpTrayIcon },
              { id: 'history', name: 'History', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
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
          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <motion.div
              key="deposit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {!selectedMethod ? (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Choose Deposit Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paymentMethods.map((method) => (
                      <motion.div
                        key={method.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => method.supported && setSelectedMethod(method)}
                        className={`gaming-card p-6 cursor-pointer transition-all ${
                          method.supported 
                            ? 'hover:border-orange-500/50' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-3xl">{method.icon}</div>
                          <div>
                            <h4 className="text-lg font-bold">{method.name}</h4>
                            <p className="text-sm text-gray-400">{method.type}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fees:</span>
                            <span>{method.fees}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Min/Max:</span>
                            <span>${method.minAmount} - ${method.maxAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Processing:</span>
                            <span>{method.processingTime}</span>
                          </div>
                        </div>
                        
                        {!method.supported && (
                          <div className="mt-4 text-center text-red-400 text-sm">
                            Coming Soon
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Payment Form */}
                  <div className="gaming-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={() => setSelectedMethod(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ← Back
                      </button>
                      <div className="text-2xl">{selectedMethod.icon}</div>
                      <h3 className="text-xl font-bold">{selectedMethod.name}</h3>
                    </div>

                    {selectedMethod.type === 'skin' ? (
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <h4 className="text-lg font-medium">Select Skins to Deposit</h4>
                          <select
                            value={filterRarity}
                            onChange={(e) => setFilterRarity(e.target.value)}
                            className="gaming-input px-3 py-1 text-sm"
                          >
                            <option value="all">All Rarities</option>
                            <option value="Consumer">Consumer</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Mil-Spec">Mil-Spec</option>
                            <option value="Restricted">Restricted</option>
                            <option value="Classified">Classified</option>
                            <option value="Covert">Covert</option>
                            <option value="Contraband">Contraband</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                          {filteredSkins.map((skin) => {
                            const isSelected = selectedSkins.find(s => s.id === skin.id);
                            return (
                              <div
                                key={skin.id}
                                onClick={() => handleSkinToggle(skin)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-orange-500 bg-orange-500/10' 
                                    : 'border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <StarIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium">{skin.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-1 rounded text-xs ${getRarityColor(skin.rarity)}`}>
                                        {skin.rarity}
                                      </span>
                                      <span className="text-gray-400 text-xs">{skin.quality}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-green-400 font-bold">${skin.price}</span>
                                      <span className="text-gray-400 text-sm">Float: {skin.float}</span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <CheckCircleIcon className="w-5 h-5 text-orange-400" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Amount (USD)
                        </label>
                        <input
                          type="number"
                          min={selectedMethod.minAmount}
                          max={selectedMethod.maxAmount}
                          value={amount}
                          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                          placeholder={`Min: $${selectedMethod.minAmount}`}
                          className="gaming-input w-full mb-4"
                        />
                        
                        <div className="grid grid-cols-4 gap-2 mb-6">
                          {[25, 50, 100, 250].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setAmount(preset)}
                              className="gaming-button bg-gray-700 hover:bg-gray-600 text-sm py-2"
                            >
                              ${preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-700 pt-4">
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span>${selectedMethod.type === 'skin' ? selectedSkinsValue.toFixed(2) : amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fees ({selectedMethod.fees}%):</span>
                          <span>-${((selectedMethod.type === 'skin' ? selectedSkinsValue : amount) * selectedMethod.fees / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-400">
                          <span>You'll receive:</span>
                          <span>${((selectedMethod.type === 'skin' ? selectedSkinsValue : amount) * (1 - selectedMethod.fees / 100)).toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={processPayment}
                        disabled={selectedMethod.type === 'skin' ? selectedSkins.length === 0 : amount < selectedMethod.minAmount}
                        className="gaming-button w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Deposit
                      </button>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <div className="gaming-card p-6">
                    <h4 className="text-lg font-bold mb-4">Transaction Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Method:</span>
                        <span>{selectedMethod.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing Time:</span>
                        <span>{selectedMethod.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security:</span>
                        <span className="flex items-center gap-1 text-green-400">
                          <ShieldCheckIcon className="w-4 h-4" />
                          Secure
                        </span>
                      </div>
                    </div>

                    {selectedMethod.type === 'skin' && selectedSkins.length > 0 && (
                      <div className="mt-6">
                        <h5 className="font-medium mb-3">Selected Items ({selectedSkins.length})</h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedSkins.map((skin) => (
                            <div key={skin.id} className="flex justify-between text-sm">
                              <span className="truncate">{skin.name}</span>
                              <span className="text-green-400">${skin.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <ShieldCheckIcon className="w-4 h-4 text-blue-400 mt-1" />
                        <div className="text-sm">
                          <p className="text-blue-400 font-medium mb-1">Security Notice</p>
                          <p className="text-gray-300">All transactions are encrypted and processed through secure payment gateways. Your data is protected.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="gaming-card p-6 text-center">
                <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <h3 className="text-2xl font-bold mb-2">Withdrawal Center</h3>
                <p className="text-gray-400 mb-6">
                  Withdraw your funds securely to your preferred payment method
                </p>
                <p className="text-sm text-blue-400">
                  Minimum withdrawal: $10 • Processing time: 1-24 hours
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentMethods.filter(m => m.type !== 'skin').map((method) => (
                  <div key={method.id} className="gaming-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl">{method.icon}</div>
                      <div>
                        <h4 className="text-lg font-bold">{method.name}</h4>
                        <p className="text-sm text-gray-400">Fee: {method.fees}%</p>
                      </div>
                    </div>
                    <button className="gaming-button w-full">
                      Withdraw via {method.name}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Transaction History</h3>
                <button className="gaming-button bg-blue-600 hover:bg-blue-700">
                  <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
                  Export
                </button>
              </div>

              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="gaming-card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {tx.type === 'deposit' ? 
                            <ArrowDownTrayIcon className="w-5 h-5 text-green-400" /> :
                            <ArrowUpTrayIcon className="w-5 h-5 text-red-400" />
                          }
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} via {tx.method}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {tx.timestamp.toLocaleDateString()} at {tx.timestamp.toLocaleTimeString()}
                          </p>
                          {tx.txHash && (
                            <p className="text-xs text-blue-400">
                              TX: {tx.txHash.slice(0, 16)}...
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </div>
                      </div>
                    </div>

                    {tx.items && tx.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Items ({tx.items.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {tx.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded">
                              {item.name}
                            </span>
                          ))}
                          {tx.items.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{tx.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 