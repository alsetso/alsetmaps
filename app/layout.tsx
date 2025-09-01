import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/features/authentication/components/AuthProvider'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alset - AI Business Transformation Platform',
  description: 'Transform your business with AI-powered automation, intelligent workflows, and autonomous agents.',
}

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
