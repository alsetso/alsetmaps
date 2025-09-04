import { supabase } from '@/integrations/supabase/client';

export interface SignupData {
  first_name: string;
  last_name: string;
  phone: string;
  role: 'agent' | 'wholesaler' | 'home_owner' | 'other';
  email: string;
  password: string;
}

export interface SignupResult {
  success: boolean;
  user?: any;
  error?: string;
  message?: string;
}

export class SignupService {
  /**
   * WORKING APPROACH: Create auth user, then public.users record
   */
  static async createAccount(signupData: SignupData): Promise<SignupResult> {
    try {
      console.log('Starting signup process...', signupData.email);

      // STEP 1: Create auth user to get the auth ID
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.first_name,
            last_name: signupData.last_name,
            phone: signupData.phone,
            role: signupData.role
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user || !authData.user.id) {
        console.error('No user data or ID returned from auth signup');
        return {
          success: false,
          error: 'No user data returned from signup'
        };
      }

      const authUserId = authData.user.id;
      console.log('Auth user created successfully with ID:', authUserId);

      // STEP 2: Create user record in public.users
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUserId, // Use the auth user's ID as the primary key
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          phone: signupData.phone,
          role: signupData.role,
          email: signupData.email,
          auth_user_id: authUserId, // Link to auth user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user record:', userError);
        console.error('Auth user created but user record failed. Auth ID:', authUserId);
        
        return {
          success: false,
          error: `Failed to create user profile: ${userError.message}`
        };
      }

      console.log('User record created successfully:', userRecord.id);

      console.log('Signup completed successfully:', {
        user_id: userRecord.id,
        auth_id: authUserId,
        email: signupData.email,
        linked: userRecord.id === authUserId
      });

      return {
        success: true,
        user: {
          ...userRecord,
          auth_user: authData.user
        },
        message: 'Account created successfully! Please check your email to verify your account.'
      };

    } catch (error) {
      console.error('Signup service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Check if an email is already registered
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - email is available
        return true;
      }

      if (data) {
        // Email already exists
        return false;
      }

      return true;

    } catch (error) {
      console.error('Email availability check error:', error);
      // Default to available if we can't check
      return true;
    }
  }

  /**
   * Resend email verification if needed
   */
  static async resendVerification(email: string): Promise<SignupResult> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Verification email sent successfully!'
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}
