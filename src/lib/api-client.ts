import { CreateBoxRequest } from './validation';
import { Box } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Box API functions
export class BoxApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Create a new box
   */
  async createBox(boxData: CreateBoxRequest): Promise<ApiResponse<Box>> {
    try {
      // Get the current session to include auth headers
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${this.baseUrl}/boxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(boxData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to create box',
          details: result.details,
        };
      }

      return result;
    } catch (error) {
      console.error('Error creating box:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  /**
   * Update an existing box
   */
  async updateBox(boxId: string, boxData: Partial<CreateBoxRequest>): Promise<ApiResponse<Box>> {
    try {
      const response = await fetch(`${this.baseUrl}/boxes/${boxId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boxData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update box',
          details: result.details,
        };
      }

      return result;
    } catch (error) {
      console.error('Error updating box:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  /**
   * Delete a box
   */
  async deleteBox(boxId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/boxes/${boxId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to delete box',
        };
      }

      return result;
    } catch (error) {
      console.error('Error deleting box:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }
}

// Export a default instance
export const boxApi = new BoxApiClient();
