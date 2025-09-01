import { supabase } from '@/integrations/supabase/client';
import { 
  UserCredits, 
  CreditTransaction, 
  CreditPackage, 
  CreditStatus, 
  CreditConsumptionResult,
  CreditUsageBreakdown,
  CreditHistoryItem
} from './types/credit-system';

export class CreditService {
  // Get user's current credit status
  static async getUserCreditStatus(): Promise<CreditStatus> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user credits directly from our new table
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No user credits record found, create default
        await this.createDefaultUserCredits(user.id);
        return {
          balance: 5,
          total_earned: 5,
          total_spent: 0,
          subscription_plan: 'free',
          subscription_expires_at: undefined
        };
      }
      throw new Error(`Failed to get credit status: ${error.message}`);
    }

    return {
      balance: data.balance,
      total_earned: data.total_earned,
      total_spent: data.total_spent,
      subscription_plan: 'free', // TODO: Get from user_subscriptions
      subscription_expires_at: undefined // TODO: Get from user_subscriptions
    };
  }

  // Create default user credits record
  private static async createDefaultUserCredits(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        balance: 5,
        total_earned: 5,
        total_spent: 0
      });

    if (error) throw new Error(`Failed to create default user credits: ${error.message}`);
  }

  // Consume credits for a specific action
  static async consumeCredits(
    actionType: 'search' | 'pin' | 'intent' | 'research' | 'market_analysis',
    referenceId?: string
  ): Promise<CreditConsumptionResult> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Determine credits to consume based on action type
    const creditsToConsume = this.getCreditsForAction(actionType);

    // Check if user has enough credits
    const creditStatus = await this.getUserCreditStatus();
    
    if (creditStatus.balance < creditsToConsume) {
      return {
        success: false,
        credits_consumed: 0,
        remaining_credits: creditStatus.balance,
        message: `Insufficient credits. You need ${creditsToConsume} credits for this action.`
      };
    }

    // Consume credits using our new database function
    const { data, error } = await supabase.rpc('consume_credits_atomic', {
      user_uuid: user.id,
      action_type_param: actionType,
      credits_to_consume: creditsToConsume,
      reference_id_param: referenceId,
      reference_table_param: 'search_history',
      description_param: `Credit consumption for ${actionType}`,
      metadata_param: {}
    });

    if (error) throw new Error(`Failed to consume credits: ${error.message}`);

    if (data && data.length > 0 && data[0].success) {
      const updatedStatus = await this.getUserCreditStatus();
      return {
        success: true,
        credits_consumed: creditsToConsume,
        remaining_credits: updatedStatus.balance,
        message: `Successfully consumed ${creditsToConsume} credits.`
      };
    } else {
      return {
        success: false,
        credits_consumed: 0,
        remaining_credits: creditStatus.balance,
        message: 'Failed to consume credits.'
      };
    }
  }

  // Get credits required for different action types
  private static getCreditsForAction(actionType: string): number {
    switch (actionType) {
      case 'search':
      case 'pin':
      case 'intent':
        return 1;
      case 'research':
        return 1;
      case 'market_analysis':
        return 2;
      default:
        return 1;
    }
  }

  // Get available credit packages
  static async getCreditPackages(): Promise<CreditPackage[]> {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (error) throw new Error(`Failed to get credit packages: ${error.message}`);
    return data || [];
  }

  // Get user's credit transaction history
  static async getCreditHistory(limit: number = 50): Promise<CreditHistoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get credit history: ${error.message}`);

    return (data || []).map(transaction => ({
      date: transaction.created_at,
      credits_used: Math.abs(transaction.amount), // amount can be negative for consumption
      action_type: transaction.type,
      description: transaction.description,
      reference_id: transaction.reference_id
    }));
  }

  // Get credit usage breakdown
  static async getCreditUsageBreakdown(): Promise<CreditUsageBreakdown> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .lt('amount', 0); // Only negative amounts (credit consumption)

    if (error) throw new Error(`Failed to get credit usage breakdown: ${error.message}`);

    const breakdown = {
      searches: 0,
      pins: 0,
      intents: 0,
      research: 0,
      market_analysis: 0,
      total_credits_used: 0
    };

    (data || []).forEach(transaction => {
      const creditsUsed = Math.abs(transaction.amount);
      breakdown.total_credits_used += creditsUsed;
      
      switch (transaction.type) {
        case 'search':
          breakdown.searches += creditsUsed;
          break;
        case 'pin':
          breakdown.pins += creditsUsed;
          break;
        case 'intent':
          breakdown.intents += creditsUsed;
          break;
        case 'research':
          breakdown.research += creditsUsed;
          break;
        case 'market_analysis':
          breakdown.market_analysis += creditsUsed;
          break;
      }
    });

    return breakdown;
  }

  // Check if user can perform an action without consuming credits
  static async canPerformAction(actionType: string): Promise<boolean> {
    const creditStatus = await this.getUserCreditStatus();
    const creditsNeeded = this.getCreditsForAction(actionType);
    return creditStatus.balance >= creditsNeeded;
  }

  // Get user's subscription status
  static async getSubscriptionStatus(): Promise<{
    plan: string;
    expiresAt?: string;
    isActive: boolean;
  }> {
    const creditStatus = await this.getUserCreditStatus();
    
    return {
      plan: creditStatus.subscription_plan,
      expiresAt: creditStatus.subscription_expires_at,
      isActive: creditStatus.subscription_plan === 'premium' && 
                (!creditStatus.subscription_expires_at || 
                 new Date(creditStatus.subscription_expires_at) > new Date())
    };
  }

  // Add credits to user account (for admin use or after payment)
  static async addCredits(
    userId: string,
    credits: number,
    transactionType: 'purchase' | 'subscription' | 'bonus',
    description: string,
    stripePaymentIntentId?: string
  ): Promise<void> {
    const { error } = await supabase.rpc('add_credits_atomic', {
      user_uuid: userId,
      action_type_param: transactionType,
      credits_to_add: credits,
      description_param: description,
      metadata_param: { stripe_payment_intent_id: stripePaymentIntentId }
    });

    if (error) throw new Error(`Failed to add credits: ${error.message}`);
  }

  // Update subscription plan
  static async updateSubscriptionPlan(
    userId: string,
    plan: 'free' | 'premium',
    stripeSubscriptionId?: string,
    expiresAt?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('user_credits')
      .update({
        subscription_plan: plan,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_expires_at: expiresAt
      })
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to update subscription plan: ${error.message}`);
  }
}
