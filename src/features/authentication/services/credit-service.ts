import { supabase } from '@/integrations/supabase/client';

export interface CreditBalance {
  id: string;
  user_id: string;
  free_credits: number;
  paid_credits: number;
  total_credits: number;
  created_at: string;
  updated_at: string;
}

export interface SearchRecord {
  id: string;
  user_id: string;
  address: string;
  latitude: number;
  longitude: number;
  search_type: 'basic' | 'smart';
  smart_data?: any;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  search_id?: string;
  transaction_type: 'debit' | 'credit' | 'purchase' | 'refund';
  credit_type: 'free' | 'paid';
  amount: number;
  description: string;
  metadata?: any;
  created_at: string;
}

export interface SearchRequest {
  address: string;
  latitude: number;
  longitude: number;
  search_type: 'basic' | 'smart';
  smart_data?: any;
}

export class CreditService {
  /**
   * Get user's current credit balance
   */
  static async getCreditBalance(userId: string): Promise<CreditBalance | null> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching credit balance:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCreditBalance:', error);
      return null;
    }
  }

  /**
   * Record a search and handle credit deduction if smart search
   */
  static async recordSearch(userId: string, searchRequest: SearchRequest): Promise<SearchRecord | null> {
    try {
      console.log('Recording search for user:', userId, 'Type:', searchRequest.search_type);

      // Determine credits to use
      const creditsUsed = searchRequest.search_type === 'smart' ? 1 : 0;

      // Check if user has enough credits for smart search
      if (searchRequest.search_type === 'smart') {
        const balance = await this.getCreditBalance(userId);
        if (!balance || balance.total_credits < 1) {
          throw new Error('Insufficient credits for smart search');
        }
      }

      // Record the search
      const { data: searchRecord, error: searchError } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          address: searchRequest.address,
          latitude: searchRequest.latitude,
          longitude: searchRequest.longitude,
          search_type: searchRequest.search_type,
          smart_data: searchRequest.smart_data,
          credits_used: creditsUsed
        })
        .select()
        .single();

      if (searchError) {
        console.error('Error recording search:', searchError);
        return null;
      }

      // If smart search, deduct credits and create transaction
      if (searchRequest.search_type === 'smart') {
        await this.deductCredits(userId, searchRecord.id, 'Smart search performed');
      }

      console.log('Search recorded successfully:', searchRecord.id);
      return searchRecord;

    } catch (error) {
      console.error('Error in recordSearch:', error);
      throw error;
    }
  }

  /**
   * Deduct credits from user (for smart searches)
   */
  private static async deductCredits(userId: string, searchId: string, description: string): Promise<boolean> {
    try {
      // Get current balance to determine which credits to use
      const balance = await this.getCreditBalance(userId);
      if (!balance) {
        throw new Error('Credit balance not found');
      }

      let creditType: 'free' | 'paid';
      let amount: number;

      // Use free credits first, then paid credits
      if (balance.free_credits > 0) {
        creditType = 'free';
        amount = -1; // Negative for debit
      } else if (balance.paid_credits > 0) {
        creditType = 'paid';
        amount = -1; // Negative for debit
      } else {
        throw new Error('No credits available');
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          search_id: searchId,
          transaction_type: 'debit',
          credit_type: creditType,
          amount: amount,
          description: description,
          metadata: {
            search_type: 'smart',
            location: 'search_deduction'
          }
        });

      if (transactionError) {
        console.error('Error creating credit transaction:', transactionError);
        return false;
      }

      console.log('Credits deducted successfully for user:', userId);
      return true;

    } catch (error) {
      console.error('Error in deductCredits:', error);
      return false;
    }
  }

  /**
   * Add credits to user (for purchases, bonuses, etc.)
   */
  static async addCredits(
    userId: string, 
    amount: number, 
    creditType: 'free' | 'paid', 
    description: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'credit',
          credit_type: creditType,
          amount: amount,
          description: description,
          metadata: metadata
        });

      if (transactionError) {
        console.error('Error creating credit transaction:', transactionError);
        return false;
      }

      console.log('Credits added successfully for user:', userId, 'Amount:', amount, 'Type:', creditType);
      return true;

    } catch (error) {
      console.error('Error in addCredits:', error);
      return false;
    }
  }

  /**
   * Get user's search history
   */
  static async getSearchHistory(userId: string, limit: number = 50): Promise<SearchRecord[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching search history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSearchHistory:', error);
      return [];
    }
  }

  /**
   * Get user's credit transaction history
   */
  static async getTransactionHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      return [];
    }
  }

  /**
   * Check if user can perform smart search
   */
  static async canPerformSmartSearch(userId: string): Promise<{ canSearch: boolean; availableCredits: number }> {
    try {
      const balance = await this.getCreditBalance(userId);
      
      if (!balance) {
        return { canSearch: false, availableCredits: 0 };
      }

      const canSearch = balance.total_credits >= 1;
      return { canSearch, availableCredits: balance.total_credits };

    } catch (error) {
      console.error('Error in canPerformSmartSearch:', error);
      return { canSearch: false, availableCredits: 0 };
    }
  }

  /**
   * Get search statistics for user
   */
  static async getSearchStats(userId: string): Promise<{
    totalSearches: number;
    basicSearches: number;
    smartSearches: number;
    totalCreditsUsed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_type, credits_used')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching search stats:', error);
        return {
          totalSearches: 0,
          basicSearches: 0,
          smartSearches: 0,
          totalCreditsUsed: 0
        };
      }

      const stats = {
        totalSearches: data.length,
        basicSearches: data.filter(s => s.search_type === 'basic').length,
        smartSearches: data.filter(s => s.search_type === 'smart').length,
        totalCreditsUsed: data.reduce((sum, s) => sum + s.credits_used, 0)
      };

      return stats;

    } catch (error) {
      console.error('Error in getSearchStats:', error);
      return {
        totalSearches: 0,
        basicSearches: 0,
        smartSearches: 0,
        totalCreditsUsed: 0
      };
    }
  }

  /**
   * Purchase credits (for future Stripe integration)
   */
  static async purchaseCredits(
    userId: string, 
    amount: number, 
    stripePaymentIntentId: string,
    description: string
  ): Promise<boolean> {
    try {
      // Add paid credits
      const success = await this.addCredits(userId, amount, 'paid', description, {
        stripe_payment_intent_id: stripePaymentIntentId,
        purchase_type: 'credit_purchase'
      });

      if (success) {
        console.log('Credits purchased successfully for user:', userId, 'Amount:', amount);
      }

      return success;

    } catch (error) {
      console.error('Error in purchaseCredits:', error);
      return false;
    }
  }
}
