/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'steamcommunity.com',
      'steamcdn-a.akamaihd.net',
      'media.steampowered.com',
      'avatars.steamstatic.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 