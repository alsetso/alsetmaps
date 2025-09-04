import { supabase } from '@/integrations/supabase/client';

export interface SignupData {
  first_name: string;
  last_name: string;
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
   * Creates a new user account with Supabase auth only
   * User must confirm email before any additional setup
   */
  static async createAccount(signupData: SignupData): Promise<SignupResult> {
    try {
      // Create user in Supabase auth only
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.first_name,
            last_name: signupData.last_name
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

      if (!authData.user) {
        return {
          success: false,
          error: 'No user data returned from signup'
        };
      }

      console.log('User signup successful:', authData.user.id);

      return {
        success: true,
        user: authData.user,
        message: 'Account created successfully! Please check your email to verify your account before proceeding.'
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
   * Resends email verification if needed
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

  /**
   * Checks if an email is already registered
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
}
