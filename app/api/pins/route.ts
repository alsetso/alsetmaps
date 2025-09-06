import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the request body
    const { search_history_id, latitude, longitude } = await request.json();

    // Validate required fields
    if (!search_history_id || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: search_history_id, latitude, longitude' },
        { status: 400 }
      );
    }

    // Create the pin - set account_id to user.id
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .insert({
        account_id: user.id, // Use account_id to match RLS policy
        search_history_id: search_history_id,
        latitude: latitude,
        longitude: longitude
      })
      .select()
      .single();

    if (pinError) {
      return NextResponse.json(
        { error: 'Failed to create pin' },
        { status: 500 }
      );
    }

    return NextResponse.json(pin, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user's pins with search history details - filter by account_id column
    const { data: pins, error: pinsError } = await supabase
      .from('pins')
      .select(`
        *,
        search_history:search_history(
          search_address,
          search_type,
          created_at
        )
      `)
      .eq('account_id', user.id)
      .order('created_at', { ascending: false });

    if (pinsError) {
      return NextResponse.json(
        { error: 'Failed to fetch pins' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pins: pins || [] });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
