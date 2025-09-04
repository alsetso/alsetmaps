import { supabase } from '@/integrations/supabase/client';

export interface AccountSetupData {
  role: 'seller' | 'buyer' | 'investor' | 'wholesaler' | 'realtor' | 'lender';
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AccountSetupResult {
  success: boolean;
  accountId?: string;
  error?: string;
}

export interface CreditsCreationResult {
  success: boolean;
  creditsId?: string;
  error?: string;
}

export class AccountSetupService {
  /**
   * Creates only the account record for authenticated user
   */
  static async setupAccountAndCredits(setupData: AccountSetupData): Promise<AccountSetupResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (existingAccount) {
        return {
          success: false,
          error: 'Account already exists'
        };
      }

      // Create account record with user details
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: user.id,
          email: user.email,
          role: setupData.role,
          first_name: setupData.first_name,
          last_name: setupData.last_name,
          phone: setupData.phone
        })
        .select('id')
        .single();

      if (accountError) {
        console.error('Error creating account:', accountError);
        return {
          success: false,
          error: 'Failed to create account'
        };
      }

      return {
        success: true,
        accountId: account.id
      };

    } catch (error) {
      console.error('Account setup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Creates credits record for an existing account
   */
  static async createCreditsOnly(accountId: string): Promise<CreditsCreationResult> {
    try {
      // Create credits record with new structure
      const { data: credits, error: creditsError } = await supabase
        .from('credits')
        .insert({
          user_id: accountId,
          available_credits: 10
        })
        .select('id')
        .single();

      if (creditsError) {
        console.error('Error creating credits:', creditsError);
        return {
          success: false,
          error: 'Failed to create credits'
        };
      }

      return {
        success: true,
        creditsId: credits.id
      };

    } catch (error) {
      console.error('Credits creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Check if user has account and credits set up
   */
  static async checkAccountStatus(): Promise<{ hasAccount: boolean; hasCredits: boolean; accountId?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { hasAccount: false, hasCredits: false };
      }

      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!account) {
        return { hasAccount: false, hasCredits: false };
      }

      const { data: credits } = await supabase
        .from('credits')
        .select('id')
        .eq('user_id', account.id)
        .single();

      return {
        hasAccount: true,
        hasCredits: !!credits,
        accountId: account.id
      };

    } catch (error) {
      console.error('Error checking account status:', error);
      return { hasAccount: false, hasCredits: false };
    }
  }

  /**
   * Get user's current credit balance
   */
  static async getCreditBalance(): Promise<{ availableCredits: number } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!account) return null;

      const { data: credits } = await supabase
        .from('credits')
        .select('available_credits')
        .eq('user_id', account.id)
        .single();

      if (!credits) return null;

      return {
        availableCredits: credits.available_credits
      };

    } catch (error) {
      console.error('Error getting credit balance:', error);
      return null;
    }
  }
}
