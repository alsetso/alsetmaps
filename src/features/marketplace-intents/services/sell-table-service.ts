import { supabase } from '@/integrations/supabase/client';
import { SellIntentData } from '../types/sell-intent';

export interface SellSubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  estimatedResponseTime?: string;
}

export interface SellRecord {
  id: string;
  user_id?: string;
  session_id?: string;
  anonymous_id?: string;
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  intent_type: 'fsbo' | 'agent' | 'wholesale';
  property_type: 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'land' | 'commercial';
  estimated_value: string;
  desired_price: string;
  timeline: 'asap' | '1-3months' | '3-6months' | '6-12months' | 'flexible';
  agent_name?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  additional_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export class SellTableService {
  /**
   * Submit a sell intent to the sell table
   * Works for both authenticated and anonymous users
   */
  static async submitSellIntent(
    data: SellIntentData, 
    sessionId?: string, 
    anonymousId?: string
  ): Promise<SellSubmissionResponse> {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare the submission data
      const submissionData = {
        user_id: user?.id || null,
        session_id: sessionId || null,
        anonymous_id: anonymousId || null,
        property_address: data.propertyAddress,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        intent_type: data.intentType,
        property_type: data.propertyType,
        estimated_value: data.estimatedValue,
        desired_price: data.desiredPrice,
        timeline: data.timeline,
        agent_name: data.agentName || null,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        additional_notes: data.additionalNotes || null,
        status: 'pending' as const
      };

      console.log('🔍 [SellTableService] Attempting to submit with data:', {
        user_id: submissionData.user_id ? 'authenticated' : 'anonymous',
        session_id: sessionId ? 'present' : 'none',
        anonymous_id: anonymousId ? 'present' : 'none',
        table: 'sell'
      });

      // Insert into the sell table
      const { data: result, error } = await supabase
        .from('sell')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ [SellTableService] Error submitting to sell table:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check if the sell table exists and has proper permissions.');
        } else if (error.code === '42P01') {
          throw new Error('The sell table does not exist. Please run the database migration first.');
        } else {
          throw new Error(`Failed to submit sell intent: ${error.message}`);
        }
      }

      console.log('✅ [SellTableService] Sell intent submitted successfully:', result.id);

      return {
        success: true,
        message: 'Your sell intent has been submitted successfully! Our team will review it within 24 hours.',
        submissionId: result.id,
        estimatedResponseTime: '24 hours',
      };

    } catch (error) {
      console.error('❌ [SellTableService] Error submitting sell intent:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit sell intent. Please try again or contact support.',
      };
    }
  }

  /**
   * Get sell intents for a specific user (authenticated)
   */
  static async getUserSellIntents(): Promise<SellRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('sell')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user sell intents: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching user sell intents:', error);
      throw error;
    }
  }

  /**
   * Get sell intents by session ID (anonymous users)
   */
  static async getAnonymousSellIntents(sessionId: string): Promise<SellRecord[]> {
    try {
      const { data, error } = await supabase
        .from('sell')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch anonymous sell intents: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching anonymous sell intents:', error);
      throw error;
    }
  }

  /**
   * Get sell intents by location using the database function
   */
  static async getSellIntentsByLocation(
    city?: string,
    state?: string,
    zipCode?: string,
    radiusMiles: number = 25
  ): Promise<SellRecord[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_sell_intents_by_location', {
          target_city: city,
          target_state: state,
          target_zip_code: zipCode,
          radius_miles: radiusMiles
        });

      if (error) {
        throw new Error(`Failed to fetch sell intents by location: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching sell intents by location:', error);
      throw error;
    }
  }

  /**
   * Update sell intent status (admin/moderator only)
   */
  static async updateSellIntentStatus(
    sellId: string,
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
        .from('sell')
        .update(updateData)
        .eq('id', sellId);

      if (error) {
        throw new Error(`Failed to update sell intent status: ${error.message}`);
      }

      console.log('✅ [SellTableService] Sell intent status updated:', sellId, status);

    } catch (error) {
      console.error('Error updating sell intent status:', error);
      throw error;
    }
  }

  /**
   * Get sell intent by ID
   */
  static async getSellIntentById(sellId: string): Promise<SellRecord | null> {
    try {
      const { data, error } = await supabase
        .from('sell')
        .select('*')
        .eq('id', sellId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new Error(`Failed to fetch sell intent: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Error fetching sell intent by ID:', error);
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
