"use client";

import { useState } from 'react';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { LoginService } from '@/features/authentication/services';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();

  // Form state for email/password login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Redirect to home page if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await signInWithGoogle();
      setMessage('Redirecting to Google...');
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error instanceof Error) {
        setMessage(`Google sign-in failed: ${error.message}`);
      } else {
        setMessage('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const result = await LoginService.login({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      });

      if (result.success) {
        setMessage(result.message || 'Login successful! Redirecting...');
        
        // Clear form
        setLoginForm({
          email: '',
          password: ''
        });

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        if (result.requiresEmailVerification) {
          setMessage(result.error || 'Please verify your email before signing in.');
        } else {
          setMessage(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Email login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedLayout showTopbar={false}>
      <div className="min-h-screen flex items-center justify-center bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
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
              Sign in to your account
            </h2>
            <p className="text-muted-foreground mt-2">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('Redirecting') || message.includes('not yet implemented')
                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Google Sign In */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">Continue with Google</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                  G
                </div>
                {loading ? 'Connecting to Google...' : 'Sign in with Google'}
              </Button>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email/Password Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">Sign in with Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={loginForm.email}
                    onChange={handleLoginFormChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={handleLoginFormChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/register" className="text-primary hover:text-primary/80 text-sm">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
