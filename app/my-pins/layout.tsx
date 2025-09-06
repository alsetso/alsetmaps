import type { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'My Pins - Alset Maps',
  description: 'Manage and organize your property pins with advanced filtering, sorting, and bulk actions.',
  keywords: ['my pins', 'property management', 'pin organization', 'real estate', 'Alset Maps'],
  url: '/my-pins',
})

export default function MyPinsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

