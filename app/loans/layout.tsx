import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = getPageMetadata('loans')

export default function LoansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
