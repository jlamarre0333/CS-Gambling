import express from 'express'

const router = express.Router()

// Get transaction history
router.get('/', async (req, res) => {
  try {
    const user = req.user as any
    const { page = 1, limit = 20, type } = req.query

    // Mock transactions
    const transactions = [
      {
        id: 'tx_1',
        type: 'deposit',
        amount: 150.00,
        items: ['AK-47 | Redline'],
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000),
        steamTradeId: 'trade_123456'
      },
      {
        id: 'tx_2',
        type: 'withdrawal',
        amount: 85.50,
        items: ['Glock-18 | Water Elemental'],
        status: 'pending',
        timestamp: new Date(Date.now() - 1800000),
        steamTradeId: null
      }
    ]

    const filteredTransactions = type ? transactions.filter(t => t.type === type) : transactions

    res.json({
      transactions: filteredTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / Number(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Create deposit
router.post('/deposit', async (req, res) => {
  try {
    const user = req.user as any
    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items required for deposit' })
    }

    // Mock deposit creation
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'deposit',
      amount: items.length * 100, // Mock calculation
      items,
      status: 'pending',
      timestamp: new Date(),
      steamTradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456&token=abcdef',
      expiresAt: new Date(Date.now() + 300000) // 5 minutes
    }

    res.json({
      transaction,
      message: 'Deposit created successfully. Please complete the Steam trade.',
      tradeUrl: transaction.steamTradeUrl
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deposit' })
  }
})

// Create withdrawal
router.post('/withdrawal', async (req, res) => {
  try {
    const user = req.user as any
    const { amount, steamTradeUrl } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' })
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    if (!steamTradeUrl) {
      return res.status(400).json({ error: 'Steam trade URL required' })
    }

    // Mock withdrawal creation
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'withdrawal',
      amount,
      status: 'processing',
      timestamp: new Date(),
      steamTradeUrl,
      estimatedDelivery: new Date(Date.now() + 600000) // 10 minutes
    }

    res.json({
      transaction,
      message: 'Withdrawal request submitted successfully.'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create withdrawal' })
  }
})

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Mock transaction details
    const transaction = {
      id,
      type: 'deposit',
      amount: 150.00,
      items: ['AK-47 | Redline'],
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000),
      steamTradeId: 'trade_123456',
      fees: 7.50,
      netAmount: 142.50
    }

    res.json(transaction)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' })
  }
})

// Cancel pending transaction
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params

    // Mock cancellation
    res.json({ 
      message: 'Transaction cancelled successfully',
      transactionId: id 
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel transaction' })
  }
})

export default router 