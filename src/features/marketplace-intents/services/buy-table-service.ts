import { supabase } from '@/integrations/supabase/client';
import { BuyerIntentData } from '../types/buyer-intent';

export interface BuySubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  estimatedResponseTime?: string;
}

export interface BuyRecord {
  id: string;
  user_id?: string;
  session_id?: string;
  anonymous_id?: string;
  
  // Contact Information
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
  // Primary Intent
  intent_type: 'personal' | 'investment';
  
  // Location Preferences (simplified)
  cities: string[]; // Array of cities they're interested in
  state: string;
  
  // Budget
  min_budget?: number;
  max_budget: number;
  
  // Property Criteria (buybox)
  property_types: string[]; // single-family, condo, townhouse, etc.
  min_beds?: number;
  max_beds?: number;
  min_baths?: number;
  max_baths?: number;
  
  // Timeline
  timeline: string;
  
  // Agent Preference
  agent_preference: string;
  
  // Additional Notes
  additional_notes?: string;
  
  // Status and workflow
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export class BuyTableService {
  /**
   * Submit a buy intent to the buy table
   * Works for both authenticated and anonymous users
   */
  static async submitBuyIntent(
    data: BuyerIntentData, 
    sessionId?: string, 
    anonymousId?: string
  ): Promise<BuySubmissionResponse> {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare the submission data
      const submissionData = {
        user_id: user?.id || null,
        session_id: sessionId || null,
        anonymous_id: anonymousId || null,
        
        // Contact Information
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        
        // Primary Intent (simplified from investment strategy)
        intent_type: data.investmentStrategy === 'primary-residence' ? 'personal' : 'investment',
        
        // Location Preferences (simplified)
        cities: [data.locationPreference.city], // Convert single city to array
        state: data.locationPreference.state,
        
        // Budget (simplified from financial criteria)
        min_budget: data.financialCriteria.minPrice || null,
        max_budget: data.financialCriteria.maxPrice,
        
        // Property Criteria (simplified)
        property_types: data.propertyCriteria.propertyType,
        min_beds: data.propertyCriteria.minBeds || null,
        max_beds: data.propertyCriteria.maxBeds || null,
        min_baths: data.propertyCriteria.minBaths || null,
        max_baths: data.propertyCriteria.maxBaths || null,
        
        // Timeline
        timeline: data.timeline,
        
        // Agent Preference
        agent_preference: data.agentPreference,
        
        // Additional Notes (combine must-haves and deal-breakers)
        additional_notes: data.additionalNotes || 
          `Must-haves: ${data.mustHaves.join(', ')}. Deal-breakers: ${data.dealBreakers.join(', ')}`,
        
        status: 'pending' as const
      };

      console.log('🔍 [BuyTableService] Attempting to submit with data:', {
        user_id: submissionData.user_id ? 'authenticated' : 'anonymous',
        session_id: sessionId ? 'present' : 'none',
        anonymous_id: anonymousId ? 'present' : 'none',
        table: 'buy',
        intent_type: submissionData.intent_type,
        cities: submissionData.cities,
        max_budget: submissionData.max_budget
      });

      // Insert into the buy table
      const { data: result, error } = await supabase
        .from('buy')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ [BuyTableService] Error submitting to buy table:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check if the buy table exists and has proper permissions.');
        } else if (error.code === '42P01') {
          throw new Error('The buy table does not exist. Please run the database migration first.');
        } else {
          throw new Error(`Failed to submit buy intent: ${error.message}`);
        }
      }

      console.log('✅ [BuyTableService] Buy intent submitted successfully:', result.id);

      return {
        success: true,
        message: 'Your buy intent has been submitted successfully! Our team will review it within 24 hours.',
        submissionId: result.id,
        estimatedResponseTime: '24 hours',
      };

    } catch (error) {
      console.error('❌ [BuyTableService] Error submitting buy intent:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit buy intent. Please try again or contact support.',
      };
    }
  }

  /**
   * Get buy intents for a specific user (authenticated)
   */
  static async getUserBuyIntents(): Promise<BuyRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('buy')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user buy intents: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching user buy intents:', error);
      throw error;
    }
  }

  /**
   * Get buy intents by session ID (anonymous users)
   */
  static async getAnonymousBuyIntents(sessionId: string): Promise<BuyRecord[]> {
    try {
      const { data, error } = await supabase
        .from('buy')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch anonymous buy intents: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching anonymous buy intents:', error);
      throw error;
    }
  }

  /**
   * Update buy intent status (admin/moderator only)
   */
  static async updateBuyIntentStatus(
    buyId: string,
    status: 'pending' | 'approved' | 'rejected' | 'contacted',
    reviewNotes?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      };

      if (reviewNotes) {
        updateData.review_notes = reviewNotes;
      }

      const { error } = await supabase
        .from('buy')
        .update(updateData)
        .eq('id', buyId);

      if (error) {
        throw new Error(`Failed to update buy intent status: ${error.message}`);
      }

      console.log('✅ [BuyTableService] Buy intent status updated:', buyId, status);

    } catch (error) {
      console.error('Error updating buy intent status:', error);
      throw error;
    }
  }

  /**
   * Get buy intent by ID
   */
  static async getBuyIntentById(buyId: string): Promise<BuyRecord | null> {
    try {
      const { data, error } = await supabase
        .from('buy')
        .select('*')
        .eq('id', buyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new Error(`Failed to fetch buy intent: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Error fetching buy intent by ID:', error);
      throw error;
    }
  }

  /**
   * Generate a unique session ID for anonymous users
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique anonymous ID for anonymous users
   */
  static generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
