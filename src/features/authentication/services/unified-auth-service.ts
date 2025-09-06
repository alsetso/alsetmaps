import { supabase } from '@/integrations/supabase/client';

export interface UserAccount {
  id: string; // Now directly equals auth.users.id
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  created_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  account?: UserAccount;
  error?: string;
}

export class UnifiedAuthService {
  /**
   * Get the current authenticated user and their account data
   */
  static async getCurrentUser(): Promise<AuthResult> {
    try {
      // Get the auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // Get the account data from accounts table (now uses auth.users.id as primary key)
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', user.id)
        .single();

      if (accountError) {
        console.warn('Account not found for user:', user.id);
        return {
          success: false,
          error: 'Account not found'
        };
      }

      return {
        success: true,
        user,
        account
      };

    } catch (error) {
      console.error('Unified auth service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      };
    }
  }

  /**
   * Get the current user's account ID (now same as auth user ID)
   */
  static async getCurrentAccountId(): Promise<string | null> {
    const result = await this.getCurrentUser();
    return result.success ? result.user?.id || null : null;
  }

  /**
   * Check if user is authenticated and has an account
   */
  static async isAuthenticated(): Promise<boolean> {
    const result = await this.getCurrentUser();
    return result.success;
  }
}
