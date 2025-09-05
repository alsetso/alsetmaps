import { supabase } from '@/integrations/supabase/client';

export interface AccountData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateAccountData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export class AccountManagementService {
  /**
   * Get account data for the current user
   */
  static async getAccountData(): Promise<AccountData | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      const { data: account, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching account data:', error);
        return null;
      }

      return account;
    } catch (error) {
      console.error('Error in getAccountData:', error);
      return null;
    }
  }

  /**
   * Update account data for the current user
   */
  static async updateAccountData(updates: UpdateAccountData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('auth_user_id', session.user.id);

      if (error) {
        console.error('Error updating account data:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAccountData:', error);
      return { success: false, error: 'Failed to update account data' };
    }
  }

  /**
   * Get payment methods for the current user
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch('/api/stripe/payment-methods', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      return [];
    }
  }

  /**
   * Create setup intent for adding a payment method
   */
  static async createSetupIntent(): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
    try {
      const response = await fetch('/api/stripe/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create setup intent');
      }

      const data = await response.json();
      return { 
        success: true, 
        clientSecret: data.clientSecret 
      };
    } catch (error) {
      console.error('Error in createSetupIntent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create setup intent' 
      };
    }
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/stripe/payment-methods?paymentMethodId=${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deletePaymentMethod:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete payment method' 
      };
    }
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/stripe/default-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set default payment method');
      }

      return { success: true };
    } catch (error) {
      console.error('Error in setDefaultPaymentMethod:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set default payment method' 
      };
    }
  }

  /**
   * Get user's current credit balance
   */
  static async getCreditBalance(): Promise<{ availableCredits: number } | null> {
    try {
      const response = await fetch('/api/credit-transactions/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credit balance');
      }

      const data = await response.json();
      return { availableCredits: data.availableCredits || 0 };
    } catch (error) {
      console.error('Error getting credit balance:', error);
      return null;
    }
  }

  /**
   * Create payment intent for purchasing credits
   * TODO: Implement server-side Stripe integration
   */
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
    try {
      // Temporarily disabled to fix client-side Stripe initialization error
      console.log('Payment intent functionality temporarily disabled');
      return { success: false, error: 'Payment functionality temporarily disabled' };
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      return { success: false, error: 'Failed to create payment intent' };
    }
  }
}