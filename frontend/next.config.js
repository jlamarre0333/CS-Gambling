/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'steamcommunity.com',
      'steamcdn-a.akamaihd.net',
      'community.cloudflare.steamstatic.com'
    ]
  }
}

module.exports = nextConfig 