import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = getPageMetadata('register')

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
