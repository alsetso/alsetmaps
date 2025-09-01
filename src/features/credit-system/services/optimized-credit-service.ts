import { supabase } from '@/integrations/supabase/client';

export interface CreditBalance {
  availableCredits: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  actionType: string;
  creditsConsumed: number;
  creditsAdded: number;
  description: string;
  referenceId?: string;
  referenceTable?: string;
  transactionHash: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface CreditConsumptionResult {
  success: boolean;
  remainingCredits: number;
  transactionId: string;
  message: string;
}

export interface CreditAdditionResult {
  success: boolean;
  newBalance: number;
  transactionId: string;
  message: string;
}

export type CreditActionType = 
  | 'search_smart' 
  | 'pin_creation' 
  | 'market_analysis' 
  | 'property_insights'
  | 'refund' 
  | 'bonus' 
  | 'purchase' 
  | 'subscription';

export class OptimizedCreditService {
  /**
   * Get user's current credit balance
   */
  static async getCreditBalance(userId: string): Promise<CreditBalance | null> {
    try {
      const { data, error } = await supabase
        .from('credit_balance_cache')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching credit balance:', error);
        return null;
      }

      return {
        availableCredits: data.available_credits,
        totalCreditsEarned: data.total_credits_earned,
        totalCreditsSpent: data.total_credits_spent,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('Error getting credit balance:', error);
      return null;
    }
  }

  /**
   * Consume credits atomically with proper locking
   */
  static async consumeCredits(
    userId: string,
    actionType: CreditActionType,
    creditsToConsume: number,
    referenceId?: string,
    referenceTable?: string,
    description?: string,
    metadata: Record<string, any> = {}
  ): Promise<CreditConsumptionResult> {
    try {
      const { data, error } = await supabase.rpc('consume_credits_atomic', {
        user_uuid: userId,
        action_type_param: actionType,
        credits_to_consume: creditsToConsume,
        reference_id_param: referenceId,
        reference_table_param: referenceTable,
        description_param: description || `${actionType} - ${creditsToConsume} credits`,
        metadata_param: metadata
      });

      if (error) {
        console.error('Error consuming credits:', error);
        return {
          success: false,
          remainingCredits: 0,
          transactionId: '',
          message: 'Failed to consume credits'
        };
      }

      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: result.success,
          remainingCredits: result.remaining_credits,
          transactionId: result.transaction_id,
          message: result.message
        };
      }

      return {
        success: false,
        remainingCredits: 0,
        transactionId: '',
        message: 'No result from credit consumption'
      };
    } catch (error) {
      console.error('Error consuming credits:', error);
      return {
        success: false,
        remainingCredits: 0,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add credits atomically (for purchases, bonuses, refunds)
   */
  static async addCredits(
    userId: string,
    actionType: CreditActionType,
    creditsToAdd: number,
    referenceId?: string,
    referenceTable?: string,
    description?: string,
    metadata: Record<string, any> = {}
  ): Promise<CreditAdditionResult> {
    try {
      const { data, error } = await supabase.rpc('add_credits_atomic', {
        user_uuid: userId,
        action_type_param: actionType,
        credits_to_add: creditsToAdd,
        reference_id_param: referenceId,
        reference_table_param: referenceTable,
        description_param: description || `${actionType} - ${creditsToAdd} credits added`,
        metadata_param: metadata
      });

      if (error) {
        console.error('Error adding credits:', error);
        return {
          success: false,
          newBalance: 0,
          transactionId: '',
          message: 'Failed to add credits'
        };
      }

      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: result.success,
          newBalance: result.new_balance,
          transactionId: result.transaction_id,
          message: result.message
        };
      }

      return {
        success: false,
        newBalance: 0,
        transactionId: '',
        message: 'No result from credit addition'
      };
    } catch (error) {
      console.error('Error adding credits:', error);
      return {
        success: false,
        newBalance: 0,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's credit transaction history
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return (data || []).map(transaction => ({
        id: transaction.id,
        actionType: transaction.action_type,
        creditsConsumed: transaction.credits_consumed,
        creditsAdded: transaction.credits_added,
        description: transaction.description || '',
        referenceId: transaction.reference_id,
        referenceTable: transaction.reference_table,
        transactionHash: transaction.transaction_hash,
        createdAt: transaction.created_at,
        metadata: transaction.metadata || {}
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Validate if user can perform an action requiring credits
   */
  static async canPerformAction(
    userId: string,
    actionType: CreditActionType,
    creditsRequired: number
  ): Promise<{ canProceed: boolean; availableCredits: number; message: string }> {
    try {
      const balance = await this.getCreditBalance(userId);
      
      if (!balance) {
        return {
          canProceed: false,
          availableCredits: 0,
          message: 'Unable to verify credit balance'
        };
      }

      const canProceed = balance.availableCredits >= creditsRequired;
      
      return {
        canProceed,
        availableCredits: balance.availableCredits,
        message: canProceed 
          ? `Action available (${balance.availableCredits} credits remaining)`
          : `Insufficient credits. Need ${creditsRequired}, have ${balance.availableCredits}`
      };
    } catch (error) {
      console.error('Error validating action:', error);
      return {
        canProceed: false,
        availableCredits: 0,
        message: 'Error validating credit balance'
      };
    }
  }

  /**
   * Get credit usage statistics for a user
   */
  static async getUserCreditStats(userId: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    mostUsedAction: string;
    averageCreditsPerAction: number;
  } | null> {
    try {
      const balance = await this.getCreditBalance(userId);
      if (!balance) return null;

      const { data: usageData, error } = await supabase
        .from('credit_usage')
        .select('action_type, credits_consumed')
        .eq('user_id', userId)
        .gt('credits_consumed', 0);

      if (error) {
        console.error('Error fetching usage data:', error);
        return null;
      }

      const actionCounts = usageData.reduce((acc, item) => {
        acc[item.action_type] = (acc[item.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedAction = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      const totalActions = usageData.length;
      const averageCreditsPerAction = totalActions > 0 
        ? balance.totalCreditsSpent / totalActions 
        : 0;

      return {
        totalEarned: balance.totalCreditsEarned,
        totalSpent: balance.totalCreditsSpent,
        currentBalance: balance.availableCredits,
        mostUsedAction,
        averageCreditsPerAction: Math.round(averageCreditsPerAction * 100) / 100
      };
    } catch (error) {
      console.error('Error getting credit stats:', error);
      return null;
    }
  }

  /**
   * Refund credits for a failed action
   */
  static async refundCredits(
    userId: string,
    originalTransactionId: string,
    reason: string
  ): Promise<CreditAdditionResult> {
    try {
      // Get the original transaction
      const { data: originalTx, error: fetchError } = await supabase
        .from('credit_usage')
        .select('credits_consumed, description')
        .eq('id', originalTransactionId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !originalTx) {
        return {
          success: false,
          newBalance: 0,
          transactionId: '',
          message: 'Original transaction not found'
        };
      }

      if (originalTx.credits_consumed <= 0) {
        return {
          success: false,
          newBalance: 0,
          transactionId: '',
          message: 'No credits to refund'
        };
      }

      // Add credits back as a refund
      return await this.addCredits(
        userId,
        'refund',
        originalTx.credits_consumed,
        originalTransactionId,
        'credit_usage',
        `Refund: ${originalTx.description} - ${reason}`,
        { originalTransactionId, reason }
      );
    } catch (error) {
      console.error('Error refunding credits:', error);
      return {
        success: false,
        newBalance: 0,
        transactionId: '',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
