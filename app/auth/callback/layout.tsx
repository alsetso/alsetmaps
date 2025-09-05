import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = getPageMetadata('authCallback')

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
