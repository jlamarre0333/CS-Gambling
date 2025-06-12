import express from 'express'

const router = express.Router()

// Get user's Steam inventory
router.get('/', async (req, res) => {
  try {
    const user = req.user as any
    
    // Mock inventory items
    const inventory = [
      {
        id: 'item_1',
        name: 'AK-47 | Redline',
        exterior: 'Field-Tested',
        rarity: 'Classified',
        weapon: 'AK-47',
        price: 125.50,
        image: '/images/ak47-redline.jpg',
        tradable: true,
        selected: false
      },
      {
        id: 'item_2',
        name: 'AWP | Dragon Lore',
        exterior: 'Minimal Wear',
        rarity: 'Covert',
        weapon: 'AWP',
        price: 2850.00,
        image: '/images/awp-dragonlore.jpg',
        tradable: true,
        selected: false
      }
    ]

    res.json({
      items: inventory,
      totalValue: inventory.reduce((sum, item) => sum + item.price, 0),
      totalItems: inventory.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
})

// Refresh inventory from Steam
router.post('/refresh', async (req, res) => {
  try {
    const user = req.user as any
    
    // This would call Steam API to refresh inventory
    res.json({ 
      message: 'Inventory refreshed successfully',
      itemsFound: 24,
      lastUpdate: new Date()
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh inventory' })
  }
})

// Get item details
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    
    // Mock item details
    const item = {
      id: itemId,
      name: 'AK-47 | Redline',
      exterior: 'Field-Tested',
      rarity: 'Classified',
      weapon: 'AK-47',
      price: 125.50,
      marketPrice: 127.25,
      priceHistory: [
        { date: new Date(Date.now() - 86400000), price: 124.75 },
        { date: new Date(Date.now() - 172800000), price: 126.50 },
        { date: new Date(Date.now() - 259200000), price: 125.25 }
      ],
      image: '/images/ak47-redline.jpg',
      description: 'It has been painted using a carbon fiber hydrographic over a red base coat and finished with a semi-gloss topcoat.',
      tradable: true,
      marketable: true,
      float: 0.234567,
      pattern: 592,
      stickers: []
    }

    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item details' })
  }
})

export default router 