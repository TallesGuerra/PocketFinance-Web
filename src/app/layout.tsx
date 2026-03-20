import type { Metadata, Viewport } from 'next'
import { BottomNav } from '@/components/BottomNav'
import { ServiceWorkerRegister } from './sw-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finanças na Mão',
  description: 'Controlo de finanças pessoais',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Finanças na Mão',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        <ServiceWorkerRegister />
        <main className="max-w-md mx-auto min-h-screen pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
