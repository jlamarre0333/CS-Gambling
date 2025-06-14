import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LiveChat from '@/components/ui/LiveChat'
import { ToastProvider } from '@/components/ui/ToastNotifications'
import ActivitySimulator from '@/components/ui/ActivitySimulator'
import { UserProvider } from '@/contexts/UserContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PaymentProvider from '@/contexts/PaymentContext'
import { GuestProvider } from '@/contexts/GuestContext'

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
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f0f23" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="bg-gaming-dark dark:bg-gaming-dark light:bg-gray-50 text-white dark:text-white light:text-gray-900 font-gaming antialiased">
        <ThemeProvider>
          <GuestProvider>
            <AuthProvider>
              <PaymentProvider>
                <UserProvider>
                  <ToastProvider>
                <div className="min-h-screen flex flex-col bg-gradient-gaming dark:bg-gradient-gaming light:bg-gradient-to-br light:from-gray-50 light:to-gray-100">
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <LiveChat />
                  <ActivitySimulator enabled={true} frequency={0.3} />
                </div>
                </ToastProvider>
              </UserProvider>
              </PaymentProvider>
            </AuthProvider>
          </GuestProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 