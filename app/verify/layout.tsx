import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = getPageMetadata('verify')

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
