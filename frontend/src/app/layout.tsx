import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'CS Skins Casino - Premier CS:GO/CS2 Skin Gambling',
  description: 'Experience the thrill of CS:GO/CS2 skin gambling with provably fair games, instant deposits, and real-time action.',
  keywords: 'csgo, cs2, skins, gambling, casino, roulette, coinflip, crash, jackpot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gaming-dark text-white font-gaming antialiased">
        <div className="min-h-screen flex flex-col bg-gradient-gaming">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
} 