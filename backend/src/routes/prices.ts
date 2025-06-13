import express from 'express'
import priceService from '../services/priceService'

const router = express.Router()

// Get price for a specific item
router.get('/item/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params
    const decodedName = decodeURIComponent(marketHashName)
    
    console.log(`Fetching price for item: ${decodedName}`)
    
    const priceData = await priceService.getItemPrice(decodedName)
    
    res.json({
      success: true,
      item: decodedName,
      priceData,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error fetching item price:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch item price' 
    })
  }
})

// Get trending items in the market
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query
    
    console.log(`Fetching trending items (limit: ${limit})`)
    
    const trendingItems = await priceService.getTrendingItems(Number(limit))
    
    res.json({
      success: true,
      trending: trendingItems,
      count: trendingItems.length,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error fetching trending items:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch trending items' 
    })
  }
})

// Bulk price check for multiple items
router.post('/bulk', async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      })
    }

    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 items allowed per request'
      })
    }

    console.log(`Bulk price check for ${items.length} items`)
    
    const priceMap = await priceService.updateInventoryPrices(items)
    
    // Convert Map to object for JSON response
    const priceObject: { [key: string]: any } = {}
    priceMap.forEach((value, key) => {
      priceObject[key] = value
    })
    
    res.json({
      success: true,
      prices: priceObject,
      itemCount: items.length,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error in bulk price check:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to process bulk price check' 
    })
  }
})

// Get market statistics
router.get('/market/stats', async (req, res) => {
  try {
    // Get trending items for market analysis
    const trending = await priceService.getTrendingItems(10)
    
    // Calculate market statistics
    const totalValue = trending.reduce((sum, item) => sum + item.price, 0)
    const averagePrice = trending.length > 0 ? totalValue / trending.length : 0
    const topItem = trending.length > 0 ? trending[0] : null
    
    const marketStats = {
      overview: {
        totalActiveItems: trending.length,
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalMarketValue: Math.round(totalValue * 100) / 100,
        lastUpdate: new Date()
      },
      topPerformers: trending.slice(0, 5).map(item => ({
        name: item.marketHashName,
        price: item.price,
        volume: item.volume,
        trend: 'up' // Based on volume for now
      })),
      categories: {
        rifles: trending.filter(item => 
          item.marketHashName.includes('AK-47') || 
          item.marketHashName.includes('M4A4') || 
          item.marketHashName.includes('M4A1-S')
        ).length,
        snipers: trending.filter(item => 
          item.marketHashName.includes('AWP')
        ).length,
        pistols: trending.filter(item => 
          item.marketHashName.includes('Glock') || 
          item.marketHashName.includes('Desert Eagle') ||
          item.marketHashName.includes('USP')
        ).length,
        knives: trending.filter(item => 
          item.marketHashName.includes('Karambit') || 
          item.marketHashName.includes('Butterfly') ||
          item.marketHashName.includes('Bayonet')
        ).length
      }
    }

    res.json({
      success: true,
      marketStats,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error fetching market stats:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch market statistics' 
    })
  }
})

// Get price history for an item
router.get('/history/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params
    const { days = 30 } = req.query
    
    const decodedName = decodeURIComponent(marketHashName)
    
    console.log(`Fetching price history for: ${decodedName} (${days} days)`)
    
    // Get current price data which includes history
    const priceData = await priceService.getItemPrice(decodedName)
    
    // Mock historical data for now (in production, you'd store this)
    const history = Array.from({ length: Number(days) }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Simulate price fluctuation
      const basePrice = priceData.current
      const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
      const price = Math.max(0.01, basePrice * (1 + variation))
      
      return {
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 100) + 10
      }
    }).reverse()

    res.json({
      success: true,
      item: decodedName,
      currentPrice: priceData.current,
      trend: priceData.trend,
      history,
      period: `${days} days`,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error fetching price history:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch price history' 
    })
  }
})

// Get popular items by category
router.get('/popular/:category', async (req, res) => {
  try {
    const { category } = req.params
    const { limit = 10 } = req.query
    
    console.log(`Fetching popular ${category} items`)
    
    // Define popular items by category
    const categoryItems: { [key: string]: string[] } = {
      rifles: [
        'AK-47 | Redline (Field-Tested)',
        'AK-47 | Fire Serpent (Field-Tested)',
        'M4A4 | Howl (Field-Tested)',
        'M4A1-S | Hot Rod (Factory New)',
        'AK-47 | Vulcan (Factory New)',
        'M4A4 | The Emperor (Factory New)',
        'AK-47 | Asiimov (Field-Tested)',
        'M4A1-S | Cyrex (Factory New)'
      ],
      snipers: [
        'AWP | Dragon Lore (Factory New)',
        'AWP | Asiimov (Field-Tested)',
        'AWP | Lightning Strike (Factory New)',
        'AWP | Hyper Beast (Factory New)',
        'AWP | Fever Dream (Factory New)',
        'AWP | Neo-Noir (Factory New)',
        'AWP | Containment Breach (Factory New)'
      ],
      pistols: [
        'Glock-18 | Fade (Factory New)',
        'Desert Eagle | Blaze (Factory New)',
        'USP-S | Kill Confirmed (Factory New)',
        'P250 | See Ya Later (Factory New)',
        'Desert Eagle | Printstream (Factory New)',
        'Glock-18 | Gamma Doppler (Factory New)'
      ]
    }

    const items = categoryItems[category] || []
    const limitedItems = items.slice(0, Number(limit))
    
    // Get price data for each item
    const popularItems = await Promise.all(
      limitedItems.map(async (itemName) => {
        const priceData = await priceService.getItemPrice(itemName)
        return {
          name: itemName,
          price: priceData.current,
          trend: priceData.trend,
          volume24h: priceData.volume24h,
          average7d: priceData.average7d
        }
      })
    )

    // Sort by price (high to low)
    popularItems.sort((a, b) => b.price - a.price)

    res.json({
      success: true,
      category,
      items: popularItems,
      count: popularItems.length,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error fetching popular items:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch popular items' 
    })
  }
})

export default router 