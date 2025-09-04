"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Button } from '@/features/shared/components/ui/button';
import Image from 'next/image';
import { getEnvironmentInfo } from '@/lib/env-utils';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get OAuth parameters from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          return;
        }

        // Handle missing code
        if (!code) {
          console.error('No authorization code received');
          setStatus('error');
          setMessage('No authorization code received from Google. Please try again.');
          return;
        }

        // Exchange code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Session exchange error:', exchangeError);
          setStatus('error');
          setMessage(`Failed to complete authentication: ${exchangeError.message}`);
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Authentication completed but no user data received.');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('Processing authentication...');
    // Reload the page to retry
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const envInfo = getEnvironmentInfo();

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
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Authentication Successful'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
          </div>

          {/* Status Display */}
          <div className={`p-4 rounded-md text-sm text-center ${
            status === 'loading' 
              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
              : status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status === 'loading' && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
                <span>{message}</span>
              </div>
            )}
            {status === 'success' && message}
            {status === 'error' && message}
          </div>

          {/* Action Buttons */}
          {status === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Try Again
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          )}

          {/* Environment Info (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
              Environment: {envInfo.isLocalhost ? 'Localhost' : 'Production'}
              <br />
              Host: {envInfo.baseUrl}
              <br />
              Callback URL: {envInfo.authCallbackUrl}
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
