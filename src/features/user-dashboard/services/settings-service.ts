import { supabase } from '@/integrations/supabase/client';

export interface UserSubscription {
  user_id: string;
  stripe_subscription_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  credits_per_month: number;
  created_at: string;
  updated_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  is_popular: boolean;
  created_at: string;
}

export class SettingsService {
  /**
   * Get user's subscription information
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found
          return null;
        }
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Get all available credit packages
   */
  static async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .order('price_cents', { ascending: true });

      if (error) {
        console.error('Error fetching credit packages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting credit packages:', error);
      return [];
    }
  }

  /**
   * Get user's account information
   */
  static async getUserAccount(userId: string): Promise<{
    email: string;
    first_name: string;
    last_name: string;
    stripe_customer_id: string | null;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('email, first_name, last_name, stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user account:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user account:', error);
      return null;
    }
  }

  /**
   * Update user's account information
   */
  static async updateUserAccount(
    userId: string, 
    updates: { first_name?: string; last_name?: string; phone?: string }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user account:', error);
      return false;
    }
  }

  /**
   * Get user's credit usage statistics
   */
  static async getUserCreditStats(userId: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    mostUsedAction: string;
    averageCreditsPerAction: number;
    monthlyUsage: Array<{ month: string; credits: number }>;
  } | null> {
    try {
      // Get basic credit stats
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (balanceError) {
        console.error('Error fetching credit balance:', error);
        return null;
      }

      // Get usage data for statistics
      const { data: usageData, error: usageError } = await supabase
        .from('credit_transactions')
        .select('action_type, credits_consumed, created_at')
        .eq('user_id', userId)
        .gt('credits_consumed', 0)
        .order('created_at', { ascending: false });

      if (usageError) {
        console.error('Error fetching usage data:', error);
        return null;
      }

      const usage = usageData || [];
      
      // Calculate statistics
      const actionCounts = usage.reduce((acc, item) => {
        acc[item.action_type] = (acc[item.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedAction = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      const totalActions = usage.length;
      const averageCreditsPerAction = totalActions > 0 
        ? balanceData.total_credits_spent / totalActions 
        : 0;

      // Calculate monthly usage (last 6 months)
      const monthlyUsage = this.calculateMonthlyUsage(usage);

      return {
        totalEarned: balanceData.total_credits_earned,
        totalSpent: balanceData.total_credits_spent,
        currentBalance: balanceData.available_credits,
        mostUsedAction,
        averageCreditsPerAction: Math.round(averageCreditsPerAction * 100) / 100,
        monthlyUsage
      };
    } catch (error) {
      console.error('Error getting credit stats:', error);
      return null;
    }
  }

  /**
   * Calculate monthly credit usage for the last 6 months
   */
  private static calculateMonthlyUsage(transactions: Array<{ credits_consumed: number; created_at: string }>): Array<{ month: string; credits: number }> {
    const monthlyUsage: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
      monthlyUsage[monthKey] = 0;
    }

    // Sum credits used per month
    transactions.forEach(transaction => {
      const monthKey = transaction.created_at.substring(0, 7);
      if (monthlyUsage[monthKey] !== undefined) {
        monthlyUsage[monthKey] += transaction.credits_consumed;
      }
    });

    // Convert to array format
    return Object.entries(monthlyUsage).map(([month, credits]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      credits
    }));
  }

  /**
   * Get subscription analytics for the user
   */
  static async getSubscriptionAnalytics(userId: string): Promise<{
    subscriptionStartDate: string | null;
    totalMonthsSubscribed: number;
    averageCreditsPerMonth: number;
    nextRenewalDate: string | null;
    subscriptionStatus: string | null;
  } | null> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          subscriptionStartDate: null,
          totalMonthsSubscribed: 0,
          averageCreditsPerMonth: 0,
          nextRenewalDate: null,
          subscriptionStatus: null
        };
      }

      const startDate = new Date(subscription.created_at);
      const now = new Date();
      const totalMonths = Math.max(0, 
        (now.getFullYear() - startDate.getFullYear()) * 12 + 
        (now.getMonth() - startDate.getMonth())
      );

      // Get total credits earned from subscription renewals
      const { data: renewalData, error: renewalError } = await supabase
        .from('credit_transactions')
        .select('credits_added')
        .eq('user_id', userId)
        .eq('action_type', 'subscription_renewal');

      if (renewalError) {
        console.error('Error fetching renewal data:', error);
        return null;
      }

      const totalRenewalCredits = (renewalData || []).reduce((sum, item) => sum + item.credits_added, 0);
      const averageCreditsPerMonth = totalMonths > 0 ? totalRenewalCredits / totalMonths : 0;

      return {
        subscriptionStartDate: subscription.created_at,
        totalMonthsSubscribed: totalMonths,
        averageCreditsPerMonth: Math.round(averageCreditsPerMonth * 100) / 100,
        nextRenewalDate: subscription.current_period_end,
        subscriptionStatus: subscription.status
      };
    } catch (error) {
      console.error('Error getting subscription analytics:', error);
      return null;
    }
  }
}
