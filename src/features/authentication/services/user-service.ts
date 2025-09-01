import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export class UserService {
  /**
   * Get the current user's profile information
   */
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: user.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        stripe_customer_id: data.stripe_customer_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update the current user's profile information
   */
  static async updateUserProfile(profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('accounts')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: user.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        stripe_customer_id: data.stripe_customer_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID (for admin purposes)
   */
  static async getUserProfileById(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        stripe_customer_id: data.stripe_customer_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user profile by ID:', error);
      throw error;
    }
  }

  /**
   * Check if a user profile exists in the accounts table
   */
  static async profileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  }

  /**
   * Create a new user profile during signup (no authentication required)
   */
  static async createUserProfileDuringSignup(userId: string, email: string, profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      // Create the account profile without requiring authentication
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          email: email,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Note: user_credits will be created by the database trigger
      // No need to manually create it here

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        stripe_customer_id: data.stripe_customer_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating user profile during signup:', error);
      throw error;
    }
  }

  /**
   * Create a new user profile in the accounts table
   */
  static async createUserProfile(userId: string, profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Create the account profile
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          email: user.email,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Note: user_credits will be created by the database trigger
      // No need to manually create it here

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'user',
        stripe_customer_id: data.stripe_customer_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
}
