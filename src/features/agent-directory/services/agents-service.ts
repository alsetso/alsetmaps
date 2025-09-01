import { 
  Agent, 
  AgentSearchResult, 
  AgentSearchFilters, 
  CreateAgentData, 
  UpdateAgentData,
  CreateInquiryData,
  AgentStats
} from '../types/agent';

export interface AgentServiceResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export class AgentsService {
  private static baseUrl = '/api/agents';

  /**
   * Search agents with filters
   */
  static async searchAgents(filters: AgentSearchFilters): Promise<AgentServiceResponse<AgentSearchResult[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search_query) queryParams.append('search_query', filters.search_query);
      if (filters.location_filter) queryParams.append('location_filter', filters.location_filter.join(','));
      if (filters.specialty_filter) queryParams.append('specialty_filter', filters.specialty_filter.join(','));
      if (filters.min_rating) queryParams.append('min_rating', filters.min_rating.toString());
      if (filters.max_price) queryParams.append('max_price', filters.max_price.toString());
      if (filters.limit_count) queryParams.append('limit_count', filters.limit_count.toString());
      if (filters.offset_count) queryParams.append('offset_count', filters.offset_count.toString());

      const response = await fetch(`${this.baseUrl}/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agents,
        message: 'Agents found successfully'
      };
    } catch (error) {
      console.error('Error searching agents:', error);
      
      return {
        success: false,
        message: 'Failed to search agents',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get agent by slug
   */
  static async getAgentBySlug(slug: string): Promise<AgentServiceResponse<Agent>> {
    try {
      const response = await fetch(`${this.baseUrl}/${slug}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agent,
        message: 'Agent found successfully'
      };
    } catch (error) {
      console.error('Error getting agent:', error);
      
      return {
        success: false,
        message: 'Failed to get agent',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new agent profile
   */
  static async createAgent(agentData: CreateAgentData): Promise<AgentServiceResponse<Agent>> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agent,
        message: 'Agent profile created successfully'
      };
    } catch (error) {
      console.error('Error creating agent:', error);
      
      return {
        success: false,
        message: 'Failed to create agent profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update agent profile
   */
  static async updateAgent(agentData: UpdateAgentData): Promise<AgentServiceResponse<Agent>> {
    try {
      const response = await fetch(`${this.baseUrl}/${agentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agent,
        message: 'Agent profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating agent:', error);
      
      return {
        success: false,
        message: 'Failed to update agent profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Link agent to existing account
   */
  static async linkAgentToAccount(agentId: string, accountId: string): Promise<AgentServiceResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${agentId}/link-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id: accountId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.success,
        message: 'Agent linked to account successfully'
      };
    } catch (error) {
      console.error('Error linking agent to account:', error);
      
      return {
        success: false,
        message: 'Failed to link agent to account',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }



  /**
   * Submit agent inquiry
   */
  static async submitInquiry(inquiryData: CreateInquiryData): Promise<AgentServiceResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.success,
        message: 'Inquiry submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      
      return {
        success: false,
        message: 'Failed to submit inquiry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get agent statistics
   */
  static async getAgentStats(): Promise<AgentServiceResponse<AgentStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.stats,
        message: 'Agent statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting agent stats:', error);
      
      return {
        success: false,
        message: 'Failed to get agent statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get featured agents
   */
  static async getFeaturedAgents(limit: number = 6): Promise<AgentServiceResponse<Agent[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/featured?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agents,
        message: 'Featured agents retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting featured agents:', error);
      
      return {
        success: false,
        message: 'Failed to get featured agents',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get agents by location
   */
  static async getAgentsByLocation(location: string, limit: number = 10): Promise<AgentServiceResponse<Agent[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/location/${encodeURIComponent(location)}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agents,
        message: 'Location-based agents retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting agents by location:', error);
      
      return {
        success: false,
        message: 'Failed to get agents by location',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if user is already an agent
   */
  static async checkIfUserIsAgent(email: string): Promise<AgentServiceResponse<Agent | null>> {
    try {
      const response = await fetch(`${this.baseUrl}/check-email?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.agent || null,
        message: data.agent ? 'User is already an agent' : 'User is not an agent'
      };
    } catch (error) {
      console.error('Error checking if user is agent:', error);
      
      return {
        success: false,
        message: 'Failed to check agent status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
