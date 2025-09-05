import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Reset Password',
  description: 'Reset your password to regain access to your Alset Maps account.',
  keywords: ['reset password', 'password recovery', 'account access'],
  url: '/reset-password',
})

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
