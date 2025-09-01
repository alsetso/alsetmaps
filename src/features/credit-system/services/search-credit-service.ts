import { supabase } from '@/integrations/supabase/client';
import { SearchTierConfig, SEARCH_TIER_CONFIG } from '@/features/property-management/types/search-history';

export interface SearchCreditValidation {
  canProceed: boolean;
  creditsRequired: number;
  availableCredits: number;
  message: string;
  searchTier: 'basic' | 'smart';
}

export interface SearchCreditConsumption {
  success: boolean;
  creditsConsumed: number;
  remainingCredits: number;
  message: string;
}

export class SearchCreditService {
  /**
   * Validate if user can perform a search at the specified tier
   */
  static async validateSearchCredits(
    userId: string | null,
    searchTier: 'basic' | 'smart'
  ): Promise<SearchCreditValidation> {
    const config = SEARCH_TIER_CONFIG[searchTier];
    
    // Basic searches are always free
    if (searchTier === 'basic') {
      return {
        canProceed: true,
        creditsRequired: 0,
        availableCredits: 0,
        message: 'Basic search is free',
        searchTier: 'basic'
      };
    }

    // Smart searches require credits
    if (searchTier === 'smart') {
      if (!userId) {
        return {
          canProceed: false,
          creditsRequired: config.credits_required,
          availableCredits: 0,
          message: 'Authentication required for smart searches',
          searchTier: 'smart'
        };
      }

      try {
        // Get user's available credits from our new user_credits table
        const { data: userCredits, error } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user credits:', error);
          return {
            canProceed: false,
            creditsRequired: config.credits_required,
            availableCredits: 0,
            message: 'Unable to verify credit balance',
            searchTier: 'smart'
          };
        }

        const availableCredits = userCredits?.balance || 0;
        const canProceed = availableCredits >= config.credits_required;

        return {
          canProceed,
          creditsRequired: config.credits_required,
          availableCredits,
          message: canProceed 
            ? `Smart search available (${availableCredits} credits remaining)`
            : `Insufficient credits. Need ${config.credits_required} credit(s), have ${availableCredits}`,
          searchTier: 'smart'
        };
      } catch (error) {
        console.error('Error validating search credits:', error);
        return {
          canProceed: false,
          creditsRequired: config.credits_required,
          availableCredits: 0,
          message: 'Error validating credit balance',
          searchTier: 'smart'
        };
      }
    }

    return {
      canProceed: false,
      creditsRequired: 0,
      availableCredits: 0,
      message: 'Invalid search tier',
      searchTier: 'basic'
    };
  }

  /**
   * Consume credits for a smart search
   */
  static async consumeSearchCredits(
    userId: string,
    searchTier: 'basic' | 'smart'
  ): Promise<SearchCreditConsumption> {
    const config = SEARCH_TIER_CONFIG[searchTier];
    
    // Basic searches don't consume credits
    if (searchTier === 'basic') {
      return {
        success: true,
        creditsConsumed: 0,
        remainingCredits: 0,
        message: 'Basic search completed (no credits consumed)'
      };
    }

    // Smart searches consume credits
    if (searchTier === 'smart') {
      try {
        // Use our new atomic credit consumption function
        const { data, error } = await supabase.rpc('consume_credits_atomic', {
          user_uuid: userId,
          action_type_param: 'search',
          credits_to_consume: config.credits_required,
          reference_table_param: 'search_history',
          description_param: `Smart search credit consumption`,
          metadata_param: { search_tier: searchTier }
        });

        if (error) {
          console.error('Error consuming search credits:', error);
          return {
            success: false,
            creditsConsumed: 0,
            remainingCredits: 0,
            message: 'Failed to consume credits'
          };
        }

        // Handle response from our new function
        if (data && data.length > 0 && data[0].success) {
          return {
            success: true,
            creditsConsumed: config.credits_required,
            remainingCredits: data[0].remaining_credits || 0,
            message: `Smart search completed (${config.credits_required} credit consumed)`
          };
        } else {
          return {
            success: false,
            creditsConsumed: 0,
            remainingCredits: 0,
            message: 'Credit consumption failed'
          };
        }
      } catch (error) {
        console.error('Error consuming search credits:', error);
        return {
          success: false,
          creditsConsumed: 0,
          remainingCredits: 0,
          message: 'Error consuming credits'
        };
      }
    }

    return {
      success: false,
      creditsConsumed: 0,
      remainingCredits: 0,
      message: 'Invalid search tier'
    };
  }

  /**
   * Get search tier information
   */
  static getSearchTierInfo(searchTier: 'basic' | 'smart') {
    return SEARCH_TIER_CONFIG[searchTier];
  }

  /**
   * Check if user has sufficient credits for smart search
   */
  static async hasSufficientCredits(userId: string | null): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const { data: userCredits, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) return false;
      
      return (userCredits?.balance || 0) >= SEARCH_TIER_CONFIG.smart.credits_required;
    } catch (error) {
      return false;
    }
  }
}
