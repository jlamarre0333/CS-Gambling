import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-gaming-darker border-t border-gaming-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-neon p-2 rounded-lg">
                <div className="w-8 h-8 bg-gaming-dark rounded flex items-center justify-center">
                  <span className="text-accent-primary font-bold text-lg">CS</span>
                </div>
              </div>
              <span className="text-xl font-bold neon-text">SkinsCasino</span>
            </div>
            <p className="text-gray-400 text-sm">
              The premier destination for CS:GO/CS2 skin gambling with provably fair games.
            </p>
          </div>

          {/* Games */}
          <div>
            <h3 className="text-white font-semibold mb-4">Games</h3>
            <ul className="space-y-2">
              <li><Link href="/roulette" className="text-gray-400 hover:text-accent-primary text-sm">Roulette</Link></li>
              <li><Link href="/coinflip" className="text-gray-400 hover:text-accent-primary text-sm">Coin Flip</Link></li>
              <li><Link href="/crash" className="text-gray-400 hover:text-accent-primary text-sm">Crash</Link></li>
              <li><Link href="/jackpot" className="text-gray-400 hover:text-accent-primary text-sm">Jackpot</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-accent-primary text-sm">Help Center</Link></li>
              <li><Link href="/fairness" className="text-gray-400 hover:text-accent-primary text-sm">Provably Fair</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-accent-primary text-sm">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-accent-primary text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-accent-primary text-sm">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent-primary text-sm">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent-primary text-sm">Reddit</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent-primary text-sm">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gaming-border mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 SkinsCasino. All rights reserved. | 18+ Only | Gamble Responsibly
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 