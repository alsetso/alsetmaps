import { supabase } from '@/integrations/supabase/client';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: any;
  profile?: any;
  error?: string;
  message?: string;
  requiresEmailVerification?: boolean;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role: 'user' | 'agent' | 'admin' | 'moderator';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export class LoginService {
  /**
   * Authenticate user with email and password
   */
  static async login(loginData: LoginData): Promise<LoginResult> {
    try {
      console.log('Starting login process for:', loginData.email);

      // STEP 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password
      });

      if (authError) {
        console.error('Auth login error:', authError);
        
        // Handle specific auth errors
        if (authError.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email address before signing in.',
            requiresEmailVerification: true
          };
        }
        
        if (authError.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. Please try again.'
          };
        }

        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'No user data returned from authentication'
        };
      }

      const authUser = authData.user;
      console.log('Auth user authenticated successfully:', authUser.id);

      // STEP 2: Check if user profile exists in public.accounts
      const { data: profileData, error: profileError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        
        // Profile doesn't exist - this shouldn't happen with our signup flow
        // but handle gracefully for production
        if (profileError.code === 'PGRST116') {
          console.warn('User profile not found for auth user:', authUser.id);
          
          // Create a minimal profile from auth data
          const minimalProfile = await this.createMinimalProfile(authUser);
          if (minimalProfile) {
            return {
              success: true,
              user: authUser,
              profile: minimalProfile,
              message: 'Login successful! Profile created from auth data.'
            };
          }
        }

        return {
          success: false,
          error: 'Failed to retrieve user profile. Please contact support.'
        };
      }

      // STEP 3: Verify profile data integrity
      if (!profileData) {
        console.error('No profile data returned for user:', authUser.id);
        return {
          success: false,
          error: 'User profile not found. Please contact support.'
        };
      }

      // STEP 4: Update last login timestamp
      await this.updateLastLogin(profileData.id);

      console.log('Login completed successfully:', {
        user_id: profileData.id,
        auth_id: authUser.id,
        email: profileData.email,
        role: profileData.role
      });

      return {
        success: true,
        user: authUser,
        profile: profileData,
        message: 'Login successful!'
      };

    } catch (error) {
      console.error('Login service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Create minimal profile from auth user data if profile is missing
   */
  private static async createMinimalProfile(authUser: any): Promise<UserProfile | null> {
    try {
      console.log('Creating minimal profile for auth user:', authUser.id);

      const metadata = authUser.user_metadata || {};
      
      const { data: newProfile, error: createError } = await supabase
        .from('accounts')
        .insert({
          id: authUser.id, // Use auth user ID as primary key
          first_name: metadata.first_name || 'Unknown',
          last_name: metadata.last_name || 'User',
          phone: metadata.phone || '',
          email: authUser.email,
          role: metadata.role || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating minimal profile:', createError);
        return null;
      }

      console.log('Minimal profile created successfully:', newProfile.id);
      return newProfile;

    } catch (error) {
      console.error('Error in createMinimalProfile:', error);
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  private static async updateLastLogin(accountId: string): Promise<void> {
    try {
      await supabase
        .from('accounts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', accountId);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't fail login if this fails
    }
  }

  /**
   * Get user profile by auth user ID
   */
  static async getUserProfile(authUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated and has valid profile
   */
  static async validateUserSession(): Promise<{ isValid: boolean; user?: any; profile?: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { isValid: false };
      }

      const profile = await this.getUserProfile(user.id);
      if (!profile) {
        return { isValid: false };
      }

      return { isValid: true, user, profile };
    } catch (error) {
      console.error('Error validating user session:', error);
      return { isValid: false };
    }
  }

  /**
   * Sign out user
   */
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Logout service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Password reset service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerification(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('Resend verification error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Verification email sent successfully!'
      };
    } catch (error) {
      console.error('Resend verification service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }
}
