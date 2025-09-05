import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = getPageMetadata('sell')

export default function SellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
