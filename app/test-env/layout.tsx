import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Test Environment',
  description: 'Test environment for development and debugging purposes.',
  keywords: ['test', 'development', 'debug'],
  url: '/test-env',
})

export default function TestEnvLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
