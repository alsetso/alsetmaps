import { supabase } from '@/integrations/supabase/client';
import { 
  FindAgentRequest, 
  CreateFindAgentRequest, 
  UpdateFindAgentRequest, 
  FindAgentFilters, 
  FindAgentStats 
} from '../types/find-agent';

export class FindAgentService {
  /**
   * Create a new find agent request
   */
  static async createRequest(data: CreateFindAgentRequest): Promise<FindAgentRequest> {
    try {
      const { data: request, error } = await supabase
        .from('find_agent')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return request;
    } catch (error) {
      console.error('Error creating find agent request:', error);
      throw new Error('Failed to create find agent request');
    }
  }

  /**
   * Get find agent request by ID
   */
  static async getRequestById(id: string): Promise<FindAgentRequest | null> {
    try {
      const { data: request, error } = await supabase
        .from('find_agent')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return request;
    } catch (error) {
      console.error('Error fetching find agent request:', error);
      return null;
    }
  }

  /**
   * Get find agent requests with filters
   */
  static async getRequests(filters: FindAgentFilters = {}): Promise<FindAgentRequest[]> {
    try {
      let query = supabase
        .from('find_agent')
        .select('*');

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.state) {
        query = query.eq('state', filters.state);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters.timeline) {
        query = query.eq('timeline', filters.timeline);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.assigned_agent_id) {
        query = query.eq('assigned_agent_id', filters.assigned_agent_id);
      }
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data: requests, error } = await query;

      if (error) throw error;
      return requests || [];
    } catch (error) {
      console.error('Error fetching find agent requests:', error);
      return [];
    }
  }

  /**
   * Update find agent request
   */
  static async updateRequest(data: UpdateFindAgentRequest): Promise<FindAgentRequest> {
    try {
      const { data: request, error } = await supabase
        .from('find_agent')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return request;
    } catch (error) {
      console.error('Error updating find agent request:', error);
      throw new Error('Failed to update find agent request');
    }
  }

  /**
   * Delete find agent request
   */
  static async deleteRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('find_agent')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting find agent request:', error);
      throw new Error('Failed to delete find agent request');
    }
  }

  /**
   * Match agents to a request using the database function
   */
  static async matchAgentsToRequest(requestId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('match_agents_to_request', { request_id: requestId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error matching agents to request:', error);
      return [];
    }
  }

  /**
   * Manually assign an agent to a request
   */
  static async assignAgentToRequest(requestId: string, agentId: string): Promise<FindAgentRequest> {
    try {
      const { data: request, error } = await supabase
        .from('find_agent')
        .update({
          assigned_agent_id: agentId,
          status: 'matched',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return request;
    } catch (error) {
      console.error('Error assigning agent to request:', error);
      throw new Error('Failed to assign agent to request');
    }
  }

  /**
   * Update request status
   */
  static async updateRequestStatus(requestId: string, status: string): Promise<FindAgentRequest> {
    try {
      const { data: request, error } = await supabase
        .from('find_agent')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return request;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw new Error('Failed to update request status');
    }
  }

  /**
   * Get requests by user ID
   */
  static async getRequestsByUser(userId: string): Promise<FindAgentRequest[]> {
    try {
      const { data: requests, error } = await supabase
        .from('find_agent')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return requests || [];
    } catch (error) {
      console.error('Error fetching user requests:', error);
      return [];
    }
  }

  /**
   * Get requests assigned to an agent
   */
  static async getRequestsByAgent(agentId: string): Promise<FindAgentRequest[]> {
    try {
      const { data: requests, error } = await supabase
        .from('find_agent')
        .select('*')
        .eq('assigned_agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return requests || [];
    } catch (error) {
      console.error('Error fetching agent requests:', error);
      return [];
    }
  }

  /**
   * Get find agent statistics
   */
  static async getStats(): Promise<FindAgentStats> {
    try {
      const { data: requests, error } = await supabase
        .from('find_agent')
        .select('status, created_at, processed_at, completed_at');

      if (error) throw error;

      const totalRequests = requests?.length || 0;
      const newRequests = requests?.filter(r => r.status === 'new').length || 0;
      const processingRequests = requests?.filter(r => r.status === 'processing').length || 0;
      const matchedRequests = requests?.filter(r => r.status === 'matched').length || 0;
      const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
      const cancelledRequests = requests?.filter(r => r.status === 'cancelled').length || 0;

      // Calculate average response time
      let totalResponseTime = 0;
      let responseCount = 0;
      
      requests?.forEach(request => {
        if (request.processed_at && request.created_at) {
          const created = new Date(request.created_at);
          const processed = new Date(request.processed_at);
          const diffHours = (processed.getTime() - created.getTime()) / (1000 * 60 * 60);
          totalResponseTime += diffHours;
          responseCount++;
        }
      });

      const averageResponseTimeHours = responseCount > 0 ? totalResponseTime / responseCount : 0;

      return {
        total_requests: totalRequests,
        new_requests: newRequests,
        processing_requests: processingRequests,
        matched_requests: matchedRequests,
        completed_requests: completedRequests,
        cancelled_requests: cancelledRequests,
        average_response_time_hours: Math.round(averageResponseTimeHours * 100) / 100,
      };
    } catch (error) {
      console.error('Error fetching find agent stats:', error);
      return {
        total_requests: 0,
        new_requests: 0,
        processing_requests: 0,
        matched_requests: 0,
        completed_requests: 0,
        cancelled_requests: 0,
        average_response_time_hours: 0,
      };
    }
  }

  /**
   * Search requests by text
   */
  static async searchRequests(searchQuery: string, filters: FindAgentFilters = {}): Promise<FindAgentRequest[]> {
    try {
      let query = supabase
        .from('find_agent')
        .select('*');

      // Apply text search if query provided
      if (searchQuery.trim()) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,additional_info.ilike.%${searchQuery}%`);
      }

      // Apply other filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.state) {
        query = query.eq('state', filters.state);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data: requests, error } = await query;

      if (error) throw error;
      return requests || [];
    } catch (error) {
      console.error('Error searching find agent requests:', error);
      return [];
    }
  }
}
