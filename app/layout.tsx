import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './components/AuthProvider'
import { Toaster } from 'sonner'
import { generateMetadata } from '@/lib/metadata'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateMetadata({
  title: 'Alset - Off-Market Deals, On-Demand',
  description: 'A clean, professional marketplace built for wholesalers, sellers, and buyers to list, find, and close off-market properties without getting buried in Facebook threads or endless email chains.',
  keywords: ['off-market properties', 'wholesaling', 'real estate marketplace', 'property investment', 'creative financing', 'assignment contracts', 'Alset'],
  url: '/',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/alset_emblem.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
