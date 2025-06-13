import axios from 'axios'

interface PriceData {
  current: number
  average7d: number
  average30d: number
  trend: 'up' | 'down' | 'stable'
  volume24h: number
  lastUpdate: Date
}

interface MarketItem {
  marketHashName: string
  price: number
  priceHistory: PriceHistoryPoint[]
  volume: number
  listings: number
}

interface PriceHistoryPoint {
  date: Date
  price: number
  volume: number
}

interface CSMoneyItem {
  name: string
  price: number
  overpay: number
  overprice: number
}

interface SkinportItem {
  market_hash_name: string
  currency: string
  suggested_price: number
  item_page: string
  market_page: string
  min_price: number
  max_price: number
  mean_price: number
  quantity: number
}

class PriceService {
  private cache: Map<string, { data: any; expiry: number }>
  private steamApiKey: string
  private csMoneyApiKey?: string
  private skinportApiKey?: string
  
  constructor() {
    // Cache prices for 5 minutes to avoid API spam
    this.cache = new Map()
    this.steamApiKey = process.env.STEAM_API_KEY || ''
    this.csMoneyApiKey = process.env.CSMONEY_API_KEY
    this.skinportApiKey = process.env.SKINPORT_API_KEY
  }

  /**
   * Simple cache implementation
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCached(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    })
  }

  /**
   * Get comprehensive price data for an item from multiple sources
   */
  async getItemPrice(marketHashName: string): Promise<PriceData> {
    const cacheKey = `price_${marketHashName}`
    const cached = this.getCached<PriceData>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // Fetch from multiple sources in parallel
      const [steamPrice, csMoneyPrice, skinportPrice] = await Promise.allSettled([
        this.getSteamMarketPrice(marketHashName),
        this.getCSMoneyPrice(marketHashName),
        this.getSkinportPrice(marketHashName)
      ])

      // Combine prices with weights
      const prices: number[] = []
      
      if (steamPrice.status === 'fulfilled' && steamPrice.value > 0) {
        prices.push(steamPrice.value)
      }
      if (csMoneyPrice.status === 'fulfilled' && csMoneyPrice.value > 0) {
        prices.push(csMoneyPrice.value)
      }
      if (skinportPrice.status === 'fulfilled' && skinportPrice.value > 0) {
        prices.push(skinportPrice.value)
      }

      // Calculate weighted average (Steam Market gets higher weight)
      let currentPrice = 0
      if (prices.length > 0) {
        if (steamPrice.status === 'fulfilled' && steamPrice.value > 0) {
          // Steam price gets 50% weight, others split remaining
          const otherPrices = prices.filter(p => p !== steamPrice.value)
          currentPrice = steamPrice.value * 0.5 + 
                        (otherPrices.reduce((sum, p) => sum + p, 0) / otherPrices.length || 0) * 0.5
        } else {
          currentPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
        }
      }

      // Get historical data for trends
      const history = await this.getPriceHistory(marketHashName)
      const average7d = this.calculateAverage(history, 7)
      const average30d = this.calculateAverage(history, 30)
      const trend = this.calculateTrend(currentPrice, average7d, average30d)

      const priceData: PriceData = {
        current: Math.round(currentPrice * 100) / 100,
        average7d: Math.round(average7d * 100) / 100,
        average30d: Math.round(average30d * 100) / 100,
        trend,
        volume24h: await this.get24hVolume(marketHashName),
        lastUpdate: new Date()
      }

      this.setCached(cacheKey, priceData)
      return priceData

    } catch (error) {
      console.error(`Error fetching price for ${marketHashName}:`, error)
      
      // Return fallback data
      return {
        current: 0,
        average7d: 0,
        average30d: 0,
        trend: 'stable',
        volume24h: 0,
        lastUpdate: new Date()
      }
    }
  }

  /**
   * Steam Community Market price
   */
  private async getSteamMarketPrice(marketHashName: string): Promise<number> {
    try {
      const url = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`
      
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.data.success && response.data.median_price) {
        const priceStr = response.data.median_price.replace(/[^0-9.]/g, '')
        return parseFloat(priceStr) || 0
      }

      return 0
    } catch (error) {
      console.error('Steam Market API error:', error)
      return 0
    }
  }

  /**
   * CS.MONEY API for alternative pricing
   */
  private async getCSMoneyPrice(marketHashName: string): Promise<number> {
    if (!this.csMoneyApiKey) return 0

    try {
      const response = await axios.get('https://cs.money/csgo_bot_prices', {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${this.csMoneyApiKey}`
        }
      })

      const item = response.data.find((item: CSMoneyItem) => 
        item.name.toLowerCase() === marketHashName.toLowerCase()
      )

      return item ? item.price / 100 : 0 // CS.MONEY returns prices in cents

    } catch (error) {
      console.error('CS.MONEY API error:', error)
      return 0
    }
  }

  /**
   * Skinport API for market data
   */
  private async getSkinportPrice(marketHashName: string): Promise<number> {
    try {
      const response = await axios.get('https://api.skinport.com/v1/items', {
        params: {
          app_id: 730,
          currency: 'USD',
          tradable: true,
          marketable: true
        },
        timeout: 5000
      })

      const item = response.data.find((item: SkinportItem) => 
        item.market_hash_name === marketHashName
      )

      return item ? item.suggested_price : 0

    } catch (error) {
      console.error('Skinport API error:', error)
      return 0
    }
  }

  /**
   * Get price history from Steam Market
   */
  private async getPriceHistory(marketHashName: string): Promise<PriceHistoryPoint[]> {
    try {
      const url = `https://steamcommunity.com/market/pricehistory/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.data.success && response.data.prices) {
        return response.data.prices.map((point: any) => ({
          date: new Date(point[0]),
          price: parseFloat(point[1]),
          volume: parseInt(point[2])
        }))
      }

      return []
    } catch (error) {
      console.error('Price history API error:', error)
      return []
    }
  }

  /**
   * Calculate average price over specified days
   */
  private calculateAverage(history: PriceHistoryPoint[], days: number): number {
    if (history.length === 0) return 0

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentPrices = history
      .filter(point => point.date >= cutoffDate)
      .map(point => point.price)

    if (recentPrices.length === 0) return 0

    return recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length
  }

  /**
   * Calculate price trend
   */
  private calculateTrend(current: number, avg7d: number, avg30d: number): 'up' | 'down' | 'stable' {
    const threshold = 0.05 // 5% threshold
    
    if (current > avg7d * (1 + threshold)) return 'up'
    if (current < avg7d * (1 - threshold)) return 'down'
    return 'stable'
  }

  /**
   * Get 24h trading volume
   */
  private async get24hVolume(marketHashName: string): Promise<number> {
    try {
      const history = await this.getPriceHistory(marketHashName)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const volume = history
        .filter(point => point.date >= yesterday)
        .reduce((sum, point) => sum + point.volume, 0)

      return volume
    } catch (error) {
      console.error('Volume calculation error:', error)
      return 0
    }
  }

  /**
   * Get trending items in the market
   */
  async getTrendingItems(limit: number = 10): Promise<MarketItem[]> {
    const cacheKey = 'trending_items'
    const cached = this.getCached<MarketItem[]>(cacheKey)
    
    if (cached) {
      return cached.slice(0, limit)
    }

    try {
      // Get popular CS2 items for trending analysis
      const popularItems = [
        'AK-47 | Redline (Field-Tested)',
        'AWP | Dragon Lore (Factory New)',
        'M4A4 | Howl (Field-Tested)',
        'AK-47 | Fire Serpent (Field-Tested)',
        'AWP | Asiimov (Field-Tested)',
        'Glock-18 | Fade (Factory New)',
        'M4A1-S | Hot Rod (Factory New)',
        'AK-47 | Vulcan (Factory New)',
        'AWP | Lightning Strike (Factory New)',
        'Desert Eagle | Blaze (Factory New)'
      ]

      const trendingData = await Promise.all(
        popularItems.map(async (itemName) => {
          const priceData = await this.getItemPrice(itemName)
          const history = await this.getPriceHistory(itemName)
          
          return {
            marketHashName: itemName,
            price: priceData.current,
            priceHistory: history.slice(-30), // Last 30 days
            volume: priceData.volume24h,
            listings: Math.floor(Math.random() * 100) + 10 // Mock for now
          }
        })
      )

      // Sort by volume and price trend
      const trending = trendingData
        .filter(item => item.price > 0)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit)

      this.setCached(cacheKey, trending, 1800) // Cache for 30 minutes
      return trending

    } catch (error) {
      console.error('Error fetching trending items:', error)
      return []
    }
  }

  /**
   * Bulk price update for inventory
   */
  async updateInventoryPrices(items: string[]): Promise<Map<string, PriceData>> {
    const priceMap = new Map<string, PriceData>()
    
    // Process in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (item) => {
        const price = await this.getItemPrice(item)
        priceMap.set(item, price)
      })

      await Promise.all(batchPromises)
      
      // Rate limiting delay
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return priceMap
  }
}

export default new PriceService()
export { PriceData, MarketItem, PriceHistoryPoint } 