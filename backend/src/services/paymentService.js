const crypto = require('crypto')
const authService = require('./authService')

class PaymentService {
  constructor() {
    this.transactions = new Map() // In production, use database
    this.pendingDeposits = new Map()
    this.pendingWithdrawals = new Map()
    this.skinPrices = new Map() // Cache for skin prices
    this.users = new Map() // Reference to user storage
    
    // Initialize default skin prices (in production, fetch from Steam Market API)
    this.initializeDefaultPrices()
  }

  initializeDefaultPrices() {
    // Sample CS:GO skin prices (in USD)
    const defaultPrices = {
      'AK-47 | Redline (Field-Tested)': 65.50,
      'AWP | Dragon Lore (Factory New)': 4500.00,
      'M4A4 | Howl (Minimal Wear)': 3200.00,
      'Karambit | Doppler (Factory New)': 850.00,
      'AK-47 | Fire Serpent (Minimal Wear)': 1200.00,
      'AWP | Medusa (Field-Tested)': 2100.00,
      'Glock-18 | Fade (Factory New)': 280.00,
      'StatTrak™ AK-47 | Vulcan (Factory New)': 450.00,
      'M4A1-S | Knight (Factory New)': 750.00,
      'AWP | Asiimov (Field-Tested)': 85.00,
    }

    for (const [name, price] of Object.entries(defaultPrices)) {
      this.skinPrices.set(name, price)
    }
  }

  // Generate unique transaction ID
  generateTransactionId() {
    return `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
  }

  // Get skin value from market data
  async getSkinValue(skinName, condition = 'Field-Tested') {
    const fullName = `${skinName} (${condition})`
    
    // Check cache first
    if (this.skinPrices.has(fullName)) {
      return this.skinPrices.get(fullName)
    }

    // In production, fetch from Steam Market API or third-party pricing service
    try {
      // Mock API call - replace with real implementation
      const basePrice = this.skinPrices.get(skinName) || 10.00
      const conditionMultiplier = this.getConditionMultiplier(condition)
      const finalPrice = basePrice * conditionMultiplier
      
      // Cache the result
      this.skinPrices.set(fullName, finalPrice)
      return finalPrice
    } catch (error) {
      console.error('Error fetching skin price:', error)
      return 0
    }
  }

  // Get condition multiplier for skin valuation
  getConditionMultiplier(condition) {
    const multipliers = {
      'Factory New': 1.0,
      'Minimal Wear': 0.85,
      'Field-Tested': 0.70,
      'Well-Worn': 0.55,
      'Battle-Scarred': 0.40
    }
    return multipliers[condition] || 0.70
  }

  // Initiate skin deposit
  async initiateDeposit(steamId, selectedSkins, tradeUrl) {
    try {
      const transactionId = this.generateTransactionId()
      let totalValue = 0
      const processedSkins = []

      // Validate and price each skin
      for (const skin of selectedSkins) {
        const skinValue = await this.getSkinValue(skin.name, skin.condition)
        
        if (skinValue <= 0) {
          throw new Error(`Unable to price skin: ${skin.name}`)
        }

        processedSkins.push({
          ...skin,
          value: skinValue,
          assetId: skin.assetId || crypto.randomBytes(16).toString('hex')
        })
        
        totalValue += skinValue
      }

      // Create deposit transaction
      const deposit = {
        id: transactionId,
        steamId,
        type: 'deposit',
        status: 'pending',
        skins: processedSkins,
        totalValue,
        tradeUrl,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        steps: [
          { step: 'initiated', timestamp: new Date(), status: 'completed' },
          { step: 'trade_offer_sent', timestamp: null, status: 'pending' },
          { step: 'trade_accepted', timestamp: null, status: 'pending' },
          { step: 'skins_received', timestamp: null, status: 'pending' },
          { step: 'balance_credited', timestamp: null, status: 'pending' }
        ]
      }

      this.transactions.set(transactionId, deposit)
      this.pendingDeposits.set(transactionId, deposit)

      // In production, create Steam trade offer here
      setTimeout(() => {
        this.simulateTradeOffer(transactionId)
      }, 2000)

      return {
        success: true,
        transactionId,
        totalValue,
        tradeOfferUrl: `https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcd1234`,
        message: 'Deposit initiated. Please accept the trade offer within 30 minutes.',
        expiresAt: deposit.expiresAt
      }
    } catch (error) {
      console.error('Deposit initiation error:', error)
      throw new Error(`Deposit failed: ${error.message}`)
    }
  }

  // Simulate trade offer process (replace with real Steam API in production)
  async simulateTradeOffer(transactionId) {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) return

    // Update trade offer sent step
    transaction.steps[1].timestamp = new Date()
    transaction.steps[1].status = 'completed'
    
    // Simulate user accepting trade after 10 seconds
    setTimeout(() => {
      this.simulateTradeAccepted(transactionId)
    }, 10000)
  }

  async simulateTradeAccepted(transactionId) {
    const transaction = this.transactions.get(transactionId)
    if (!transaction || transaction.status !== 'pending') return

    // Update trade accepted step
    transaction.steps[2].timestamp = new Date()
    transaction.steps[2].status = 'completed'
    
    // Update skins received step
    transaction.steps[3].timestamp = new Date()
    transaction.steps[3].status = 'completed'
    
    // Credit user balance
    await this.creditUserBalance(transaction.steamId, transaction.totalValue, transactionId)
    
    // Update final step
    transaction.steps[4].timestamp = new Date()
    transaction.steps[4].status = 'completed'
    transaction.status = 'completed'
    transaction.completedAt = new Date()
    
    // Remove from pending
    this.pendingDeposits.delete(transactionId)
    
    console.log(`Deposit completed for ${transaction.steamId}: $${transaction.totalValue}`)
  }

  // Credit user balance
  async creditUserBalance(steamId, amount, transactionId) {
    // In production, this would update the database
    // For now, we'll track balance changes in the transaction system
    const balanceUpdate = {
      id: this.generateTransactionId(),
      steamId,
      type: 'balance_credit',
      amount,
      relatedTransaction: transactionId,
      timestamp: new Date()
    }
    
    this.transactions.set(balanceUpdate.id, balanceUpdate)
    return balanceUpdate
  }

  // Initiate skin withdrawal
  async initiateWithdrawal(steamId, amount, tradeUrl, selectedSkins = null) {
    try {
      if (amount <= 0) {
        throw new Error('Invalid withdrawal amount')
      }

      // Check user balance (in production, fetch from database)
      const userBalance = await this.getUserBalance(steamId)
      if (userBalance < amount) {
        throw new Error('Insufficient balance')
      }

      const transactionId = this.generateTransactionId()
      
      // If no specific skins selected, we'll choose equivalent value skins
      const skinsToSend = selectedSkins || await this.selectSkinsForWithdrawal(amount)
      
      const withdrawal = {
        id: transactionId,
        steamId,
        type: 'withdrawal',
        status: 'pending',
        amount,
        skins: skinsToSend,
        tradeUrl,
        createdAt: new Date(),
        steps: [
          { step: 'initiated', timestamp: new Date(), status: 'completed' },
          { step: 'balance_debited', timestamp: null, status: 'pending' },
          { step: 'skins_selected', timestamp: null, status: 'pending' },
          { step: 'trade_offer_sent', timestamp: null, status: 'pending' },
          { step: 'trade_completed', timestamp: null, status: 'pending' }
        ]
      }

      this.transactions.set(transactionId, withdrawal)
      this.pendingWithdrawals.set(transactionId, withdrawal)

      // Debit user balance immediately
      await this.debitUserBalance(steamId, amount, transactionId)
      withdrawal.steps[1].timestamp = new Date()
      withdrawal.steps[1].status = 'completed'

      // Select skins
      withdrawal.steps[2].timestamp = new Date()
      withdrawal.steps[2].status = 'completed'

      // Simulate sending trade offer
      setTimeout(() => {
        this.simulateWithdrawalTradeOffer(transactionId)
      }, 3000)

      return {
        success: true,
        transactionId,
        amount,
        skins: skinsToSend,
        message: 'Withdrawal initiated. Trade offer will be sent shortly.',
        estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    } catch (error) {
      console.error('Withdrawal initiation error:', error)
      throw new Error(`Withdrawal failed: ${error.message}`)
    }
  }

  // Select skins for withdrawal based on amount
  async selectSkinsForWithdrawal(targetAmount) {
    const availableSkins = [
      { name: 'AK-47 | Redline', condition: 'Field-Tested', value: 65.50 },
      { name: 'AWP | Asiimov', condition: 'Field-Tested', value: 85.00 },
      { name: 'Glock-18 | Fade', condition: 'Factory New', value: 280.00 },
      { name: 'M4A1-S | Knight', condition: 'Factory New', value: 750.00 }
    ]

    const selectedSkins = []
    let remainingAmount = targetAmount

    // Simple greedy algorithm - in production, use more sophisticated selection
    availableSkins.sort((a, b) => b.value - a.value)
    
    for (const skin of availableSkins) {
      while (remainingAmount >= skin.value && selectedSkins.length < 10) {
        selectedSkins.push({
          ...skin,
          assetId: crypto.randomBytes(16).toString('hex')
        })
        remainingAmount -= skin.value
      }
    }

    return selectedSkins
  }

  // Simulate withdrawal trade offer
  async simulateWithdrawalTradeOffer(transactionId) {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) return

    transaction.steps[3].timestamp = new Date()
    transaction.steps[3].status = 'completed'

    // Simulate trade completion after 30 seconds
    setTimeout(() => {
      transaction.steps[4].timestamp = new Date()
      transaction.steps[4].status = 'completed'
      transaction.status = 'completed'
      transaction.completedAt = new Date()
      
      this.pendingWithdrawals.delete(transactionId)
      
      console.log(`Withdrawal completed for ${transaction.steamId}: $${transaction.amount}`)
    }, 30000)
  }

  // Debit user balance
  async debitUserBalance(steamId, amount, transactionId) {
    const balanceUpdate = {
      id: this.generateTransactionId(),
      steamId,
      type: 'balance_debit',
      amount: -amount,
      relatedTransaction: transactionId,
      timestamp: new Date()
    }
    
    this.transactions.set(balanceUpdate.id, balanceUpdate)
    return balanceUpdate
  }

  // Get user balance
  async getUserBalance(steamId) {
    let balance = 1000 // Starting balance
    
    // Calculate balance from transaction history
    for (const [id, transaction] of this.transactions) {
      if (transaction.steamId === steamId) {
        if (transaction.type === 'balance_credit') {
          balance += transaction.amount
        } else if (transaction.type === 'balance_debit') {
          balance += transaction.amount // amount is negative for debits
        }
      }
    }
    
    return Math.max(0, balance)
  }

  // Get transaction history
  async getTransactionHistory(steamId, limit = 50, offset = 0) {
    const userTransactions = []
    
    for (const [id, transaction] of this.transactions) {
      if (transaction.steamId === steamId) {
        userTransactions.push(transaction)
      }
    }
    
    // Sort by creation date (newest first)
    userTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Apply pagination
    const paginatedTransactions = userTransactions.slice(offset, offset + limit)
    
    return {
      transactions: paginatedTransactions,
      total: userTransactions.length,
      hasMore: userTransactions.length > offset + limit
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId) {
    return this.transactions.get(transactionId)
  }

  // Get pending transactions
  async getPendingTransactions(steamId) {
    const pending = []
    
    for (const [id, transaction] of this.pendingDeposits) {
      if (transaction.steamId === steamId) {
        pending.push(transaction)
      }
    }
    
    for (const [id, transaction] of this.pendingWithdrawals) {
      if (transaction.steamId === steamId) {
        pending.push(transaction)
      }
    }
    
    return pending
  }

  // Cancel pending transaction
  async cancelTransaction(transactionId, steamId) {
    const transaction = this.transactions.get(transactionId)
    
    if (!transaction) {
      throw new Error('Transaction not found')
    }
    
    if (transaction.steamId !== steamId) {
      throw new Error('Unauthorized')
    }
    
    if (transaction.status !== 'pending') {
      throw new Error('Transaction cannot be cancelled')
    }
    
    // Refund balance if it was a withdrawal
    if (transaction.type === 'withdrawal') {
      await this.creditUserBalance(steamId, transaction.amount, `refund_${transactionId}`)
    }
    
    transaction.status = 'cancelled'
    transaction.cancelledAt = new Date()
    
    this.pendingDeposits.delete(transactionId)
    this.pendingWithdrawals.delete(transactionId)
    
    return {
      success: true,
      message: 'Transaction cancelled successfully'
    }
  }

  // Admin functions
  async getAllTransactions(limit = 100, offset = 0) {
    const allTransactions = Array.from(this.transactions.values())
    allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return {
      transactions: allTransactions.slice(offset, offset + limit),
      total: allTransactions.length,
      hasMore: allTransactions.length > offset + limit
    }
  }

  async getPaymentStats() {
    let totalDeposits = 0
    let totalWithdrawals = 0
    let pendingDeposits = 0
    let pendingWithdrawals = 0
    
    for (const [id, transaction] of this.transactions) {
      if (transaction.type === 'deposit') {
        if (transaction.status === 'completed') {
          totalDeposits += transaction.totalValue
        } else if (transaction.status === 'pending') {
          pendingDeposits += transaction.totalValue
        }
      } else if (transaction.type === 'withdrawal') {
        if (transaction.status === 'completed') {
          totalWithdrawals += transaction.amount
        } else if (transaction.status === 'pending') {
          pendingWithdrawals += transaction.amount
        }
      }
    }
    
    return {
      totalDeposits,
      totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      netFlow: totalDeposits - totalWithdrawals,
      totalTransactions: this.transactions.size
    }
  }
}

// Create singleton instance
const paymentService = new PaymentService()

module.exports = paymentService 