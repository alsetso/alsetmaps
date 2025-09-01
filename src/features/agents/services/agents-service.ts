import { supabase } from '@/integrations/supabase/client';
import { Agent, CreateAgentData, UpdateAgentData, AgentSearchFilters, AgentSearchResult, AgentStats } from '../types/agent';

export class AgentsService {
  /**
   * Create a new agent profile (starts as pending lead)
   */
  static async createAgent(data: CreateAgentData, userId?: string): Promise<Agent> {
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = await this.generateSlug(data.first_name, data.last_name);
      }

      const agentData = {
        ...data,
        status: 'pending', // Start as pending lead
        owner_id: userId,
      };

      const { data: agent, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent profile');
    }
  }

  /**
   * Get agent by ID
   */
  static async getAgentById(id: string): Promise<Agent | null> {
    try {
      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Get agent by slug
   */
  static async getAgentBySlug(slug: string): Promise<Agent | null> {
    try {
      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      console.error('Error fetching agent by slug:', error);
      return null;
    }
  }

  /**
   * Update agent profile
   */
  static async updateAgent(data: UpdateAgentData): Promise<Agent> {
    try {
      const { data: agent, error } = await supabase
        .from('agents')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent profile');
    }
  }

  /**
   * Delete agent profile
   */
  static async deleteAgent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw new Error('Failed to delete agent profile');
    }
  }

  /**
   * Search agents with filters
   */
  static async searchAgents(filters: AgentSearchFilters): Promise<AgentSearchResult[]> {
    try {
      let query = supabase
        .from('agents')
        .select('*')
        .eq('status', 'approved'); // Only show approved agents

      // Apply search query
      if (filters.search_query) {
        query = query.textSearch('search_vector', filters.search_query);
      }

      // Apply location filter
      if (filters.location_filter && filters.location_filter.length > 0) {
        query = query.overlaps('service_areas', filters.location_filter);
      }

      // Apply specialty filter
      if (filters.specialty_filter && filters.specialty_filter.length > 0) {
        query = query.overlaps('specialties', filters.specialty_filter);
      }

      // Apply pagination
      if (filters.limit_count) {
        query = query.limit(filters.limit_count);
      }
      if (filters.offset_count) {
        query = query.range(filters.offset_count, filters.offset_count + (filters.limit_count || 10) - 1);
      }

      // Order by featured first, then rating
      query = query.order('featured', { ascending: false })
                  .order('rating', { ascending: false })
                  .order('created_at', { ascending: false });

      const { data: agents, error } = await query;

      if (error) throw error;

      // Transform to search results with search score
      return (agents || []).map(agent => ({
        id: agent.id,
        first_name: agent.first_name,
        last_name: agent.last_name,
        company_name: agent.company_name,
        slug: agent.slug,
        profile_image: agent.profile_image,
        specialties: agent.specialties || [],
        service_areas: agent.service_areas || [],
        is_verified: agent.is_verified,
        featured: agent.featured,
        search_score: this.calculateSearchScore(agent, filters.search_query || ''),
      }));
    } catch (error) {
      console.error('Error searching agents:', error);
      return [];
    }
  }

  /**
   * Get featured agents
   */
  static async getFeaturedAgents(limit: number = 6): Promise<Agent[]> {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true)
        .order('featured_date', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return agents || [];
    } catch (error) {
      console.error('Error fetching featured agents:', error);
      return [];
    }
  }

  /**
   * Get agents by status (for admin review)
   */
  static async getAgentsByStatus(status: string, limit: number = 50): Promise<Agent[]> {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return agents || [];
    } catch (error) {
      console.error('Error fetching agents by status:', error);
      return [];
    }
  }

  /**
   * Update agent status (for admin approval workflow)
   */
  static async updateAgentStatus(
    id: string, 
    status: string, 
    reviewedBy: string
  ): Promise<Agent> {
    try {
      const updateData: any = {
        status,
        reviewed_by: reviewedBy,
        updated_at: new Date().toISOString(),
      };

      // Set featured date if status is approved and agent is featured
      if (status === 'approved') {
        const agent = await this.getAgentById(id);
        if (agent?.featured && !agent.featured_date) {
          updateData.featured_date = new Date().toISOString();
        }
      }

      const { data: agent, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw new Error('Failed to update agent status');
    }
  }

  /**
   * Toggle featured status
   */
  static async toggleFeaturedStatus(id: string, featured: boolean): Promise<Agent> {
    try {
      const updateData: any = {
        featured,
        updated_at: new Date().toISOString(),
      };

      if (featured) {
        updateData.featured_date = new Date().toISOString();
      }

      const { data: agent, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw new Error('Failed to update featured status');
    }
  }



  /**
   * Get agent statistics
   */
  static async getAgentStats(): Promise<AgentStats> {
    try {
      const { data: stats, error } = await supabase
        .from('agents')
        .select('status, featured, is_verified');

      if (error) throw error;

      const totalAgents = stats?.length || 0;
      const verifiedAgents = stats?.filter(a => a.is_verified).length || 0;
      const featuredAgents = stats?.filter(a => a.featured).length || 0;

      return {
        total_agents: totalAgents,
        verified_agents: verifiedAgents,
        featured_agents: featuredAgents,
        total_inquiries: 0, // This would come from a separate inquiries table
      };
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      return {
        total_agents: 0,
        verified_agents: 0,
        featured_agents: 0,
        total_inquiries: 0,
      };
    }
  }

  /**
   * Generate unique slug for agent
   */
  private static async generateSlug(firstName: string, lastName: string): Promise<string> {
    const baseSlug = `${firstName}-${lastName}`.toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('agents')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Calculate search score for ranking results
   */
  private static calculateSearchScore(agent: Agent, searchQuery: string): number {
    let score = 0;

    // Featured agents get bonus points
    if (agent.featured) score += 100;

    // Verified agents get bonus points
    if (agent.is_verified) score += 50;

    // More experience gets more points
    if (agent.years_experience) {
      score += Math.min(agent.years_experience * 2, 40); // Cap at 40 points
    }

    // Text relevance bonus
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const text = `${agent.first_name} ${agent.last_name} ${agent.company_name || ''} ${agent.bio || ''}`.toLowerCase();
      
      if (text.includes(query)) score += 20;
      if (agent.specialties?.some(s => s.toLowerCase().includes(query))) score += 15;
      if (agent.service_areas?.some(s => s.toLowerCase().includes(query))) score += 15;
    }

    return score;
  }
}
