import express from 'express'
import steamIntegrationService from '../services/steamIntegrationService'

const router = express.Router()

// Get user's Steam inventory
router.get('/', async (req, res) => {
  try {
    const user = req.user as any
    
    // For now, we'll use a demo Steam ID since we don't have auth yet
    // In production, this would come from the authenticated user
    const demoSteamId = req.query.steamId as string || '76561198000000000'
    
    console.log(`Fetching Steam inventory for user: ${demoSteamId}`)
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(demoSteamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    // Get real Steam inventory using our integration service
    const inventory = await steamIntegrationService.getSteamInventory(demoSteamId)
    
    if (!inventory) {
      return res.status(404).json({ error: 'Failed to fetch inventory or inventory is private' })
    }

    res.json({
      items: inventory.items,
      totalValue: inventory.totalValue,
      totalItems: inventory.totalItems,
      steamId: inventory.steamId,
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
    const inventory = await steamIntegrationService.getSteamInventory(steamId)
    
    if (!inventory) {
      return res.status(404).json({ error: 'Failed to refresh inventory or inventory is private' })
    }
    
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
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    const profile = await steamIntegrationService.getSteamProfile(steamId)
    
    if (!profile) {
      return res.status(404).json({ error: 'Steam profile not found' })
    }
    
    res.json({
      success: true,
      profile
    })
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

// Get tradable items for gambling
router.get('/tradable/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    console.log(`Fetching tradable items for: ${steamId}`)
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    const tradableItems = await steamIntegrationService.getUserTradableItems(steamId)
    
    res.json({
      success: true,
      items: tradableItems,
      totalItems: tradableItems.length,
      totalValue: steamIntegrationService.calculateSelectedItemsValue(tradableItems.map(item => ({ ...item, selected: true })))
    })
  } catch (error) {
    console.error('Error fetching tradable items:', error)
    res.status(500).json({ error: 'Failed to fetch tradable items' })
  }
})

// Validate item ownership
router.post('/validate-ownership', async (req, res) => {
  try {
    const { steamId, itemIds } = req.body
    
    if (!steamId || !itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({ error: 'Steam ID and item IDs are required' })
    }
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    const ownsItems = await steamIntegrationService.validateUserOwnsItems(steamId, itemIds)
    
    res.json({
      success: true,
      ownsItems,
      validatedItems: itemIds.length
    })
  } catch (error) {
    console.error('Error validating item ownership:', error)
    res.status(500).json({ error: 'Failed to validate item ownership' })
  }
})

// Sync user inventory
router.post('/sync/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    const user = req.user as any
    
    console.log(`Syncing inventory for Steam ID: ${steamId}`)
    
    // Validate Steam ID format
    if (!steamIntegrationService.isValidSteamId(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }
    
    const userId = user?.id || `user_${steamId}`
    const syncSuccess = await steamIntegrationService.syncUserInventory(userId, steamId)
    
    if (syncSuccess) {
      res.json({
        success: true,
        message: 'Inventory synced successfully',
        syncedAt: new Date()
      })
    } else {
      res.status(500).json({ error: 'Failed to sync inventory' })
    }
  } catch (error) {
    console.error('Error syncing inventory:', error)
    res.status(500).json({ error: 'Failed to sync inventory' })
  }
})

// Get item price
router.get('/price/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params
    
    console.log(`Fetching price for item: ${itemName}`)
    
    const priceData = await steamIntegrationService.getItemPrice(itemName)
    
    if (priceData) {
      res.json({
        success: true,
        itemName,
        ...priceData
      })
    } else {
      res.status(404).json({ error: 'Price not available for this item' })
    }
  } catch (error) {
    console.error('Error fetching item price:', error)
    res.status(500).json({ error: 'Failed to fetch item price' })
  }
})

// Steam server status
router.get('/steam-status', async (req, res) => {
  try {
    const status = await steamIntegrationService.getSteamServerStatus()
    res.json(status)
  } catch (error) {
    console.error('Error checking Steam server status:', error)
    res.status(500).json({ error: 'Failed to check Steam server status' })
  }
})

export default router 