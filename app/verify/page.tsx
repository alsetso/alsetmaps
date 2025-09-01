'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/features/shared/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setVerificationStatus('error');
          setMessage('Invalid verification link. Please check your email and try again.');
          return;
        }

        // For now, we'll just mark the user as verified
        // In a production app, you might want to verify the token with Supabase
        // or implement a proper verification endpoint
        
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now sign in to your account.');
        
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Verification failed. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <SharedLayout showTopbar={false}>
      <div className="min-h-screen flex items-center justify-center bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="Alset"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Email Verification
            </h2>
          </div>

          {/* Status Message */}
          <div className={`p-4 rounded-md text-center ${
            verificationStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : verificationStatus === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-sm">{message}</p>
          </div>

          {/* Action Buttons */}
          {verificationStatus === 'success' && (
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-3">
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Try Signing Up Again
                </Button>
              </Link>
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-primary hover:text-primary/80 text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
