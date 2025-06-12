import axios from 'axios'

export interface SteamItem {
  assetid: string
  classid: string
  instanceid: string
  amount: number
  pos: number
  market_hash_name: string
  market_name: string
  name: string
  name_color: string
  type: string
  tradable: boolean
  marketable: boolean
  exterior?: string
  rarity?: string
  weapon?: string
  price?: number
  image_url?: string
}

export interface SteamInventoryResponse {
  assets: any[]
  descriptions: any[]
  success: boolean
  total_inventory_count: number
}

export interface MarketPriceResponse {
  success: boolean
  lowest_price?: string
  volume?: string
  median_price?: string
}

export class SteamService {
  private apiKey: string
  private baseUrl = 'https://api.steampowered.com'
  private marketUrl = 'https://steamcommunity.com/market'

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Steam API key not found. Steam features will be limited.')
    }
  }

  async getUserInventory(steamId: string, appId: number = 730): Promise<SteamItem[]> {
    try {
      const response = await axios.get<SteamInventoryResponse>(
        `${this.baseUrl}/IEconService/GetInventoryItemsWithDescriptions/v1/`,
        {
          params: {
            key: this.apiKey,
            steamid: steamId,
            appid: appId,
            contextid: 2, // CS2 context
            count: 5000 // Max items to fetch
          },
          timeout: 10000
        }
      )

      if (!response.data.success || !response.data.assets) {
        throw new Error('Failed to fetch inventory')
      }

      // Combine assets with descriptions
      const items: SteamItem[] = response.data.assets.map(asset => {
        const description = response.data.descriptions.find(
          desc => desc.classid === asset.classid && desc.instanceid === asset.instanceid
        )

        return {
          assetid: asset.assetid,
          classid: asset.classid,
          instanceid: asset.instanceid,
          amount: asset.amount,
          pos: asset.pos,
          market_hash_name: description?.market_hash_name || '',
          market_name: description?.market_name || '',
          name: description?.name || '',
          name_color: description?.name_color || '',
          type: description?.type || '',
          tradable: description?.tradable === 1,
          marketable: description?.marketable === 1,
          exterior: this.extractExterior(description?.name || ''),
          rarity: this.extractRarity(description?.tags || []),
          weapon: this.extractWeapon(description?.name || ''),
          image_url: description?.icon_url ? `https://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}` : undefined
        }
      })

      // Filter CS2 items only
      return items.filter(item => 
        item.market_hash_name && 
        item.tradable && 
        item.marketable &&
        !item.name.includes('Graffiti') &&
        !item.name.includes('Sticker')
      )
    } catch (error) {
      console.error('Error fetching Steam inventory:', error)
      throw new Error('Failed to fetch Steam inventory')
    }
  }

  async getMarketPrice(marketHashName: string): Promise<number> {
    try {
      const response = await axios.get<MarketPriceResponse>(
        `${this.marketUrl}/priceoverview/`,
        {
          params: {
            currency: 1, // USD
            appid: 730, // CS2
            market_hash_name: marketHashName
          },
          timeout: 5000
        }
      )

      if (!response.data.success || !response.data.lowest_price) {
        return 0
      }

      // Parse price from Steam format ($X.XX)
      const priceString = response.data.lowest_price.replace('$', '').replace(',', '')
      return parseFloat(priceString) || 0
    } catch (error) {
      console.error('Error fetching market price:', error)
      return 0
    }
  }

  async getMultipleMarketPrices(marketHashNames: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {}
    
    // Batch requests with delay to avoid rate limiting
    for (const name of marketHashNames) {
      try {
        prices[name] = await this.getMarketPrice(name)
        await this.delay(100) // 100ms delay between requests
      } catch (error) {
        prices[name] = 0
      }
    }

    return prices
  }

  private extractExterior(itemName: string): string | undefined {
    const exteriors = [
      'Factory New',
      'Minimal Wear', 
      'Field-Tested',
      'Well-Worn',
      'Battle-Scarred'
    ]

    for (const exterior of exteriors) {
      if (itemName.includes(`(${exterior})`)) {
        return exterior
      }
    }

    return undefined
  }

  private extractRarity(tags: any[]): string | undefined {
    const rarityTag = tags.find(tag => tag.category === 'Rarity')
    return rarityTag?.localized_tag_name || rarityTag?.name
  }

  private extractWeapon(itemName: string): string | undefined {
    // Extract weapon name from item name (before first space or hyphen)
    const match = itemName.match(/^([A-Z0-9-]+(?:\s+[A-Z0-9-]+)*?)(?:\s+\||\s+★)/i)
    return match ? match[1].trim() : undefined
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Validate Steam ID format
  validateSteamId(steamId: string): boolean {
    return /^\d{17}$/.test(steamId)
  }

  // Convert Steam ID formats
  steamId64To32(steamId64: string): string {
    const id64 = BigInt(steamId64)
    const id32 = id64 - BigInt('76561197960265728')
    return id32.toString()
  }

  steamId32To64(steamId32: string): string {
    const id32 = BigInt(steamId32)
    const id64 = id32 + BigInt('76561197960265728')
    return id64.toString()
  }
} 