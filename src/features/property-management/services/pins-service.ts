import { supabase } from '@/integrations/supabase/client';
import { UnifiedAuthService } from '@/features/authentication/services/unified-auth-service';
import { Pin } from '../types/pin';

// Re-export Pin type for backward compatibility
export type { Pin } from '../types/pin';

export interface CreatePinData {
  latitude: number;
  longitude: number;
  name: string;
  images?: string[];
  notes?: string;
  searchHistoryId?: string;
  smartData?: any; // Smart search data from Zillow API
}

export class PinsService {
  /**
   * Create a new pin for the authenticated user
   */
  static async createPin(pinData: CreatePinData): Promise<{ success: boolean; pin?: Pin; error?: string }> {
    try {
      console.log('🔍 Starting pin creation process...');
      
      // Get the current authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('❌ Authentication error:', sessionError);
        return { success: false, error: 'User not authenticated' };
      }

      console.log('✅ User authenticated:', session.user.id);

      // Get the user's account ID from the accounts table
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (accountError || !accountData) {
        console.error('❌ Account lookup error:', accountError);
        return { success: false, error: 'User account not found' };
      }

      console.log('✅ Account found:', accountData.id);

      // Validate required fields
      if (!pinData.name || pinData.name.trim().length === 0) {
        return { success: false, error: 'Pin name is required' };
      }

      // Validate coordinates
      if (!pinData.latitude || !pinData.longitude) {
        return { success: false, error: 'Invalid coordinates provided' };
      }

      if (pinData.latitude < -90 || pinData.latitude > 90) {
        return { success: false, error: 'Latitude must be between -90 and 90' };
      }

      if (pinData.longitude < -180 || pinData.longitude > 180) {
        return { success: false, error: 'Longitude must be between -180 and 180' };
      }

      // CRITICAL FIX: Format coordinates for database precision requirements
      const formattedLatitude = Number(pinData.latitude.toFixed(8)); // DECIMAL(10,8)
      const formattedLongitude = Number(pinData.longitude.toFixed(8)); // DECIMAL(11,8)
      
      console.log('📍 Coordinate formatting:', {
        original: { lat: pinData.latitude, lng: pinData.longitude },
        formatted: { lat: formattedLatitude, lng: formattedLongitude }
      });
      
      // Create the pin with properly formatted coordinates
      const pinInsertData = {
        user_id: accountData.id, // Keep for business logic (credits, profile data)
        auth_user_id: session.user.id, // Add direct auth relationship for RLS
        latitude: formattedLatitude,
        longitude: formattedLongitude,
        name: pinData.name,
        images: pinData.images || [],
        notes: pinData.notes || null,
        search_history_id: pinData.searchHistoryId || null,
        smart_data: pinData.smartData || null // Include smart search data if available
      };

      // Remove undefined values to prevent database errors
      Object.keys(pinInsertData).forEach(key => {
        if (pinInsertData[key as keyof typeof pinInsertData] === undefined) {
          delete pinInsertData[key as keyof typeof pinInsertData];
        }
      });

      console.log('📌 Attempting to insert pin with data:', pinInsertData);

      const { data: pin, error: pinError } = await supabase
        .from('pins')
        .insert(pinInsertData)
        .select()
        .single();

      if (pinError) {
        console.error('❌ Pin creation error:', pinError);
        console.error('❌ Error details:', {
          code: pinError.code,
          message: pinError.message,
          details: pinError.details,
          hint: pinError.hint
        });
        console.error('❌ Pin data that failed:', pinInsertData);
        
        // Return more specific error message
        const errorMessage = pinError.message || 'Failed to create pin';
        return { success: false, error: errorMessage };
      }

      console.log('✅ Pin created successfully:', pin);
      return { success: true, pin };

    } catch (error) {
      console.error('❌ Unexpected error creating pin:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Get all pins for the authenticated user
   */
  static async getUserPins(): Promise<{ success: boolean; pins?: Pin[]; error?: string }> {
    try {
      // Use unified auth service
      const accountId = await UnifiedAuthService.getCurrentAccountId();
      
      if (!accountId) {
        return { success: false, error: 'User not authenticated or account not found' };
      }

      // Get user's pins
      const { data: pins, error: pinsError } = await supabase
        .from('pins')
        .select('*')
        .eq('user_id', accountId)
        .order('created_at', { ascending: false });

      if (pinsError) {
        console.error('Error fetching user pins:', pinsError);
        return { success: false, error: 'Failed to fetch pins' };
      }

      return { success: true, pins: pins || [] };

    } catch (error) {
      console.error('Unexpected error fetching user pins:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Get all public pins
   */
  static async getPublicPins(): Promise<{ success: boolean; pins?: Pin[]; error?: string }> {
    try {
      const { data: pins, error: pinsError } = await supabase
        .from('pins')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (pinsError) {
        console.error('Error fetching public pins:', pinsError);
        return { success: false, error: 'Failed to fetch public pins' };
      }

      return { success: true, pins: pins || [] };

    } catch (error) {
      console.error('Unexpected error fetching public pins:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Update an existing pin
   */
  static async updatePin(pinId: string, updates: Partial<CreatePinData>): Promise<{ success: boolean; pin?: Pin; error?: string }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the user's account ID
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (accountError || !accountData) {
        return { success: false, error: 'User account not found' };
      }

      // Update the pin (only if user owns it)
      const { data: pin, error: pinError } = await supabase
        .from('pins')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', pinId)
        .eq('user_id', accountData.id) // Ensure user owns the pin
        .select()
        .single();

      if (pinError) {
        console.error('Pin update error:', pinError);
        return { success: false, error: 'Failed to update pin' };
      }

      return { success: true, pin };

    } catch (error) {
      console.error('Unexpected error updating pin:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Delete a pin
   */
  static async deletePin(pinId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the user's account ID
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (accountError || !accountData) {
        return { success: false, error: 'User account not found' };
      }

      // Delete the pin (only if user owns it)
      const { error: deleteError } = await supabase
        .from('pins')
        .delete()
        .eq('id', pinId)
        .eq('user_id', accountData.id); // Ensure user owns the pin

      if (deleteError) {
        console.error('Pin deletion error:', deleteError);
        return { success: false, error: 'Failed to delete pin' };
      }

      return { success: true };

    } catch (error) {
      console.error('Unexpected error deleting pin:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Get a single pin by ID
   */
  static async getPinById(pinId: string): Promise<{ success: boolean; pin?: Pin; error?: string }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the user's account ID
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (accountError || !accountData) {
        return { success: false, error: 'User account not found' };
      }

      // Get the pin (only if user owns it)
      const { data: pin, error: pinError } = await supabase
        .from('pins')
        .select('*')
        .eq('id', pinId)
        .eq('user_id', accountData.id)
        .single();

      if (pinError) {
        console.error('Pin fetch error:', pinError);
        return { success: false, error: 'Failed to fetch pin' };
      }

      return { success: true, pin };

    } catch (error) {
      console.error('Unexpected error fetching pin:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}
