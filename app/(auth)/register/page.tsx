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
import { SignupService, SignupData } from '@/features/authentication/services/signup-service';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const { user } = useAuth();
  const router = useRouter();

  // Form state for signup
  const [signupForm, setSignupForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect to home page if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!signupForm.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!signupForm.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!signupForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!signupForm.password) {
      newErrors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignupForm({
      ...signupForm,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('info');
    
    try {
      // Check email availability
      const isEmailAvailable = await SignupService.checkEmailAvailability(signupForm.email);
      if (!isEmailAvailable) {
        setMessage('An account with this email already exists. Please sign in instead.');
        setMessageType('error');
        return;
      }

      // Prepare signup data
      const signupData: SignupData = {
        first_name: signupForm.first_name.trim(),
        last_name: signupForm.last_name.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password
      };

      // Create account using the new working service
      const result = await SignupService.createAccount(signupData);

      if (result.success) {
        setMessage(result.message || 'Account created successfully! Please check your email to verify your account.');
        setMessageType('success');
        
        // Clear form
        setSignupForm({
          first_name: '',
          last_name: '',
          email: '',
          password: ''
        });

        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage(result.error || 'Signup failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border border-blue-200';
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
              Create your account
            </h2>
            <p className="text-muted-foreground mt-2">
              Join Alset to start your property journey
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${getMessageStyles()}`}>
              {message}
            </div>
          )}

          {/* Signup Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">Create New Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={signupForm.first_name}
                      onChange={handleSignupFormChange}
                      placeholder="First name"
                      className={errors.first_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs">{errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={signupForm.last_name}
                      onChange={handleSignupFormChange}
                      placeholder="Last name"
                      className={errors.last_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={signupForm.email}
                    onChange={handleSignupFormChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'border-red-500' : ''}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={signupForm.password}
                    onChange={handleSignupFormChange}
                    placeholder="Create a password"
                    className={errors.password ? 'border-red-500' : ''}
                    required
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>

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
