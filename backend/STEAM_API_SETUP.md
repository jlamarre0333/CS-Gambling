# Steam API Setup Guide

## 🔧 Getting Your Steam API Key

To use the Steam API features in your CS:GO gambling site, you'll need to get a Steam Web API key:

1. **Visit Steam API Key Page**: Go to https://steamcommunity.com/dev/apikey
2. **Log in**: Use your Steam account credentials
3. **Register for API Key**: 
   - Domain Name: Use your domain (or `localhost` for development)
   - Click "Register"
4. **Copy Your Key**: Save the generated API key

## 🌟 Environment Setup

Create a `.env` file in your backend directory with:

```bash
# Steam API Configuration
STEAM_API_KEY=your_steam_api_key_here
STEAM_APP_ID=730  # CS:GO App ID

# Server Configuration
PORT=3001
NODE_ENV=development

# Database (if configured)
DATABASE_URL=your_database_url_here

# JWT Secret (for future authentication)
JWT_SECRET=your_jwt_secret_here
```

## 🚀 Testing Your Integration

### 1. Test with Mock Data (Default)
If no Steam API key is provided, the service will return mock CS:GO items.

### 2. Test with Real Steam Inventory
Once you have your API key set up:

```bash
# Get inventory for a specific Steam ID
GET /api/inventory?steamId=76561198000000000

# Refresh inventory
POST /api/inventory/refresh
Body: { "steamId": "76561198000000000" }

# Get Steam profile
GET /api/inventory/profile/76561198000000000
```

## 🎮 Steam ID Information

### Finding Steam IDs for Testing:
- **Your Steam ID**: Use https://steamid.io/ to convert your Steam profile URL
- **Public Profiles**: Look for profiles with public inventories
- **Demo Steam ID**: `76561198000000000` (used as fallback)

### Steam ID Formats:
- **Steam ID 64** (what we use): `76561198000000000`
- **Steam ID 32**: `STEAM_0:0:00000000`
- **Steam Profile URL**: `https://steamcommunity.com/id/username`

## 🔒 Security Notes

1. **Never commit your API key** to version control
2. **Use environment variables** for production
3. **Implement rate limiting** for production use
4. **Consider API quotas** - Steam has rate limits

## 🎯 Next Steps

After setting up the Steam API:

1. **Test the endpoints** with a real Steam ID
2. **Implement Steam authentication** for user login
3. **Add inventory caching** to reduce API calls
4. **Set up price tracking** for accurate item values
5. **Implement trade/deposit system**

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid API Key"**: 
   - Check your `.env` file
   - Verify the key on Steam's developer page

2. **"Private Inventory"**: 
   - User's inventory must be public
   - Test with different Steam IDs

3. **Rate Limited**: 
   - Steam has API limits
   - Implement caching and delays

4. **No Items Returned**: 
   - User might not have CS:GO items
   - Check if inventory is public
   - Verify Steam ID format

---

**Ready to test?** Start your server and try the endpoints! 