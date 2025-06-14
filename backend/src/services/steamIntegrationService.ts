import axios from 'axios'
import jwt from 'jsonwebtoken'

interface SteamProfile {
  steamid: string
  personaname: string
  avatarfull: string
  profileurl: string
  personastate: number
  lastlogoff?: number
}

interface SteamItem {
  id: string
  name: string
  icon_url: string
  rarity: string
  exterior?: string
  type?: string
  weapon?: string
  tradable: boolean
  marketable: boolean
  price: number
  selected: boolean
}

interface SteamInventory {
  items: SteamItem[]
  totalValue: number
  totalItems: number
  steamId: string
}

class SteamIntegrationService {
  private steamServerUrl: string
  private jwtSecret: string

  constructor() {
    this.steamServerUrl = process.env.STEAM_SERVER_URL || 'http://localhost:3002'
    this.jwtSecret = process.env.JWT_SECRET || 'cs2-gambling-jwt-secret'
  }

  /**
   * Authenticate user with Steam and create/update user account
   */
  async authenticateWithSteam(steamId: string): Promise<{ user: any; token: string }> {
    try {
      // Get Steam profile from our Steam server
      const profile = await this.getSteamProfile(steamId)
      
      if (!profile) {
        throw new Error('Failed to fetch Steam profile')
      }

      // Create or update user in database
      const user = await this.createOrUpdateUser(profile)
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          steamId: user.steamId,
          username: user.username
        },
        this.jwtSecret,
        { expiresIn: '7d' }
      )

      return { user, token }
    } catch (error) {
      console.error('Steam authentication error:', error)
      throw new Error('Steam authentication failed')
    }
  }

  /**
   * Get Steam profile from our Steam server
   */
  async getSteamProfile(steamId: string): Promise<SteamProfile | null> {
    try {
      const response = await axios.get(`${this.steamServerUrl}/api/steam/profile/${steamId}`)
      
      if (response.data.success) {
        return response.data.profile
      }
      
      return null
    } catch (error) {
      console.error('Error fetching Steam profile:', error)
      return null
    }
  }

  /**
   * Get Steam inventory from our Steam server
   */
  async getSteamInventory(steamId: string): Promise<SteamInventory | null> {
    try {
      const response = await axios.get(`${this.steamServerUrl}/api/steam/inventory/${steamId}`)
      
      if (response.data.success) {
        return {
          items: response.data.items,
          totalValue: response.data.totalValue,
          totalItems: response.data.totalItems,
          steamId: response.data.steamId
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching Steam inventory:', error)
      return null
    }
  }

  /**
   * Get item price from Steam market
   */
  async getItemPrice(itemName: string): Promise<{ price: string; volume: string } | null> {
    try {
      const response = await axios.get(`${this.steamServerUrl}/api/steam/price/${encodeURIComponent(itemName)}`)
      
      if (response.data.success) {
        return {
          price: response.data.price,
          volume: response.data.volume
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching item price:', error)
      return null
    }
  }

  /**
   * Validate Steam ID format
   */
  isValidSteamId(steamId: string): boolean {
    // Steam ID 64 format validation
    const steamId64Regex = /^7656119[0-9]{10}$/
    return steamId64Regex.test(steamId)
  }

  /**
   * Create or update user in database based on Steam profile
   */
  private async createOrUpdateUser(profile: SteamProfile): Promise<any> {
    // This would integrate with your database service
    // For now, return a mock user object
    return {
      id: `user_${profile.steamid}`,
      steamId: profile.steamid,
      username: profile.personaname,
      avatar: profile.avatarfull,
      profileUrl: profile.profileurl,
      balance: 1000.00, // Starting balance
      level: 1,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      isOnline: profile.personastate === 1,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Sync user's Steam inventory with database
   */
  async syncUserInventory(userId: string, steamId: string): Promise<boolean> {
    try {
      const inventory = await this.getSteamInventory(steamId)
      
      if (!inventory) {
        return false
      }

      // Here you would save the inventory to your database
      console.log(`Synced ${inventory.totalItems} items for user ${userId}`)
      console.log(`Total inventory value: $${inventory.totalValue.toFixed(2)}`)
      
      return true
    } catch (error) {
      console.error('Error syncing user inventory:', error)
      return false
    }
  }

  /**
   * Get user's tradable items for gambling
   */
  async getUserTradableItems(steamId: string): Promise<SteamItem[]> {
    try {
      const inventory = await this.getSteamInventory(steamId)
      
      if (!inventory) {
        return []
      }

      // Filter for tradable and marketable items only
      return inventory.items.filter(item => item.tradable && item.marketable)
    } catch (error) {
      console.error('Error getting tradable items:', error)
      return []
    }
  }

  /**
   * Calculate total value of selected items
   */
  calculateSelectedItemsValue(items: SteamItem[]): number {
    return items
      .filter(item => item.selected)
      .reduce((total, item) => total + item.price, 0)
  }

  /**
   * Validate if user owns specific items
   */
  async validateUserOwnsItems(steamId: string, itemIds: string[]): Promise<boolean> {
    try {
      const inventory = await this.getSteamInventory(steamId)
      
      if (!inventory) {
        return false
      }

      const userItemIds = inventory.items.map(item => item.id)
      return itemIds.every(itemId => userItemIds.includes(itemId))
    } catch (error) {
      console.error('Error validating item ownership:', error)
      return false
    }
  }

  /**
   * Check Steam server health
   */
  async checkSteamServerHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.steamServerUrl}/health`, { timeout: 5000 })
      return response.data.status === 'OK'
    } catch (error) {
      console.error('Steam server health check failed:', error)
      return false
    }
  }

  /**
   * Get Steam server status and info
   */
  async getSteamServerStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.steamServerUrl}/api/test`)
      return {
        online: true,
        ...response.data
      }
    } catch (error) {
      return {
        online: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export default new SteamIntegrationService() 