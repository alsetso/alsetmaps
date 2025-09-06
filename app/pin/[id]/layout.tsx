import type { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Pin Details - Alset Maps',
  description: 'View and manage detailed information about your property pin including notes, sharing settings, and analytics.',
  keywords: ['pin details', 'property management', 'pin information', 'real estate', 'Alset Maps'],
  url: '/pin/[id]',
})

export default function PinIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

