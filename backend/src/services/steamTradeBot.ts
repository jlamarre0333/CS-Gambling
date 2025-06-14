import axios from 'axios';
import crypto from 'crypto';

interface SteamItem {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  pos: number;
  market_hash_name: string;
  name: string;
  type: string;
  rarity?: string;
  quality?: string;
  tradable: boolean;
  marketable: boolean;
  commodity: boolean;
  market_tradable_restriction?: number;
  market_marketable_restriction?: number;
  descriptions?: Array<{
    type: string;
    value: string;
    color?: string;
  }>;
  tags?: Array<{
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }>;
  icon_url?: string;
  icon_url_large?: string;
}

interface TradeOffer {
  tradeofferid: string;
  accountid_other: number;
  message: string;
  expiration_time: number;
  trade_offer_state: number;
  items_to_give?: SteamItem[];
  items_to_receive?: SteamItem[];
  is_our_offer: boolean;
  time_created: number;
  time_updated: number;
  from_real_time_trade: boolean;
  escrow_end_date: number;
  confirmation_method: number;
}

interface TradeOfferResponse {
  response: {
    trade_offers_sent?: TradeOffer[];
    trade_offers_received?: TradeOffer[];
    next_cursor?: number;
    descriptions?: SteamItem[];
  };
}

interface CreateTradeOfferRequest {
  newversion: boolean;
  version: number;
  me: {
    assets: Array<{
      appid: number;
      contextid: string;
      amount: number;
      assetid: string;
    }>;
    currency: any[];
    ready: boolean;
  };
  them: {
    assets: Array<{
      appid: number;
      contextid: string;
      amount: number;
      assetid: string;
    }>;
    currency: any[];
    ready: boolean;
  };
}

export class SteamTradeBot {
  private apiKey: string;
  private botSteamId: string;
  private botTradeToken: string;
  private baseUrl = 'https://api.steampowered.com';
  
  constructor() {
    this.apiKey = process.env.STEAM_API_KEY || '';
    this.botSteamId = process.env.STEAM_BOT_ID || '76561198000000000'; // Replace with actual bot Steam ID
    this.botTradeToken = process.env.STEAM_BOT_TRADE_TOKEN || ''; // Bot's trade token
    
    if (!this.apiKey) {
      throw new Error('Steam API key is required for trade bot functionality');
    }
  }

  /**
   * Get bot's CS2 inventory
   */
  async getBotInventory(): Promise<SteamItem[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/IEconService/GetInventoryItemsWithDescriptions/v1/`,
        {
          params: {
            key: this.apiKey,
            steamid: this.botSteamId,
            appid: 730, // CS2
            contextid: 2,
            count: 5000
          }
        }
      );

      return response.data.response?.assets || [];
    } catch (error) {
      console.error('Error fetching bot inventory:', error);
      throw new Error('Failed to fetch bot inventory');
    }
  }

  /**
   * Get user's CS2 inventory
   */
  async getUserInventory(steamId: string): Promise<SteamItem[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/IEconService/GetInventoryItemsWithDescriptions/v1/`,
        {
          params: {
            key: this.apiKey,
            steamid: steamId,
            appid: 730, // CS2
            contextid: 2,
            count: 5000
          }
        }
      );

      return response.data.response?.assets || [];
    } catch (error) {
      console.error('Error fetching user inventory:', error);
      throw new Error('Failed to fetch user inventory');
    }
  }

  /**
   * Create a trade offer for skin deposit (user sends skins to bot)
   */
  async createDepositTradeOffer(
    userSteamId: string,
    userTradeToken: string,
    itemsToReceive: Array<{
      appid: number;
      contextid: string;
      assetid: string;
      amount: number;
    }>,
    message: string = 'CS2 Skins Casino - Skin Deposit'
  ): Promise<{ tradeofferid: string; success: boolean }> {
    try {
      const tradeOfferData: CreateTradeOfferRequest = {
        newversion: true,
        version: 4,
        me: {
          assets: [], // Bot gives nothing for deposits
          currency: [],
          ready: false
        },
        them: {
          assets: itemsToReceive, // User gives skins
          currency: [],
          ready: false
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/IEconService/CreateTradeOffer/v1/`,
        {
          key: this.apiKey,
          trade_offer_create_params: JSON.stringify({
            partner: this.steamIdTo32Bit(userSteamId),
            trade_offer_access_token: userTradeToken,
            message: message
          }),
          json_tradeoffer: JSON.stringify(tradeOfferData)
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.response?.tradeofferid) {
        return {
          tradeofferid: response.data.response.tradeofferid,
          success: true
        };
      }

      throw new Error('Failed to create trade offer');
    } catch (error) {
      console.error('Error creating deposit trade offer:', error);
      throw new Error('Failed to create deposit trade offer');
    }
  }

  /**
   * Create a trade offer for skin withdrawal (bot sends skins to user)
   */
  async createWithdrawalTradeOffer(
    userSteamId: string,
    userTradeToken: string,
    itemsToGive: Array<{
      appid: number;
      contextid: string;
      assetid: string;
      amount: number;
    }>,
    message: string = 'CS2 Skins Casino - Skin Withdrawal'
  ): Promise<{ tradeofferid: string; success: boolean }> {
    try {
      const tradeOfferData: CreateTradeOfferRequest = {
        newversion: true,
        version: 4,
        me: {
          assets: itemsToGive, // Bot gives skins
          currency: [],
          ready: false
        },
        them: {
          assets: [], // User gives nothing for withdrawals
          currency: [],
          ready: false
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/IEconService/CreateTradeOffer/v1/`,
        {
          key: this.apiKey,
          trade_offer_create_params: JSON.stringify({
            partner: this.steamIdTo32Bit(userSteamId),
            trade_offer_access_token: userTradeToken,
            message: message
          }),
          json_tradeoffer: JSON.stringify(tradeOfferData)
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.response?.tradeofferid) {
        return {
          tradeofferid: response.data.response.tradeofferid,
          success: true
        };
      }

      throw new Error('Failed to create withdrawal trade offer');
    } catch (error) {
      console.error('Error creating withdrawal trade offer:', error);
      throw new Error('Failed to create withdrawal trade offer');
    }
  }

  /**
   * Accept a trade offer
   */
  async acceptTradeOffer(tradeOfferId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/IEconService/AcceptTradeOffer/v1/`,
        {
          key: this.apiKey,
          tradeofferid: tradeOfferId
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.response !== undefined;
    } catch (error) {
      console.error('Error accepting trade offer:', error);
      return false;
    }
  }

  /**
   * Decline a trade offer
   */
  async declineTradeOffer(tradeOfferId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/IEconService/DeclineTradeOffer/v1/`,
        {
          key: this.apiKey,
          tradeofferid: tradeOfferId
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.response !== undefined;
    } catch (error) {
      console.error('Error declining trade offer:', error);
      return false;
    }
  }

  /**
   * Get trade offer details
   */
  async getTradeOffer(tradeOfferId: string): Promise<TradeOffer | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/IEconService/GetTradeOffer/v1/`,
        {
          params: {
            key: this.apiKey,
            tradeofferid: tradeOfferId,
            language: 'english'
          }
        }
      );

      return response.data.response?.offer || null;
    } catch (error) {
      console.error('Error getting trade offer:', error);
      return null;
    }
  }

  /**
   * Get all trade offers (sent and received)
   */
  async getTradeOffers(
    getSentOffers: boolean = true,
    getReceivedOffers: boolean = true,
    getDescriptions: boolean = true,
    activeOnly: boolean = true
  ): Promise<TradeOfferResponse['response']> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/IEconService/GetTradeOffers/v1/`,
        {
          params: {
            key: this.apiKey,
            get_sent_offers: getSentOffers ? 1 : 0,
            get_received_offers: getReceivedOffers ? 1 : 0,
            get_descriptions: getDescriptions ? 1 : 0,
            language: 'english',
            active_only: activeOnly ? 1 : 0,
            historical_only: 0,
            time_historical_cutoff: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // 30 days ago
          }
        }
      );

      return response.data.response || {};
    } catch (error) {
      console.error('Error getting trade offers:', error);
      return {};
    }
  }

  /**
   * Get trade offer history
   */
  async getTradeHistory(
    maxTrades: number = 100,
    startAfterTime: number = 0,
    startAfterTradeId: string = ''
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/IEconService/GetTradeHistory/v1/`,
        {
          params: {
            key: this.apiKey,
            max_trades: maxTrades,
            start_after_time: startAfterTime,
            start_after_tradeid: startAfterTradeId,
            get_descriptions: 1,
            language: 'english',
            include_failed: 1,
            include_total: 1
          }
        }
      );

      return response.data.response || {};
    } catch (error) {
      console.error('Error getting trade history:', error);
      return {};
    }
  }

  /**
   * Cancel a trade offer
   */
  async cancelTradeOffer(tradeOfferId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/IEconService/CancelTradeOffer/v1/`,
        {
          key: this.apiKey,
          tradeofferid: tradeOfferId
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.response !== undefined;
    } catch (error) {
      console.error('Error canceling trade offer:', error);
      return false;
    }
  }

  /**
   * Validate trade URL and extract trade token
   */
  validateTradeUrl(tradeUrl: string): { valid: boolean; token?: string; partner?: string } {
    const tradeUrlRegex = /https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)/;
    const match = tradeUrl.match(tradeUrlRegex);
    
    if (match) {
      return {
        valid: true,
        partner: match[1],
        token: match[2]
      };
    }
    
    return { valid: false };
  }

  /**
   * Convert 64-bit Steam ID to 32-bit account ID
   */
  private steamIdTo32Bit(steamId64: string): string {
    const steamId64BigInt = BigInt(steamId64);
    const accountId = steamId64BigInt - BigInt('76561197960265728');
    return accountId.toString();
  }

  /**
   * Convert 32-bit account ID to 64-bit Steam ID
   */
  private accountIdToSteamId64(accountId: string): string {
    const accountIdBigInt = BigInt(accountId);
    const steamId64 = accountIdBigInt + BigInt('76561197960265728');
    return steamId64.toString();
  }

  /**
   * Get item market price from Steam Market
   */
  async getItemMarketPrice(marketHashName: string): Promise<number> {
    try {
      const response = await axios.get(
        'https://steamcommunity.com/market/priceoverview/',
        {
          params: {
            appid: 730,
            currency: 1, // USD
            market_hash_name: marketHashName
          }
        }
      );

      if (response.data.success && response.data.lowest_price) {
        // Parse price string like "$1.23" to number
        const priceString = response.data.lowest_price.replace('$', '').replace(',', '');
        return parseFloat(priceString) || 0;
      }

      return 0;
    } catch (error) {
      console.error('Error getting item market price:', error);
      return 0;
    }
  }

  /**
   * Calculate total value of items
   */
  async calculateItemsValue(items: SteamItem[]): Promise<number> {
    let totalValue = 0;
    
    for (const item of items) {
      if (item.market_hash_name) {
        const price = await this.getItemMarketPrice(item.market_hash_name);
        totalValue += price;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return totalValue;
  }

  /**
   * Generate secure confirmation code for trades
   */
  generateConfirmationCode(tradeOfferId: string, userSteamId: string): string {
    const secret = process.env.TRADE_CONFIRMATION_SECRET || 'default-secret-change-this';
    const data = `${tradeOfferId}-${userSteamId}-${Date.now()}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify confirmation code
   */
  verifyConfirmationCode(code: string, tradeOfferId: string, userSteamId: string, timestamp: number): boolean {
    const secret = process.env.TRADE_CONFIRMATION_SECRET || 'default-secret-change-this';
    const data = `${tradeOfferId}-${userSteamId}-${timestamp}`;
    const expectedCode = crypto.createHmac('sha256', secret).update(data).digest('hex');
    
    // Check if code matches and is not older than 10 minutes
    const isValidTime = Date.now() - timestamp < 10 * 60 * 1000;
    return code === expectedCode && isValidTime;
  }

  /**
   * Health check for trade bot
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    botOnline: boolean;
    apiKeyValid: boolean;
    inventoryAccessible: boolean;
    lastError?: string;
  }> {
    try {
      // Test API key validity
      const testResponse = await axios.get(
        `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/`,
        {
          params: {
            key: this.apiKey,
            steamids: this.botSteamId
          }
        }
      );

      const apiKeyValid = testResponse.data.response?.players?.length > 0;
      
      if (!apiKeyValid) {
        return {
          status: 'unhealthy',
          botOnline: false,
          apiKeyValid: false,
          inventoryAccessible: false,
          lastError: 'Invalid API key or bot Steam ID'
        };
      }

      // Test inventory access
      try {
        await this.getBotInventory();
        return {
          status: 'healthy',
          botOnline: true,
          apiKeyValid: true,
          inventoryAccessible: true
        };
      } catch (inventoryError) {
        return {
          status: 'unhealthy',
          botOnline: true,
          apiKeyValid: true,
          inventoryAccessible: false,
          lastError: 'Cannot access bot inventory'
        };
      }

    } catch (error) {
      return {
        status: 'unhealthy',
        botOnline: false,
        apiKeyValid: false,
        inventoryAccessible: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default SteamTradeBot; 