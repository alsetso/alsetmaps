import { supabase } from '@/integrations/supabase/client';

export interface PinSharingSettings {
  isPublic: boolean;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  allowInquiries?: boolean;
  contactMethod?: 'email' | 'phone' | 'both';
  showViewCount?: boolean;
}

export interface PublicPinData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  images?: string[];
  notes?: string;
  is_public: boolean;
  share_token: string;
  view_count: number;
  last_viewed_at?: string;
  seo_title?: string;
  seo_description?: string;
  share_settings?: any;
  created_at: string;
  updated_at?: string;
}

export class PinSharingService {
  /**
   * Toggle a pin's public status
   */
  static async togglePinPublicStatus(
    pinId: string, 
    isPublic: boolean
  ): Promise<{ success: boolean; error?: string }> {
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

      // Use the database function to safely toggle public status
      const { data, error } = await supabase.rpc('toggle_pin_public_status', {
        pin_id: pinId,
        user_id: accountData.id,
        make_public: isPublic
      });

      if (error) {
        console.error('Error toggling pin public status:', error);
        return { success: false, error: 'Failed to update pin visibility' };
      }

      if (!data) {
        return { success: false, error: 'Pin not found or you do not have permission to modify it' };
      }

      return { success: true };

    } catch (error) {
      console.error('Unexpected error toggling pin public status:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Update pin sharing settings
   */
  static async updatePinSharingSettings(
    pinId: string,
    settings: Partial<PinSharingSettings>
  ): Promise<{ success: boolean; error?: string }> {
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

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (settings.isPublic !== undefined) {
        updateData.is_public = settings.isPublic;
      }
      if (settings.customDomain !== undefined) {
        updateData.custom_domain = settings.customDomain;
      }
      if (settings.seoTitle !== undefined) {
        updateData.seo_title = settings.seoTitle;
      }
      if (settings.seoDescription !== undefined) {
        updateData.seo_description = settings.seoDescription;
      }
      if (settings.allowInquiries !== undefined || 
          settings.contactMethod !== undefined || 
          settings.showViewCount !== undefined) {
        updateData.share_settings = {
          allowInquiries: settings.allowInquiries,
          contactMethod: settings.contactMethod,
          showViewCount: settings.showViewCount
        };
      }

      // Update the pin
      const { error } = await supabase
        .from('pins')
        .update(updateData)
        .eq('id', pinId)
        .eq('user_id', accountData.id);

      if (error) {
        console.error('Error updating pin sharing settings:', error);
        return { success: false, error: 'Failed to update sharing settings' };
      }

      return { success: true };

    } catch (error) {
      console.error('Unexpected error updating pin sharing settings:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Get public pin data by share token
   */
  static async getPublicPinByToken(shareToken: string): Promise<{ 
    success: boolean; 
    pin?: PublicPinData; 
    error?: string 
  }> {
    try {
      const { data: pin, error } = await supabase
        .from('pins')
        .select(`
          id,
          name,
          latitude,
          longitude,
          images,
          notes,
          is_public,
          share_token,
          view_count,
          last_viewed_at,
          seo_title,
          seo_description,
          share_settings,
          created_at,
          updated_at
        `)
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single();

      if (error || !pin) {
        return { success: false, error: 'Pin not found or not publicly accessible' };
      }

      return { success: true, pin };

    } catch (error) {
      console.error('Unexpected error fetching public pin:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  /**
   * Generate share URL for a pin
   */
  static generateShareUrl(pinId: string, customDomain?: string): string {
    const baseUrl = customDomain || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/shared/property/${pinId}`;
  }

  /**
   * Get sharing analytics for a pin
   */
  static async getPinSharingAnalytics(pinId: string): Promise<{
    success: boolean;
    analytics?: {
      viewCount: number;
      lastViewed?: string;
      isPublic: boolean;
      shareToken: string;
    };
    error?: string;
  }> {
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

      // Get pin analytics
      const { data: pin, error } = await supabase
        .from('pins')
        .select('view_count, last_viewed_at, is_public, share_token')
        .eq('id', pinId)
        .eq('user_id', accountData.id)
        .single();

      if (error || !pin) {
        return { success: false, error: 'Pin not found or you do not have permission to view it' };
      }

      return {
        success: true,
        analytics: {
          viewCount: pin.view_count,
          lastViewed: pin.last_viewed_at,
          isPublic: pin.is_public,
          shareToken: pin.share_token
        }
      };

    } catch (error) {
      console.error('Unexpected error fetching pin analytics:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}
