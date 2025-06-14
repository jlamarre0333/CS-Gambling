import express from 'express';
import SteamTradeBot from '../services/steamTradeBot';
import TradeConfirmationService from '../services/tradeConfirmation';

const router = express.Router();

// Initialize trade bot only if Steam API key is available
let tradeBot: SteamTradeBot | null = null;
let confirmationService: TradeConfirmationService | null = null;

const initializeServices = () => {
  if (!tradeBot && process.env.STEAM_API_KEY) {
    try {
      tradeBot = new SteamTradeBot();
      confirmationService = new TradeConfirmationService();
    } catch (error) {
      console.warn('Trade bot services not available:', error);
    }
  }
};

// Middleware to validate Steam ID
const validateSteamId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const steamId = req.body.steamId || req.params.steamId;
  if (!steamId || !/^\d{17}$/.test(steamId)) {
    return res.status(400).json({ error: 'Invalid Steam ID format' });
  }
  next();
};

// Middleware to validate trade URL
const validateTradeUrl = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const tradeUrl = req.body.tradeUrl;
  if (!tradeUrl) {
    return res.status(400).json({ error: 'Trade URL is required' });
  }
  
  initializeServices();
  if (!tradeBot) {
    return res.status(503).json({ error: 'Trade bot service not available' });
  }
  
  const validation = tradeBot.validateTradeUrl(tradeUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Invalid trade URL format' });
  }
  
  req.body.tradeToken = validation.token;
  req.body.partner = validation.partner;
  next();
};

/**
 * GET /api/trade-bot/health
 * Check trade bot health status
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      botOnline: true,
      apiKeyValid: true,
      inventoryAccessible: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check trade bot health',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/inventory
 * Get bot's CS2 inventory
 */
router.get('/inventory', async (req, res) => {
  try {
    // Mock bot inventory - replace with actual Steam API call
    const mockInventory = [
      {
        assetid: '123456789',
        name: 'AK-47 | Redline',
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        type: 'Rifle',
        rarity: 'Classified',
        tradable: true,
        marketable: true,
        estimated_value: 25.50
      },
      {
        assetid: '987654321',
        name: 'AWP | Dragon Lore',
        market_hash_name: 'AWP | Dragon Lore (Factory New)',
        type: 'Sniper Rifle',
        rarity: 'Covert',
        tradable: true,
        marketable: true,
        estimated_value: 4500.00
      }
    ];

    res.json({
      success: true,
      items: mockInventory,
      count: mockInventory.length,
      totalValue: mockInventory.reduce((sum, item) => sum + item.estimated_value, 0)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch bot inventory',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/user-inventory/:steamId
 * Get user's CS2 inventory
 */
router.get('/user-inventory/:steamId', validateSteamId, async (req, res) => {
  try {
    const { steamId } = req.params;
    
    // Initialize services if not already done
    initializeServices();
    
    if (!tradeBot) {
      // Return mock inventory when trade bot is not available
      const mockInventory = [
        {
          assetid: '123456789',
          name: 'AK-47 | Redline',
          market_hash_name: 'AK-47 | Redline (Field-Tested)',
          type: 'Rifle',
          rarity: 'Classified',
          tradable: true,
          marketable: true,
          estimated_value: 25.50
        },
        {
          assetid: '987654321',
          name: 'AWP | Dragon Lore',
          market_hash_name: 'AWP | Dragon Lore (Factory New)',
          type: 'Sniper Rifle',
          rarity: 'Covert',
          tradable: true,
          marketable: true,
          estimated_value: 4500.00
        }
      ];
      
      return res.json({
        success: true,
        steamId,
        items: mockInventory,
        count: mockInventory.length,
        mock: true,
        message: 'Using mock data - Steam API not available'
      });
    }
    
    const inventory = await tradeBot.getUserInventory(steamId);
    
    res.json({
      success: true,
      steamId,
      items: inventory,
      count: inventory.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch user inventory',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/deposit
 * Create a deposit trade offer (user sends skins to bot)
 */
router.post('/deposit', async (req, res) => {
  try {
    const { steamId, tradeUrl, items, message } = req.body;
    
    if (!steamId || !/^\d{17}$/.test(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Mock response for now - replace with actual trade bot logic
    const mockTradeOfferId = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockConfirmationId = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      tradeOfferId: mockTradeOfferId,
      confirmationId: mockConfirmationId,
      confirmationCode: 'abc123def456',
      totalValue: items.length * 10.50, // Mock value
      expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
      message: 'Trade offer created successfully. Please confirm the trade within 10 minutes.'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to create deposit trade offer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/withdrawal
 * Create a withdrawal trade offer (bot sends skins to user)
 */
router.post('/withdrawal', async (req, res) => {
  try {
    const { steamId, tradeUrl, items, message } = req.body;
    
    if (!steamId || !/^\d{17}$/.test(steamId)) {
      return res.status(400).json({ error: 'Invalid Steam ID format' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Mock response for now - replace with actual trade bot logic
    const mockTradeOfferId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockConfirmationId = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      tradeOfferId: mockTradeOfferId,
      confirmationId: mockConfirmationId,
      confirmationCode: 'xyz789uvw012',
      totalValue: items.length * 15.75, // Mock value
      expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
      message: 'Withdrawal trade offer created successfully. Please confirm within 10 minutes.'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to create withdrawal trade offer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/confirm/:confirmationId
 * Confirm a trade with confirmation code
 */
router.post('/confirm/:confirmationId', async (req, res) => {
  try {
    const { confirmationId } = req.params;
    const { confirmationCode } = req.body;
    
    if (!confirmationCode) {
      return res.status(400).json({ error: 'Confirmation code is required' });
    }

    // Mock confirmation logic - replace with actual verification
    const isValidCode = confirmationCode.length >= 8; // Simple validation
    
    if (!isValidCode) {
      return res.status(400).json({ error: 'Invalid confirmation code' });
    }

    res.json({
      success: true,
      confirmationId,
      status: 'confirmed',
      confirmedAt: Date.now(),
      message: 'Trade confirmed successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to confirm trade',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/cancel/:confirmationId
 * Cancel a trade confirmation
 */
router.post('/cancel/:confirmationId', async (req, res) => {
  try {
    const { confirmationId } = req.params;
    const { reason } = req.body;
    
    const result = confirmationService.cancelConfirmation(confirmationId, reason);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Cancel the trade offer if it exists
    if (result.confirmation?.tradeOfferId) {
      await tradeBot.cancelTradeOffer(result.confirmation.tradeOfferId);
    }

    res.json({
      success: true,
      confirmation: result.confirmation,
      message: 'Trade confirmation cancelled successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to cancel trade confirmation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/confirmations/:steamId
 * Get all confirmations for a user
 */
router.get('/confirmations/:steamId', validateSteamId, async (req, res) => {
  try {
    const { steamId } = req.params;
    const confirmations = confirmationService.getUserConfirmations(steamId);
    
    res.json({
      success: true,
      confirmations,
      count: confirmations.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch confirmations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/trade-offers
 * Get all trade offers
 */
router.get('/trade-offers', async (req, res) => {
  try {
    // Mock trade offers - replace with actual Steam API call
    const mockOffers = {
      trade_offers_sent: [
        {
          tradeofferid: 'sent_123',
          accountid_other: 123456789,
          trade_offer_state: 2, // Active
          time_created: Date.now() - 3600000, // 1 hour ago
          message: 'CS2 Skins Casino - Withdrawal'
        }
      ],
      trade_offers_received: [
        {
          tradeofferid: 'received_456',
          accountid_other: 987654321,
          trade_offer_state: 2, // Active
          time_created: Date.now() - 1800000, // 30 minutes ago
          message: 'CS2 Skins Casino - Deposit'
        }
      ]
    };

    res.json({
      success: true,
      offers: mockOffers
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch trade offers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/trade-offer/:tradeOfferId
 * Get specific trade offer details
 */
router.get('/trade-offer/:tradeOfferId', async (req, res) => {
  try {
    const { tradeOfferId } = req.params;
    const offer = await tradeBot.getTradeOffer(tradeOfferId);
    
    if (!offer) {
      return res.status(404).json({ error: 'Trade offer not found' });
    }
    
    res.json({
      success: true,
      offer
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch trade offer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/accept/:tradeOfferId
 * Accept a trade offer
 */
router.post('/accept/:tradeOfferId', async (req, res) => {
  try {
    const { tradeOfferId } = req.params;
    const success = await tradeBot.acceptTradeOffer(tradeOfferId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to accept trade offer' });
    }
    
    res.json({
      success: true,
      message: 'Trade offer accepted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to accept trade offer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/decline/:tradeOfferId
 * Decline a trade offer
 */
router.post('/decline/:tradeOfferId', async (req, res) => {
  try {
    const { tradeOfferId } = req.params;
    const success = await tradeBot.declineTradeOffer(tradeOfferId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to decline trade offer' });
    }
    
    res.json({
      success: true,
      message: 'Trade offer declined successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to decline trade offer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/stats
 * Get trade bot statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const confirmationStats = confirmationService.getStats();
    const tradeOffers = await tradeBot.getTradeOffers(true, true, true, false);
    
    res.json({
      success: true,
      stats: {
        confirmations: confirmationStats,
        tradeOffers: {
          sent: tradeOffers.trade_offers_sent?.length || 0,
          received: tradeOffers.trade_offers_received?.length || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/trade-bot/validate-trade-url
 * Validate a Steam trade URL
 */
router.post('/validate-trade-url', (req, res) => {
  try {
    const { tradeUrl } = req.body;
    
    if (!tradeUrl) {
      return res.status(400).json({ error: 'Trade URL is required' });
    }
    
    // Simple trade URL validation
    const tradeUrlRegex = /https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)/;
    const match = tradeUrl.match(tradeUrlRegex);
    
    const validation = {
      valid: !!match,
      partner: match ? match[1] : null,
      token: match ? match[2] : null
    };
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to validate trade URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/trade-bot/item-price/:marketHashName
 * Get item market price
 */
router.get('/item-price/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params;
    const price = await tradeBot.getItemMarketPrice(decodeURIComponent(marketHashName));
    
    res.json({
      success: true,
      marketHashName,
      price
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch item price',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 