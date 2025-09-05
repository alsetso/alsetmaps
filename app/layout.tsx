import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/features/authentication/components/AuthProvider'
import { Toaster } from 'sonner'
import { generateMetadata } from '@/lib/metadata'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateMetadata({
  title: 'Alset Maps - AI-Powered Property Intelligence',
  description: 'Discover properties with AI-powered insights, market analysis, and investment opportunities. Transform your real estate experience with intelligent property data.',
  keywords: ['real estate', 'property search', 'AI', 'market analysis', 'investment', 'property intelligence', 'Alset Maps'],
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
