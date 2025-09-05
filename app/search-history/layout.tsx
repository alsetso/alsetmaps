import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = getPageMetadata('searchHistory')

export default function SearchHistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
