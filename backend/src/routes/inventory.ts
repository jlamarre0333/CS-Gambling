import express from 'express'
import steamService from '../services/steamService'

const router = express.Router()

// Get user's Steam inventory
router.get('/', async (req, res) => {
  try {
    const user = req.user as any
    
    // For now, we'll use a demo Steam ID since we don't have auth yet
    // In production, this would come from the authenticated user
    const demoSteamId = req.query.steamId as string || '76561198000000000'
    
    console.log(`Fetching Steam inventory for user: ${demoSteamId}`)
    
    // Get real Steam inventory
    const inventory = await steamService.getUserInventory(demoSteamId)
    
    // Add selected field for frontend compatibility
    const itemsWithSelection = inventory.items.map(item => ({
      ...item,
      selected: false
    }))

    res.json({
      items: itemsWithSelection,
      totalValue: inventory.totalValue,
      totalItems: inventory.totalItems,
      steamId: demoSteamId,
      lastUpdated: new Date()
    })
  } catch (error) {
    console.error('Error in inventory route:', error)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
})

// Refresh inventory from Steam
router.post('/refresh', async (req, res) => {
  try {
    const user = req.user as any
    const { steamId } = req.body
    
    if (!steamId) {
      return res.status(400).json({ error: 'Steam ID is required' })
    }
    
    console.log(`Refreshing inventory for Steam ID: ${steamId}`)
    
    // Get fresh inventory from Steam API
    const inventory = await steamService.getUserInventory(steamId)
    
    res.json({ 
      message: 'Inventory refreshed successfully',
      itemsFound: inventory.totalItems,
      totalValue: inventory.totalValue,
      lastUpdate: new Date(),
      steamId
    })
  } catch (error) {
    console.error('Error refreshing inventory:', error)
    res.status(500).json({ error: 'Failed to refresh inventory' })
  }
})

// Get Steam profile information
router.get('/profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    console.log(`Fetching Steam profile for: ${steamId}`)
    
    const profile = await steamService.getUserProfile(steamId)
    
    res.json(profile)
  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    res.status(500).json({ error: 'Failed to fetch Steam profile' })
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