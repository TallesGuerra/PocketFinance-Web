import type { Metadata, Viewport } from 'next'
import { BottomNav } from '@/components/BottomNav'
import { Sidebar } from '@/components/Sidebar'
import { ServiceWorkerRegister } from './sw-register'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'PocketFinance Web',
  description: 'Personal finance tracker - web version of PocketFinance Android',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PocketFinance',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
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
    <html lang="pt" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')})()`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ServiceWorkerRegister />
            {/* Desktop: sidebar + content | Mobile: full width */}
            <div className="flex min-h-screen">
              <Sidebar />
              {/* Main content */}
              <div className="flex-1 lg:overflow-y-auto">
                {/* Desktop top bar */}
                <div className="hidden lg:block h-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
                <main className="max-w-md lg:max-w-none mx-auto min-h-screen pb-24 lg:pb-8">
                  {children}
                </main>
              </div>
            </div>
            {/* Mobile bottom nav */}
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
