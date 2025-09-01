import { supabase } from '@/integrations/supabase/client';

export interface BillingPortalData {
  url: string;
}

export interface SubscriptionStatus {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan_name: string;
  plan_price_cents: number;
  plan_interval: 'month' | 'year';
}

export class BillingService {
  /**
   * Create a billing portal session for the current user
   * This will redirect them to Stripe's customer portal
   */
  static async createBillingPortalSession(): Promise<string> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Call the API route to create billing portal session
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  /**
   * Get the current user's subscription status
   */
  static async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user credits which includes subscription info
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw error;
      }

      if (!data.stripe_subscription_id) {
        return null;
      }

      // TODO: Call Stripe API to get detailed subscription info
      // For now, return basic info from our database
      return {
        id: data.stripe_subscription_id,
        status: 'active', // This should come from Stripe
        current_period_start: data.created_at,
        current_period_end: data.subscription_expires_at || '',
        cancel_at_period_end: false,
        plan_name: data.subscription_plan || 'free',
        plan_price_cents: 0,
        plan_interval: 'month'
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }

  /**
   * Cancel the current user's subscription
   */
  static async cancelSubscription(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Call the API route to cancel subscription
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  static async reactivateSubscription(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Call the API route to reactivate subscription
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Get billing history for the current user
   */
  static async getBillingHistory(): Promise<any[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Call the API route to get billing history
      const response = await fetch('/api/stripe/billing-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get billing history');
      }

      const { invoices } = await response.json();
      return invoices || [];
    } catch (error) {
      console.error('Error getting billing history:', error);
      return [];
    }
  }
}

