import type { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Buy Properties - Alset Maps',
  description: 'Discover properties for sale with AI-powered insights, market analysis, and investment opportunities. Find your next home or investment property.',
  keywords: ['real estate', 'properties for sale', 'buy property', 'home buying', 'investment properties', 'Alset Maps'],
  url: '/buy',
})

export default function BuyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

