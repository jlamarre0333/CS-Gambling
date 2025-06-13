import SteamAPI from 'steamapi'
import axios from 'axios'
import priceService from './priceService'

interface SteamItem {
  id: string
  name: string
  exterior?: string
  rarity: string
  weapon?: string
  price: number
  image: string
  tradable: boolean
  marketable: boolean
  description?: string
  float?: number
  pattern?: number
  stickers?: any[]
  priceHistory?: any
  trend?: 'up' | 'down' | 'stable'
}

interface SteamInventoryResponse {
  items: SteamItem[]
  totalValue: number
  totalItems: number
}

class SteamService {
  private steam: SteamAPI
  private apiKey: string

  constructor() {
    // You'll need to get your Steam API key from https://steamcommunity.com/dev/apikey
    this.apiKey = process.env.STEAM_API_KEY || 'your_steam_api_key_here'
    this.steam = new SteamAPI(this.apiKey)
  }

  /**
   * Get user's CS:GO/CS2 inventory from Steam
   * @param steamId - User's Steam ID (64-bit)
   * @returns Promise<SteamInventoryResponse>
   */
  async getUserInventory(steamId: string): Promise<SteamInventoryResponse> {
    try {
      console.log(`Fetching inventory for Steam ID: ${steamId}`)
      
      // Steam Web API endpoint for CS:GO inventory
      const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`
      
      const response = await axios.get(inventoryUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.data || !response.data.assets || !response.data.descriptions) {
        throw new Error('Invalid inventory response from Steam')
      }

      const { assets, descriptions } = response.data
      const items: SteamItem[] = []

      // Process inventory items
      for (const asset of assets) {
        const description = descriptions.find((desc: any) => 
          desc.classid === asset.classid && desc.instanceid === asset.instanceid
        )

        if (!description || !description.tradable || !description.marketable) {
          continue // Skip non-tradable items
        }

        // Get comprehensive price data
        const priceData = await priceService.getItemPrice(description.market_hash_name)

        // Extract item information
        const item: SteamItem = {
          id: `${asset.assetid}`,
          name: description.name || 'Unknown Item',
          exterior: this.extractExterior(description.name),
          rarity: this.extractRarity(description.tags),
          weapon: this.extractWeapon(description.name),
          price: priceData.current,
          image: `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`,
          tradable: description.tradable === 1,
          marketable: description.marketable === 1,
          description: description.description,
          float: undefined, // Would need additional API call for float values
          pattern: undefined,
          stickers: this.extractStickers(description.descriptions),
          priceHistory: priceData,
          trend: priceData.trend
        }

        items.push(item)
      }

      const totalValue = items.reduce((sum, item) => sum + item.price, 0)

      return {
        items,
        totalValue,
        totalItems: items.length
      }

    } catch (error) {
      console.error('Error fetching Steam inventory:', error)
      
      // Return mock data if Steam API fails (for development)
      return this.getMockInventory()
    }
  }

  /**
   * Get user's Steam profile information
   * @param steamId - User's Steam ID (64-bit)
   */
  async getUserProfile(steamId: string) {
    try {
      const profile = await this.steam.getUserSummary(steamId)
      return {
        steamId: profile.steamID,
        username: profile.nickname,
        avatar: profile.avatar.large,
        profileUrl: profile.url,
        accountCreated: profile.createdAt,
        lastOnline: profile.lastLogOffAt
      }
    } catch (error) {
      console.error('Error fetching Steam profile:', error)
      throw new Error('Failed to fetch Steam profile')
    }
  }

  /**
   * Get current market price for an item
   * @param marketHashName - Steam market hash name
   */
  private async getItemPrice(marketHashName: string): Promise<number> {
    try {
      // Using Steam Community Market API
      const priceUrl = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`
      
      const response = await axios.get(priceUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.data && response.data.median_price) {
        // Parse price string like "$1.23" to number
        const priceStr = response.data.median_price.replace(/[^0-9.]/g, '')
        return parseFloat(priceStr) || 0
      }

      return 0
    } catch (error) {
      console.error(`Error fetching price for ${marketHashName}:`, error)
      return 0
    }
  }

  /**
   * Extract exterior condition from item name
   */
  private extractExterior(itemName: string): string | undefined {
    const exteriors = [
      'Factory New', 'Minimal Wear', 'Field-Tested', 
      'Well-Worn', 'Battle-Scarred'
    ]
    
    for (const exterior of exteriors) {
      if (itemName.includes(`(${exterior})`)) {
        return exterior
      }
    }
    return undefined
  }

  /**
   * Extract rarity from item tags
   */
  private extractRarity(tags: any[]): string {
    if (!tags) return 'Unknown'
    
    const rarityTag = tags.find(tag => tag.category === 'Rarity')
    if (rarityTag) {
      return rarityTag.localized_name || 'Unknown'
    }
    return 'Unknown'
  }

  /**
   * Extract weapon type from item name
   */
  private extractWeapon(itemName: string): string | undefined {
    const weapons = [
      'AK-47', 'AWP', 'M4A4', 'M4A1-S', 'Glock-18', 'USP-S',
      'Desert Eagle', 'P250', 'Tec-9', 'Five-SeveN', 'CZ75-Auto',
      'R8 Revolver', 'Dual Berettas', 'P2000', 'MP9', 'MAC-10',
      'UMP-45', 'PP-Bizon', 'P90', 'MP5-SD', 'MP7', 'Galil AR',
      'FAMAS', 'SSG 08', 'SCAR-20', 'G3SG1', 'Nova', 'XM1014',
      'Sawed-Off', 'MAG-7', 'M249', 'Negev'
    ]

    for (const weapon of weapons) {
      if (itemName.includes(weapon)) {
        return weapon
      }
    }
    return undefined
  }

  /**
   * Extract stickers from item descriptions
   */
  private extractStickers(descriptions: any[]): any[] {
    if (!descriptions) return []

    const stickers: any[] = []
    for (const desc of descriptions) {
      if (desc.value && desc.value.includes('Sticker:')) {
        // Parse sticker information
        stickers.push({
          name: desc.value.replace('Sticker: ', ''),
          // Additional sticker parsing could be added here
        })
      }
    }
    return stickers
  }

  /**
   * Fallback mock inventory for development/testing
   */
  private getMockInventory(): SteamInventoryResponse {
    const mockItems: SteamItem[] = [
      {
        id: 'mock_1',
        name: 'AK-47 | Redline (Field-Tested)',
        exterior: 'Field-Tested',
        rarity: 'Classified',
        weapon: 'AK-47',
        price: 125.50,
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJ6pYh0u3E8oP5jAfn-0dsYmr1ctXGdlI6N1nS-QK2wOy5hMC96p3PwCNl6D5iuyhJF9TnqA',
        tradable: true,
        marketable: true,
        description: 'It has been painted using a carbon fiber hydrographic over a red base coat and finished with a semi-gloss topcoat.',
        stickers: []
      },
      {
        id: 'mock_2',
        name: 'AWP | Dragon Lore (Minimal Wear)',
        exterior: 'Minimal Wear',
        rarity: 'Covert',
        weapon: 'AWP',
        price: 2850.00,
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G0GuJwl0r-T9I-iiwHnrUBvNzrycNfBdVA_YwzT-FG2k-a8jcPu75nJwXNkvD5iuyid8mGdwUYbUtvBR7M',
        tradable: true,
        marketable: true,
        description: 'The Dragon Lore is a legendary AWP skin.',
        stickers: []
      }
    ]

    return {
      items: mockItems,
      totalValue: mockItems.reduce((sum, item) => sum + item.price, 0),
      totalItems: mockItems.length
    }
  }
}

export default new SteamService() 