import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../src/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract agent data from request body
    const {
      first_name,
      last_name,
      email,
      phone,
      company_name,
      license_number,
      license_state,
      specialties,
      service_areas,
      years_experience,
      languages,
      website,
      linkedin,
      facebook,
      instagram,
      bio,
      slug,
      search_keywords,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Profile URL already exists. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('agents')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists in our system.' },
        { status: 409 }
      );
    }

    // TODO: Get the logged-in user's account ID from the session
    // For now, we'll create the agent without linking to an account
    // You'll need to implement authentication middleware to get the user's account ID
    
    // Prepare agent data for insertion
    const agentData = {
      first_name,
      last_name,
      email,
      phone,
      company_name: company_name || null,
      license_number: license_number || null,
      license_state: license_state || null,
      specialties: specialties || [],
      service_areas: service_areas || [],
      years_experience: years_experience || null,
      languages: languages || [],
      website: website || null,
      linkedin: linkedin || null,
      facebook: facebook || null,
      instagram: instagram || null,
      bio: bio || null,
      slug,
      search_keywords: search_keywords || [],
      is_active: true,
      is_verified: false,
      verification_method: null,
      // created_by_account_id: accountId, // TODO: Add when auth is implemented
      // updated_by_account_id: accountId, // TODO: Add when auth is implemented
    };

    // Insert agent into database
    const { data: newAgent, error: insertError } = await supabase
      .from('agents')
      .insert(agentData)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create agent profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: newAgent,
      message: 'Agent profile created successfully'
    });

  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search_query');
    const locationFilter = searchParams.get('location_filter');
    const specialtyFilter = searchParams.get('specialty_filter');
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

    if (specialtyFilter) {
      const specialties = specialtyFilter.split(',');
      query = query.overlaps('specialties', specialties);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: agents, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agents: agents || [],
      total: count || 0,
      message: 'Agents fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
