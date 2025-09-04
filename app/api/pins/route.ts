import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { search_history_id, latitude, longitude, user_id } = await request.json();

    // Validate required fields
    if (!search_history_id || !latitude || !longitude || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: search_history_id, latitude, longitude, user_id' },
        { status: 400 }
      );
    }

    // Create the pin directly - no extra validation needed
    console.log('🔧 Attempting to create pin with data:', {
      user_id: user_id,
      search_history_id: search_history_id,
      latitude: latitude,
      longitude: longitude
    });
    
    const supabase = createServerSupabaseClient();
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .insert({
        user_id: user_id,
        search_history_id: search_history_id,
        latitude: latitude,
        longitude: longitude
      })
      .select()
      .single();

    if (pinError) {
      console.error('❌ Pin creation error:', pinError);
      console.error('Error details:', {
        message: pinError.message,
        details: pinError.details,
        hint: pinError.hint,
        code: pinError.code
      });
      return NextResponse.json(
        { error: 'Failed to create pin' },
        { status: 500 }
      );
    }
    
    console.log('✅ Pin created successfully:', pin);

    return NextResponse.json(pin, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating pin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current authenticated user
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get the user's account ID
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // Get user's pins with search history details
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
      .eq('user_id', accountData.id)
      .order('created_at', { ascending: false });

    if (pinsError) {
      console.error('Error fetching pins:', pinsError);
      return NextResponse.json(
        { error: 'Failed to fetch pins' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pins: pins || [] });

  } catch (error) {
    console.error('Unexpected error fetching pins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
