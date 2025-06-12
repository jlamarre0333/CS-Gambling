import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import { AppDataSource } from './database'
import { User, UserRole, UserStatus } from '../entities/User'

export const setupPassport = () => {
  // Steam Strategy
  passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:3001/api/auth/steam/return',
    realm: process.env.STEAM_REALM || 'http://localhost:3001/',
    apiKey: process.env.STEAM_API_KEY || ''
  }, async (identifier: string, profile: any, done: Function) => {
    try {
      const steamId = identifier.replace('https://steamcommunity.com/openid/id/', '')
      const userRepository = AppDataSource.getRepository(User)
      
      // Check if user already exists
      let user = await userRepository.findOne({ where: { steamId } })
      
      if (user) {
        // Update user info from Steam
        user.username = profile.displayName || user.username
        user.avatar = profile.photos?.[2]?.value || user.avatar
        user.lastLoginAt = new Date()
        user.loginCount += 1
        
        await userRepository.save(user)
      } else {
        // Create new user
        user = userRepository.create({
          steamId,
          username: profile.displayName || `User${steamId.slice(-8)}`,
          avatar: profile.photos?.[2]?.value || 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          balance: 100, // Welcome bonus
          lastLoginAt: new Date(),
          loginCount: 1,
          preferences: {
            notifications: true,
            soundEffects: true,
            autoplay: false
          },
          statistics: {
            wins: 0,
            losses: 0,
            draws: 0
          }
        })
        
        await userRepository.save(user)
        
        console.log(`✅ New user registered: ${user.username} (${steamId})`)
      }
      
      return done(null, user)
    } catch (error) {
      console.error('❌ Steam authentication error:', error)
      return done(error)
    }
  }))

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id)
  })

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { id },
        relations: ['achievements']
      })
      
      if (!user) {
        return done(null, false)
      }
      
      done(null, user)
    } catch (error) {
      done(error)
    }
  })
}

export default setupPassport 