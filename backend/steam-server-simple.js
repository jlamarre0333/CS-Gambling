const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3002;

// Your Steam API credentials
const STEAM_API_KEY = process.env.STEAM_API_KEY || '9D0FC6D133693B6F6FD1A71935254257';

// Middleware
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Steam server is running',
    timestamp: new Date().toISOString()
  });
});

// Get Steam profile
app.get('/api/steam/profile/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    
    console.log(`Fetching Steam profile for: ${steamId}`);
    
    const response = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    
    const player = response.data.response.players[0];
    
    if (!player) {
      return res.status(404).json({ error: 'Steam profile not found' });
    }
    
    res.json({
      success: true,
      profile: {
        steamid: player.steamid,
        personaname: player.personaname,
        avatarfull: player.avatarfull,
        profileurl: player.profileurl,
        personastate: player.personastate,
        lastlogoff: player.lastlogoff
      }
    });
  } catch (error) {
    console.error('Error fetching Steam profile:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Steam profile' 
    });
  }
});

// Get Steam inventory
app.get('/api/steam/inventory/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    
    console.log(`🎮 Fetching Steam inventory for: ${steamId}`);
    
    // Get CS2 inventory (appid 730) - FIXED: Use HTTPS with proper headers
    const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;
    
    console.log(`📡 Requesting: ${inventoryUrl}`);
    
    const response = await axios.get(inventoryUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`✅ Response status: ${response.status}`);
    console.log(`📊 Response data keys:`, Object.keys(response.data || {}));
    
    // Check if the response indicates success
    if (!response.data || response.data.success === false) {
      console.log('❌ Steam API returned success: false');
      return res.json({
        success: true,
        items: [],
        totalValue: 0,
        totalItems: 0,
        message: 'No CS2 items found or inventory is private'
      });
    }
    
    if (!response.data.assets || response.data.assets.length === 0) {
      console.log('📦 No assets found in inventory');
      return res.json({
        success: true,
        items: [],
        totalValue: 0,
        totalItems: 0,
        message: 'No CS2 items found in inventory'
      });
    }
    
    console.log(`🎯 Found ${response.data.assets.length} raw assets`);
    
    const items = response.data.assets.map((asset, index) => {
      const description = response.data.descriptions?.find(
        desc => desc.classid === asset.classid && desc.instanceid === asset.instanceid
      );
      
      const rarityTag = description?.tags?.find(tag => tag.category === 'Rarity');
      const exteriorTag = description?.tags?.find(tag => tag.category === 'Exterior');
      const typeTag = description?.tags?.find(tag => tag.category === 'Type');
      const weaponTag = description?.tags?.find(tag => tag.category === 'Weapon');
      
      return {
        id: asset.assetid,
        name: description?.market_hash_name || description?.name || 'Unknown Item',
        icon_url: description?.icon_url ? `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}` : '',
        rarity: rarityTag?.localized_tag_name || rarityTag?.name || 'Unknown',
        exterior: exteriorTag?.localized_tag_name || exteriorTag?.name || '',
        type: typeTag?.localized_tag_name || typeTag?.name || '',
        weapon: weaponTag?.localized_tag_name || weaponTag?.name || '',
        tradable: description?.tradable === 1,
        marketable: description?.marketable === 1,
        price: Math.floor(Math.random() * 500) + 10, // Mock price for now
        selected: false,
        classid: asset.classid,
        instanceid: asset.instanceid
      };
    });
    
    const totalValue = items.reduce((sum, item) => sum + item.price, 0);
    
    console.log(`🎉 Successfully processed ${items.length} items, total value: $${totalValue}`);
    
    res.json({
      success: true,
      items: items.slice(0, 50), // Limit to 50 items for performance
      totalValue,
      totalItems: items.length,
      steamId
    });
    
  } catch (error) {
    console.error('❌ Error fetching Steam inventory:', error.message);
    if (error.response) {
      console.error('📊 Error status:', error.response.status);
      console.error('📊 Error statusText:', error.response.statusText);
      console.error('📊 Error data:', error.response.data);
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Steam inventory. Make sure your inventory is public.' 
    });
  }
});

// Get item prices from Steam Market
app.get('/api/steam/price/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    
    const priceUrl = `http://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;
    
    const response = await axios.get(priceUrl);
    
    if (response.data.success) {
      res.json({
        success: true,
        price: response.data.lowest_price || response.data.median_price || '$0.00',
        volume: response.data.volume || '0'
      });
    } else {
      res.json({
        success: false,
        error: 'Price not available'
      });
    }
  } catch (error) {
    console.error('Error fetching item price:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch item price' 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Steam API server is working!',
    steamApiKey: STEAM_API_KEY ? 'Configured' : 'Missing',
    endpoints: [
      'GET /health',
      'GET /api/steam/profile/:steamId',
      'GET /api/steam/inventory/:steamId',
      'GET /api/steam/price/:itemName',
      'GET /api/test'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 STEAM API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/test`);
  console.log(`👤 Profile Example: http://localhost:${PORT}/api/steam/profile/76561198000000000`);
  console.log(`🎮 Inventory Example: http://localhost:${PORT}/api/steam/inventory/76561198000000000`);
  console.log(`✅ Steam API Key: ${STEAM_API_KEY ? STEAM_API_KEY.substring(0, 8) + '...' : 'NOT SET'}`);
  console.log(`\n🔥 Ready to serve Steam data!`);
}); 