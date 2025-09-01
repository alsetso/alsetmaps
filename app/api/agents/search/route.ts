import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../src/integrations/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search_query');
    const locationFilter = searchParams.get('location_filter');
    const limit = parseInt(searchParams.get('limit_count') || '20');
    const offset = parseInt(searchParams.get('offset_count') || '0');

    let query = supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply search filters
    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
    }

    if (locationFilter) {
      const locations = locationFilter.split(',');
      query = query.overlaps('service_areas', locations);
    }



    // Note: min_rating and max_price are not currently implemented in the agents table
    // You may want to add these fields or implement them differently

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: agents, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to search agents' },
        { status: 500 }
      );
    }

    // Transform data to match AgentSearchResult interface
    const searchResults = (agents || []).map((agent: any) => ({
      id: agent.id,
      first_name: agent.first_name,
      last_name: agent.last_name,
      company_name: agent.company_name,
      slug: agent.slug,
      profile_image: agent.profile_image,
      specialties: agent.specialties || [],
      service_areas: agent.service_areas || [],
      is_verified: agent.is_verified,
      featured: agent.is_featured,
      search_score: 1.0, // TODO: Implement actual search scoring
    }));

    return NextResponse.json({
      success: true,
      agents: searchResults,
      total: count || 0,
      message: 'Agents found successfully'
    });

  } catch (error) {
    console.error('Error searching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
