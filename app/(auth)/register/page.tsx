"use client";

import { useState } from 'react';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { Button } from '@/features/shared/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();

  // Redirect to home page if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await signInWithGoogle();
      setMessage('Redirecting to Google...');
    } catch (error) {
      console.error('Google sign-up error:', error);
      if (error instanceof Error) {
        setMessage(`Google sign-up failed: ${error.message}`);
      } else {
        setMessage('Google sign-up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
              Create your account
            </h2>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('Redirecting') 
                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              {loading ? 'Connecting to Google...' : 'Sign up with Google'}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-primary hover:text-primary/80 text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
