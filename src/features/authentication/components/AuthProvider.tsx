"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserService } from '../services/user-service';
import { getAuthCallbackUrl } from '@/lib/env-utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await ensureUserProfile(session.user);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureUserProfile(session.user);
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ensure user profile exists in accounts table
  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const profileExists = await UserService.profileExists(user.id);
      
      if (!profileExists) {
        // Get user metadata from auth.users
        if (user.user_metadata) {
          const { first_name, last_name, phone } = user.user_metadata;
          
          // Create profile with metadata from signup
          await UserService.createUserProfile(user.id, {
            first_name: first_name || '',
            last_name: last_name || '',
            phone: phone || ''
          });
          console.log('Created new user profile in accounts table with signup data');
        } else {
          // Fallback to empty profile
          await UserService.createUserProfile(user.id, {
            first_name: '',
            last_name: '',
            phone: ''
          });
          console.log('Created new user profile in accounts table with default data');
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      // Don't throw error here - we still want to allow login
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Profile creation will be handled by the auth state change listener
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    try {
      // Create user with Supabase (let them handle email confirmation)
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone
          }
        }
      });
      
      if (error) throw error;
      
      // Don't try to auto-signin - let Supabase handle email confirmation
      // Don't create profile yet - wait for email confirmation and sign in
      
      // Send our custom verification email immediately
      try {
        const response = await fetch('/api/auth/send-verification-email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            email, 
            firstName, 
            lastName 
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send verification email');
        }
        
        console.log('Verification email sent via API route');
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the signup if email fails
      }
      
      // Profile creation will happen automatically when user confirms email and signs in
      // The ensureUserProfile function will handle this, and the trigger will create user_credits
      
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(),
        scopes: 'email profile',
      },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
