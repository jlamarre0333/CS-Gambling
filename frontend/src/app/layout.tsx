import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LiveChat from '@/components/ui/LiveChat'
import { ToastProvider } from '@/components/ui/ToastNotifications'
import ActivitySimulator from '@/components/ui/ActivitySimulator'
import { UserProvider } from '@/contexts/UserContext'

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
        <UserProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col bg-gradient-gaming">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <LiveChat />
              <ActivitySimulator enabled={true} frequency={4} />
            </div>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
} 