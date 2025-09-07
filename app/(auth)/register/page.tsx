"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { TopBar } from '../../components/TopBar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      await signUp(formData.email, formData.password, formData.name, '', '');
      setMessage('Account created! Please check your email to verify your account.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      await signInWithGoogle();
      setMessage('Redirecting to Google...');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar showSearchByDefault={false} showSearchIcon={false} />
        <div className="flex items-center justify-center h-96 pt-[76px]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if user is logged in (will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar showSearchByDefault={false} showSearchIcon={false} />
        <div className="flex items-center justify-center h-96 pt-[76px]">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-[84px]">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src="/logo.svg" alt="Alset" className="h-8 w-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-600 mt-2">
              Join Alset to start making off-market deals
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('created') || message.includes('Redirecting')
                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Google Sign In */}
          <div className="bg-white border border-gray-200 rounded-md p-6">
            <h3 className="text-center text-lg font-medium text-gray-900 mb-4">
              Continue with Google
            </h3>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              {isSubmitting ? 'Connecting to Google...' : 'Sign up with Google'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Email/Password Sign Up Form */}
          <div className="bg-white border border-gray-200 rounded-md p-6">
            <h3 className="text-center text-lg font-medium text-gray-900 mb-4">
              Sign up with Email
            </h3>
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-gray-900 hover:text-gray-700 text-sm font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}