const express = require('express')
const router = express.Router()
const paymentService = require('../services/paymentService')
const authenticateToken = require('../middleware/authenticateToken')

// POST /api/payments/deposit - Initiate skin deposit
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const { selectedSkins, tradeUrl } = req.body
    const steamId = req.user.steamId

    if (!selectedSkins || !Array.isArray(selectedSkins) || selectedSkins.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one skin to deposit'
      })
    }

    if (!tradeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Trade URL is required'
      })
    }

    // Validate trade URL format
    const tradeUrlPattern = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/
    if (!tradeUrlPattern.test(tradeUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade URL format'
      })
    }

    const result = await paymentService.initiateDeposit(steamId, selectedSkins, tradeUrl)
    res.json(result)
  } catch (error) {
    console.error('Deposit error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// POST /api/payments/withdraw - Initiate skin withdrawal
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, tradeUrl, selectedSkins } = req.body
    const steamId = req.user.steamId

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a valid withdrawal amount'
      })
    }

    if (!tradeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Trade URL is required'
      })
    }

    // Validate trade URL format
    const tradeUrlPattern = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/
    if (!tradeUrlPattern.test(tradeUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade URL format'
      })
    }

    const result = await paymentService.initiateWithdrawal(steamId, amount, tradeUrl, selectedSkins)
    res.json(result)
  } catch (error) {
    console.error('Withdrawal error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// GET /api/payments/balance - Get user balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const steamId = req.user.steamId
    const balance = await paymentService.getUserBalance(steamId)
    res.json({
      success: true,
      balance
    })
  } catch (error) {
    console.error('Balance error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get balance'
    })
  }
})

// GET /api/payments/transactions - Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const steamId = req.user.steamId
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const result = await paymentService.getTransactionHistory(steamId, limit, offset)
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Transaction history error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history'
    })
  }
})

// GET /api/payments/transaction/:id - Get specific transaction
router.get('/transaction/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const steamId = req.user.steamId
    
    const transaction = await paymentService.getTransaction(id)
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    // Check if user owns this transaction (non-admin users)
    if (req.user.role !== 'admin' && transaction.steamId !== steamId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    res.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('Get transaction error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction'
    })
  }
})

// GET /api/payments/pending - Get pending transactions
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const steamId = req.user.steamId
    const pending = await paymentService.getPendingTransactions(steamId)
    res.json({
      success: true,
      transactions: pending
    })
  } catch (error) {
    console.error('Pending transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get pending transactions'
    })
  }
})

// POST /api/payments/cancel/:id - Cancel pending transaction
router.post('/cancel/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const steamId = req.user.steamId
    
    const result = await paymentService.cancelTransaction(id, steamId)
    res.json(result)
  } catch (error) {
    console.error('Cancel transaction error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// GET /api/payments/skin-prices - Get skin price data
router.get('/skin-prices', authenticateToken, async (req, res) => {
  try {
    const { skins } = req.query // comma-separated list of skin names
    
    if (!skins) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skin names'
      })
    }

    const skinNames = skins.split(',')
    const prices = {}

    for (const skinName of skinNames) {
      const condition = req.query.condition || 'Field-Tested'
      const price = await paymentService.getSkinValue(skinName.trim(), condition)
      prices[skinName.trim()] = price
    }

    res.json({
      success: true,
      prices
    })
  } catch (error) {
    console.error('Skin prices error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get skin prices'
    })
  }
})

// GET /api/payments/available-skins - Get available skins for withdrawal
router.get('/available-skins', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.query
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a valid amount'
      })
    }

    const skins = await paymentService.selectSkinsForWithdrawal(parseFloat(amount))
    res.json({
      success: true,
      skins,
      totalValue: skins.reduce((sum, skin) => sum + skin.value, 0)
    })
  } catch (error) {
    console.error('Available skins error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get available skins'
    })
  }
})

// Admin routes (require admin role)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    })
  }
  next()
}

// GET /api/payments/admin/transactions - Get all transactions (admin)
router.get('/admin/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const offset = parseInt(req.query.offset) || 0

    const result = await paymentService.getAllTransactions(limit, offset)
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Admin transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    })
  }
})

// GET /api/payments/admin/stats - Get payment statistics (admin)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await paymentService.getPaymentStats()
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Payment stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics'
    })
  }
})

module.exports = router 